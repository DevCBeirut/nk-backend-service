module.exports = {

	friendlyName: 'Perform an Arango Query',


    description: 'A generic function that performs a query on the Arango Database, and returns a result',
    

    inputs : {
        requestId: {
			type: 'string',
			required: true,
			description: 'The ID of the incoming request. The request ID is used for tracing purposes'
        },
        query: {
            type: 'string',
            required: true,
            description: 'The query to be performed on the database'
        },
        queryParams: {
            type: 'ref',
            required: false,
            description: 'the query parameters to be appended to the query',
            defaultsTo: {}
        }
    },

    exits: {},

    fn: async function (inputs, exits) {
        const timeout = require("await-timeout");
        // Initialize the filename. This variable will be used for logging purposes 
        const FILE_PATH = __filename.split('helpers')[1];
        const ARANGO_CLIENT = new require('arangojs')(
			{
				url: `http://${process.env.ARANGODB_USERNAME}:${process.env.ARANGODB_PASSWORD}@${process.env.ARANGODB_HOST}:${process.env.ARANGODB_PORT}/`,
			}).useDatabase(process.env.ARANGODB_DB_NAME);

        // A counter that allows to attempt to perform the query three times before generating an error
        let queryAttemptCounter = 1;
        // A variable that will hold the query result that must be returned
        let queryCursor;
        let queryResult;

        // Implements a retry mechanism in case of an error that occurs when executing the query.
        // The function will attempt to execute the query three times. If after three times, the query is not executed
        // successfully, return an error
        // TODO: Implement a more thorough error check to distinguish between errors that require another attempt
        // TODO: such as write-write conflict or ECONNREFUSED and errors that do not, such as a bad query
        while (true) {
            try {
                sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Executing the query. Attempt ${queryAttemptCounter}.`);
                queryCursor = await ARANGO_CLIENT.query(inputs.query, inputs.queryParams);
                queryResult = await queryCursor.all();
    
                sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Successfully executed the query. Returning the result`);

                ARANGO_CLIENT.close();
                return exits.success({
                    status: 'success',
                    data: queryResult
                });
            } catch (error) {
                // If the maximum number of query attempts is exceeded, generate an error
                if(queryAttemptCounter == sails.config.custom.arangoInfo.maxRetryAttempts) {
                    sails.log.warn(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Exceeded maximum number of attempts. Exiting with an error.`);

                    ARANGO_CLIENT.close();
                    // If there error is a server error, notify the API that a response with status 500 must be returned
                    sails.log.error(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Arango server error found.`);
                    sails.log.error(error);
                    return exits.success({
                        status: 'error',
                        data: {
                            errorCode: 500,
                            message: "ArangoDB server error while executing the query"
                        }
                    });

                }

                // If the error is a logical error, notify the API that a response with status 400 must be returned
                if(error.isArangoError) {
                    sails.log.error(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Arango logical error found.`);
                    sails.log.error(error.response.body);
                    ARANGO_CLIENT.close();
                    return exits.success({
                        status: 'error',
                        data: {
                            errorCode: 400,
                            message: "ArangoDB logical error while executing the query"
                        }
                    });
                }

                // If the maximum number of attempts is not exceeded, log the error, increment the counter, and retry the query after a certain timeout
                sails.log.error(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Error while executing the query. Attempt ${queryAttemptCounter} out of ${sails.config.custom.arangoInfo.maxRetryAttempts}.`);
                sails.log.error(error);
                queryAttemptCounter++;
                await timeout.set(sails.config.custom.arangoInfo.retryDelay);
            }
        } 
    }
}