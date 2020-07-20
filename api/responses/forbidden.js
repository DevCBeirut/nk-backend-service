module.exports = function logicalEror(data) {
	if(!data)
		data = {
			status: "forbidden",
			message: "Forbidden Access"
		}
	return this.res.status(403).send(data);
};
