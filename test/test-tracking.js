"use strict";

const assert = require('assert'),
    RedemptionClient = require('../index.js').RedemptionClient,
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
                .post(/.*\/tracking\/v1\.2\/redemption\?.*/, 'endpoint')
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

            assert(qs.includes('?PartnerId=partnerId&TransactionId=transaction%2FId&MemberId=memberId&Currency=GBP&OrderTotal=209.00&ItemsUNiDAYSDiscount=13.00&Code=ABC123&ItemsTax=34.50&ShippingGross=5.00&ShippingDiscount=3.00&ItemsGross=230.00&ItemsOtherDiscount=10.00&UNiDAYSDiscountPercentage=10.00&NewCustomer=True'));
        });

        it('should return uppercase encoded characters', () => {
            let qs = client._toQueryString(redemption);
            assert(qs.includes('&TransactionId=transaction%2FId'));
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

    describe('#toQueryStringWithMinimumParams', () => {
        let client;
        let redemption;
        before(() => {
            client = new RedemptionClient('partnerId', 'transactionId', 'GBP');
            redemption = {};
        });

        it('should serialise a full redemption without undefined parameters', () => {
            let qs = client._toQueryString(redemption);

            assert(qs.includes('?PartnerId=partnerId&TransactionId=transactionId&MemberId=&Currency=GBP&OrderTotal=&ItemsUNiDAYSDiscount=&Code=&ItemsTax=&ShippingGross=&ShippingDiscount=&ItemsGross=&ItemsOtherDiscount=&UNiDAYSDiscountPercentage=&NewCustomer='));
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
            let trackingScriptUrl = client.getTrackingScriptUrl({
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

            assert.strictEqual(trackingScriptUrl, 'https://api.myunidays.com/tracking/v1.2/redemption/js?PartnerId=partnerId&TransactionId=transaction%2FId&MemberId=memberId&Currency=GBP&OrderTotal=209.00&ItemsUNiDAYSDiscount=13.00&Code=ABC123&ItemsTax=34.50&ShippingGross=5.00&ShippingDiscount=3.00&ItemsGross=230.00&ItemsOtherDiscount=10.00&UNiDAYSDiscountPercentage=10.00&NewCustomer=True');
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
            let trackingScriptUrl = client.getTrackingScriptUrl({
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

            assert.strictEqual(trackingScriptUrl, 'https://api.myunidays.com/tracking/v1.2/redemption/js?PartnerId=partnerId&TransactionId=transaction%2FId&MemberId=memberId&Currency=GBP&OrderTotal=209.00&ItemsUNiDAYSDiscount=13.00&Code=ABC123&ItemsTax=34.50&ShippingGross=5.00&ShippingDiscount=3.00&ItemsGross=230.00&ItemsOtherDiscount=10.00&UNiDAYSDiscountPercentage=10.00&NewCustomer=True&Test=True');
        });
    });

    describe('#getSignedTrackingScriptUrl', () => {
        let client,
            key = 'AAAAAA==';

        before(() => {
            client = new RedemptionClient('a partner Id', 'the transaction id', 'GBP');
        });

        it('should validate the redemption', () => {
            assert.throws(() => {
                    client.getSignedTrackingScriptUrl(null, key);
                },
                Error);
        });

        it('should return a valid tracking script url', () => {
            let trackingScriptUrl = client.getSignedTrackingScriptUrl({
                orderTotal: 209.00,
                itemsUNiDAYSDiscount: 13.00,
                code: 'a code',
                itemsTax: 34.50,
                shippingGross: 5.00,
                shippingDiscount: 3.00,
                itemsGross: 230.00,
                itemsOtherDiscount: 10.00,
                UNiDAYSDiscountPercentage: 10.00,
                newCustomer: true
            }, key);

            assert.strictEqual(trackingScriptUrl, 'https://api.myunidays.com/tracking/v1.2/redemption/js?PartnerId=a+partner+Id&TransactionId=the+transaction+id&MemberId=&Currency=GBP&OrderTotal=209.00&ItemsUNiDAYSDiscount=13.00&Code=a+code&ItemsTax=34.50&ShippingGross=5.00&ShippingDiscount=3.00&ItemsGross=230.00&ItemsOtherDiscount=10.00&UNiDAYSDiscountPercentage=10.00&NewCustomer=True&Signature=c6sNwe3kcvr3%2FNYH%2B661%2F37BSP1RFIgrJ2LJ5e3ETOTD0kPBb6gzqvR8uEhFEJaksfBxy9Ct%2Frrn9%2F8fH0tuQQ%3D%3D');
        });
    });

    describe('#getTestSignedTrackingScriptUrl', () => {
        let client,
            key = 'AAAAAA==';

        before(() => {
            client = new RedemptionClient('a partner Id', 'the transaction id', 'GBP', { testMode: true });
        });

        it('should return a valid test tracking script url', () => {
            let trackingScriptUrl = client.getSignedTrackingScriptUrl({
                orderTotal: 209.00,
                itemsUNiDAYSDiscount: 13.00,
                code: 'a code',
                itemsTax: 34.50,
                shippingGross: 5.00,
                shippingDiscount: 3.00,
                itemsGross: 230.00,
                itemsOtherDiscount: 10.00,
                UNiDAYSDiscountPercentage: 10.00,
                newCustomer: true
            }, key);

            assert.strictEqual(trackingScriptUrl, 'https://api.myunidays.com/tracking/v1.2/redemption/js?PartnerId=a+partner+Id&TransactionId=the+transaction+id&MemberId=&Currency=GBP&OrderTotal=209.00&ItemsUNiDAYSDiscount=13.00&Code=a+code&ItemsTax=34.50&ShippingGross=5.00&ShippingDiscount=3.00&ItemsGross=230.00&ItemsOtherDiscount=10.00&UNiDAYSDiscountPercentage=10.00&NewCustomer=True&Signature=c6sNwe3kcvr3%2FNYH%2B661%2F37BSP1RFIgrJ2LJ5e3ETOTD0kPBb6gzqvR8uEhFEJaksfBxy9Ct%2Frrn9%2F8fH0tuQQ%3D%3D&Test=True');
        });
    });

    describe('#getTrackingServerUrl', () => {
        let client,
            key = 'xCaiGms6eEcRYKqY7hXYPBLizZwY9Z2g/OqyOXa0r7lqZ8Npf78eK+rbnoplH7xCAab/0+h1zLYxfJm62GbgSHfnvjUGEOuh/MtHNALCoXD6Y3YWIrJnlEfym2kmWl7ZQoFyYbZXBTZq0SyCXJAI53ShKIcTPDBM3sNLm70IWns=';
        before(() => {
            client = new RedemptionClient('a partner Id', 'the transaction id', 'GBP');
        })

        it('should validate the redemption', () => {
            assert.throws(() => {
                    client.getTrackingServerUrl(null, key);
                },
                Error);
        });

        it('should return a valid server tracking url', () => {
            let trackingPixelUrl = client.getTrackingServerUrl({
                orderTotal: 209.00,
                itemsUNiDAYSDiscount: 13.00,
                code: 'a code',
                itemsTax: 34.50,
                shippingGross: 5.00,
                shippingDiscount: 3.00,
                itemsGross: 230.00,
                itemsOtherDiscount: 10.00,
                UNiDAYSDiscountPercentage: 10.00,
                newCustomer: true
            }, key);

            assert.strictEqual(trackingPixelUrl, 'https://api.myunidays.com/tracking/v1.2/redemption?PartnerId=a+partner+Id&TransactionId=the+transaction+id&MemberId=&Currency=GBP&OrderTotal=209.00&ItemsUNiDAYSDiscount=13.00&Code=a+code&ItemsTax=34.50&ShippingGross=5.00&ShippingDiscount=3.00&ItemsGross=230.00&ItemsOtherDiscount=10.00&UNiDAYSDiscountPercentage=10.00&NewCustomer=True&Signature=VsP%2B%2BN2PQ7Jy%2FhH6wjkVcGRLRkqpyBFyZPCLW7u0UYuXiYvBlggi4SgCQ1GPs5mg3JswBYms8qTwRehFpWhhAg%3D%3D');
        });
    });

    describe('#getTestTrackingServerUrl', () => {
        let client,
            key = 'xCaiGms6eEcRYKqY7hXYPBLizZwY9Z2g/OqyOXa0r7lqZ8Npf78eK+rbnoplH7xCAab/0+h1zLYxfJm62GbgSHfnvjUGEOuh/MtHNALCoXD6Y3YWIrJnlEfym2kmWl7ZQoFyYbZXBTZq0SyCXJAI53ShKIcTPDBM3sNLm70IWns=';
        before(() => {
            client = new RedemptionClient('a partner Id', 'the transaction id', 'GBP', { testMode: true });
        })

        it('should return a valid test server tracking url', () => {
            let trackingPixelUrl = client.getTrackingServerUrl({
                orderTotal: 209.00,
                itemsUNiDAYSDiscount: 13.00,
                code: 'a code',
                itemsTax: 34.50,
                shippingGross: 5.00,
                shippingDiscount: 3.00,
                itemsGross: 230.00,
                itemsOtherDiscount: 10.00,
                UNiDAYSDiscountPercentage: 10.00,
                newCustomer: true
            }, key);

            assert.strictEqual(trackingPixelUrl, 'https://api.myunidays.com/tracking/v1.2/redemption?PartnerId=a+partner+Id&TransactionId=the+transaction+id&MemberId=&Currency=GBP&OrderTotal=209.00&ItemsUNiDAYSDiscount=13.00&Code=a+code&ItemsTax=34.50&ShippingGross=5.00&ShippingDiscount=3.00&ItemsGross=230.00&ItemsOtherDiscount=10.00&UNiDAYSDiscountPercentage=10.00&NewCustomer=True&Signature=VsP%2B%2BN2PQ7Jy%2FhH6wjkVcGRLRkqpyBFyZPCLW7u0UYuXiYvBlggi4SgCQ1GPs5mg3JswBYms8qTwRehFpWhhAg%3D%3D&Test=True');
        });
    })
});
