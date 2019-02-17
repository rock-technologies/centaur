const jsonwebtoken = require('jsonwebtoken');
const moment = require('moment');
const uuid = require('uuid/v4');
const get = require('lodash/get');
const { AuthenticationError, ApolloError } = require('apollo-server-express');
const logger = require('../../utils/logger');
const factory = require('../../dao/DaoModelFactory');
const { checkPassword } = require('../../utils/passwordUtils');

const MYSQL_TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const JWT_OPTIONS = {
   expiresIn: '2hrs',
   issuer: '<My site Name>'
};

function createUnsignedToken(sessionId, csrfToken, emailAddress, content, logo) {
   const {
      id,
      firstName,
      lastName,
      username,
      defaultLocation,
      schoolSystem,
      role
   } = content;

   return {
      sessionId,
      csrfToken,
      subject: {
         emailAddress,
         id,
         firstName,
         lastName,
         defaultLocation,
         schoolSystem,
         role,
         username,
         extensionData: { logo }
      }
   };
}

const createJwt = unsignedToken => jsonwebtoken.sign(
   unsignedToken,
   process.env.SECRET_JWT,
   JWT_OPTIONS
);

const resolver = async (temp, { username, password }, { res }) => {
   const log = logger.child({ widget_type: 'resolver login' });

   const csrfToken = uuid();
   const existingUser = factory.buildModel('User');
   const existingSession = factory.buildModel('Session');
   const system = factory.buildModel('SchoolSystem');

   log.info(`User logging in: ${username}`);

   // Verify user first.
   const userResult = await existingUser.find({ username });

   if (!userResult || userResult.length !== 1) {
      log.error(`Unable to find only one user with the username ${username}`);
      throw new AuthenticationError('Access Denied');
   }

   const goodPassword = checkPassword(password, userResult[0].password);
   if (!goodPassword) {
      log.warn(`Invalid password detected for ${username}.  Aborting...`);
      return null;
   }

   existingUser.update(userResult[0]);

   const {
      id,
      firstName,
      lastName,
      emailAddress,
      role,
      schoolSystem,
      defaultLocation,
   } = userResult[0];

   // Check for existing active sessions first.  If we find one, return it instead of a new one.
   const sessionResult = await existingSession.find({ userId: id, isActive: true });

   if (Array.isArray(sessionResult) && sessionResult.length > 0) {
      log.info(`Previous session found for ${username}`);
      // Is the current session expired?
      if (moment(sessionResult[0].expirationTimestamp).diff(moment()) >= 0) {
         log.info('Found a previously active session.  Continuing to use it.');

         const sessionId = sessionResult[0].id;
         const now = moment().utc();
         const exp = now.clone().add(2, 'hours');

         existingSession.update({
            id: sessionId,
            updatedTimestamp: now.format(MYSQL_TIMESTAMP_FORMAT),
            expirationTimestamp: exp.format(MYSQL_TIMESTAMP_FORMAT)
         });

         try {
            if (existingSession.persist()) {
               log.info('Previous session updated successfully.  Re-building Authorization header.');

               const unsignedToken = createUnsignedToken(sessionId, csrfToken, emailAddress, userResult[0], get(existingSession, 'extensionData.logo'));
               return {
                  jwt: createJwt(unsignedToken),
                  sessionData: unsignedToken.subject,
                  csrfToken
               };
            }
         } catch (error) {
            log.error(`Failed to update session ${id}: ${error}`);
            throw new ApolloError('An error occurred.');
         }
      } else {
         // Current session is expired.  Proceed and create a new one.
         existingSession.update({
            id: sessionResult[0].id,
            isActive: false
         });

         try {
            // It's ok to ignore this promise.  It is only disabling the old session.
            existingSession.persist();
            // Fall through to new session code below.
            log.info('The current session is expired. Creating a new one.');
         } catch (error) {
            log.error(`Current session is expired, but failed to de-activate it: ${error}`);
            throw new ApolloError('An error occurred');
         }
      }
   } else {
      log.info(`The user ${username} does not have any previous active sessions.`);
   }

   // Either no previous session, or the current one expired.  Create a new session.
   const now = moment().utc();
   const exp = now.clone().add(2, 'hours');

   const newSession = factory.buildModel('Session');
   const result = await system.find({ id: existingUser.get('schoolSystem') });
   const logo = Array.isArray(result) && result.length > 0 ? result[0].logoPath : null;

   newSession.update({
      userId: id,
      emailAddress,
      firstName,
      lastName,
      role,
      schoolSystem,
      defaultLocation,
      createdTimestamp: now.format(MYSQL_TIMESTAMP_FORMAT),
      expirationTimestamp: exp.format(MYSQL_TIMESTAMP_FORMAT),
      updatedTimestamp: now.format(MYSQL_TIMESTAMP_FORMAT),
      isActive: true,
      extensionData: { logo }
   });

   try {
      await newSession.persist();

      const unsignedToken = createUnsignedToken(newSession.get('id'), csrfToken, username, userResult[0], logo);

      if (newSession.get('id') === unsignedToken.sessionId) {
         log.info(`User ${username} successfully logged in.`);

         return {
            jwt: createJwt(unsignedToken),
            sessionData: unsignedToken.subject,
            csrfToken
         };
      }

      log.error(`User ${username} was not logged in successfully.  Session failed to save to database.`);
   } catch (error) {
      log.error(`Failed to create new session for user ${username}: ${error}`);
      throw new ApolloError('An error occurred');
   }
};

module.exports = resolver;
