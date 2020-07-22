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

        if(person && person.status === "serverError")
            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Server error detected when fetching the information of person ${inputs.id}`);
        
        else if(person && person.status === "logicalError")
            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Logical error detected when fetching the information of person ${inputs.id}`);
        
        else if(!person.data || person.data.length === 0) {
            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Unable to find any person record with ID ${inputs.id} in the database.`);
            person = {
                status: 'logicalError',
                data: `Unable to find any person record with ID ${inputs.id} in the database.`
            };
        }
        else 
            sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Successfully fetched person record with ID ${inputs.id}`);
        
        return exits[person.status](person);
    }
}