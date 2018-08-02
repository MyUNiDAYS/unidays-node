<p align="center">
  <img src="/assets/UNIDAYS_Logo.png" />
</p>
<br/>

[![Build status](https://ci.appveyor.com/api/projects/status/xjfdbra2ea85qd27/branch/master?svg=true)](https://ci.appveyor.com/project/UNiDAYS/unidays-node/branch/master)
[![npm version](https://badge.fury.io/js/unidays-node.svg)](https://badge.fury.io/js/unidays-javascript)

# UNiDAYS NodeJS Library

This is the NodeJS library for integrating with UNiDAYS. This is to be used for coded and codeless integrations. The following documentation provides descriptions of the implementations and examples.

## Contents

[**How to use this code?**](#how-to-use-this-code)

[**Direct Tracking**](#direct-tracking)
- [Parameters](#parameters)
    - [Example Basket](#example-basket)
- [Example Usage](#example-usage)
    - [Get Tracking Script URL _(returns url for client-to-server request)_](#get-tracking-script-url)
    - [Get Signed Tracking Script URL _(returns a signed url for client-to-server request)_](#get-signed-tracking-script-url)
    - [Get Tracking Server URL _(returns url for server-to-server request)_](#get-tracking-server-url)
    - [Record Redemption _(builds and sends server-to-server request)_](#record-redemption)
    - [Test Endpoint](#test-endpoint)

[**Codeless Verification**](#codeless-verification)
- [Codeless API](#codeless-api)
    - [Validate](#validate)

[**Contributing**](#contributing)

## How to use this code

- Pull the package from [npm]().
- See the example usage section for the type of call you intend to use. Each of these contains an example.

## Direct Tracking

### Parameters

Here is a description of all the available parameters. Which of these you provide to us are dependant on the agreed contract.

### Mandatory Parameters

| Parameter | Description | Data Type | Example |
|---|---|---|---|
| partnerId | Your PartnerId as provided by UNiDAYS. If you operate in multiple geographic regions you MAY have a different PartnerId for each region | String | XaxptFh0sK8Co6pI== |
| transactionId | A unique ID for the transaction in your system | String | Order123 |
| currency | The ISO 4217 currency code | String | GBP |

Having **either** Code or MemberID as a parameter is also mandatory:

| Parameter | Description | Data Type | Example |
|---|---|---|---|
| code | The UNiDAYS discount code used | String | ABC123 |
| memberId | Only to be provided if you are using a codeless integration | String | 0LTio6iVNaKj861RM9azJQ== |

### Optional Parameters

Note any of the following properties to which the value is unknown should be omitted from calls. Which of the following values you provide to us will depend on your agreed contract.

| Parameter | Description | Data Type | Example |
|---|---|---|---|
| orderTotal | Total monetary amount paid, formatted to 2 decimal places | Decimal | 209.00 |
| itemsUNiDAYSDiscount | Total monetary amount of UNiDAYS discount applied on gross item value `itemsGross`, formatted to 2 decimal places | Decimal | 13.00 |
| itemsTax | Total monetary amount of tax applied to items, formatted to 2 decimal places | Decimal | 34.50
| shippingGross | Total monetary amount of shipping cost, before any shipping discount or tax applied, formatted to 2 decimal places | Decimal | 5.00 |
| shippingDiscount | Total monetary amount of shipping discount (UNiDAYS or otherwise) applied to the order, formatted to 2 decimal places | Decimal | 3.00 |
| itemsGross | Total monetary amount of the items, including tax, before any discounts are applied, formatted to 2 decimal places | Decimal | 230.00 |
| itemsOtherDiscount | Total monetary amount of all non UNiDAYS discounts applied to `itemsGross`, formatted to 2 decimal places | Decimal | 10.00 |
| UNiDAYSDiscountPercentage | The UNiDAYS discount applied, as a percentage, formatted to 2 decimal places | Decimal | 10.00 |
| newCustomer | Is the user a new (vs returning) customer to you? | Boolean | true or false |

### Example Basket

Here is an example basket with the fields relating to UNiDAYS tracking parameters,

| Item | Gross | UNiDAYS Discount | Other Discount | Tax | Net Total | Line Total |
|---|---|---|---|---|---|---|
| Shoes | 100.00 | 0.00 | 0.00 | 16.67 | 83.33 | 100.00 |
| Shirt | 50.00 | 5.00 | 0.00 | 7.50 | 37.50 | 45.00 |
| Jeans | 80.00 | 8.00 | 10.00 | 10.33 | 51.67 | 62.00 |
||||||||
| **Totals** | 230.00 | 13.00 | 10.00 | 34.50 | 172.50 | 207.00 |
||||||||
|||||| Shipping | 5.00 |
|||||| Shipping Discount | 3.00 |
||||||||
|||||| **Order Total** | 209.00 |

## Example Usage

Below are the four options for implementing your integration. These examples cover both coded and codeless integrations (see the live analytics PDF for details) and include all optional parameters. They are intended as a guideline for implementation.

- [Get Tracking Script URL _(returns url for client-to-server request)_](#get-tracking-script-url)
- [Get Signed Tracking Script URL _(returns a signed url for client-to-server request)_](#get-signed-tracking-script-url)
- [Get Tracking Server URL _(returns url for server-to-server request)_](#get-tracking-server-url)
- [Record Redemption _(builds and sends server-to-server request)_](#record-redemption)
- [Test Endpoint](#test-endpoint)

### Get Tracking Script URL

This is known as our client-to-server integration.

#### Making the call

The method to get the URL to make a client-to-server request with is `getTrackingScriptUrl()`. To implement this method you first need to ensure that you have access to all required transaction details.

Once you have access to this transaction information, create a RedemptionClient object, providing the mandatory parameters as arguments (`RedemptionClient(partnerId, currency, transactionId)`) and call `.getTrackingScriptUrl(redemption)` where the `redemption` is an object containing the transaction details you are required to send to the UNiDAYS Tracking API.

#### Return

A URL will be returned to you, which can then be used to call the UNiDAYS Tracking API.

#### Example

```javascript

"use strict";

const UNiDAYS = require('../lib/index.js'),
      RedemptionClient = UNiDAYS.RedemptionClient;

// UNiDAYS will provide your partnerId.
var partnerId = '0LTio6iVNaKj861RM9azJQ==';

// These must be based on the real values of the transaction
var transactionId = 'Order123',
    currency = 'GBP';

// Create a reference to the RedemptionClient object, passing in your partnerId, transactionId and currency.
var client = new RedemptionClient(partnerId, transactionId, currency);

// Create an object containing the remaining corresponding transaction details
var redemption = {
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

// Pass this object into the getTrackingScriptUrl method.
var trackingServerUrl = client.getTrackingScriptUrl(redemption);

// You now have a URL which can be used in script element to call the API.
```

### Get Signed Tracking Script URL

This is known as our signed client-to-server integration.

#### Making the call

The method to get the signed URL to make a client-to-server request with is `getSignedTrackingScriptUrl()`. To implement this method you first need to ensure that you have access to all required transaction details.

Once you have access to this transaction information, create a RedemptionClient object, providing the mandatory parameters as arguments (`RedemptionClient(partnerId, currency, transactionId)`) and call `.getSignedTrackingScriptUrl(redemption, key)` where the `redemption` is an object containing the transaction details you are required to send to the UNiDAYS Tracking API, and the `key` is your signing key as provided by UNiDAYS.

#### Return

A signed URL will be returned to you, which can then be used to call the UNiDAYS Tracking API.

#### Example

```javascript

"use strict";

const UNiDAYS = require('../lib/index.js'),
      RedemptionClient = UNiDAYS.RedemptionClient;

// UNiDAYS will provide your partnerId and signingKey.
var partnerId = '0LTio6iVNaKj861RM9azJQ==',
    signingKey = '+ON3JGqQtsoagk0Sgdd6gDkz/MHr95T+LeYmPzSkBB9Y/LMPNFiXRYc90I73DLUJDXTDDjNQ8DbYXYTkH4SNnuer43v4LmhPHhB5k/9vy5Pmtt2CnNAiylYIQK/Jm0xYhRsGUVmT9GzVx1CyeaxzfPkGsdszlcfy1HuaxGv/yjA=';

// These must be based on the real values of the transaction
var transactionId = 'Order123',
    currency = 'GBP';

// Create a reference to the RedemptionClient object, passing in your partnerId, transactionId and currency.
var client = new RedemptionClient(partnerId, transactionId, currency);

// Create an object containing the remaining corresponding transaction details
var redemption = {
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

// Pass this object into the getSignedTrackingScriptUrl method, along with your signing key.
var trackingServerUrl = client.getSignedTrackingScriptUrl(redemption, signingKey);

// You now have a signed URL which can be used in a script element to call the API.
```

### Get Tracking Server URL

This is known as our server-to-server integration.
Note: Request signing for server-to-server integrations is mandatory.

#### Making the call

The method to get the signed URL to make a server-to-server request with is `getTrackingServerUrl()`. To implement this method you first need to ensure that you have access to all required transaction details.

Once you have access to this transaction information, create a RedemptionClient object, providing the mandatory parameters as arguments (`RedemptionClient(partnerId, currency, transactionId)`) and call `.getTrackingServerUrl(redemption, key)` where the `redemption` is an object containing the transaction details you are required to send to the UNiDAYS Tracking API, and the `key` is your signing key as provided by UNiDAYS.

#### Return

A signed URL will be returned to you, which can then be used to call the UNiDAYS Tracking API.

#### Example

```javascript

"use strict";

const UNiDAYS = require('../lib/index.js'),
      RedemptionClient = UNiDAYS.RedemptionClient;

// UNiDAYS will provide your partnerId and signingKey.
var partnerId = '0LTio6iVNaKj861RM9azJQ==',
    signingKey = '+ON3JGqQtsoagk0Sgdd6gDkz/MHr95T+LeYmPzSkBB9Y/LMPNFiXRYc90I73DLUJDXTDDjNQ8DbYXYTkH4SNnuer43v4LmhPHhB5k/9vy5Pmtt2CnNAiylYIQK/Jm0xYhRsGUVmT9GzVx1CyeaxzfPkGsdszlcfy1HuaxGv/yjA=';

// These must be based on the real values of the transaction
var transactionId = 'Order123',
    currency = 'GBP';

// Create a reference to the RedemptionClient object, passing in your partnerId, transactionId and currency.
var client = new RedemptionClient(partnerId, transactionId, currency);

// Create an object containing the remaining corresponding transaction details
var redemption = {
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

// Pass this object into the getTrackingServerUrl method, along with your signing key.
var trackingServerUrl = client.getTrackingServerUrl(redemption, signingKey);

// You now have a signed URL which can be used to call the API directly.
```

### Record Redemption

The underlying implementation of `recordRedemption` uses node-fetch to call the UNiDAYS Tracking API and returns a promise confirming the successful recording with a HTTP 200 status, or a 4xx error detailing issues with the request. See https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API for more information.

#### Example

```javascript

"use strict";

const UNiDAYS = require('../lib/index.js'),
      RedemptionClient = UNiDAYS.RedemptionClient;

// UNiDAYS will provide your partnerId and signingKey.
var partnerId = '0LTio6iVNaKj861RM9azJQ==',
    signingKey = '+ON3JGqQtsoagk0Sgdd6gDkz/MHr95T+LeYmPzSkBB9Y/LMPNFiXRYc90I73DLUJDXTDDjNQ8DbYXYTkH4SNnuer43v4LmhPHhB5k/9vy5Pmtt2CnNAiylYIQK/Jm0xYhRsGUVmT9GzVx1CyeaxzfPkGsdszlcfy1HuaxGv/yjA=';

// These must be based on the real values of the transaction
var transactionId = 'Order123',
    currency = 'GBP';

// Create a reference to the RedemptionClient object, passing in your partnerId, transactionId and currency.
var client = new RedemptionClient(partnerId, transactionId, currency);

// Create an object containing the remaining corresponding transaction details
var redemption = {
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

// Pass this object into the recordRedemption method, along with your signing key.
client.recordRedemption(redemption, signingKey)
      .then(res => {
          if (!res.ok) {
              let error = new Error(res.statusText);
              error.result = res;
              throw error;
          }
      }).catch(err => {
          // The response will detail errors with the request.
          if (err.result)
              err.result.json().then(json => console.log(json));
      });

// The method has built the request and performed a request to our API directly.
```

### Test endpoint

To record test redemptions during development, pass in `{ testMode:true }` as a 3rd optional argument. The rest of the code example should remain the same. This will not record a live redemption.

#### Example

```javascript
var client = new RedemptionClient(partnerId, transactionId, currency, { testMode: true });
```

## Codeless Verification

### Codeless API

If you have agreed to provide UNiDAYS Members with a codeless experience, alongside direct tracking, you will also need to implement the 'Codeless API' which will assist you with parsing and validating the signed traffic we direct towards your site.

#### Making the call

First call the CodelessClient with the key provided to you by UNiDAYS (`new CodelessClient(key)`). Then call the `validate(ud_s, ud_t, ud_h)` method with the values for ud_s, ud_t and ud_h as the arguments.

| Parameter | Description | Data Type | Max Length | Example |
|---|---|---|---|---|
| ud_s | UNiDAYS verified student ID | String | 256 chars | Do/faqh330SGgCnn4t3X4g== |
| ud_t | Timestamp for the request | String | 64 bits | 1375349460 |
| ud_h | Hash signature of the other two parameters | Base64 String | GBP | o9Cg3q2eVElZxYlJsEAQ== |

#### Return

If the method successfully validates the hash of the incoming request, a DateTime for the request will be returned; else null will be returned.

#### Example

```javascript

"use strict";

const UNiDAYS = require('../lib/index.js'),
      CodelessClient = UNiDAYS.CodelessClient;

// UNiDAYS will provide your key.
var key = '+ON3JGqQtsoagk0Sgdd6gDkz/MHr95T+LeYmPzSkBB9Y/LMPNFiXRYc90I73DLUJDXTDDjNQ8DbYXYTkH4SNnuer43v4LmhPHhB5k/9vy5Pmtt2CnNAiylYIQK/Jm0xYhRsGUVmT9GzVx1CyeaxzfPkGsdszlcfy1HuaxGv/yjA=';

// Initialise a new UNiDAYS Codeless Client with the provided signing key.
var client = new CodelessClient(key);

// Get a hash from studentId (ud_s) & timestamp (ud_t)
var hash = client.hash(ud_s, ud_t)

//Validate hash
var validHash = client.validate(ud_s, ud_t, hash)

// validate will return the dateTime of the request if it is valid, else null.
```

## Contributing

This project is set up as an open source project. As such, if there any any suggestions you have for features, for improving the code itself or come across any problems, you can raise them and / or suggest changes in implementation.

If you are interested in contributing to this codebase, please follow the [contributing guidelines](./.github/contributing.md). This contains guides on both contributing directly and raising feature requests or bug reports. Please adhere to our [code of conduct](./CODE_OF_CONDUCT.md) when doing any of the above.
