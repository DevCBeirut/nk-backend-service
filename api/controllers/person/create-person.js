module.exports = {


	friendlyName: 'Create a person record',


	description: 'Creates a new person record in the database, provided that this user does not exist',


    inputs: {
        firstName: {
            type: 'string',
            description: 'The first name of the person',
            required: true
        },
        lastName: {
            type: 'string',
            description: 'The last name of the person',
            required: true
        },
        age: {
            type: 'number',
            description: 'The age of the person',
            required: true,
            min: 1,
            max: 120
        },
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
        },
        dob: {
            type: 'string',
            description: 'Date of birth YYYY-MM-DD',
            required: true,
            regex: /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/
        }
    },
    
    exits: sails.config.custom.responseTypes,

    fn: async function (inputs, exits) {

        // Initialize the request ID and the filename. These variables will be used for logging and tracing purposes
        const REQUEST_ID = this.req.requestId;
		const FILE_PATH = __filename.split('controllers')[1];

        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Starting...`);

        inputs.password = await sails.helpers.bcryptHelper.with({action: "hashPassword", password: inputs.password, requestId: REQUEST_ID});

        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Attempting to create a new person with email ${inputs.email} in the database...`);
        // Use the helper function to fetch all the persons
        let createPerson = await sails.helpers.arangoTransaction.with({
            requestId: REQUEST_ID,
            collections: {write: ['persons'], read: ['persons']},
            action: String((params) => {
                let db = require('@arangodb').db;
                // Custom ArangoDB error generator
                let handledError = new require('@arangodb').ArangoError();
                handledError.errorNum = 400;
                // Check if the user already exists in the database
                let userAlreadyExists = db._query(
                    'FOR person IN persons FILTER person.isActive == true AND person.email == @email AND person.deletedAt == null RETURN person',
                    {
                        email: params.email
                    }
                ).toArray();

                // If a user record with the same email exists, generate an error
                if(userAlreadyExists && userAlreadyExists.length > 0) {
                    // generate an Arango handled error
                    handledError.errorMessage = `A person with email ${params.email} already exists. Please choose a different email.`;
                    throw handledError;
                }

                // If a user record does not exist, create the user record in the database
                let createdUser = db._query(
                    `INSERT @person INTO persons RETURN NEW`, 
                    {
                        person: {
                            firstName: params.firstName,
                            lastName: params.lastName,
                            age: params.age,
                            dob: params.dob,
                            email: params.email,
                            password: params.password,
                            createdAt: + new Date(),
                            updatedAt: + new Date(),
                            isActive: true
                        }
                    }
                ).toArray();
                
                // If unable to create user, generate an error
                if(!createdUser || createdUser.length === 0) {
                    // generate an Arango handled error
                    handledError.errorMessage = `Unable to create user with email ${params.email}`;
                    throw handledError;
                }

                // Else, return the user record
                return {status: "success", data: createdUser[0]};
            }),
            params: inputs
        });

        // Handle the possible errors returned by the helper function
        if(createPerson && createPerson.status === "error") {
            // If the error is a logical error, return a response with status 400
            if(createPerson.data && createPerson.data.errorCode && createPerson.data.errorCode === 400) {
                sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Logical error detected when creating a person record in the database. Returning a logical error response`);
                return exits.logicalError({
                    status: 'LOGICAL_ERROR',
                    data: createPerson.data.message
                });
            }

            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Server error detected when creating a person record in the database. Returning a server error response`);
            // If the error is a server error, return a response with status 500
            return exits.serverError({
                status: 'SERVER_ERROR',
                data: createPerson.data.message
            });
        }
        
        // Return a successful response
        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Successfully created a new person record.`);
        
        return exits.success({status: "success", data: createPerson});
    }
}