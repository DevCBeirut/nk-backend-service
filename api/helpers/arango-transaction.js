module.exports = {

	friendlyName: 'Perform an Arango Transaction',


    description: 'A generic function that performs a transaction on the Arango Database, and returns a result',
    

    inputs : {
        requestId: {
			type: 'string',
			required: true,
			description: 'The ID of the incoming request. The request ID is used for tracing purposes'
        },
        collections: {
            type: 'ref',
            required: true,
            description: 'A JSON object specifying the collections to read from or write to: {write: ["col1"], read: ["col2"]}'
        },
        action: {
            type: 'string',
            required: true,
            description: 'A string specifying the set of commands to be performed as a transaction against the database'
        },
        params: {
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
        let transactionAttemptCounter = 1;
        const MAX_ATTEMPS = 3
        // A variable that will hold the transaction result that must be returned
        let arangoTransactionResult;

        // Implements a retry mechanism in case of an error that occurs when executing the query.
        // The function will attempt to execute the query three times. If after three times, the query is not executed
        // successfully, return an error
        while (true) {
            try {
                sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Executing the transaction. Attempt ${transactionAttemptCounter}.`);
                arangoTransactionResult = await ARANGO_CLIENT.transaction(inputs.collections, inputs.action, inputs.params);
    
                sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Successfully executed the transaction. Returning the result`);
    
                ARANGO_CLIENT.close();
                return exits.success(arangoTransactionResult);
            } catch (error) {
                // If the maximum number of query attempts is exceeded, generate an error
                if(transactionAttemptCounter === MAX_ATTEMPS) {
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

                // If this is a logical error thrown from inside the transaction, break out and return a response
                if (error && error.response && error.response.body && error.response.body.error) {
                    sails.log.error(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Arango logical error found.`);
                    sails.log.error(error.response.body);

                    ARANGO_CLIENT.close();
                    return exits.success({
                        status: 'error',
                        data: {
                            errorCode: 400,
                            message: error.response.body.errorMessage
                        }
                    })
                }

                // If the maximum number of attempts is not exceeded, log the error, increment the counter, and retry the query after a certain timeout
                sails.log.error(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Error while executing the transaction. Attempt ${transactionAttemptCounter} out of ${MAX_ATTEMPS}.`);
                sails.log.error(error);
                transactionAttemptCounter++;
                await timeout.set(250);
            }
        }
    }
}