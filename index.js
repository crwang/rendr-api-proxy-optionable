var _ = require('underscore');
rendrApiProxy = require('rendr/server/middleware/apiProxy');

/**
 * Middleware handler for intercepting API routes.
 */
module.exports = apiProxyOptionable;

function apiProxyOptionable(dataAdapter) {
    return function(req, res, next) {
        var api;

        api = _.pick(req, 'query', 'method', 'body');

        api.path = rendrApiProxy.getApiPath(req.path);
        api.api = rendrApiProxy.getApiName(req.path) || 'default';
        api.headers = {
            'x-forwarded-for': rendrApiProxy.getXForwardedForHeader(req.headers, req.ip)
        };

        // Pass through specified headers.
        var headerPassthrough = dataAdapter.options[api.api].headerPassthrough;

        if (headerPassthrough && headerPassthrough.request) {
            _.extend(api.headers || {}, apiProxyOptionable.getPassthroughHeaders(req.headers, headerPassthrough.request));
        }

        dataAdapter.request(req, api, {
            convertErrorCode: false
        }, function(err, response, body) {
            if (err) return next(err);

            // Pass through statusCode.
            res.status(response.statusCode);

            // Pass through specified headers.
            if (headerPassthrough && headerPassthrough.response) {
                var responseHeaders = apiProxyOptionable.getPassthroughHeaders(response.headers, headerPassthrough.response);

                if (responseHeaders) {
                    res.set(responseHeaders);
                }
            }
            if (!response.jsonp) {
                res.json(body);
            } else {
                res.jsonp(body);
            }
        });
    };
}

apiProxyOptionable.getPassthroughHeaders = function getPassthroughHeaders(
    originalHeaders, passthroughKeys) {
    return _.pick(originalHeaders, passthroughKeys);
};
