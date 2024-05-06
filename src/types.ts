/**
 * Locale data in Jed-formatted JSON object shape.
 */
export type LocaleData = Record<string, any>;

/**
 * Callback function for subscription.
 */
export type SubscribeCallback = () => void;

/**
 * Callback function for unsubscription.
 */
export type UnsubscribeCallback = () => void;

/**
 * Subscribes to changes of locale data.
 * @param callback Callback function to subscribe.
 * @returns Unsubscribe callback function.
 */
export type Subscribe = (callback: SubscribeCallback) => UnsubscribeCallback;

/**
 * Retrieves the domain to use when calling domain-specific filters.
 * @param domain Optional domain parameter.
 * @returns Domain string.
 */
export type GetFilterDomain = (domain?: string) => string;
