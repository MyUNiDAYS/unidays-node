"use strict";

const assert = require('assert'),
      RedemptionClient = require('../lib/index.js').RedemptionClient,
      fetchMock = require('fetch-mock'),
      querystring = require('querystring');


describe('RedemptionClient', () => {
  describe('#constructor', () => {
    it('should validate inputs', () => {
      assert.throws(() => {
        new RedemptionClient(null, 'customerSecret');
      },
      Error);

      assert.throws(() => {
        new RedemptionClient('partnerId', null);
      },
      Error);
    });

    it('should set inputs correctly', () => {
      let partnerId = 'partnerId',
          customerSecret = 'customerSecret';
      const client = new RedemptionClient(partnerId, customerSecret);

      assert.strictEqual(client.partnerId, partnerId);
      assert(client.customerSecret.equals(new Buffer(customerSecret, 'base64')));
    });
  });

  describe('#recordRedemption', () => {
    let client;
    let mock;
    before(() => {
      mock = fetchMock.sandbox();
      mock
        .post(/.*\/perks\/redemption\/v1\.2\?.*/, 'live')
        .post(/.*\/perks\/redemption\/v1\.2\-test.*/, 'test')
        .catch(404);
      client = new RedemptionClient("partnerId", "customerSecret", {fetch: mock});
    })


    it('should validate the redemption', () => {
      assert.throws(() => {
        client.recordRedemption(undefined);
      },
      Error);
    });

    it('should send a valid POST request', (done) => {
      client.recordRedemption({
        transactionId: 'transactionId',
        currency: 'GBP',
        memberId: 'memberId',
        orderTotal: 209.00,
        itemsUNiDAYSDiscount: 13.00,
        code: 'ABC123',
        itemsTax: 34.50,
        shippingGross: 5.00,
        shippingDiscount: 3.00,
        itemsGross: 230.00,
        itemsOtherDiscount: 10.00,
        UNiDAYSDiscountPercentage: 10.00,
        newCustomer: true
      })
      .then(res => {
        assert.strictEqual(res.status, 200);
        return res.text();
      })
      .then(body => {
        assert.strictEqual(body, 'live');
        done();
      })
      .catch(err => {
        assert.fail();
        done();
      });
    });

    it('should record redemption to the test endpoint when testMode === true', (done) => {
      let testClient = new RedemptionClient('partnerId', 'customerSecret', {testMode: true, fetch: mock});
      testClient.recordRedemption({
        transactionId: 'transactionId',
        memberId: 'memberId',
        currency: 'GBP',
        orderTotal: 209.00,
        itemsUNiDAYSDiscount: 13.00,
        code: 'ABC123',
        itemsTax: 34.50,
        shippingGross: 5.00,
        shippingDiscount: 3.00,
        itemsGross: 230.00,
        itemsOtherDiscount: 10.00,
        UNiDAYSDiscountPercentage: 10.00,
        newCustomer: true
      })
      .then(res => {
        assert.strictEqual(res.status, 200);
        return res.text();
      })
      .then(body => {
        assert.strictEqual(body, 'test');
        done();
      })
      .catch(err => {
        assert.fail();
        done();
      });
    });
  });

  describe('#toQueryString', () => {
    let client;
    let redemption;
    before(() => {
      client = new RedemptionClient('partnerId', '+ON3JGqQtsoagk0Sgdd6gDkz/MHr95T+LeYmPzSkBB9Y/LMPNFiXRYc90I73DLUJDXTDDjNQ8DbYXYTkH4SNnuer43v4LmhPHhB5k/9vy5Pmtt2CnNAiylYIQK/Jm0xYhRsGUVmT9GzVx1CyeaxzfPkGsdszlcfy1HuaxGv/yjA=');
      redemption = {
        transactionId: 'transaction/Id',
        currency: 'GBP',
        memberId: 'memberId',
        orderTotal: 209.00,
        itemsUNiDAYSDiscount: 13.00,
        code: 'ABC123',
        itemsTax: 34.50,
        shippingGross: 5.00,
        shippingDiscount: 3.00,
        itemsGross: 230.00,
        itemsOtherDiscount: 10.00,
        UNiDAYSDiscountPercentage: 10.00,
        newCustomer: true
      };
    });

    it('should serialise a full redemption correctly', () => {
      let qs = client.toQueryString(redemption);

      assert(qs.includes('?PartnerId=partnerId&TransactionId=transaction%2fId&Currency=GBP&MemberId=memberId&OrderTotal=209.00&ItemsUNiDAYSDiscount=13.00&Code=ABC123&ItemsTax=34.50&ShippingGross=5.00&ShippingDiscount=3.00&ItemsGross=230.00&ItemsOtherDiscount=10.00&UNiDAYSDiscountPercentage=10.00&NewCustomer=true'));
    });

    it('should return lowercase encoded characters', () => {
      let qs = client.toQueryString(redemption);
      assert(qs.includes('&TransactionId=transaction%2fId'));
    });

    it('should serialise numbers to 2dp', () => {
      let redemption2 = {
        transactionId: 'transactionId',
        currency: 'GBP',
        memberId: 'memberId',
        orderTotal: 7.07777777
      };

      let qs = client.toQueryString(redemption2);
      let orderTotal = querystring.parse(qs)['OrderTotal'];
      assert.strictEqual(orderTotal, '7.08');
    });
  });

  describe('#toQueryStringWithMissingParam', () => {
    let client;
    let redemption;
    before(() => {
      client = new RedemptionClient('partnerId', '+ON3JGqQtsoagk0Sgdd6gDkz/MHr95T+LeYmPzSkBB9Y/LMPNFiXRYc90I73DLUJDXTDDjNQ8DbYXYTkH4SNnuer43v4LmhPHhB5k/9vy5Pmtt2CnNAiylYIQK/Jm0xYhRsGUVmT9GzVx1CyeaxzfPkGsdszlcfy1HuaxGv/yjA=');
      redemption = {
        transactionId: 'transaction/Id',
        currency: 'GBP',
        orderTotal: 209.00,
        itemsUNiDAYSDiscount: 13.00,
        code: 'ABC123',
        itemsTax: 34.50,
        shippingGross: 5.00,
        shippingDiscount: 3.00,
        itemsGross: 230.00,
        itemsOtherDiscount: 10.00,
        UNiDAYSDiscountPercentage: 10.00,
        newCustomer: true
      };
    });

    it('should serialise a full redemption without undefined parameters', () => {
      let qs = client.toQueryString(redemption);

      assert(qs.includes('?PartnerId=partnerId&TransactionId=transaction%2fId&Currency=GBP&OrderTotal=209.00&ItemsUNiDAYSDiscount=13.00&Code=ABC123&ItemsTax=34.50&ShippingGross=5.00&ShippingDiscount=3.00&ItemsGross=230.00&ItemsOtherDiscount=10.00&UNiDAYSDiscountPercentage=10.00&NewCustomer=true'));
    });
  });

  describe('#getTrackingPixelUrl', () => {
    let client;

    before(() => {
      client = new RedemptionClient("partnerId", "+ON3JGqQtsoagk0Sgdd6gDkz/MHr95T+LeYmPzSkBB9Y/LMPNFiXRYc90I73DLUJDXTDDjNQ8DbYXYTkH4SNnuer43v4LmhPHhB5k/9vy5Pmtt2CnNAiylYIQK/Jm0xYhRsGUVmT9GzVx1CyeaxzfPkGsdszlcfy1HuaxGv/yjA=");
    });

    it('should validate the redemption', () => {
      assert.throws(() => {
        client.getTrackingPixelUrl(null);
      },
      Error);
    });

    it('should return a valid tracking pixel url', () => {
      var trackingPixelUrl = client.getTrackingPixelUrl({
        transactionId: 'transaction/Id',
        currency: 'GBP',
        memberId: 'memberId',
        orderTotal: 209.00,
        itemsUNiDAYSDiscount: 13.00,
        code: 'ABC123',
        itemsTax: 34.50,
        shippingGross: 5.00,
        shippingDiscount: 3.00,
        itemsGross: 230.00,
        itemsOtherDiscount: 10.00,
        UNiDAYSDiscountPercentage: 10.00,
        newCustomer: true
      });

      assert.strictEqual(trackingPixelUrl, 'https://tracking.myunidays.com/perks/redemption/v1.2.gif?PartnerId=partnerId&TransactionId=transaction%2fId&Currency=GBP&MemberId=memberId&OrderTotal=209.00&ItemsUNiDAYSDiscount=13.00&Code=ABC123&ItemsTax=34.50&ShippingGross=5.00&ShippingDiscount=3.00&ItemsGross=230.00&ItemsOtherDiscount=10.00&UNiDAYSDiscountPercentage=10.00&NewCustomer=true');
    });
  });
 
  describe('#getSignedTrackingPixelUrl', () => {
    let client;

    before(() => {
      client = new RedemptionClient("partnerId", "+ON3JGqQtsoagk0Sgdd6gDkz/MHr95T+LeYmPzSkBB9Y/LMPNFiXRYc90I73DLUJDXTDDjNQ8DbYXYTkH4SNnuer43v4LmhPHhB5k/9vy5Pmtt2CnNAiylYIQK/Jm0xYhRsGUVmT9GzVx1CyeaxzfPkGsdszlcfy1HuaxGv/yjA=");
    });

    it('should validate the redemption', () => {
      assert.throws(() => {
        client.getSignedTrackingPixelUrl(null);
      },
      Error);
    });

    it('should return a valid tracking pixel url', () => {
      var trackingPixelUrl = client.getSignedTrackingPixelUrl({
        transactionId: 'transaction/Id',
        currency: 'GBP',
        memberId: 'memberId',
        orderTotal: 209.00,
        itemsUNiDAYSDiscount: 13.00,
        code: 'ABC123',
        itemsTax: 34.50,
        shippingGross: 5.00,
        shippingDiscount: 3.00,
        itemsGross: 230.00,
        itemsOtherDiscount: 10.00,
        UNiDAYSDiscountPercentage: 10.00,
        newCustomer: true
      });

      assert.strictEqual(trackingPixelUrl, 'https://tracking.myunidays.com/perks/redemption/v1.2.gif?PartnerId=partnerId&TransactionId=transaction%2fId&Currency=GBP&MemberId=memberId&OrderTotal=209.00&ItemsUNiDAYSDiscount=13.00&Code=ABC123&ItemsTax=34.50&ShippingGross=5.00&ShippingDiscount=3.00&ItemsGross=230.00&ItemsOtherDiscount=10.00&UNiDAYSDiscountPercentage=10.00&NewCustomer=true&Signature=Q82jSo08TYNWquRjgSxYQcDIUwxqrM5%2fexZXHuUOK27bwVBMiBIIUuNTJuMza7TALN2lSD4gyuQGpQTgSXavRQ%3d%3d');
    });
  });

  describe('#getTrackingServerUrl', () => {
    let client;
    before(() => {
      client = new RedemptionClient('partnerId', '+ON3JGqQtsoagk0Sgdd6gDkz/MHr95T+LeYmPzSkBB9Y/LMPNFiXRYc90I73DLUJDXTDDjNQ8DbYXYTkH4SNnuer43v4LmhPHhB5k/9vy5Pmtt2CnNAiylYIQK/Jm0xYhRsGUVmT9GzVx1CyeaxzfPkGsdszlcfy1HuaxGv/yjA=');
    })

    it('should validate the redemption', () => {
      assert.throws(() => {
        client.getTrackingServerUrl(null);
      },
      Error);
    });

    it('should return a valid js tracking url', () => {
      var trackingPixelUrl = client.getTrackingServerUrl({
        transactionId: 'transaction/Id',
        currency: 'GBP',
        memberId: 'memberId',
        orderTotal: 209.00,
        itemsUNiDAYSDiscount: 13.00,
        code: 'ABC123',
        itemsTax: 34.50,
        shippingGross: 5.00,
        shippingDiscount: 3.00,
        itemsGross: 230.00,
        itemsOtherDiscount: 10.00,
        UNiDAYSDiscountPercentage: 10.00,
        newCustomer: true
      });

      assert.strictEqual(trackingPixelUrl, 'https://tracking.myunidays.com/perks/redemption/v1.2.js?PartnerId=partnerId&TransactionId=transaction%2fId&Currency=GBP&MemberId=memberId&OrderTotal=209.00&ItemsUNiDAYSDiscount=13.00&Code=ABC123&ItemsTax=34.50&ShippingGross=5.00&ShippingDiscount=3.00&ItemsGross=230.00&ItemsOtherDiscount=10.00&UNiDAYSDiscountPercentage=10.00&NewCustomer=true&Signature=Q82jSo08TYNWquRjgSxYQcDIUwxqrM5%2fexZXHuUOK27bwVBMiBIIUuNTJuMza7TALN2lSD4gyuQGpQTgSXavRQ%3d%3d');
    });
  })
});
