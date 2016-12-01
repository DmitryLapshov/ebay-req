/*jslint node: true */
'use strict';

var request = require('request'),
    parseString = require('xml2js').parseString,
    Builder = require('xml2js').Builder,
    fs = require('fs'),
    credentials = require('./credentials'),
    config = require('./config');

var opType = config.opType;
var requestName = config[opType].requestName;
var requestBody = config[opType].requestBody;
requestBody.RequesterCredentials = {};
requestBody.RequesterCredentials.eBayAuthToken = credentials.authToken;
requestBody.$ = {};
requestBody.$.xmlns = "urn:ebay:apis:eBLBaseComponents";
var req = {};
req[requestName] = requestBody;
var builder = new Builder();
var xml = builder.buildObject(req);

var options = {
    url: config.url,
    headers: {
        'User-Agent': 'ebay-ngp/0.0.1 (Language=Javascript)',
        'Content-Type': 'text/xml',
        'X-EBAY-API-CALL-NAME': opType,
        'X-EBAY-API-COMPATIBILITY-LEVEL': '957',
        'X-EBAY-API-SITEID': '0' // US
    },
    body: xml
};

request.post(options, function (error, response, body) {
    if (error) {
        console.error(error);
    } else if (response.statusCode !== 200 && response.statusCode !== 204) {
        console.error(response.statusCode + ': ' + response.statusMessage);
    } else {
        parseString(body, {explicitArray: false}, function (err, result) {
            if (err) {
                console.error(err);
            } else {
                fs.writeFile('./results/' + opType + '.json', JSON.stringify(result, null, '\t'), 'utf8', function (err) {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log(opType + ' - Done!');
                    }
                });
            }
        });
    }
});
