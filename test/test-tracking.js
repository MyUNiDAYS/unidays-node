"use strict";

const assert = require('assert'),
    RedemptionClient = require('../lib/index.js').RedemptionClient,
    fetchMock = require('fetch-mock'),
    querystring = require('querystring');


describe('RedemptionClient', () => {
    describe('#constructor', () => {
        it('should validate inputs', () => {
            assert.throws(() => {
                    new RedemptionClient(null, 'transactionId', 'GBP');
                },
                Error);

            assert.throws(() => {
                    new RedemptionClient('partnerId', null, 'GBP');
                },
                Error);

            assert.throws(() => {
                    new RedemptionClient('partnerId', 'transactionId', null);
                },
                Error);
        });

        it('should set inputs correctly', () => {
            let partnerId = 'partnerId',
                transactionId = 'transactionId',
                currency = 'GBP';
            const client = new RedemptionClient(partnerId, transactionId, currency);

            assert.strictEqual(client.partnerId, partnerId);
            assert.strictEqual(client.transactionId, transactionId);
            assert.strictEqual(client.currency, currency);
        });
    });

    describe('#recordRedemption', () => {
        let client;
        let mock;
        let key = '+ON3JGqQtsoagk0Sgdd6gDkz/MHr95T+LeYmPzSkBB9Y/LMPNFiXRYc90I73DLUJDXTDDjNQ8DbYXYTkH4SNnuer43v4LmhPHhB5k/9vy5Pmtt2CnNAiylYIQK/Jm0xYhRsGUVmT9GzVx1CyeaxzfPkGsdszlcfy1HuaxGv/yjA=';

        before(() => {
            mock = fetchMock.sandbox();
            mock
                .post(/.*\/v1\.2\/redemption\?.*/, 'endpoint')
                .catch(404);
            client = new RedemptionClient('partnerId', 'transactionId', 'GBP', {
                fetch: mock
            });
        })

        it('should validate the redemption', () => {
            assert.throws(() => {
                    client.recordRedemption(undefined, key);
                },
                Error);
        });

        it('should send a valid POST request', (done) => {
            client.recordRedemption({
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
                }, key)
                .then(res => {
                    assert.strictEqual(res.status, 200);
                    return res.text();
                })
                .then(body => {
                    assert.strictEqual(body, 'endpoint');
                    done();
                })
                .catch(err => {
                    assert.fail();
                    done();
                });
        });

        it('should record redemption to the test endpoint when testMode === true', (done) => {
            let testClient = new RedemptionClient('partnerId', 'transactionId', 'GBP', {
                testMode: true,
                fetch: mock
            });
            testClient.recordRedemption({
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
                }, key)
                .then(res => {
                    assert.strictEqual(res.status, 200);
                    return res.text();
                })
                .then(body => {
                    assert.strictEqual(body, 'endpoint');
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
            client = new RedemptionClient('partnerId', 'transaction/Id', 'GBP');
            redemption = {
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
            let qs = client._toQueryString(redemption);

            assert(qs.includes('?PartnerId=partnerId&TransactionId=transaction%2fId&Currency=GBP&MemberId=memberId&OrderTotal=209.00&ItemsUNiDAYSDiscount=13.00&Code=ABC123&ItemsTax=34.50&ShippingGross=5.00&ShippingDiscount=3.00&ItemsGross=230.00&ItemsOtherDiscount=10.00&UNiDAYSDiscountPercentage=10.00&NewCustomer=true'));
        });

        it('should return lowercase encoded characters', () => {
            let qs = client._toQueryString(redemption);
            assert(qs.includes('&TransactionId=transaction%2fId'));
        });

        it('should serialise numbers to 2dp', () => {
            let redemption2 = {
                transactionId: 'transactionId',
                currency: 'GBP',
                memberId: 'memberId',
                orderTotal: 7.07777777
            };

            let qs = client._toQueryString(redemption2);
            let orderTotal = querystring.parse(qs)['OrderTotal'];
            assert.strictEqual(orderTotal, '7.08');
        });
    });

    describe('#toQueryStringWithMissingParam', () => {
        let client;
        let redemption;
        before(() => {
            client = new RedemptionClient('partnerId', 'transaction/Id', 'GBP');
            redemption = {
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
            let qs = client._toQueryString(redemption);

            assert(qs.includes('?PartnerId=partnerId&TransactionId=transaction%2fId&Currency=GBP&OrderTotal=209.00&ItemsUNiDAYSDiscount=13.00&Code=ABC123&ItemsTax=34.50&ShippingGross=5.00&ShippingDiscount=3.00&ItemsGross=230.00&ItemsOtherDiscount=10.00&UNiDAYSDiscountPercentage=10.00&NewCustomer=true'));
        });
    });

    describe('#getTrackingScriptUrl', () => {
        let client;

        before(() => {
            client = new RedemptionClient('partnerId', 'transaction/Id', 'GBP');
        });

        it('should validate the redemption', () => {
            assert.throws(() => {
                    client.getTrackingScriptUrl(null);
                },
                Error);
        });

        it('should return a valid tracking script url', () => {
            var trackingScriptUrl = client.getTrackingScriptUrl({
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

            assert.strictEqual(trackingScriptUrl, 'https://tracking.myunidays.com/v1.2/redemption/js?PartnerId=partnerId&TransactionId=transaction%2fId&Currency=GBP&MemberId=memberId&OrderTotal=209.00&ItemsUNiDAYSDiscount=13.00&Code=ABC123&ItemsTax=34.50&ShippingGross=5.00&ShippingDiscount=3.00&ItemsGross=230.00&ItemsOtherDiscount=10.00&UNiDAYSDiscountPercentage=10.00&NewCustomer=true');
        });
    });

    describe('#getTestTrackingScriptUrl', () => {
        let client;

        before(() => {
            client = new RedemptionClient('partnerId', 'transaction/Id', 'GBP', { testMode: true });
        });

        it('should validate the redemption', () => {
            assert.throws(() => {
                    client.getTrackingScriptUrl(null);
                },
                Error);
        });

        it('should return a valid tracking script url', () => {
            var trackingScriptUrl = client.getTrackingScriptUrl({
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

            assert.strictEqual(trackingScriptUrl, 'https://tracking.myunidays.com/v1.2/redemption/js?PartnerId=partnerId&TransactionId=transaction%2fId&Currency=GBP&MemberId=memberId&OrderTotal=209.00&ItemsUNiDAYSDiscount=13.00&Code=ABC123&ItemsTax=34.50&ShippingGross=5.00&ShippingDiscount=3.00&ItemsGross=230.00&ItemsOtherDiscount=10.00&UNiDAYSDiscountPercentage=10.00&NewCustomer=true&Test=True');
        });
    });

    describe('#getSignedTrackingScriptUrl', () => {
        let client,
            key = '+ON3JGqQtsoagk0Sgdd6gDkz/MHr95T+LeYmPzSkBB9Y/LMPNFiXRYc90I73DLUJDXTDDjNQ8DbYXYTkH4SNnuer43v4LmhPHhB5k/9vy5Pmtt2CnNAiylYIQK/Jm0xYhRsGUVmT9GzVx1CyeaxzfPkGsdszlcfy1HuaxGv/yjA=';

        before(() => {
            client = new RedemptionClient('partnerId', 'transaction/Id', 'GBP');
        });

        it('should validate the redemption', () => {
            assert.throws(() => {
                    client.getSignedTrackingScriptUrl(null, key);
                },
                Error);
        });

        it('should return a valid tracking script url', () => {
            var trackingScriptUrl = client.getSignedTrackingScriptUrl({
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
            }, key);

            assert.strictEqual(trackingScriptUrl, 'https://tracking.myunidays.com/v1.2/redemption/js?PartnerId=partnerId&TransactionId=transaction%2fId&Currency=GBP&MemberId=memberId&OrderTotal=209.00&ItemsUNiDAYSDiscount=13.00&Code=ABC123&ItemsTax=34.50&ShippingGross=5.00&ShippingDiscount=3.00&ItemsGross=230.00&ItemsOtherDiscount=10.00&UNiDAYSDiscountPercentage=10.00&NewCustomer=true&Signature=J7zpDfftsTBvLZ5n23HfbK71MsgYRZlhWF20K%2fF75%2bTdZkga1ErBj4HbgyzDMcnLo1lDMfCzoBwcB4OGsEc6Jw%3d%3d');
        });
    });

    describe('#getTestSignedTrackingScriptUrl', () => {
        let client,
            key = '+ON3JGqQtsoagk0Sgdd6gDkz/MHr95T+LeYmPzSkBB9Y/LMPNFiXRYc90I73DLUJDXTDDjNQ8DbYXYTkH4SNnuer43v4LmhPHhB5k/9vy5Pmtt2CnNAiylYIQK/Jm0xYhRsGUVmT9GzVx1CyeaxzfPkGsdszlcfy1HuaxGv/yjA=';

        before(() => {
            client = new RedemptionClient('partnerId', 'transaction/Id', 'GBP', { testMode: true });
        });

        it('should return a valid test tracking script url', () => {
            var trackingScriptUrl = client.getSignedTrackingScriptUrl({
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
            }, key);

            assert.strictEqual(trackingScriptUrl, 'https://tracking.myunidays.com/v1.2/redemption/js?PartnerId=partnerId&TransactionId=transaction%2fId&Currency=GBP&MemberId=memberId&OrderTotal=209.00&ItemsUNiDAYSDiscount=13.00&Code=ABC123&ItemsTax=34.50&ShippingGross=5.00&ShippingDiscount=3.00&ItemsGross=230.00&ItemsOtherDiscount=10.00&UNiDAYSDiscountPercentage=10.00&NewCustomer=true&Signature=J7zpDfftsTBvLZ5n23HfbK71MsgYRZlhWF20K%2fF75%2bTdZkga1ErBj4HbgyzDMcnLo1lDMfCzoBwcB4OGsEc6Jw%3d%3d&Test=True');
        });
    });

    describe('#getTrackingServerUrl', () => {
        let client,
            key = '+ON3JGqQtsoagk0Sgdd6gDkz/MHr95T+LeYmPzSkBB9Y/LMPNFiXRYc90I73DLUJDXTDDjNQ8DbYXYTkH4SNnuer43v4LmhPHhB5k/9vy5Pmtt2CnNAiylYIQK/Jm0xYhRsGUVmT9GzVx1CyeaxzfPkGsdszlcfy1HuaxGv/yjA=';
        before(() => {
            client = new RedemptionClient('partnerId', 'transaction/Id', 'GBP');
        })

        it('should validate the redemption', () => {
            assert.throws(() => {
                    client.getTrackingServerUrl(null, key);
                },
                Error);
        });

        it('should return a valid server tracking url', () => {
            var trackingPixelUrl = client.getTrackingServerUrl({
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
            }, key);

            assert.strictEqual(trackingPixelUrl, 'https://tracking.myunidays.com/v1.2/redemption?PartnerId=partnerId&TransactionId=transaction%2fId&Currency=GBP&MemberId=memberId&OrderTotal=209.00&ItemsUNiDAYSDiscount=13.00&Code=ABC123&ItemsTax=34.50&ShippingGross=5.00&ShippingDiscount=3.00&ItemsGross=230.00&ItemsOtherDiscount=10.00&UNiDAYSDiscountPercentage=10.00&NewCustomer=true&Signature=J7zpDfftsTBvLZ5n23HfbK71MsgYRZlhWF20K%2fF75%2bTdZkga1ErBj4HbgyzDMcnLo1lDMfCzoBwcB4OGsEc6Jw%3d%3d');
        });
    });

    describe('#getTestTrackingServerUrl', () => {
        let client,
            key = '+ON3JGqQtsoagk0Sgdd6gDkz/MHr95T+LeYmPzSkBB9Y/LMPNFiXRYc90I73DLUJDXTDDjNQ8DbYXYTkH4SNnuer43v4LmhPHhB5k/9vy5Pmtt2CnNAiylYIQK/Jm0xYhRsGUVmT9GzVx1CyeaxzfPkGsdszlcfy1HuaxGv/yjA=';
        before(() => {
            client = new RedemptionClient('partnerId', 'transaction/Id', 'GBP', { testMode: true });
        })

        it('should return a valid test server tracking url', () => {
            var trackingPixelUrl = client.getTrackingServerUrl({
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
            }, key);

            assert.strictEqual(trackingPixelUrl, 'https://tracking.myunidays.com/v1.2/redemption?PartnerId=partnerId&TransactionId=transaction%2fId&Currency=GBP&MemberId=memberId&OrderTotal=209.00&ItemsUNiDAYSDiscount=13.00&Code=ABC123&ItemsTax=34.50&ShippingGross=5.00&ShippingDiscount=3.00&ItemsGross=230.00&ItemsOtherDiscount=10.00&UNiDAYSDiscountPercentage=10.00&NewCustomer=true&Signature=J7zpDfftsTBvLZ5n23HfbK71MsgYRZlhWF20K%2fF75%2bTdZkga1ErBj4HbgyzDMcnLo1lDMfCzoBwcB4OGsEc6Jw%3d%3d&Test=True');
        });
    })
});