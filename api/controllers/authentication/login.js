module.exports = {


	friendlyName: 'Login',


	description: 'Logs a user based on their email and password, and generates a JWT token and refresh token',


    inputs: {
        email: {
            type: 'string',
            description: 'The email of the person',
            required: true
        },
        password: {
            type: 'string',
            description: 'The password of the person',
            minLength: 8,
            maxLength: 32,
            required: true
        }
    },
    
    exits: sails.config.custom.responseTypes,

    fn: async function (inputs, exits) {

        // Initialize the request ID and the filename. These variables will be used for logging and tracing purposes
        const REQUEST_ID = this.req.headers.requestId;
        const FILE_PATH = __filename.split('controllers')[1];
        
		sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Starting...`);

        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Attempting to log ${inputs.email} in...`);
        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Fetching the user data from the database...`);

        let person = await sails.helpers.arangoQuery.with({
            requestId: REQUEST_ID,
            query: 'FOR person IN persons FILTER person.email == @email AND person.isActive == true RETURN person',
            queryParams: {email: inputs.email}
        });

        // Handle the possible errors returned by the helper function
        if(person && (person.status === "serverError" || person.status === "logicalError")) {
            // If the error is a logical error, return a response with status 400
            if(person.status === "logicalError") 
                sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Logical error detected when querying the database. Returning a Logical error response`);
            else
                sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Server error detected when querying the database. Returning a server error response`);
            // If the error is a server error, return a response with status 500
            return exits[person.status](person);
        }
        
        // If no person record was found in the database, log it and exit.
        if(!person.data || person.data.length === 0) {
            person.data = [];
            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Unable to find any person record with email ${inputs.email} in the database.`);
            return exits.logicalError({
                status: 'logicalError',
                data: `Unable to find any person record with email ${inputs.email} in the database.`
            });
        }

        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Successfully found the person record in the database...`);
        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Evaluating the password entered...`);

        let passwordMatch = await sails.helpers.bcryptHelper.with(
            {
                action: "comparePassword", 
                requestId: REQUEST_ID, 
                password: inputs.password, 
                hashedPassword: person.data[0].password
            }
        );
        
        // If the passwords don't match, returm am error
        if(!passwordMatch) {
            sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: the password entered does not match the user's password. Exiting...`);
            return exits.forbidden({
                status: "forbidden",
                data: "Password is incorrect"
            });
        }

        // Create JWT Access and Refresh tokens
        let tokens = await sails.helpers.createJwtTokens.with(
            {
                requestId: REQUEST_ID, 
                email: person.data[0].email, 
                isAdmin: person.data[0].isAdmin ? person.data[0].isAdmin : false
            }
        );

        // If unable to generate tokens, return a server error response
        if(tokens.status && tokens.status === "error")
            return exits.serverError({
                status: "serverError",
                data: tokens
            });

        return exits.success({
            status: 'success',
            data: {
                user: person.data[0],
                tokens: tokens.data
            }
        });
    }
}