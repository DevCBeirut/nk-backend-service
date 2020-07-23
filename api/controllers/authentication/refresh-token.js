module.exports = {


	friendlyName: 'Refresh Token',


	description: 'Creates a new Access Token and Refresh Token for a user, if the Refresh Token is still valid',


    inputs: {
        accessToken: {
            type: 'string',
            description: 'The old expired JWT access token',
            required: true
        },
        refreshToken: {
            type: 'string',
            description: 'The old JWT refresh token',
            required: true
        },
    },
    
    exits: sails.config.custom.responseTypes,

    fn: async function (inputs, exits) {
        const jwt = require("jsonwebtoken");
        const REQUEST_ID = this.req.headers.requestId;
        const FILE_PATH = __filename.split('controllers')[1];

        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Starting...`);
        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Verifying the validity of the refresh token`);
        
        let data;
        try {
            data = await jwt.verify(inputs.refreshToken, sails.config.custom.jwt.secret);
        } catch (error) {
            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Invalid Refresh Token. Exiting`);
            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: ${error.name}, ${error.message}, ${error.expiredAt}`);
            return exits.unauthorized({status: "unauthorized", data: "Invalid Refresh Token"});
        }

        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Successfully verified the validity of the refresh token`);
        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Extracted info: ${JSON.stringify(data)}`);
        // Create JWT Access and Refresh tokens
        let tokens = await sails.helpers.createJwtTokens.with(
            {
                requestId: REQUEST_ID, 
                email: data.data.email,
                isAdmin: data.data.isAdmin ? data.data.isAdmin : false
            }
        );

        // If unable to generate tokens, return a server error response
        if(tokens.status && tokens.status === "error")
            return exits.serverError(tokens);

        return exits.success({
            status: 'success',
            data: tokens.data
        });
    }
}