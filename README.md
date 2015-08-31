[![Build Status](https://travis-ci.org/crwang/rendr-api-proxy-optionable.svg?branch=master)](https://travis-ci.org/crwang/rendr-api-proxy-optionable) 
[![Code Climate](https://codeclimate.com/github/crwang/rendr-api-proxy-optionable/badges/gpa.svg)](https://codeclimate.com/github/crwang/rendr-api-proxy-optionable)
[![Dependency Status](https://david-dm.org/crwang/rendr-api-proxy-optionable.png)](https://david-dm.org/crwang/rendr-api-proxy-optionable)

Provides an implementation for a Rendr api proxy that allows options.

Currently, options for request header and response header passthroughs are supported.

This solves issues with passing request headers like cookies to maintain session state.

It also helps with the responses headers for common tags like `etag` and link header paging, eg: https://developer.github.com/guides/traversing-with-pagination/

## How it Works

The API Proxy will look for `headerPassthrough` keys in the options of the dataAdapter.  If the keys are found, they will be added into the request or response.

## Setup

### Installation

Install the package and save it to package.json through the `--save` option.

```bash
npm install rendr-api-proxy-optionable --save
```

### Use the customApiProxy and add the config for the header passthrough options.

index.js

```js

// Add the require
var customApiProxy = require('rendr-api-proxy-optionable'),
    ...

// Add the dataAdapterConfig to determine what to pass through.
// This could be configured using node-config.
var dataAdapterConfig = {
    default: {
        host: 'localhost:3000', // put your default here
        protocol: 'http',
        headerPassthrough: { // pass through to handle things like link headers
            response: [
                'link',
                'etag',
                'total',
                'cache-control',
                'per-page'
            ]
        }
    },
    session: {
        host: 'localhost:3030', // an example of local here
        protocol: 'http',
        headerPassthrough: { // pass through cookies for session purposes
            request: [
                'cookie'
            ]
        }
    }
};

// Add the custom apiProxy when creating the server
var server = rendr.createServer({
    dataAdapterConfig: dataAdapterConfig,
    apiProxy: customApiProxy
});
```


## Tests

To run the tests, run `npm test` from the command-line.
