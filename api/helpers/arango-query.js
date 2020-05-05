module.exports = {


	friendlyName: 'Perform Arango Query',


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
        const ARANGO_CLIENT = sails.config.custom.arangoClient();

        // A counter that allows to attempt to perform the query three times before generating an error
        let queryAttemptCounter = 1;
        // A variable that will hold the query result that must be returned
        let queryCursor;
        let queryResult;

        // Implements a retry mechanism in case of an error that occurs when executing the query.
        // The function will attempt to execute the query three times. If after three times, the query is not executed
        // successfully, return an error
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
                if(queryAttemptCounter == 3) {
                    sails.log.warn(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Exceeded maximum number of attempts. Exiting with an error.`);

                    ARANGO_CLIENT.close();

                    // If the error is a logical error, notify the API that a response with status 400 must be returned
                    if(error.isArangoError) {
                        sails.log.error(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Arango logical error found.`);
                        sails.log.error(error);
                        return exits.success({
                            status: 'error',
                            data: {
                                errorCode: 400,
                                message: "ArangoDB logical error while executing the query"
                            }
                        });
                    }

                    // If ther error is a server error, notify the API that a response with status 500 must be returned
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
                sails.log.warn(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Error while executing the query. Attempt ${queryAttemptCounter}.`);
                sails.log.warn(error);
                queryAttemptCounter++;
                await timeout.set(250);
            }
        } 
    }
}