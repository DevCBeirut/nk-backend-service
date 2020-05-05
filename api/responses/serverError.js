module.exports = function serverError(data) {
	if(!data)
		data = {
			status: "error",
			message: "Internal Server Error"
		}
	return this.res.status(500).send(data);
};
