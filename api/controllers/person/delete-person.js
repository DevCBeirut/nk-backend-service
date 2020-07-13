module.exports = {


	friendlyName: 'Delete Person',


	description: 'Deletes a person record from the database',


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
        const REQUEST_ID = this.req.requestId;
		const FILE_PATH = __filename.split('controllers')[1];

		sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Starting...`);

        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Attempting to delete the person with ID ${inputs.id} from the database...`);
        // Use the helper function to delete the person
        let deletedPerson = await sails.helpers.arangoQuery.with({
            requestId: REQUEST_ID,
            query: `FOR person IN persons
                    FILTER person._key == @personId
                    AND person.isActive == true
                    UPDATE person
                        WITH 
                            {
                                isActive: false,
                                deletedAt: @timestamp,
                                updatedAt: @timestamp
                            }
                        IN persons
                    RETURN NEW`,
            queryParams: { personId: inputs.id, timestamp: + new Date()}
        });

        // Handle the possible errors returned by the helper function
        if(deletedPerson && deletedPerson.status === "error") {
            // If the error is a logical error, return a response with status 400
            if(deletedPerson.data && deletedPerson.data.errorCode && deletedPerson.data.errorCode === 400) {
                sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Logical error detected when querying the database. Returning a Logical error response`);
                return exits.logicalError({
                    status: 'LOGICAL_ERROR',
                    data: deletedPerson.data.message
                });
            }

            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Server error detected when querying the database. Returning a server error response`);
            // If the error is a server error, return a response with status 500
            return exits.serverError({
                status: 'SERVER_ERROR',
                data: deletedPerson.data.message
            });
        }
        
        // If no person record was found in the database, log it.
        if(!deletedPerson.data || deletedPerson.data.length === 0) {
            deletedPerson.data = [];
            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Unable to find any person record with ID ${inputs.id} in the database.`);
            return exits.logicalError({
                status: 'error',
                data: []
            });
        }
        else 
            sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Successfully deleted a person record for person ID: ${inputs.id}`);
        
        return exits.success({
            status: 'success',
            data: deletedPerson.data
        });
    }
}