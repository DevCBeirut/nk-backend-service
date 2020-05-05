/**
 * Custom configuration
 * (sails.config.custom)
 *
 * One-off settings specific to your application.
 *
 * For more information on custom configuration, visit:
 * https://sailsjs.com/config/custom
 */

module.exports.custom = {
	responseTypes: {
		forbidden: {
			description: 'This response type informs the client that an unauthorized action has been requested',
			responseType: 'forbidden',
			statusCode: 403
		},
		logicalError: {
			description: 'This response type informs the client that there was an error, specifically handled by the respective microservice',
			responseType: 'logicalError',
			statusCode: 400
		},
		serverError: {
			description: 'This response type informs the client that an unexpected error has occurred in the catch block of the action',
			responseType: 'serverError',
			statusCode: 500
		},
	},
	arangoClient: () => {
		let connection = new require('arangojs')(
			{
				url: `http://${process.env.ARANGODB_USERNAME}:${process.env.ARANGODB_PASSWORD}@${process.env.ARANGODB_HOST}:${process.env.ARANGODB_PORT}/`,
			}).useDatabase(process.env.ARANGODB_DB_NAME);
		return connection;
	}
};
