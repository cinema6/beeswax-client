'use strict';

var urlUtils        = require('url'),
    util            = require('util'),
    Promise         = require('bluebird'),
    rp              = require('request-promise'),
    rpErrors        = require('request-promise/errors');
    
/* Node doesn't have Beeswax's root CAs' SSL certs; this module injects common root CAs' certs
 * into https.globalAgent.options + fixes the issue */
require('ssl-root-cas').inject();

// Return true if value is a Plain Old Javascript Object
function isPOJO(value) {
    return !!(value && value.constructor === Object);
}

// Upon instantiation, will setup objects with bound CRUD methods for each entry here
var entities = {
    advertisers: {
        endpoint: '/rest/advertiser',
        idField: 'advertiser_id'
    },
    campaigns: {
        endpoint: '/rest/campaign',
        idField: 'campaign_id'
    },
    creatives: {
        endpoint: '/rest/creative',
        idField: 'creative_id'
    }
};


function BeeswaxClient(opts) {
    var self = this;

    opts = opts || {};
    if (!opts.creds || !opts.creds.email || !opts.creds.password) {
        throw new Error('Must provide creds object with email + password');
    }
    
    self.apiRoot = opts.apiRoot || 'https://stingersbx.api.beeswax.com';
    self._creds = opts.creds;
    self._cookieJar = rp.jar();
    
    Object.keys(entities).forEach(function(type) {
        var cfg = entities[type];
        self[type] = {};
        self[type].find = self._find.bind(self, cfg.endpoint, cfg.idField);
        self[type].query = self._query.bind(self, cfg.endpoint);
        self[type].create = self._create.bind(self, cfg.endpoint, cfg.idField);
        self[type].edit = self._edit.bind(self, cfg.endpoint, cfg.idField);
        self[type].delete = self._delete.bind(self, cfg.endpoint, cfg.idField);
    });
}

// Send a request to authenticate to Beeswax
BeeswaxClient.prototype.authenticate = function() {
    var self = this;
        
    // Ensure we don't make multiple simulataneous auth requests
    if (self._authPromise) {
        return self._authPromise;
    }
    
    self._authPromise = rp.post({
        url: urlUtils.resolve(self.apiRoot, '/rest/authenticate'),
        body: {
            email: self._creds.email,
            password: self._creds.password,
            keep_logged_in: true // tells Beeswax to use longer lasting sessions
        },
        json: true,
        jar: self._cookieJar
    })
    .then(function(body) {
        if (body.success === false) {
            return Promise.reject(new Error(util.inspect(body)));
        }
    })
    .catch(function(error) {
        delete error.response; // Trim response obj off error for cleanliness
        return Promise.reject(error);
    }).finally(function() {
        delete self._authPromise;
    });
    
    return self._authPromise;
};

// Send a request to Beeswax, handling '401 - Unauthenticated' errors
BeeswaxClient.prototype.request = function(method, opts) {
    var self = this;
    
    opts.json = true;
    opts.jar = self._cookieJar;
    
    return (function sendRequest() {
        return rp[method](opts)
        .catch(rpErrors.StatusCodeError, function(error) {
            if (error.statusCode !== 401) {
                return Promise.reject(error);
            }
            
            return self.authenticate().then(sendRequest);
        });
    }())
    .then(function(body) {
        if (body.success === false) {
            return Promise.reject(new Error(util.inspect(body)));
        }
        return body;
    })
    .catch(function(error) {
        delete error.response; // Trim response obj off error for cleanliness
        return Promise.reject(error);
    });
};

// Send a GET request to find a single entity by id
BeeswaxClient.prototype._find = function(endpoint, idField, id) {
    var opts = {
        url: urlUtils.resolve(this.apiRoot, endpoint),
        body: {}
    };
    opts.body[idField] = id;
    return this.request('get', opts).then(function(body) {
        return { success: true, payload: body.payload[0] };
    });
};

// Send a GET request to fetch entities by JSON query
BeeswaxClient.prototype._query = function(endpoint, body) {
    var opts = {
        url: urlUtils.resolve(this.apiRoot, endpoint),
        body: body || {}
    };
    return this.request('get', opts).then(function(body) {
        return { success: true, payload: body.payload };
    });
};

// Send a POST request to create a new entity. GETs + resolves with the created entity.
BeeswaxClient.prototype._create = function(endpoint, idField, body) {
    var self = this;
    // Beeswax sends a weird 401 error if a body is empty, so handle this here
    if (!isPOJO(body) || Object.keys(body || {}).length === 0) {
        return Promise.resolve({
            success: false,
            code: 400,
            message: 'Body must be non-empty object',
        });
    }

    var opts = {
        url: urlUtils.resolve(self.apiRoot, endpoint) + '/strict',
        body: body
    };
    return self.request('post', opts).then(function(body) {
        return self._find(endpoint, idField, body.payload.id);
    });
};

// Send a PUT request to edit an existing entity by id. GETs + resolves with the updated entity.
BeeswaxClient.prototype._edit = function(endpoint, idField, id, body, failOnNotFound) {
    var self = this;
    if (!isPOJO(body) || Object.keys(body || {}).length === 0) {
        return Promise.resolve({
            success: false,
            code: 400,
            message: 'Body must be non-empty object',
        });
    }

    var opts = {
        url: urlUtils.resolve(this.apiRoot, endpoint) + '/strict',
        body: body
    };
    opts.body[idField] = id;
    return this.request('put', opts).then(function(/*body*/) {
        return self._find(endpoint, idField, id);
    })
    .catch(function(resp) {
        /* Catch + return "object not found" errors as unsuccessful responses. Can instead set
         * failOnNotFound param to true to reject the original error. */
        var notFound = false;
        try {
            notFound = resp.error.payload[0].message.some(function(str) {
                return (/Could not load object.*to update/).test(str);
            });
        } catch(e) {}
        
        if (!!notFound && !failOnNotFound) {
            return Promise.resolve({
                success: false,
                code: 400,
                message: 'Not found',
            });
        }
        
        return Promise.reject(resp);
    });
};

// Send a DELETE request to delete an entity by id
BeeswaxClient.prototype._delete = function(endpoint, idField, id, failOnNotFound) {
    var opts = {
        url: urlUtils.resolve(this.apiRoot, endpoint) + '/strict',
        body: {}
    };
    opts.body[idField] = id;

    return this.request('del', opts).then(function(body) {
        return { success: true, payload: body.payload[0] };
    })
    .catch(function(resp) {
        /* Catch + return "object not found" errors as unsuccessful responses. Can instead set
         * failOnNotFound param to true to reject the original error. */
        var notFound = false;
        try {
            notFound = resp.error.payload[0].message.some(function(str) {
                return (/Could not load object.*to delete/).test(str);
            });
        } catch(e) {}
        
        if (!!notFound && !failOnNotFound) {
            return Promise.resolve({
                success: false,
                code: 400,
                message: 'Not found',
            });
        }
        
        return Promise.reject(resp);
    });
};

module.exports = BeeswaxClient;
