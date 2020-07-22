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
        const REQUEST_ID = this.req.headers.requestId;
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

        if(deletedPerson && deletedPerson.status === "serverError")
            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Server error detected when deleting person record with ID ${inputs.id}`);
        
        else if(deletedPerson && deletedPerson.status === "logicalError")
            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Logical error detected when deleting person record with ID ${inputs.id}`);
        
        else if(!deletedPerson.data || deletedPerson.data.length === 0) {
            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Unable to find any person record with ID ${inputs.id} in the database.`);
            deletedPerson = {
                status: 'logicalError',
                data: `Unable to find any person record with ID ${inputs.id} in the database.`
            };
        }
        else 
            sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Successfully deleted person record with ID ${inputs.id}`);
        
        return exits[deletedPerson.status](deletedPerson)
    }
}