module.exports = {

	friendlyName: 'Perform an Arango Query',


    description: 'A generic function that performs a query on the Arango Database, and returns a result',
    

    inputs : {
        password: {
			type: 'string',
			required: true,
			description: 'The password to be hashed'
        },
        requestId: {
			type: 'string',
			required: true,
			description: 'The ID of the incoming request. The request ID is used for tracing purposes'
        },
        action: {
			type: 'string',
            required: true,
            isIn: ['hashPassword', 'comparePassword'],
			description: 'The ID of the incoming request. The request ID is used for tracing purposes'
        },
        hashedPassword: {
			type: 'string',
			required: false,
			description: 'The hashed password with which the plaintext password is going to be compared. It is only required when the action is "comaprePassword"'
        },
    },

    exits: {},

    fn: async function (inputs, exits) {
        // Initialize the filename. This variable will be used for logging purposes 
        const FILE_PATH = __filename.split('helpers')[1];
        const BCRYPT = require('bcrypt');

        // If the action is hashPassword, generate an encrypted password from the plain text one and return it
        if(inputs.action === "hashPassword") {
            sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Generating an encrypted password...`);
            let beforeEncryptionTimeStamp = + new Date()
            const SALT = await BCRYPT.genSalt(10);
            let hashedPassword = await BCRYPT.hash(inputs.password, SALT);
            
            sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Successfully encrypted the password in ${(+ new Date() - beforeEncryptionTimeStamp)} milliseconds`);
    
            return exits.success(hashedPassword);
        }
        // If the action is comparePassword, compare the hashed password with the plain text one and return the result
        else {
            let passwordMatch = await BCRYPT.compare(inputs.password, inputs.hashedPassword);
            return exits.success(passwordMatch);
        }
    }
}