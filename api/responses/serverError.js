module.exports = function serverError(data) {
	if(!data)
		data = {
			status: "serverError",
			message: "Internal Server Error"
		}
	return this.res.status(500).send(data);
};
