import type { TanninDomainMetadata } from "tannin";

/**
 * Generic Translations in Jed-formatted JSON object shape.
 */
export type LocaleData = Record<string, unknown>;
/**
 * a Jed-formatted JSON header shape.
 */
export type HeaderData = Record<
	string,
	TanninDomainMetadata | [string, string]
>;
/**
 * a Jed-formatted JSON translation shape.
 */
export type LocaleRow = Record<
	string,
	string[] | Record<string, string | string[]>
>;

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
