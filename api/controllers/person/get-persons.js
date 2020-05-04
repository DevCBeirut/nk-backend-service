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

        let allEmployees = await sails.helpers.arangoQuery.with({
            requestId: REQUEST_ID,
            query: 'FOR employee IN employee RETURN employee'
        });

        return exits.success({
            status: 'success',
            data: allEmployees
        });
    }
}