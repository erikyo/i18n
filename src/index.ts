/**
 * Internal dependencies
 */
import createI18n from "./create-i18n.js";
import type { Subscribe } from "./types.js";

export { sprintf } from "./sprintf.js";

/**
 * WordPress dependencies
 */
const I18n = new createI18n();
export const getLocaleData = I18n.getLocaleData;
export const setLocaleData = I18n.setLocaleData;
export const addLocaleData = I18n.addLocaleData;
export const resetLocaleData = I18n.resetLocaleData;
export const subscribe: Subscribe = I18n.subscribe;
export const __ = I18n.__;
export const _x = I18n._x;
export const _n = I18n._n;
export const _nx = I18n._nx;
export const isRTL = I18n.isRTL;
export const hasTranslation = I18n.hasTranslation;

export default I18n;
