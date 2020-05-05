module.exports = {


	friendlyName: 'Get all persons',


	description: 'Retrieves all the person records from the database',


    inputs: {},
    
    exits: sails.config.custom.responseTypes,

    fn: async function (inputs, exits) {

        // Initialize the request ID and the filename. These variables will be used for logging and tracing purposes
        const REQUEST_ID = this.req.requestId;
		const FILE_PATH = __filename.split('controllers')[1];

		sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Starting...`);

        // Use the helper function to execute the query
        let allEmployees = await sails.helpers.arangoQuery.with({
            requestId: REQUEST_ID,
            query: 'FOR person IN persons RETURN person'
        });

        // Handle the possible errors returned by the helper function
        if(allEmployees && allEmployees.status === "error") {
            // If the error is a logical error, return a response with status 400
            if(allEmployees.data && allEmployees.data.errorCode && allEmployees.data.errorCode === 400)
                return exits.logicalError({
                    status: 'LOGICAL_ERROR',
                    data: allEmployees.data.message
                });

            // If the error is a server error, return a response with status 500
            return exits.serverError({
                status: 'SERVER_ERROR',
                data: allEmployees.data.message
            });
        }
        
        return exits.success({
            status: 'success',
            data: allEmployees.data
        });
    }
}