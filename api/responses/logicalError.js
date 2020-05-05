module.exports = function logicalEror(data) {
	if(!data)
		data = {
			status: "error",
			message: "Logical Error"
		}
	return this.res.status(400).send(data);
};
