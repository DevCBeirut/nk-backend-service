module.exports = {


	friendlyName: 'Get a person based on their Arango ID',


	description: 'Retrieves a person record from the database',


    inputs: {
        id: {
			type: 'string',
			required: true,
			description: 'The Arango ID of the person.'
        }
    },
    
    exits: sails.config.custom.responseTypes,

    fn: async function (inputs, exits) {

        // Initialize the request ID and the filename. These variables will be used for logging and tracing purposes
        const REQUEST_ID = this.req.headers.requestId;
		const FILE_PATH = __filename.split('controllers')[1];

		sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Starting...`);

        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Attempting to fetch the person with ID ${inputs.id} from the database...`);
        // Use the helper function to fetch all the persons
        let person = await sails.helpers.arangoQuery.with({
            requestId: REQUEST_ID,
            query: 'FOR person IN persons FILTER person._key == @personId AND person.isActive == true RETURN person',
            queryParams: { personId: inputs.id}
        });

        // Handle the possible errors returned by the helper function
        if(person && person.status === "error") {
            // If the error is a logical error, return a response with status 400
            if(person.data && person.data.errorCode && person.data.errorCode === 400) {
                sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Logical error detected when querying the database. Returning a Logical error response`);
                return exits.logicalError({
                    status: 'LOGICAL_ERROR',
                    data: person.data.message
                });
            }

            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Server error detected when querying the database. Returning a server error response`);
            // If the error is a server error, return a response with status 500
            return exits.serverError({
                status: 'SERVER_ERROR',
                data: person.data.message
            });
        }
        
        // If no person record was found in the database, log it.
        if(!person.data || person.data.length === 0) {
            person.data = [];
            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Unable to find any person record with ID ${inputs.id} in the database.`);
        }
        else 
            sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Successfully found a person record for person ID: ${inputs.id}`);
        return exits.success({
            status: 'success',
            data: person.data
        });
    }
}