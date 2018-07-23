"use strict";

const crypto = require('crypto'),
      fetch = require('node-fetch');

class RedemptionClient {
  constructor (partnerId, transactionId, currency, customerSecret, opts) {
    if (partnerId == null) throw new Error('partnerId is null or undefined.');
    if (transactionId == null) throw new Error('transactionId is null or undefined.');
    if (currency == null) throw new Error('currency is null or undefined.');
    if (customerSecret == null) throw new Error('customerSecret is null or undefined');

    this.partnerId = partnerId;
    this.transactionId = transactionId;
    this.currency = currency;
    this.customerSecret = new Buffer(customerSecret, 'base64');
    this.options = Object.assign({ fetch: fetch, hostname: "tracking.myunidays.com", protocol: 'https', testMode: false }, opts);
  }

  recordRedemption (redemption) {
    if (redemption == null) throw new Error('redemption is null or undefined');

    const serverEndpointPath = this.options.testMode ? '/perks/redemption/v1.2-test' : '/perks/redemption/v1.2';
    const queryString = this.toQueryString(redemption);

    let url = buildUri(this.options, serverEndpointPath, queryString);
    return this.options.fetch(url, {
      method: 'POST',
      headers: { 'User-Agent': 'UNiDAYS node.js tracking SDK v1.2' }
    });
  }

  toQueryString (redemption) {
    let qs = '?PartnerId=' + encodeStringValue(this.partnerId)
      + '&TransactionId=' + encodeStringValue(this.transactionId)
      + '&Currency=' + encodeStringValue(this.currency)
      +  (redemption.memberId !== undefined ? '&MemberId=' + encodeStringValue(redemption.memberId) : '')
      +  (redemption.orderTotal !== undefined ? '&OrderTotal=' + encodeNumberValue(redemption.orderTotal) : '')
      +  (redemption.itemsUNiDAYSDiscount !== undefined ? '&ItemsUNiDAYSDiscount=' + encodeNumberValue(redemption.itemsUNiDAYSDiscount) : '')
      +  (redemption.code !== undefined ? '&Code=' + encodeStringValue(redemption.code) : '')
      +  (redemption.itemsTax !== undefined ? '&ItemsTax=' + encodeNumberValue(redemption.itemsTax) : '')
      +  (redemption.shippingGross !== undefined ? '&ShippingGross=' + encodeNumberValue(redemption.shippingGross) : '')
      +  (redemption.shippingDiscount !== undefined ? '&ShippingDiscount=' + encodeNumberValue(redemption.shippingDiscount) : '')
      +  (redemption.itemsGross !== undefined ? '&ItemsGross=' + encodeNumberValue(redemption.itemsGross) : '')
      +  (redemption.itemsOtherDiscount !== undefined ? '&ItemsOtherDiscount=' + encodeNumberValue(redemption.itemsOtherDiscount) : '')
      +  (redemption.UNiDAYSDiscountPercentage !== undefined ? '&UNiDAYSDiscountPercentage=' + encodeNumberValue(redemption.UNiDAYSDiscountPercentage) : '')
      +  (redemption.UNiDAYSDiscountPercentage !== undefined ? '&NewCustomer=' + (redemption.newCustomer ? true : false) : '');

      return qs;
  }

  signQueryString(queryString){
    let sig = generateSignature(queryString, this.customerSecret);
    return queryString + '&Signature=' + encodeStringValue(sig);
  }

  getTrackingPixelUrl (redemption) {
    if (redemption == null) throw new Error('redemption is null or undefined');

    const pixelEndpointPath = this.options.testMode ? '/perks/redemption/v1.2-test.gif' : '/perks/redemption/v1.2.gif',
          hostname = 'tracking.myunidays.com';
    let queryString = this.toQueryString(redemption);

    return buildUri(this.options, pixelEndpointPath, queryString);
  }

  getSignedTrackingPixelUrl (redemption) {
    if (redemption == null) throw new Error('redemption is null or undefined');

    const pixelEndpointPath = this.options.testMode ? '/perks/redemption/v1.2-test.gif' : '/perks/redemption/v1.2.gif',
          hostname = 'tracking.myunidays.com';
    let queryString = this.toQueryString(redemption);
    queryString = this.signQueryString(queryString);

    return buildUri(this.options, pixelEndpointPath, queryString);
  }

  getTrackingServerUrl(redemption) {
    if (redemption == null) throw new Error('redemption is null or undefined');

    const jsEndpointPath = this.options.testMode ? '/perks/redemption/v1.2-test.js' : '/perks/redemption/v1.2.js',
          hostname = 'tracking.myunidays.com';

    let queryString = this.toQueryString(redemption);
    queryString = this.signQueryString(queryString);

    return buildUri(this.options, jsEndpointPath, queryString);
  }
}

const encodeStringValue = (value) => {
  if (value == null) return '';
  return encodeURIComponent(value).replace(/%[A-F0-9]{2}/g, m => m.toLowerCase());
}

const encodeNumberValue = (value) => {
  if (value == null) return '';
  if ((typeof (value)).toLowerCase() !== 'number')
    value = parseFloat(value);

  return (Math.round(value * 100) / 100).toFixed(2);
}

const generateSignature = (queryString, customerSecret) => {
  const hmac = crypto.createHmac('sha512', customerSecret);
  return hmac.update(queryString).digest('base64');
}

const buildUri = (options, path, query) => {
  const protocol = options.protocol, hostname = options.hostname;
  return `${protocol}://${hostname}${path}${query}`;
}

module.exports = RedemptionClient;
