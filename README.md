beeswax-client
==============

Node.js wrapper for the Beeswax API.

Install
-------
```bash
$> npm install beeswax-client
```

Usage
-----

### Instantiation

Instantiate with an options object:
```javascript
var BeeswaxClient = require('beeswax-client');

var beeswax = new BeeswaxClient({
    apiRoot: 'https://<hostname>',  // Default: 'https://stingersbx.api.beeswax.com'
    creds: {
        email       : 'user@domain.com',    // required
        password    : '...'                 // required
    },
    useStrict: false // Default: true
});
```

The `apiRoot` and `useStrict` will be used to construct request urls, and the `creds` will be used when authenticating.
The `useStrict` parameter enables or disables strict mode in Beeswax API (it's either adding or removing `/strict` suffix from API endpoint URLs).

The instantiated client will contain methods for performing CRUD operations on each supported entity:
```javascript
beeswax.advertisers.find = function() {}
beeswax.advertisers.query = function() {}
beeswax.advertisers.create = function() {}
beeswax.advertisers.edit = function() {}
beeswax.advertisers.delete = function() {}

beeswax.campaigns.find = function() {}
// ...

beeswax.creatives.find = function() {}
// ...
```

Currently supported entities are:

- advertisers
- campaigns
- creatives


### `beeswax.authenticate()`
Sends a POST request to authenticate to Beeswax, using the provided `creds`.
You shouldn't need to call this method explicitly - it will be called automatically upon receiving an Unauthorized response from any other request.

### `beeswax.<entity>.find(id)`
Send a GET request to fetch the entity with the given id.

### `beeswax.<entity>.query(body)`
Send a GET request to fetch entities. `body` should be an object containing any fields to query by. By default, Beeswax's API will fetch up to 50 records, starting with the oldest.

### `beeswax.<entity>.queryAll(body)`
Like `query()`, but recursively sends GET requests until all entities matching the query have been fetched.

### `beeswax.<entity>.create(body)`
Send a POST request to create a new entity. `body` should be an object representing the new entity.

### `beeswax.<entity>.edit(id, body, failOnNotFound)`
Send a PUT request to update the entity specified by `id`. `body` should be an object containing any fields that should be updated.

### `beeswax.<entity>.delete(id, failOnNotFound)`
Send a DELETE request to delete the entity specified by `id`


