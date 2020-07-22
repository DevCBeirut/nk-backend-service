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

        if(allPersons && allPersons.status === "serverError")
        sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Server error detected when fetching the person records from the database`);
        
        else if(allPersons && allPersons.status === "logicalError")
            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Logical error detected when fetching the person records from the database`);
        
        else if(!allPersons.data || allPersons.data.length === 0) {
            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Unable to find any person record in the database.`);
            person = {
                status: 'logicalError',
                data: `Unable to find any person records in the database.`
            };
        }
        else 
            sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Successfully fetched all the person records from the database`);
        
        return exits[allPersons.status](allPersons);
    }
}