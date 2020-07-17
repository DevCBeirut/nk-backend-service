module.exports = function logicalEror(data) {
	if(!data)
		data = {
			status: "error",
			message: "Unauthorized Access"
		}
	return this.res.status(401).send(data);
};
