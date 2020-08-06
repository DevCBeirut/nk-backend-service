/**
 * Seed Function
 * (sails.config.bootstrap)
 *
 * A function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also create a hook.
 *
 * For more information on seeding your app with fake data, check out:
 * https://sailsjs.com/config/bootstrap
 */

module.exports.bootstrap = async (cb) => {

	const FILE_PATH = __filename.split('config')[1];
    const ARANGO_CLIENT = require('arangojs');
      
    const db = new ARANGO_CLIENT.Database({
        url: `http://${process.env.ARANGODB_USERNAME}:${process.env.ARANGODB_PASSWORD}@${process.env.ARANGODB_HOST}:${process.env.ARANGODB_PORT}/`,
    });

	try {
		sails.log.info(`${FILE_PATH}: Attempting to initialize the required database and collection`);
		sails.log.info(`${FILE_PATH}: fetching the available databases`);
		// List all the databases available
		const dbNames = await db.listDatabases();
	
		if(dbNames.includes(process.env.ARANGODB_DB_NAME)) {
			sails.log.info(`${FILE_PATH}: The database already has a database named '${process.env.ARANGODB_DB_NAME}'`);
			sails.log.info(`${FILE_PATH}: Checking the existence of collection ${process.env.ARANGODB_DB_NAME}`);
			
			// use the existing database
			db.useDatabase(process.env.ARANGODB_DB_NAME);
			const collections = await db.collections();
			
			// check if the collection already exists
			for([oneCollectionIndex, oneCollection] of collections.entries()) {
				if(oneCollection.name === process.env.ARANGODB_DB_NAME) {
					sails.log.info(`${FILE_PATH}: Collection '${process.env.ARANGODB_DB_NAME}' already exists. Launching the service...`);
					return cb();
				}
			}

			sails.log.info(`${FILE_PATH}: Collection '${process.env.ARANGODB_DB_NAME}' does not exist. Attempting to create it...`);
			
			const personsCollection = db.collection(process.env.ARANGODB_DB_NAME);
			await personsCollection.create();

			sails.log.info(`${FILE_PATH}: Successfully created the '${process.env.ARANGODB_DB_NAME}' collection. Launching the service...`);
			return cb();
		}

		sails.log.info(`${FILE_PATH}: The database does not have a database named '${process.env.ARANGODB_DB_NAME}'. Creating the database...`);
		
		const newDb = await db.createDatabase(process.env.ARANGODB_DB_NAME);
		
		sails.log.info(`${FILE_PATH}: Successfully created the database:`);
		sails.log.info(`${FILE_PATH}: ${JSON.stringify(newDb)}`);

		// use the newly created database
		db.useDatabase(process.env.ARANGODB_DB_NAME);

		// Create the persons Collection
		sails.log.info(`${FILE_PATH}: Attempting to create the '${process.env.ARANGODB_DB_NAME}' collection`);
		
		const personsCollection = db.collection(process.env.ARANGODB_DB_NAME);
		await personsCollection.create();

		sails.log.info(`${FILE_PATH}: Successfully created the '${process.env.ARANGODB_DB_NAME}' collection`);
		return cb();

	} catch (error) {
		sails.log.info(error)
		sails.log.info(`${FILE_PATH}: Error while initializing the database. Exiting...`);
		process.exit(0);
	}

};
