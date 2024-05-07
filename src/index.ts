/**
 * Internal dependencies
 */
import createI18n from "./i18n.js";

const I18n = new createI18n();

/**
 * Expose the public API functions
 */
export const __ = I18n.__;
export const _x = I18n._x;
export const _n = I18n._n;
export const _nx = I18n._nx;

export default I18n;

export { sprintf } from "./sprintf.js";
