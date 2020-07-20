module.exports = {

	friendlyName : `Health Check API`,

	descriptions : `Returns a response with status 200 signaling that the service is up and running.`,

	extendedDescription : `This is a health check API. It is used to ensure that the service is up and running. Upon being called, the API returns a 200 response`,
	
	inputs : {},

	exits : sails.config.custom.responseTypes,

	fn : async function(inputs, exits) {
		return exits.success({
			status: "success",
			data: "The gateway service is running"
		});
	}
};
