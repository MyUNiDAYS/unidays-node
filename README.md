# UNiDAYS Node Tracking Helper

[![npm](https://img.shields.io/npm/dt/express.svg)](https://www.npmjs.com/package/unidays.tracking)

This is the NodeJs library for UNiDAYS redemption tracking. This is to be used for coded and codeless integrations. The following documentation provides descriptions of the implementation, examples for getting a server request url, signed and unsigned pixel urls and sending a request through this SDK.

## Parameters

Here is a description of all the available parameters. Which of these you provide to us are dependant on the agreed contract.

Mandatory parameters are:

* `PartnerId`
* `TransactionId`
* `Currency`
* `Code` or `MemberId`

Note any of the following properties to which the value is unknown should be omitted from calls.

| Parameter | Description | Data Type | Example |
|---|---|---|---|
| TransactionId | A unique ID for the transaction in your system | String | Order123 |
| MemberId | Only to be provided if you are using a codeless integration | String | 0LTio6iVNaKj861RM9azJQ== |
| Currency | The ISO 4217 currency code | String | GBP |
| OrderTotal | Total monetary amount paid, formatted to 2 decimal places | Decimal | 209.00 |
| ItemsUNiDAYSDiscount | Total monetary amount of UNiDAYS discount applied on gross item value `ItemsGross`, formatted to 2 decimal places | Decimal | 13.00 |
| Code | The UNiDAYS discount code used | String | ABC123 |
| ItemsTax | Total monetary amount of tax applied to items, formatted to 2 decimal places | Decimal | 34.50
| ShippingGross | Total monetary amount of shipping cost, before any shipping discount or tax applied, formatted to 2 decimal places | Decimal | 5.00 |
| ShippingDiscount | Total monetary amount of shipping discount (UNiDAYS or otherwise) applied to the order, formatted to 2 decimal places | Decimal | 3.00 |
| ItemsGross | Total monetary amount of the items, including tax, before any discounts are applied, formatted to 2 decimal places | Decimal | 230.00 |
| ItemsOtherDiscount | Total monetary amount of all non UNiDAYS discounts applied to `ItemsGross`, formatted to 2 decimal places | Decimal | 10.00 |
| UNiDAYSDiscountPercentage | The UNiDAYS discount applied, as a percentage, formatted to 2 decimal places | Decimal | 10.00 |
| NewCustomer | Is the user a new (vs returning) customer to you? | Boolean | true or false |

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

Below are examples of implementing the server to server and client to server integrations. These examples cover both coded and codeless integrations and include all optional parameters. They are intended as a guideline for implementation.

### Get Server Request URL

All server requests are signed, but we deal with that so you don't have to.

`getTrackingServerUrl` generates a script url to inject into a: 
```html 
<script src="{jsTrackingUrl}"> tag on your receipt/post-payment page
```

#### Example
```javascript

"use strict";

const UNiDAYS = require('../lib/index.js'),
      RedemptionClient = UNiDAYS.RedemptionClient;

// Initialise a new UNiDAYS client with the partnerId and customerSecret provided to you during the setup process
let client = new RedemptionClient('{YourPartnerId}', '{YourCustomerSecret}');

let trackingServerUrl = client.getTrackingServerUrl({
	transactionId: 'transactionId-' + Date.now(),
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
```

### Send Request

The underlying implementation of `recordRedemption` uses node-fetch to call the UNiDAYS Tracking API and returns a promise confirming the successful recording with a HTTP 200 status, or a 4xx error detailing issues with the request. See https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API for more information. 

#### Example
```javascript

"use strict";

const UNiDAYS = require('../lib/index.js'),
      RedemptionClient = UNiDAYS.RedemptionClient;

let client = new RedemptionClient('{YourPartnerId}', '{YourCustomerSecret}');

client.recordRedemption({
	transactionId: 'transactionId-' + Date.now(),
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
}).then(res => {
	if (!res.ok) {
		let error = new Error(res.statusText);
		error.result = res;
		throw error;
	}
}).catch(err => {
	// the response will detail errors with the request. 
	if (err.result)
		err.result.json().then(json => console.log(json));
});

```

### Client To Server

#### Example 
Calls to get a Pixels URL can be signed or unsigned. This is the difference between calling `getSignedTrackingPixelUrl` or `getTrackingPixelUrl`. The arguments for both of these calls are the same.

```javascript

"use strict";

const UNiDAYS = require('../lib/index.js'),
      RedemptionClient = UNiDAYS.RedemptionClient;

let client = new RedemptionClient('{YourCustomerId}', '{YourCustomerSecret}');

let trackingPixelUrl = client.getTrackingPixelUrl({
	transactionId: 'transactionId-' + Date.now(),
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
});
```

### Test endpoint

To record test redemptions during development pass in { testMode:true } as a 3rd optional argument. The rest of the code example should remain the same. This will not record a live redemption.

#### Example
```javascript

let client = new RedemptionClient('{YourPartnerId}', '{YourCustomerSecret}', { testMode: true }); 

```

### CodelessClient

#### Example
```javascript

"use strict";

const UNiDAYS = require('../lib/index.js'),
      RedemptionClient = UNiDAYS.RedemptionClient;


// Initialise a new UNiDAYS client with the customerSecret provided to you during the setup process
let client = new Codeless('{YourCustomerSecret}');

// Get a hash from studentId & timestamp
client.hash(studentId, timestamp)

//Validate hash
validHash = client.validate(studentId, timestamp, hash)

```