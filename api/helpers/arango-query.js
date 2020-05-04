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

        // Initialize the filename. This variable will be used for logging purposes 
        const FILE_PATH = __filename.split('helpers')[1];
        const ARANGO_CLIENT = sails.config.custom.arangoClient();

        sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Performing query...`);
        
        const queryCursor = await ARANGO_CLIENT.query(inputs.query, inputs.queryParams);
        const query = await queryCursor.all();

        ARANGO_CLIENT.close();
        return exits.success({
            status: 'success',
            data: query
        });
    }
}