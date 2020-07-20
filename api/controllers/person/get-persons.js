module.exports = {


	friendlyName: 'Get all persons',


	description: 'Retrieves all the person records from the database',


    inputs: {},
    
    exits: sails.config.custom.responseTypes,

    fn: async function (inputs, exits) {

        // Initialize the request ID and the filename. These variables will be used for logging and tracing purposes
        const REQUEST_ID = this.req.headers.requestId;
		const FILE_PATH = __filename.split('controllers')[1];

		sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Starting...`);

        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Attempting to fetch the persons from the database...`);
        // Use the helper function to fetch all the persons
        let allPersons = await sails.helpers.arangoQuery.with({
            requestId: REQUEST_ID,
            query: 'FOR person IN persons FILTER person.isActive == true RETURN person'
        });

        // Handle the possible errors returned by the helper function
        if(allPersons && allPersons.status === "error") {
            // If the error is a logical error, return a response with status 400
            if(allPersons.data && allPersons.data.errorCode && allPersons.data.errorCode === 400) {
                sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Logical error detected when querying the database. Returning a Logical error response`);
                return exits.logicalError({
                    status: 'LOGICAL_ERROR',
                    data: allPersons.data.message
                });
            }

            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Server error detected when querying the database. Returning a server error response`);
            // If the error is a server error, return a response with status 500
            return exits.serverError({
                status: 'SERVER_ERROR',
                data: allPersons.data.message
            });
        }
        
        // If no records were found in the database, log it
        if(!allPersons.data || allPersons.data.length === 0) {
            allPersons.data = [];
            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Unable to find any person record in the database.`);
        }
        else 
            sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Returning ${allPersons.data.length} person records.`);
        
        return exits.success({
            status: 'success',
            data: allPersons.data
        });
    }
}