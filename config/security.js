module.exports.security = {
  cors: {
      allRoutes: true,
      allowRequestMethods: 'GET, POST, DELETE, PUT, OPTIONS, HEAD',
      allowRequestHeaders: 'access-control-allow-headers,access-control-allow-methods,access-control-allow-origin,authorization,content-type,platform',
  }
};
