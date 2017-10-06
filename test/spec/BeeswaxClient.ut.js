describe('BeeswaxClient', function() {
    var util, Promise, BeeswaxClient, rp, rpErrors, mockOps, request;

    beforeEach(function() {
        util            = require('util');
        Promise         = require('bluebird');
        rp              = require('request-promise');
        rpErrors        = require('request-promise/errors');
        request         = require('request');
        BeeswaxClient   = require('../../lib/BeeswaxClient');
        
        spyOn(rp, 'jar').and.returnValue({ cookies: 'yum' });
        
        mockOps = {
            apiRoot: 'https://stinger.ut.api.beeswax.com',
            creds: { email: 'foo@bar.com', password: 'very good password' }
        };
    });

    describe('initialization', function() {
        var opts, boundFns;

        function getBoundFn(original, argParams) {
            var boundObj = boundFns.filter(function(call) {
                return call.original === original && call.args.every(function(arg, idx) {
                    return arg === argParams[idx];
                });
            })[0] || {};
            
            return boundObj.bound;
        }
        beforeEach(function() {
            opts = {
                apiRoot: 'https://stinger.ut.api.beeswax.com',
                creds: { email: 'foo@bar.com', password: 'very good password' }
            };

            boundFns = [];
            
            ['_find', '_query', '_queryAll', '_create', '_edit', '_delete'].forEach(function(method) {
                spyOn(BeeswaxClient.prototype[method], 'bind').and.callFake(function() {
                    var boundFn = Function.prototype.bind.apply(BeeswaxClient.prototype[method], arguments);

                    boundFns.push({
                        bound: boundFn,
                        original: BeeswaxClient.prototype[method],
                        args: Array.prototype.slice.call(arguments)
                    });

                    return boundFn;
                });
            });
        });

        it('should correctly initialize', function() {
            var beeswax = new BeeswaxClient(opts);
            expect(beeswax).toEqual(jasmine.any(BeeswaxClient));
            expect(beeswax.apiRoot).toBe('https://stinger.ut.api.beeswax.com');
            expect(beeswax._creds).toEqual({ email: 'foo@bar.com', password: 'very good password' });
            expect(beeswax._cookieJar).toEqual({ cookies: 'yum' });
            expect(beeswax._authPromise).not.toBeDefined();
        });
        
        it('should have default values for some options', function() {
            var beeswax = new BeeswaxClient({ creds: opts.creds });
            expect(beeswax).toEqual(jasmine.any(BeeswaxClient));
            expect(beeswax.apiRoot).toBe('https://stingersbx.api.beeswax.com');
            expect(beeswax._creds).toEqual({ email: 'foo@bar.com', password: 'very good password' });
        });
        
        it('should setup objects with bound methods for each supported entity type', function() {
            var beeswax = new BeeswaxClient(opts);
            expect(beeswax.advertisers).toEqual({
                find: getBoundFn(BeeswaxClient.prototype._find, [beeswax, '/rest/advertiser', 'advertiser_id']),
                query: getBoundFn(BeeswaxClient.prototype._query, [beeswax, '/rest/advertiser']),
                queryAll: getBoundFn(BeeswaxClient.prototype._queryAll, [beeswax, '/rest/advertiser', 'advertiser_id']),
                create: getBoundFn(BeeswaxClient.prototype._create, [beeswax, '/rest/advertiser', 'advertiser_id']),
                edit: getBoundFn(BeeswaxClient.prototype._edit, [beeswax, '/rest/advertiser', 'advertiser_id']),
                delete: getBoundFn(BeeswaxClient.prototype._delete, [beeswax, '/rest/advertiser', 'advertiser_id']),
            });
            expect(beeswax.campaigns).toEqual({
                find: getBoundFn(BeeswaxClient.prototype._find, [beeswax, '/rest/campaign', 'campaign_id']),
                query: getBoundFn(BeeswaxClient.prototype._query, [beeswax, '/rest/campaign']),
                queryAll: getBoundFn(BeeswaxClient.prototype._queryAll, [beeswax, '/rest/campaign', 'campaign_id']),
                create: getBoundFn(BeeswaxClient.prototype._create, [beeswax, '/rest/campaign', 'campaign_id']),
                edit: getBoundFn(BeeswaxClient.prototype._edit, [beeswax, '/rest/campaign', 'campaign_id']),
                delete: getBoundFn(BeeswaxClient.prototype._delete, [beeswax, '/rest/campaign', 'campaign_id']),
            });
            expect(beeswax.creatives).toEqual({
                find: getBoundFn(BeeswaxClient.prototype._find, [beeswax, '/rest/creative', 'creative_id']),
                query: getBoundFn(BeeswaxClient.prototype._query, [beeswax, '/rest/creative']),
                queryAll: getBoundFn(BeeswaxClient.prototype._queryAll, [beeswax, '/rest/creative', 'creative_id']),
                create: getBoundFn(BeeswaxClient.prototype._create, [beeswax, '/rest/creative', 'creative_id']),
                edit: getBoundFn(BeeswaxClient.prototype._edit, [beeswax, '/rest/creative', 'creative_id']),
                delete: getBoundFn(BeeswaxClient.prototype._delete, [beeswax, '/rest/creative', 'creative_id']),
            });
            expect(beeswax.lineItems).toEqual({
                find: getBoundFn(BeeswaxClient.prototype._find, [beeswax, '/rest/line_item', 'line_item_id']),
                query: getBoundFn(BeeswaxClient.prototype._query, [beeswax, '/rest/line_item']),
                queryAll: getBoundFn(BeeswaxClient.prototype._queryAll, [beeswax, '/rest/line_item', 'line_item_id']),
                create: getBoundFn(BeeswaxClient.prototype._create, [beeswax, '/rest/line_item', 'line_item_id']),
                edit: getBoundFn(BeeswaxClient.prototype._edit, [beeswax, '/rest/line_item', 'line_item_id']),
                delete: getBoundFn(BeeswaxClient.prototype._delete, [beeswax, '/rest/line_item', 'line_item_id']),
            });
            expect(beeswax.creativeLineItems).toEqual({
                find: getBoundFn(BeeswaxClient.prototype._find, [beeswax, '/rest/creative_line_item', 'cli_id']),
                query: getBoundFn(BeeswaxClient.prototype._query, [beeswax, '/rest/creative_line_item']),
                queryAll: getBoundFn(BeeswaxClient.prototype._queryAll, [beeswax, '/rest/creative_line_item', 'cli_id']),
                create: getBoundFn(BeeswaxClient.prototype._create, [beeswax, '/rest/creative_line_item', 'cli_id']),
                edit: getBoundFn(BeeswaxClient.prototype._edit, [beeswax, '/rest/creative_line_item', 'cli_id']),
                delete: getBoundFn(BeeswaxClient.prototype._delete, [beeswax, '/rest/creative_line_item', 'cli_id']),
            });
            expect(beeswax.targetingTemplates).toEqual({
                find: getBoundFn(BeeswaxClient.prototype._find, [beeswax, '/rest/targeting_template', 'targeting_template_id']),
                query: getBoundFn(BeeswaxClient.prototype._query, [beeswax, '/rest/targeting_template']),
                queryAll: getBoundFn(BeeswaxClient.prototype._queryAll, [beeswax, '/rest/targeting_template', 'targeting_template_id']),
                create: getBoundFn(BeeswaxClient.prototype._create, [beeswax, '/rest/targeting_template', 'targeting_template_id']),
                edit: getBoundFn(BeeswaxClient.prototype._edit, [beeswax, '/rest/targeting_template', 'targeting_template_id']),
                delete: getBoundFn(BeeswaxClient.prototype._delete, [beeswax, '/rest/targeting_template', 'targeting_template_id']),
            });
        });
        
        it('should fail if an email + password are not passed', function() {
            var msg = 'Must provide creds object with email + password',
                beeswax;
            expect(function() { beeswax = new BeeswaxClient(); }).toThrow(new Error(msg));
            expect(function() { beeswax = new BeeswaxClient({}); }).toThrow(new Error(msg));
            expect(function() { beeswax = new BeeswaxClient({ creds: {} }); }).toThrow(new Error(msg));
            expect(function() { beeswax = new BeeswaxClient({ creds: { email: 'foo@bar.com' } }); }).toThrow(new Error(msg));
            expect(function() { beeswax = new BeeswaxClient({ creds: { password: 'very good password' } }); }).toThrow(new Error(msg));
        });
    });
    
    describe('authenticate', function() {
        var beeswax, authResp;
        beforeEach(function() {
            beeswax = new BeeswaxClient(mockOps);
            authResp = Promise.resolve({
                success: true,
                message: 'you logged in'
            });
            spyOn(rp, 'post').and.callFake(function() { return authResp; });
        });
        
        it('should POST an authenticate request and resolve if it succeeds', function(done) {
            beeswax.authenticate().then(function() {
                expect(rp.post).toHaveBeenCalledWith({
                    url: 'https://stinger.ut.api.beeswax.com/rest/authenticate',
                    body: {
                        email: 'foo@bar.com',
                        password: 'very good password',
                        keep_logged_in: true
                    },
                    json: true,
                    jar: beeswax._cookieJar
                });
                expect(beeswax._authPromise).not.toBeDefined();
            }).catch(function(error) {
                expect(error).not.toBeDefined();
            }).done(done);
        });
        
        it('should reject if the response succeeds but the success flag is false', function(done) {
            authResp = Promise.resolve({ success: false, message: 'your password is wrong!' });
            beeswax.authenticate().then(function() {
                fail('Should not have resolved');
            }).catch(function(error) {
                expect(error).toEqual(new Error(util.inspect({ success: false, message: 'your password is wrong!' })));
                expect(rp.post).toHaveBeenCalled();
                expect(beeswax._authPromise).not.toBeDefined();
            }).done(done);
        });
        
        it('should reject if the response fails', function(done) {
            authResp = Promise.reject({ statusCode: 500, error: 'no can do buddy' });
            beeswax.authenticate().then(function() {
                fail('Should not have resolved');
            }).catch(function(error) {
                expect(error).toEqual({ statusCode: 500, error: 'no can do buddy' });
                expect(rp.post).toHaveBeenCalled();
                expect(beeswax._authPromise).not.toBeDefined();
            }).done(done);
        });
        
        it('should not send duplicate requests if multiple calls are made at once', function(done) {
            var authResolve, authReject;
            authResp = new Promise(function(resolve, reject) {
                authResolve = resolve;
                authReject = reject;
            });
            
            var promises = [
                beeswax.authenticate(),
                beeswax.authenticate(),
                beeswax.authenticate()
            ];
            expect(beeswax._authPromise).toBeDefined();
            promises.forEach(function(promise) {
                expect(promise).toBe(beeswax._authPromise);
            });
            
            Promise.all(promises).then(function() {
                expect(rp.post).toHaveBeenCalledWith({
                    url: 'https://stinger.ut.api.beeswax.com/rest/authenticate',
                    body: {
                        email: 'foo@bar.com',
                        password: 'very good password',
                        keep_logged_in: true
                    },
                    json: true,
                    jar: beeswax._cookieJar
                });
                expect(rp.post.calls.count()).toBe(1);
                expect(beeswax._authPromise).not.toBeDefined();
            }).catch(function(error) {
                expect(error).not.toBeDefined();
            }).done(done);
            
            process.nextTick(function() {
                authResolve({ success: true, message: 'ok now youre logged in' });
            });
        });
    });
    
    describe('request', function() {
        var beeswax, opts, resps;
        beforeEach(function() {
            beeswax = new BeeswaxClient(mockOps);
            spyOn(beeswax, 'authenticate').and.returnValue(Promise.resolve());
            opts = {
                url: 'https://stinger.ut.api.beeswax.com/rest/advertiser',
                body: { advertiser_id: 1234 }
            };
            resps = {
                get: Promise.resolve({ success: true, payload: { found: 'yes' } }),
                post: Promise.resolve({ success: true, payload: { created: 'yes' } }),
                put: Promise.resolve({ success: true, payload: { edited: 'yes' } }),
                del: Promise.resolve({ success: true, payload: { deleted: 'yes' } }),
            };
            ['get', 'post', 'put', 'del'].forEach(function(verb) {
                spyOn(rp, verb).and.callFake(function() { return resps[verb]; });
            });
        });
        
        it('should send a request and resolve with the body', function(done) {
            beeswax.request('get', opts).then(function(body) {
                expect(body).toEqual({ success: true, payload: { found: 'yes' } });
                expect(rp.get).toHaveBeenCalledWith({
                    url: 'https://stinger.ut.api.beeswax.com/rest/advertiser',
                    body: { advertiser_id: 1234 },
                    json: true,
                    jar: beeswax._cookieJar
                });
                expect(beeswax.authenticate).not.toHaveBeenCalled();
                expect(rp.get.calls.count()).toBe(1);
            }).catch(function(error) {
                expect(error).not.toBeDefined();
            }).done(done);
        });
        
        it('should handle different http verbs', function(done) {
            Promise.all([
                { method: 'get', url: 'https://sting.bw.com/rest/foo' },
                { method: 'post', url: 'https://sting.bw.com/rest/bar', body: { name: 'doofus' } },
                { method: 'put', url: 'https://sting.bw.com/rest/blah', body: { id: 1234 } },
                { method: 'del', url: 'https://sting.bw.com/rest/bloop', body: { id: 9876 } }
            ].map(function(opts) {
                var verb = opts.method;
                delete opts.method;
                return beeswax.request(verb, opts);
            })).then(function(results) {
                expect(results[0]).toEqual({ success: true, payload: { found: 'yes' } });
                expect(results[1]).toEqual({ success: true, payload: { created: 'yes' } });
                expect(results[2]).toEqual({ success: true, payload: { edited: 'yes' } });
                expect(results[3]).toEqual({ success: true, payload: { deleted: 'yes' } });
                expect(rp.get).toHaveBeenCalledWith({ url: 'https://sting.bw.com/rest/foo', json: true, jar: beeswax._cookieJar });
                expect(rp.post).toHaveBeenCalledWith({ url: 'https://sting.bw.com/rest/bar', body: { name: 'doofus' }, json: true, jar: beeswax._cookieJar });
                expect(rp.put).toHaveBeenCalledWith({ url: 'https://sting.bw.com/rest/blah', body: { id: 1234 }, json: true, jar: beeswax._cookieJar });
                expect(rp.del).toHaveBeenCalledWith({ url: 'https://sting.bw.com/rest/bloop', body: { id: 9876 }, json: true, jar: beeswax._cookieJar });
                expect(beeswax.authenticate).not.toHaveBeenCalled();
            }).catch(function(error) {
                expect(error).not.toBeDefined();
            }).done(done);
        });
        
        describe('if the request returns a 401 response', function() {
            beforeEach(function() {
                resps.get = Promise.reject(new rpErrors.StatusCodeError(401, 'Unauthenticated', { opts: 'yes' }, { response: 'large' }));
                beeswax.authenticate.and.callFake(function() {
                    resps.get = Promise.resolve({ success: true, payload: { id: 1234 } });
                    return Promise.resolve();
                });
            });
            
            it('should authenticate first and then retry the request', function(done) {
                beeswax.request('get', opts).then(function(body) {
                    expect(body).toEqual({ success: true, payload: { id: 1234 } });
                    expect(rp.get.calls.count()).toBe(2);
                    rp.get.calls.allArgs().forEach(function(args) {
                        expect(args).toEqual([{
                            url: 'https://stinger.ut.api.beeswax.com/rest/advertiser',
                            body: { advertiser_id: 1234 },
                            json: true,
                            jar: beeswax._cookieJar
                        }]);
                    });
                    expect(beeswax.authenticate).toHaveBeenCalled();
                }).catch(function(error) {
                    expect(error).not.toBeDefined();
                }).done(done);
            });
            
            it('should reject and not retry if authentication fails', function(done) {
                beeswax.authenticate.and.returnValue(Promise.reject(new Error('ECONNRESET')));
                beeswax.request('get', opts).then(function(body) {
                    expect(body).not.toBeDefined();
                }).catch(function(error) {
                    expect(error).toEqual(new Error('ECONNRESET'));
                    expect(rp.get.calls.count()).toBe(1);
                    expect(beeswax.authenticate).toHaveBeenCalled();
                }).done(done);
            });
        });
        
        it('should reject if the response succeeds but the success flag is false', function(done) {
            resps.get = Promise.resolve({ success: false, message: 'cant find it :(' });
            beeswax.request('get', opts).then(function() {
                fail('Should not have resolved');
            }).catch(function(error) {
                expect(error).toEqual(new Error(util.inspect({ success: false, message: 'cant find it :(' })));
                expect(rp.get).toHaveBeenCalled();
                expect(beeswax.authenticate).not.toHaveBeenCalled();
            }).done(done);
        });
        
        it('should reject if the response fails', function(done) {
            resps.get = Promise.reject(new rpErrors.StatusCodeError(500, 'BIG PROBLEMS', { opts: 'yes' }, { reponse: 'yes' }));
            beeswax.request('get', opts).then(function() {
                fail('Should not have resolved');
            }).catch(function(error) {
                expect(error).toEqual(jasmine.any(rpErrors.StatusCodeError));
                expect(error.statusCode).toBe(500);
                expect(error.message).toMatch(/BIG PROBLEMS/);
                expect(error.error).toBe('BIG PROBLEMS');
                expect(error.response).not.toBeDefined();
                expect(rp.get).toHaveBeenCalled();
                expect(beeswax.authenticate).not.toHaveBeenCalled();
            }).done(done);
        });
    });
    
    describe('_find', function() {
        var beeswax, reqResp;
        beforeEach(function() {
            beeswax = new BeeswaxClient(mockOps);
            reqResp = {
                success: true,
                payload: [
                    { id: 123, name: 'foo' },
                    { id: 123, name: 'bar' }
                ]
            };
            spyOn(beeswax, 'request').and.callFake(function() { return Promise.resolve(reqResp); });
        });
        
        it('should send a properly formatted get request', function(done) {
            beeswax._find('/rest/campaign', 'campaign_id', 123).then(function(body) {
                expect(body).toEqual({ success: true, payload: { id: 123, name: 'foo' } });
                expect(beeswax.request).toHaveBeenCalledWith('get', {
                    url: 'https://stinger.ut.api.beeswax.com/rest/campaign',
                    body: { campaign_id: 123 }
                });
            }).catch(function(error) {
                expect(error).not.toBeDefined();
            }).done(done);
        });
        
        it('should handle an empty payload', function(done) {
            reqResp.payload = [];
            beeswax._find('/rest/campaign', 'campaign_id', 123).then(function(body) {
                expect(body).toEqual({ success: true, payload: undefined });
                expect(beeswax.request).toHaveBeenCalled();
            }).catch(function(error) {
                expect(error).not.toBeDefined();
            }).done(done);
        });
        
        it('should reject if the request fails', function(done) {
            reqResp = Promise.reject('I GOT A PROBLEM');
            beeswax._find('/rest/campaign', 'campaign_id', 123).then(function(body) {
                expect(body).not.toBeDefined();
            }).catch(function(error) {
                expect(error).toEqual('I GOT A PROBLEM');
                expect(beeswax.request).toHaveBeenCalled();
            }).done(done);
        });
    });
    
    describe('_query', function() {
        var beeswax, reqResp;
        beforeEach(function() {
            beeswax = new BeeswaxClient(mockOps);
            reqResp = {
                success: true,
                payload: [
                    { id: 123, name: 'foo' },
                    { id: 123, name: 'bar' }
                ]
            };
            spyOn(beeswax, 'request').and.callFake(function() { return Promise.resolve(reqResp); });
        });
        
        it('should send a properly formatted get request', function(done) {
            beeswax._query('/rest/campaign', { campaign_name: 'foobar' }).then(function(body) {
                expect(body).toEqual({ success: true, payload: [{ id: 123, name: 'foo' }, { id: 123, name: 'bar' }] });
                expect(beeswax.request).toHaveBeenCalledWith('get', {
                    url: 'https://stinger.ut.api.beeswax.com/rest/campaign',
                    body: { campaign_name: 'foobar' }
                });
            }).catch(function(error) {
                expect(error).not.toBeDefined();
            }).done(done);
        });
        
        it('should handle an undefined request body', function(done) {
            beeswax._query('/rest/campaign').then(function(body) {
                expect(body).toEqual({ success: true, payload: [{ id: 123, name: 'foo' }, { id: 123, name: 'bar' }] });
                expect(beeswax.request).toHaveBeenCalledWith('get', {
                    url: 'https://stinger.ut.api.beeswax.com/rest/campaign',
                    body: {}
                });
            }).catch(function(error) {
                expect(error).not.toBeDefined();
            }).done(done);
        });
        
        it('should reject if the request fails', function(done) {
            reqResp = Promise.reject('I GOT A PROBLEM');
            beeswax._query('/rest/campaign', { campaign_name: 'foobar' }).then(function(body) {
                expect(body).not.toBeDefined();
            }).catch(function(error) {
                expect(error).toEqual('I GOT A PROBLEM');
                expect(beeswax.request).toHaveBeenCalled();
            }).done(done);
        });
    });
    
    describe('_queryAll', function() {
        var beeswax;
        beforeEach(function() {
            beeswax = new BeeswaxClient(mockOps);
            spyOn(beeswax, 'request').and.callFake(function(method, opts) {
                var resp = { success: true, payload: [] }, i;
                
                if (opts.body.offset < 150) {
                    for (i = opts.body.offset; i < opts.body.offset + 50; i++) {
                        resp.payload.push({ id: i, name: 'item #' + i });
                    }
                } else {
                    for (i = opts.body.offset; i < opts.body.offset + 25; i++) {
                        resp.payload.push({ id: i, name: 'item #' + i });
                    }
                }
                return Promise.resolve(resp);
            });
        });
        
        it('should recursively fetch items until it receives less than its batch size', function(done) {
            beeswax._queryAll('/rest/campaign', 'campaign_id', { campaign_name: 'foobar' }).then(function(body) {
                expect(body).toEqual({ success: true, payload: jasmine.any(Array) });
                expect(body.payload.length).toBe(175);
                body.payload.forEach(function(item, idx) {
                    expect(item).toEqual({ id: idx, name: 'item #' + idx });
                });
                expect(beeswax.request.calls.count()).toBe(4);
                beeswax.request.calls.allArgs().forEach(function(argArr, idx) {
                    expect(argArr).toEqual(['get', {
                        url: 'https://stinger.ut.api.beeswax.com/rest/campaign',
                        body: {
                            campaign_name: 'foobar',
                            offset: idx * 50,
                            rows: 50,
                            sort_by: 'campaign_id'
                        }
                    }]);
                });
            }).catch(function(error) {
                expect(error).not.toBeDefined();
            }).done(done);
        });
        
        it('should handle an undefined body', function(done) {
            beeswax._queryAll('/rest/campaign', 'campaign_id').then(function(body) {
                expect(body).toEqual({ success: true, payload: jasmine.any(Array) });
                expect(body.payload.length).toBe(175);
                expect(beeswax.request.calls.count()).toBe(4);
                beeswax.request.calls.allArgs().forEach(function(argArr, idx) {
                    expect(argArr).toEqual(['get', {
                        url: 'https://stinger.ut.api.beeswax.com/rest/campaign',
                        body: {
                            offset: idx * 50,
                            rows: 50,
                            sort_by: 'campaign_id'
                        }
                    }]);
                });
            }).catch(function(error) {
                expect(error).not.toBeDefined();
            }).done(done);
        });
        
        it('should override pagination params', function(done) {
            beeswax._queryAll('/rest/campaign', 'campaign_id', { rows: 13, offset: 500, sort_by: 'campaign_name' }).then(function(body) {
                expect(body).toEqual({ success: true, payload: jasmine.any(Array) });
                expect(body.payload.length).toBe(175);
                expect(beeswax.request.calls.count()).toBe(4);
                beeswax.request.calls.allArgs().forEach(function(argArr, idx) {
                    expect(argArr).toEqual(['get', {
                        url: 'https://stinger.ut.api.beeswax.com/rest/campaign',
                        body: {
                            offset: idx * 50,
                            rows: 50,
                            sort_by: 'campaign_id'
                        }
                    }]);
                });
            }).catch(function(error) {
                expect(error).not.toBeDefined();
            }).done(done);
        });
        
        it('should handle getting only a few items on the first request', function(done) {
            beeswax.request.and.returnValue(Promise.resolve({
                success: true,
                payload: [{ id: 1, name: 'foo' }, { id: 2, name: 'bar' }]
            }));
            beeswax._queryAll('/rest/campaign', 'campaign_id', { rows: 13, offset: 500, sort_by: 'campaign_name' }).then(function(body) {
                expect(body).toEqual({ success: true, payload: [{ id: 1, name: 'foo' }, { id: 2, name: 'bar' }] });
                expect(beeswax.request.calls.count()).toBe(1);
            }).catch(function(error) {
                expect(error).not.toBeDefined();
            }).done(done);
        });
        
        it('should handle getting an empty body on the first request', function(done) {
            beeswax.request.and.returnValue(Promise.resolve({ success: true, payload: [] }));
            beeswax._queryAll('/rest/campaign', 'campaign_id', { rows: 13, offset: 500, sort_by: 'campaign_name' }).then(function(body) {
                expect(body).toEqual({ success: true, payload: [] });
                expect(beeswax.request.calls.count()).toBe(1);
            }).catch(function(error) {
                expect(error).not.toBeDefined();
            }).done(done);
        });
        
        it('should reject if one of the requests fails', function(done) {
            beeswax.request.and.callFake(function(method, opts) {
                var resp = { success: true, payload: [] }, i;
                
                if (opts.body.offset >= 100) {
                    return Promise.reject('too many requests :(');
                } else {
                    for (i = opts.body.offset; i < opts.body.offset + 50; i++) {
                        resp.payload.push({ id: i, name: 'item #' + i });
                    }
                }
                return Promise.resolve(resp);
            });

            beeswax._queryAll('/rest/campaign', 'campaign_id', { campaign_name: 'foobar' }).then(function(body) {
                expect(body).not.toBeDefined();
            }).catch(function(error) {
                expect(error).toEqual('too many requests :(');
                expect(beeswax.request.calls.count()).toBe(3);
            }).done(done);
        });
    });
    
    describe('_create', function() {
        var beeswax, resps;
        beforeEach(function() {
            beeswax = new BeeswaxClient(mockOps);
            resps = {
                get: Promise.resolve({ success: true, payload: [{ id: 9886, campaign: 'yes' }] }),
                post: Promise.resolve({ success: true, payload: { id: 9886 } })
            };
            ['get', 'post'].forEach(function(verb) {
                spyOn(rp, verb).and.callFake(function() { return resps[verb]; });
            });
            spyOn(beeswax, 'request').and.callThrough();
        });
        
        it('should send a properly formatted post request, and then find the created object', function(done) {
            beeswax._create('/rest/campaign', 'campaign_id', { campaign_name: 'foobar' }).then(function(body) {
                expect(body).toEqual({ success: true, payload: { id: 9886, campaign: 'yes' } });
                expect(beeswax.request).toHaveBeenCalledWith('post', jasmine.objectContaining({
                    url: 'https://stinger.ut.api.beeswax.com/rest/campaign/strict',
                    body: { campaign_name: 'foobar' }
                }));
                expect(beeswax.request).toHaveBeenCalledWith('get', jasmine.objectContaining({
                    url: 'https://stinger.ut.api.beeswax.com/rest/campaign',
                    body: { campaign_id: 9886 }
                }));
            }).catch(function(error) {
                expect(error).not.toBeDefined();
            }).done(done);
        });
        
        it('should return an unsuccessful response if the body is empty', function(done) {
            Promise.all([undefined, null, {}, 'asdf'].map(function(reqBody) {
                return beeswax._create('/rest/campaign', 'campaign_id', reqBody);
            })).then(function(results) {
                results.forEach(function(body) {
                    expect(body).toEqual({
                        success: false,
                        code: 400,
                        message: 'Body must be non-empty object'
                    });
                });
                expect(beeswax.request).not.toHaveBeenCalled();
            }).catch(function(error) {
                expect(error).not.toBeDefined();
            }).done(done);
        });
        
        it('should reject if the post request fails', function(done) {
            resps.post = Promise.reject(new Error('I GOT A PROBLEM POSTING'));
            beeswax._create('/rest/campaign', 'campaign_id', { campaign_name: 'foobar' }).then(function(body) {
                expect(body).not.toBeDefined();
            }).catch(function(error) {
                expect(error).toEqual(new Error('I GOT A PROBLEM POSTING'));
                expect(beeswax.request).toHaveBeenCalledWith('post', jasmine.any(Object));
                expect(beeswax.request.calls.count()).toBe(1);
            }).done(done);
        });

        it('should reject if the get request fails', function(done) {
            resps.get = Promise.reject(new Error('I GOT A PROBLEM GETTING'));

            beeswax._create('/rest/campaign', 'campaign_id', { campaign_name: 'foobar' }).then(function(body) {
                expect(body).not.toBeDefined();
            }).catch(function(error) {
                expect(error).toEqual(new Error('I GOT A PROBLEM GETTING'));
                expect(beeswax.request).toHaveBeenCalledWith('post', jasmine.any(Object));
                expect(beeswax.request).toHaveBeenCalledWith('get', jasmine.any(Object));
            }).done(done);
        });
    });
    
    describe('_edit', function() {
        var beeswax, resps;
        beforeEach(function() {
            beeswax = new BeeswaxClient(mockOps);
            resps = {
                get: Promise.resolve({ success: true, payload: [{ id: 9886, campaign: 'yes' }] }),
                put: Promise.resolve({ success: true, payload: [{ id: 9886 }] })
            };
            ['get', 'put'].forEach(function(verb) {
                spyOn(rp, verb).and.callFake(function() { return resps[verb]; });
            });
            spyOn(beeswax, 'request').and.callThrough();
        });
        
        it('should send a properly formatted put request, and then find the edited object', function(done) {
            beeswax._edit('/rest/campaign', 'campaign_id', 9886, { campaign_name: 'foobar' }).then(function(body) {
                expect(body).toEqual({ success: true, payload: { id: 9886, campaign: 'yes' } });
                expect(beeswax.request).toHaveBeenCalledWith('put', jasmine.objectContaining({
                    url: 'https://stinger.ut.api.beeswax.com/rest/campaign/strict',
                    body: { campaign_id: 9886, campaign_name: 'foobar' }
                }));
                expect(beeswax.request).toHaveBeenCalledWith('get', jasmine.objectContaining({
                    url: 'https://stinger.ut.api.beeswax.com/rest/campaign',
                    body: { campaign_id: 9886 }
                }));
            }).catch(function(error) {
                expect(error).not.toBeDefined();
            }).done(done);
        });
        
        it('should return an unsuccessful response if the body is empty', function(done) {
            Promise.all([undefined, null, {}, 'asdf'].map(function(reqBody) {
                return beeswax._edit('/rest/campaign', 'campaign_id', 9886, reqBody);
            })).then(function(results) {
                results.forEach(function(body) {
                    expect(body).toEqual({
                        success: false,
                        code: 400,
                        message: 'Body must be non-empty object'
                    });
                });
                expect(beeswax.request).not.toHaveBeenCalled();
            }).catch(function(error) {
                expect(error).not.toBeDefined();
            }).done(done);
        });
        
        describe('if the item is not found when attempting to PUT', function() {
            var errBody;
            beforeEach(function() {
                errBody = {
                    success: false,
                    payload: [{
                        message: [
                            'there were problems',
                            'with your request',
                            'Could not load object 9886 to update'
                        ]
                    }]
                };
                resps.put = Promise.reject(new rpErrors.StatusCodeError(406, errBody, { opts: 'yes' }, { response: 'yes' }));
            });

            it('should resolve with an unsuccessful response', function(done) {
                beeswax._edit('/rest/campaign', 'campaign_id', 9886, { campaign_name: 'foobar' }).then(function(body) {
                    expect(body).toEqual({ success: false, code: 400, message: 'Not found' });
                    expect(beeswax.request).toHaveBeenCalledWith('put', jasmine.any(Object));
                    expect(beeswax.request.calls.count()).toBe(1);
                }).catch(function(error) {
                    expect(error).not.toBeDefined();
                }).done(done);
            });
            
            it('should reject if the failOnNotFound param is true', function(done) {
                beeswax._edit('/rest/campaign', 'campaign_id', 9886, { campaign_name: 'foobar' }, true).then(function(body) {
                    expect(body).not.toBeDefined();
                }).catch(function(error) {
                    expect(error).toEqual(jasmine.any(rpErrors.StatusCodeError));
                    expect(error.statusCode).toBe(406);
                    expect(error.message).toMatch(/Could not load object.*to update/);
                    expect(error.error).toEqual(errBody);
                    expect(error.response).not.toBeDefined();
                    expect(beeswax.request).toHaveBeenCalledWith('put', jasmine.any(Object));
                    expect(beeswax.request.calls.count()).toBe(1);
                }).done(done);
            });
        });
        
        it('should reject if the put request fails', function(done) {
            var errBody = {
                success: false,
                payload: [{
                    message: [
                            'there were problems',
                            'with your request',
                    ]
                }]
            };
            resps.put = Promise.reject(new rpErrors.StatusCodeError(406, errBody, { opts: 'yes' }, { response: 'yes' }));

            beeswax._edit('/rest/campaign', 'campaign_id', 9886, { campaign_name: 'foobar' }).then(function(body) {
                expect(body).not.toBeDefined();
            }).catch(function(error) {
                expect(error).toEqual(jasmine.any(rpErrors.StatusCodeError));
                expect(error.statusCode).toBe(406);
                expect(error.message).toMatch(/there were problems/);
                expect(error.error).toEqual(errBody);
                expect(error.response).not.toBeDefined();
                expect(beeswax.request).toHaveBeenCalledWith('put', jasmine.any(Object));
                expect(beeswax.request.calls.count()).toBe(1);
            }).done(done);
        });

        it('should reject if the get request fails', function(done) {
            resps.get = Promise.reject('I GOT A PROBLEM GETTING');

            beeswax._edit('/rest/campaign', 'campaign_id', 9886, { campaign_name: 'foobar' }).then(function(body) {
                expect(body).not.toBeDefined();
            }).catch(function(error) {
                expect(error).toEqual('I GOT A PROBLEM GETTING');
                expect(beeswax.request).toHaveBeenCalledWith('put', jasmine.any(Object));
                expect(beeswax.request).toHaveBeenCalledWith('get', jasmine.any(Object));
            }).done(done);
        });
    });
    
    describe('_delete', function() {
        var beeswax, resps;
        beforeEach(function() {
            beeswax = new BeeswaxClient(mockOps);
            resps = {
                del: Promise.resolve({ success: true, payload: [{ id: 9886 }] })
            };
            ['del'].forEach(function(verb) {
                spyOn(rp, verb).and.callFake(function() { return resps[verb]; });
            });
            spyOn(beeswax, 'request').and.callThrough();
        });
        
        it('should send a properly formatted delete request, and then find the edited object', function(done) {
            beeswax._delete('/rest/campaign', 'campaign_id', 9886).then(function(body) {
                expect(body).toEqual({ success: true, payload: { id: 9886 } });
                expect(beeswax.request).toHaveBeenCalledWith('del', jasmine.objectContaining({
                    url: 'https://stinger.ut.api.beeswax.com/rest/campaign/strict',
                    body: { campaign_id: 9886 }
                }));
            }).catch(function(error) {
                expect(error).not.toBeDefined();
            }).done(done);
        });
        
        describe('if the item is not found when attempting to DELETE', function() {
            var errBody;
            beforeEach(function() {
                errBody = {
                    success: false,
                    payload: [{
                        message: [
                            'there were problems',
                            'with your request',
                            'Could not load object 9886 to delete'
                        ]
                    }]
                };
                resps.del = Promise.reject(new rpErrors.StatusCodeError(406, errBody, { opts: 'yes' }, { response: 'yes' }));
            });

            it('should resolve with an unsuccessful response', function(done) {
                beeswax._delete('/rest/campaign', 'campaign_id', 9886).then(function(body) {
                    expect(body).toEqual({ success: false, code: 400, message: 'Not found' });
                    expect(beeswax.request).toHaveBeenCalledWith('del', jasmine.any(Object));
                }).catch(function(error) {
                    expect(error).not.toBeDefined();
                }).done(done);
            });
            
            it('should reject if the failOnNotFound param is true', function(done) {
                beeswax._delete('/rest/campaign', 'campaign_id', 9886, true).then(function(body) {
                    expect(body).not.toBeDefined();
                }).catch(function(error) {
                    expect(error).toEqual(jasmine.any(rpErrors.StatusCodeError));
                    expect(error.statusCode).toBe(406);
                    expect(error.message).toMatch(/Could not load object.*to delete/);
                    expect(error.error).toEqual(errBody);
                    expect(error.response).not.toBeDefined();
                    expect(beeswax.request).toHaveBeenCalledWith('del', jasmine.any(Object));
                }).done(done);
            });
        });
        
        it('should reject if the delete request fails', function(done) {
            var errBody = {
                success: false,
                payload: [{
                    message: [
                        'there were problems',
                        'with your request'
                    ]
                }]
            };
            resps.del = Promise.reject(new rpErrors.StatusCodeError(406, errBody, { opts: 'yes' }, { response: 'yes' }));

            beeswax._delete('/rest/campaign', 'campaign_id', 9886).then(function(body) {
                expect(body).not.toBeDefined();
            }).catch(function(error) {
                expect(error).toEqual(jasmine.any(rpErrors.StatusCodeError));
                expect(error.statusCode).toBe(406);
                expect(error.message).toMatch(/there were problems/);
                expect(error.error).toEqual(errBody);
                expect(error.response).not.toBeDefined();
                expect(beeswax.request).toHaveBeenCalledWith('del', jasmine.any(Object));
            }).done(done);
        });
    });

    describe('uploadCreativeAsset', function() {
        var beeswax , req;
        beforeEach(function() {
            req = {
                sourceUrl : 'https://abc/def.jpeg'
            };
            beeswax = new BeeswaxClient(mockOps);
            spyOn(beeswax, 'request');
            spyOn(request,'head');
            spyOn(request,'post');
        });

        it('rejects if there is no sourceUrl or creativeContentBytes',function(done){
            beeswax.uploadCreativeAsset({})
            .then(done.fail, function(e){
                expect(e.message)
                .toEqual('uploadCreativeAsset params requires a sourceUrl or a creativeContentBytes property.');
            })
            .then(done);
        });

        it('rejects if head does not get the content-length',function(done){
            request.head.and.callFake(function(opts,cb){
                cb(null,{ statusCode : 200, headers : {} },{});
            });

            beeswax.uploadCreativeAsset(req)
            .then(done.fail,function(e){
                expect(e.message).toEqual(
                   'Unable to detect content-length of sourceUrl: https://abc/def.jpeg' 
                );
            })
            .then(done);
        });

        it('returns data about the asset when everything works',function(done){
            request.head.and.callFake(function(opts,cb){
                cb(null,{ statusCode : 200, headers : { 'content-length' : '100' } },{});
            });

            beeswax.request.and.callFake(function(method,opts){
                if ((method === 'post') && (opts.url.match(/\/creative_asset$/))){
                    return Promise.resolve({
                        success: true,
                        payload:  {
                            id : 666
                        }
                    });
                }
                else
                if ((method === 'get') && (opts.url.match(/\/creative_asset\/666/))){
                    return Promise.resolve({
                        success: true,
                        payload:  [{
                            id  : 666,
                            foo : 'bar'
                        }]
                    });
                }
                return Promise.reject(new Error('Invalid request call.'));
            });

            request.post.and.callFake(function(opts,cb){
                var body;
                if (opts.url.match(/\/creative_asset\/upload/)){
                    body = JSON.stringify({
                        success: true,
                        payload:  {
                            id : 666
                        }
                    });
                    return cb(null,{ statusCode : 200, headers : { }},body);
                }
           
                cb(new Error('Bad request post.'));
            });

            beeswax.uploadCreativeAsset(req)
            .then(function(result){
                expect(result).toEqual({id : 666, foo : 'bar' }); 
            })
            .then(done,done.fail);
        });
    });
        
});
