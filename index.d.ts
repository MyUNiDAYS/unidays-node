declare module 'unidays-node' {
  /**
   * RedemptionClient class for handling UNiDAYS redemptions
   */
  export class RedemptionClient {
    /**
     * @param partnerId Your PartnerId as provided by UNiDAYS. The partnerId GUID needs to be Base64 encoded.
     * @param transactionId A unique ID for the transaction in your system
     * @param currency The ISO 4217 currency code
     * @param opts Optional configuration parameters
     */
    constructor(
      partnerId: string,
      transactionId: string,
      currency: string,
      opts?: {
        fetch?: typeof fetch;
        hostname?: string;
        protocol?: string;
        testMode?: boolean;
      }
    );

    /**
     * Get the URL for client-to-server tracking script
     * @param redemption Object containing transaction details
     * @returns URL for the UNiDAYS Tracking API. If successful, a response with a status code of 200 OK will be returned. This will only work for GET requests.
     */
    getTrackingScriptUrl(redemption: RedemptionData): string;

    /**
     * Get the signed URL for client-to-server tracking script
     * @param redemption Object containing transaction details
     * @param key Your signing key as provided by UNiDAYS
     * @returns Signed URL for the UNiDAYS Tracking API. If successful, a response with a status code of 200 OK will be returned. This will only work for GET requests.
     */
    getSignedTrackingScriptUrl(redemption: RedemptionData, key: string): string;

    /**
     * Get the signed URL for server-to-server tracking
     * @param redemption Object containing transaction details
     * @param key Your signing key as provided by UNiDAYS
     * @returns Signed URL for the UNiDAYS Tracking API. If successful, a response with a status code of 204 No Content will be returned. This will work for both POST and GET requests.
     */
    getTrackingServerUrl(redemption: RedemptionData, key: string): string;

    /**
     * Record a redemption by sending a server-to-server request
     * @param redemption Object containing transaction details
     * @param key Your signing key as provided by UNiDAYS
     * @returns Promise resolving to the API response. If successful, a response with a status code of 200 OK will be returned.
     */
    recordRedemption(redemption: RedemptionData, key: string): Promise<Response>;
  }

  /**
   * CodelessClient class for handling UNiDAYS codeless verifications
   */
  export class CodelessClient {
    /**
     * @param key Your signing key as provided by UNiDAYS
     */
    constructor(key: string);

    /**
     * Validate the hash of the incoming request
     * @param studentId UNiDAYS verified student ID (ud_s)
     * @param timestamp Timestamp for the request (ud_t)
     * @param hash Hash signature of the other two parameters (ud_h)
     * @returns Date object if validation is successful, null otherwise
     */
    validate(studentId: string, timestamp: string, hash: string): Date | null;

    /**
     * Generate a hash from studentId and timestamp
     * @param studentId UNiDAYS verified student ID
     * @param timestamp Timestamp for the request
     * @returns Hash signature
     */
    hash(studentId: string, timestamp: string): string;
  }

  /**
   * Interface for redemption data
   */
  interface RedemptionData {
    memberId?: string;
    orderTotal?: number;
    itemsUNiDAYSDiscount?: number;
    code?: string;
    itemsTax?: number;
    shippingGross?: number;
    shippingDiscount?: number;
    itemsGross?: number;
    itemsOtherDiscount?: number;
    UNiDAYSDiscountPercentage?: number;
    newCustomer?: boolean;
  }
}