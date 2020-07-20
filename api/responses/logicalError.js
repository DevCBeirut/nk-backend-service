module.exports = function logicalEror(data) {
	if(!data)
		data = {
			status: "logicalError",
			message: "Logical Error"
		}
	return this.res.status(400).send(data);
};
