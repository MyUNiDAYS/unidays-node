# unidays-node



```javascript

"use strict";

const UNiDAYS = require('../lib/index.js'),
      RedemptionClient = UNiDAYS.RedemptionClient;


// Initialise a new UNiDAYS client with the customerId and customerSecret provided to you during the setup process
let client = new RedemptionClient('{YourCustomerId}', '{YourCustomerSecret}');

// To record test redemptions during development pass in { testMode:true } as a 3rd optional argument
// This will not record a live redemption.
let client2 = new RedemptionClient('{YourCustomerId}', '{YourCustomerSecret}', { testMode: true }); 

/* 
	The underlying implementation of recordRedemption uses node-fetch to call the UNiDAYS Tracking API and returns a promise
	confirming the successful recording with a HTTP 200 status, or a 4xx error detailing issues with the request.
	See https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API for more information. 

  recordRedemption accepts one argument, an object of properties describing the redemption the properties should be as follows:
  - transactionId: A unique Id for the transaction in your system, used for debugging purposes.
  - memberId: The UNiDAYS Id for the Member. Used in conjunction with Codeless API integrations (See the v1.1 Tracking API Documentation).
  - code: The UNiDAYS discount code that was used, Only used in code-based integrations (See the v1.1 Tracking API Documentation).
  - currency: The ISO 4217 currency code.
  - orderTotal: Total monetary amount paid, formatted to 2 decimal places.
  - itemsUNiDAYSDiscount: Total monetary amount of UNiDAYS discount applied on gross item value *itemsGross* formatted to 2 decimal places.
  - itemsTax: Total monetary amount of tax applied to items formatted to 2 decimal places
  - shippingGross: Total monetary amount of shipping cost before any shipping discount or shipping tax applied formatted to 2 decimal places.
  - shippingDiscount: Total monetary amount of shipping discount (UNiDAYS or otherwise) applied to the order, formatted to 2 decimal places. 
  - itemsGross: Total monetary amount of the items, including tax before any discounts are applied, formatted to 2 decimal places.
  - itemsOtherDiscount: Total monetary amount of all non UNiDAYS discounts applied to itemsGross, formatted to 2 decimal places.
  - UNiDAYSDiscountPercentage: The UNiDAYS discount applied, as a percentage formatted to 2 decimal places. 
  - newCustomer: Is the user a new (vs returning) customer to you? (true or false)

  Note any properties to which the value is unknown should be ommitted.
*/
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
	console.log(res.status);
	if (!res.ok) {
		let error = new Error(res.statusText);
		error.result = res;
		throw error;
	}
	console.log('Redemption recorded successfully');
}).catch(err => {
	// the response will detail errors with the request. 
	console.log('An error occurred recording redemption');
	if (err.result)
		err.result.json().then(json => console.log(json));
});


// getJsTrackingUrl generates a script url to inject into a <script src="{jsTrackingUrl}"> tag on your receipt/post-payment page
let jsTrackingScriptUrl = client.getJsTrackingUrl({
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

// getTrackingPixelUrl generates an image url which should be placed inside an <img> element on your receipt/post-payment page.
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