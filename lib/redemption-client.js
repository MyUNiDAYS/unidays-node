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

        this.serverEndPoint = '/v1.2/redemption';
        this.pixelEndpoint = this.serverEndPoint + '/gif';
        this.partnerId = partnerId;
        this.transactionId = transactionId;
        this.currency = currency;

        this.options = Object.assign({
            fetch: fetch,
            hostname: "tracking.myunidays.com",
            protocol: 'https',
            testMode: false
        }, opts);
    }

    _toQueryString(redemption) {
        return '?PartnerId=' + _encodeStringValue(this.partnerId) +
            '&TransactionId=' + _encodeStringValue(this.transactionId) +
            '&Currency=' + _encodeStringValue(this.currency) +
            (redemption.memberId ? '&MemberId=' + _encodeStringValue(redemption.memberId) : '') +
            (redemption.orderTotal ? '&OrderTotal=' + _encodeNumberValue(redemption.orderTotal) : '') +
            (redemption.itemsUNiDAYSDiscount ? '&ItemsUNiDAYSDiscount=' + _encodeNumberValue(redemption.itemsUNiDAYSDiscount) : '') +
            (redemption.code ? '&Code=' + _encodeStringValue(redemption.code) : '') +
            (redemption.itemsTax ? '&ItemsTax=' + _encodeNumberValue(redemption.itemsTax) : '') +
            (redemption.shippingGross ? '&ShippingGross=' + _encodeNumberValue(redemption.shippingGross) : '') +
            (redemption.shippingDiscount ? '&ShippingDiscount=' + _encodeNumberValue(redemption.shippingDiscount) : '') +
            (redemption.itemsGross ? '&ItemsGross=' + _encodeNumberValue(redemption.itemsGross) : '') +
            (redemption.itemsOtherDiscount ? '&ItemsOtherDiscount=' + _encodeNumberValue(redemption.itemsOtherDiscount) : '') +
            (redemption.UNiDAYSDiscountPercentage ? '&UNiDAYSDiscountPercentage=' + _encodeNumberValue(redemption.UNiDAYSDiscountPercentage) : '') +
            (redemption.newCustomer ? '&NewCustomer=' + (redemption.newCustomer ? true : false) : '');
    }

    _signQueryString(queryString, customerSecret) {
        var sig = _generateSignature(queryString, customerSecret);

        return queryString + '&Signature=' + _encodeStringValue(sig);
    }

    getTrackingPixelUrl(redemption) {
        if (redemption == null)
            throw new Error('redemption is null or undefined');

        var queryString = this._toQueryString(redemption);

        return _buildUri(this.options, this.pixelEndpoint, queryString) + (this.options.testMode ? '&Test=True' : '');
    }

    getSignedTrackingPixelUrl(redemption, key) {
        if (redemption == null)
            throw new Error('redemption is null or undefined');

        var queryString = this._toQueryString(redemption);
        queryString = this._signQueryString(queryString, key);

        return _buildUri(this.options, this.pixelEndpoint, queryString) + (this.options.testMode ? '&Test=True' : '');
    }

    getTrackingServerUrl(redemption, key) {
        if (redemption == null)
            throw new Error('redemption is null or undefined');

        var queryString = this._toQueryString(redemption);
        queryString = this._signQueryString(queryString, key);

        return _buildUri(this.options, this.serverEndPoint, queryString) + (this.options.testMode ? '&Test=True' : '');
    }

    recordRedemption(redemption, key) {
        if (redemption == null)
            throw new Error('redemption is null or undefined.');

        var queryString = this._toQueryString(redemption);
        queryString = this._signQueryString(queryString, key);

        var url = _buildUri(this.options, this.serverEndPoint, queryString) + (this.options.testMode ? '&Test=True' : '');

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

    return encodeURIComponent(value).replace(/%[A-F0-9]{2}/g, m => m.toLowerCase());
}

const _encodeNumberValue = (value) => {
    if (value == null)
        return '';

    if ((typeof (value)).toLowerCase() !== 'number')
        value = parseFloat(value);

    return (Math.round(value * 100) / 100).toFixed(2);
}

const _generateSignature = (queryString, customerSecret) => {
    const hmac = crypto.createHmac('sha512', customerSecret);

    return hmac.update(queryString).digest('base64');
}

const _buildUri = (options, path, query) => {
    const protocol = options.protocol,
        hostname = options.hostname;

    return `${protocol}://${hostname}${path}${query}`;
}

module.exports = RedemptionClient;