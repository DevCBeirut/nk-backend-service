module.exports.routes = {
	'GET /health': { action: 'health-check' },

	'GET /persons': { action: 'person/get-persons' },
	'GET /person/:id': { action: 'person/get-person-details' },
	'POST /person' : {action: 'person/create-person'},
	'DELETE /person/:id' : {action: 'person/delete-person'},

	'POST /login': { action: 'authentication/login'},
	'PUT /token/refresh': {action: 'authentication/refresh-token'}
};
