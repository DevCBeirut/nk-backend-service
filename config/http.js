/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */
module.exports.http = {

  /****************************************************************************
  *                                                                           *
  * Sails/Express middleware to run for every HTTP request.                   *
  * (Only applies to HTTP requests -- not virtual WebSocket requests.)        *
  *                                                                           *
  * https://sailsjs.com/documentation/concepts/middleware                     *
  *                                                                           *
  ****************************************************************************/

  middleware: {

    /***************************************************************************
    *                                                                          *
    * The order in which middleware should be run for HTTP requests.           *
    * (This Sails app's routes are handled by the "router" middleware below.)  *
    *                                                                          *
    ***************************************************************************/

    order: [
		'requestIdGenerator',
		'cookieParser',
		'session',
		'bodyParser',
		'compress',
		'poweredBy',
		'router',
		'www',
		'favicon',
    ],

	/**
	 * If the incoming request does not contain a unique ID, create a new one 
	 */
	requestIdGenerator: (function () {
			return function (req, res, cb) {
				if (req.url !== '/health' && !req.headers.requestId) {
					req.headers.requestId = req.headers.requestid ? req.headers.requestid : Math.floor(Math.random() * Math.floor(99999)) + new Date().getTime();
					sails.log.info(`Incoming Request ID: ${req.headers.requestId}, { ${req.method}: ${req.url}}`);
				}
				return cb();
			}
		})(),
	},

};
