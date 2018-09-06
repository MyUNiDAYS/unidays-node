"use strict";

const crypto = require('crypto'),
    fetch = require('node-fetch');

class RedemptionClient {
    constructor(partnerId, transactionId, currency, opts) {
        if (!partnerId)
            throw new Error('partnerId is required and cannot be empty.');
        if (!transactionId)
            throw new Error('transactionId is required and cannot be empty.');
        if (!currency)
            throw new Error('currency is required and cannot be empty.');

        this.serverEndPoint = '/tracking/v1.2/redemption';
        this.scriptEndpoint = this.serverEndPoint + '/js';
        this.partnerId = partnerId;
        this.transactionId = transactionId;
        this.currency = currency;

        this.options = Object.assign({
            fetch: fetch,
            hostname: "api.myunidays.com",
            protocol: 'https',
            testMode: false
        }, opts);
    }

    _toQueryString(redemption) {
        return '?PartnerId=' + _encodeStringValue(this.partnerId) +
            '&TransactionId=' + _encodeStringValue(this.transactionId) +
            '&MemberId=' + (redemption.memberId ? _encodeStringValue(redemption.memberId) : '') +
            '&Currency=' + _encodeStringValue(this.currency) +
            '&OrderTotal=' + (redemption.orderTotal ?  _encodeNumberValue(redemption.orderTotal) : '') +
            '&ItemsUNiDAYSDiscount=' + (redemption.itemsUNiDAYSDiscount ? _encodeNumberValue(redemption.itemsUNiDAYSDiscount) : '') +
            '&Code=' + (redemption.code ? _encodeStringValue(redemption.code) : '') +
            '&ItemsTax=' + (redemption.itemsTax ?  _encodeNumberValue(redemption.itemsTax) : '') +
            '&ShippingGross=' + (redemption.shippingGross ? _encodeNumberValue(redemption.shippingGross) : '') +
            '&ShippingDiscount=' + (redemption.shippingDiscount ? _encodeNumberValue(redemption.shippingDiscount) : '') +
            '&ItemsGross=' + (redemption.itemsGross ? _encodeNumberValue(redemption.itemsGross) : '') +
            '&ItemsOtherDiscount=' + (redemption.itemsOtherDiscount ?  _encodeNumberValue(redemption.itemsOtherDiscount) : '') +
            '&UNiDAYSDiscountPercentage=' + (redemption.UNiDAYSDiscountPercentage ?  _encodeNumberValue(redemption.UNiDAYSDiscountPercentage) : '') +
            '&NewCustomer=' + (typeof(redemption.newCustomer) === 'boolean' && redemption.newCustomer ? 'True' : '');
    }

    getTrackingScriptUrl(redemption) {
        if (redemption == null)
            throw new Error('redemption is null or undefined');

        let queryString = this._toQueryString(redemption);

        return _buildUri(this.options, this.scriptEndpoint, queryString) + (this.options.testMode ? '&Test=True' : '');
    }

    getSignedTrackingScriptUrl(redemption, key) {
        if (redemption == null)
            throw new Error('redemption is null or undefined');

        let queryString = this._toQueryString(redemption);
        queryString = _signQueryString(queryString, key);

        return _buildUri(this.options, this.scriptEndpoint, queryString) + (this.options.testMode ? '&Test=True' : '');
    }

    getTrackingServerUrl(redemption, key) {
        if (redemption == null)
            throw new Error('redemption is null or undefined');

        let queryString = this._toQueryString(redemption);
        queryString = _signQueryString(queryString, key);

        return _buildUri(this.options, this.serverEndPoint, queryString) + (this.options.testMode ? '&Test=True' : '');
    }

    recordRedemption(redemption, key) {
        if (redemption == null)
            throw new Error('redemption is null or undefined.');

        let queryString = this._toQueryString(redemption);
        queryString = _signQueryString(queryString, key);

        let url = _buildUri(this.options, this.serverEndPoint, queryString) + (this.options.testMode ? '&Test=True' : '');

        return this.options.fetch(url, {
            method: 'POST',
            headers: {
                'User-Agent': 'UNiDAYS node.js tracking SDK v1.2'
            }
        });
    }
}

const _encodeStringValue = (value) => {
    if (value == null)
        return '';

    return encodeURIComponent(value).replace(/%20/g, "+");
}

const _encodeNumberValue = (value) => {
    if (value == null)
        return '';

    if ((typeof (value)).toLowerCase() !== 'number')
        value = parseFloat(value);

    return (Math.round(value * 100) / 100).toFixed(2);
}

const _signQueryString = (queryString, customerSecret) => {
  const hmac = crypto.createHmac('sha512', new Buffer(customerSecret, 'base64'));

  let sig = hmac.update(queryString).digest('base64');

  return queryString + '&Signature=' + _encodeStringValue(sig);
}

const _buildUri = (options, path, query) => {
    const protocol = options.protocol,
        hostname = options.hostname;

    return `${protocol}://${hostname}${path}${query}`;
}

module.exports = RedemptionClient;
