const assert = require('assert'),
    Codeless = require('../index.js').CodelessClient;

const sharedSecret = 'tnFUmqDkq1w9eT65hF9okxL1On+d2BQWUyOFLYE3FTOwHjmnt5Sh/sxMA3/i0od3pV5EBfSAmXo//fjIdAE3cIAatX7ZZqVi0Dr8qEYGtku+ZRVbPSmTcEUTA/gXYo3KyL2JqXaZ/qhUvCMbLWyV07qRiFOjyLdOWhioHlJM5io=',
    studentId = 'Do/faqh330SGgCnn4t3X4g==',
    timestamp = 1395741712,
    hash = 'i38dJdX+XLKuE4F5tv+Knpl5NPtu5zrdsjnqBQliJEJE4NkMmfurVnUaT46WluRYoD1/f5spAqU36YgeTMCNeg==';

describe('Codeless', function () {
    const codeless = new Codeless(sharedSecret);

    describe('#validate', function () {
        it('should validate hash', function () {
            const result = codeless.validate(studentId, timestamp, hash);

            assert.deepStrictEqual(result, new Date(timestamp));
        });

        it('should reject invalid hash', function () {
            const result = codeless.validate(studentId, timestamp, 'garbage');

            assert.strictEqual(result, null);
        });
    });

    describe('#hash', function () {
        it('should hash parameters', function () {
            const result = codeless.hash(studentId, timestamp);

            assert.strictEqual(result, hash);
        })
    })
});