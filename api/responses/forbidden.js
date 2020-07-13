module.exports = function logicalEror(data) {
	if(!data)
		data = {
			status: "error",
			message: "Forbidden Access"
		}
	return this.res.status(403).send(data);
};
