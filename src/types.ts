import {TanninDomainMetadata} from "tannin";

/**
 * Translations in Jed-formatted JSON object shape.
 */
export type LocaleData = Record<string, unknown>;

export type HeaderData = Record<string, TanninDomainMetadata | [string, string] >
export type LocaleRow = Record<string, string[] | Record<string, string|string[]>>
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
