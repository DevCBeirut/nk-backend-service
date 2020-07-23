module.exports = {

	friendlyName: 'Create JWT Tokens',


    description: 'A generic function that performs a query on the Arango Database, and returns a result',
    

    inputs : {
        email: {
			type: 'string',
			required: true,
			description: 'The email of the user'
        },
        isAdmin: {
            type: 'boolean',
            required: false,
            defaultsTo: false,
            description: 'An attribute specifying if the person is an admin'
        },
        requestId: {
			type: 'string',
			required: true,
			description: 'The ID of the incoming request. The request ID is used for tracing purposes'
        },
        personId: {
			type: 'string',
			required: true,
			description: 'The Arango ID of the person'
        }
    },

    exits: {},

    fn: async function (inputs, exits) {
        // Initialize the filename. This variable will be used for logging purposes 
        const FILE_PATH = __filename.split('helpers')[1];
        const jwt = require("jsonwebtoken");
        try {
            // Create a JWT access Token
            sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Creating a JWT Access Token for ${inputs.email}`)
            let accessToken = await jwt.sign(
                {
                    data: {
                        email: inputs.email,
                        isActive: true,
                        isAdmin: inputs.isAdmin,
                        personId: inputs.personId,
                        date: new Date()
                    }
                }, 
                // The JWT secret
                sails.config.custom.jwt.secret
                , 
                {
                    expiresIn: sails.config.custom.jwt.accessTokenValidity
                }
            );
            sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Successfully created a JWT Access Token for ${inputs.email}`)
            sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: ${accessToken}`);
            // Create a JWT Refresh Token
            sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Creating a JWT Refresh Token for ${inputs.email}`)
            
            let refreshToken = await jwt.sign(
                {
                    data: {
                        email: inputs.email,
                        isActive: true,
                        isAdmin: inputs.isAdmin,
                        personId: inputs.personId,
                        date: new Date()
                    }
                }, 
                // The JWT secret
                sails.config.custom.jwt.secret
                , 
                {
                    expiresIn: sails.config.custom.jwt.refreshTokenValidity
                }
            );
            sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Successfully created a JWT Refresh Token for ${inputs.email}`)
            sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: ${refreshToken}`);

            return exits.success(
                {
                    status: "success",
                    data: {
                        accessToken: accessToken,
                        refreshToken: refreshToken
                    }
                }
            )
        } catch (error) {
            sails.log.warn(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Unable to create JWT Tokens for ${inputs.email}`)
            sails.log.warn(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: ${error}`);

            return exits.success({status: "serverError", data: "Unable to create JWT Tokens"})
        }
    }
}



