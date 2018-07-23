"use strict";

const crypto = require('crypto'),
      querystring = require('querystring');

module.exports = class {
  constructor(sharedSecret) {
    this.sharedSecret = new Buffer(sharedSecret, 'base64');
  }

  validate(studentId, timestamp, hash) {
    return hash === this.hash(studentId, timestamp);
  }

  hash(studentId, timestamp) {
    const query = querystring.stringify({
      ud_s: studentId,
      ud_t: timestamp
    }).replace(/%[A-F0-9]{2}/g, m => m.toLowerCase());
    const hmac = crypto.createHmac('sha512', this.sharedSecret);
    return hmac.update(`?${query}`).digest('base64');
  }
}
