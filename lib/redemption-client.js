"use strict";

const crypto = require('crypto'),
      fetch = require('node-fetch');

class RedemptionClient {
  constructor (partnerId, transactionId, currency, opts) {
    if (partnerId == null) throw new Error('partnerId is null or undefined.');
    if (transactionId == null) throw new Error('transactionId is null or undefined.');
    if (currency == null) throw new Error('currency is null or undefined.');

    this.test = null;
    this.partnerId = partnerId;
    this.transactionId = transactionId;
    this.currency = currency;
    this.options = Object.assign({ fetch: fetch, hostname: "tracking.myunidays.com", protocol: 'https'}, opts);
  }

  recordRedemption (redemption, customerSecret) {
    if (redemption == null) throw new Error('redemption is null or undefined');

    const serverEndpointPath = this.options.testMode ? '/perks/redemption/v1.2-test' : '/perks/redemption/v1.2';
    var queryString = this.toQueryString(redemption);
    queryString = this.signQueryString(queryString, customerSecret);

    var url = buildUri(this.options, serverEndpointPath, queryString);
    return this.options.fetch(url, {
      method: 'POST',
      headers: { 'User-Agent': 'UNiDAYS node.js tracking SDK v1.2' }
    });
  }

  toQueryString (redemption) {
    var qs = '?PartnerId=' + encodeStringValue(this.partnerId)
      + '&TransactionId=' + encodeStringValue(this.transactionId)
      + '&Currency=' + encodeStringValue(this.currency)
      +  (redemption.memberId != null ? '&MemberId=' + encodeStringValue(redemption.memberId) : '')
      +  (redemption.orderTotal != null ? '&OrderTotal=' + encodeNumberValue(redemption.orderTotal) : '')
      +  (redemption.itemsUNiDAYSDiscount != null ? '&ItemsUNiDAYSDiscount=' + encodeNumberValue(redemption.itemsUNiDAYSDiscount) : '')
      +  (redemption.code != null ? '&Code=' + encodeStringValue(redemption.code) : '')
      +  (redemption.itemsTax != null ? '&ItemsTax=' + encodeNumberValue(redemption.itemsTax) : '')
      +  (redemption.shippingGross != null ? '&ShippingGross=' + encodeNumberValue(redemption.shippingGross) : '')
      +  (redemption.shippingDiscount != null ? '&ShippingDiscount=' + encodeNumberValue(redemption.shippingDiscount) : '')
      +  (redemption.itemsGross != null ? '&ItemsGross=' + encodeNumberValue(redemption.itemsGross) : '')
      +  (redemption.itemsOtherDiscount != null ? '&ItemsOtherDiscount=' + encodeNumberValue(redemption.itemsOtherDiscount) : '')
      +  (redemption.UNiDAYSDiscountPercentage != null ? '&UNiDAYSDiscountPercentage=' + encodeNumberValue(redemption.UNiDAYSDiscountPercentage) : '')
      +  (redemption.newCustomer != null ? '&NewCustomer=' + (redemption.newCustomer ? true : false) : '')
      +  (this.test != null ? '&Test=' + (this.test ? true : false) : '');

      return qs;
  }

  signQueryString(queryString, customerSecret){
    var sig = generateSignature(queryString, customerSecret);
    return queryString + '&Signature=' + encodeStringValue(sig);
  }

  getTrackingPixelUrl (redemption) {
    if (redemption == null) throw new Error('redemption is null or undefined');

    const pixelEndpointPath = '/perks/redemption/v1.2.gif',
          hostname = 'tracking.myunidays.com';
    var queryString = this.toQueryString(redemption);

    return buildUri(this.options, pixelEndpointPath, queryString);
  }

  getTestTrackingPixelUrl (redemption, test) {
    this.test = test;
    if (redemption == null) throw new Error('redemption is null or undefined');

    const pixelEndpointPath = '/perks/redemption/v1.2.gif',
          hostname = 'tracking.myunidays.com';

    var queryString = this.toQueryString(redemption);

    return buildUri(this.options, pixelEndpointPath, queryString);
  }

  getSignedTrackingPixelUrl (redemption, customerSecret) {
    if (redemption == null) throw new Error('redemption is null or undefined');

    const pixelEndpointPath = '/perks/redemption/v1.2.gif',
          hostname = 'tracking.myunidays.com';
    var queryString = this.toQueryString(redemption);
    queryString = this.signQueryString(queryString, customerSecret);

    return buildUri(this.options, pixelEndpointPath, queryString);
  }

  getTestSignedTrackingPixelUrl (redemption, customerSecret, test) {
    this.test = test;
    
    if (redemption == null) throw new Error('redemption is null or undefined');

    const pixelEndpointPath = '/perks/redemption/v1.2.gif',
          hostname = 'tracking.myunidays.com';

    var queryString = this.toQueryString(redemption);
    queryString = this.signQueryString(queryString, customerSecret);

    return buildUri(this.options, pixelEndpointPath, queryString);
  }


  getTrackingServerUrl(redemption, customerSecret) {
    if (redemption == null) throw new Error('redemption is null or undefined');

    const jsEndpointPath = '/perks/redemption/v1.2.js',
          hostname = 'tracking.myunidays.com';

    var queryString = this.toQueryString(redemption);
    queryString = this.signQueryString(queryString, customerSecret);

    return buildUri(this.options, jsEndpointPath, queryString);
  }

  getTestTrackingServerUrl(redemption, customerSecret, test) {
    this.test = test;
    if (redemption == null) throw new Error('redemption is null or undefined');
    
    const jsEndpointPath = '/perks/redemption/v1.2.js',
          hostname = 'tracking.myunidays.com';

    var queryString = this.toQueryString(redemption);
    queryString = this.signQueryString(queryString, customerSecret);

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
