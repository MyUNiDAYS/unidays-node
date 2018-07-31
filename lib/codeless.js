"use strict";

const crypto = require('crypto'),
    querystring = require('querystring');

module.exports = class {
    constructor(key) {
        this.key = new Buffer(key, 'base64');
    }

    validate(studentId, timestamp, hash) {
        if (hash !== this.hash(studentId, timestamp))
            return null;

        const timeSinceEpoch = parseInt(timestamp);
        return new Date(timeSinceEpoch);
    }

    hash(studentId, timestamp) {
        const query = querystring.stringify({
            ud_s: studentId,
            ud_t: timestamp
        }).replace(/%[A-F0-9]{2}/g, m => m.toLowerCase());
        const hmac = crypto.createHmac('sha512', this.key);
        return hmac.update(`?${query}`).digest('base64');
    }
}