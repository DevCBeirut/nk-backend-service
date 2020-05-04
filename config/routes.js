module.exports.routes = {
	'GET /health': { action: 'health-check' },

	'GET /persons': { action: 'person/get-persons' },
};
