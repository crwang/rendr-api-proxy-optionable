var should = require('should'),
    sinon = require('sinon'),
    apiProxy = require('../index');

var httpMocks = require('node-mocks-http');

describe('apiProxy', function() {

    var dataAdapterConfig = {
        default: {
            host: 'localhost',
            protocol: 'http',
            headerPassthrough: {
                request: [
                    'cookies'
                ],
                response: [
                    'link',
                    'etag',
                    'total',
                    'cache-control',
                    'per-page'
                ]
            }
        }
    };
    var requestHeaders = {
        'host': 'any.host.name',
        'cookies': 'pass it'
    };
    var responseHeaders = {
        etag: 'an etag',
        link: 'link header response',
        'dont-pass-me': 'this should not be passed through'
    };

    describe('middleware', function() {

        var dataAdapter, proxy, requestFromClient, responseToClient, requestToApi;
        
        context('apiProxy', function() {
            var defaultModelAttrs;

            requestToApi = function(req, api, options, callback) {
                callback(null, {
                    statusCode: 200,
                    headers: responseHeaders
                }, {
                    what: 'ever'
                });
            };
            
            dataAdapter = {
                request: requestToApi,
                options: dataAdapterConfig
            };

            beforeEach(function() {
                var body = {
                    what: 'ever'
                };

                requestFromClient = httpMocks.createRequest({
                    method: 'GET',
                    url: '/',
                    headers: requestHeaders
                });

                responseToClient = httpMocks.createResponse();
                proxy = apiProxy(dataAdapter);

            });

            it('should pass through the specified response header', function() {
                proxy(requestFromClient, responseToClient);
                var proxyResponseHeaders = responseToClient._getHeaders();
                proxyResponseHeaders.link.should.eql(responseHeaders.link);
            });

            it('should not pass unspecified response headers', function() {
                proxy(requestFromClient, responseToClient);
                var proxyResponseHeaders = responseToClient._getHeaders();
                should.not.exist(proxyResponseHeaders['dont-pass-me']);
            });

            it('passes through the request headers', function() {
                var api = {
                    api: "default",
                    body: {},
                    headers: {
                        cookies: "pass it", // passed through header
                        'x-forwarded-for': undefined
                    },
                    method: "GET",
                    path: "/",
                    query: {}
                };
                var spy = sinon.spy(dataAdapter, 'request');
                proxy(requestFromClient, responseToClient);
                sinon.assert.calledOnce(spy);
                sinon.assert.calledWith(spy, requestFromClient, api, {
                    convertErrorCode: false
                });
            });
        });
    });

    describe('getPassthroughHeaders', function() {

        var originalHeaders = {
            'dont-pass-me': 'any.host.name',
            cookies: 'pass it'
        };
        var headers = apiProxy.getPassthroughHeaders(originalHeaders, dataAdapterConfig.
            default.headerPassthrough.request);

        it('should pass through the specified header', function() {
            headers.cookies.should.eql(originalHeaders.cookies);
        });

        it('should not pass headers not specified', function() {
            should.not.exist(headers['dont-pass-me']);
        });
    });
});
