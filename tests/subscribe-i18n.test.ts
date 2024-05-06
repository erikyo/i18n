/**
 * Internal dependencies
 */
import createI18n from "../src/create-i18n";

/**
 * WordPress dependencies
 */
import { createHooks } from "@wordpress/hooks";
import { describe, expect, it } from "vitest";

describe("i18n updates", () => {
	it("updates on setLocaleData", () => {
		const hooks = createHooks();
		const i18n = new createI18n(undefined, undefined, hooks);

		const doneTranslations: unknown[] = [];

		function doTranslation() {
			doneTranslations.push(i18n.__("original"));
		}

		i18n.subscribe(doTranslation);

		// Do translation on empty instance with no translation data.
		doTranslation();

		// Set translation data.
		i18n.setLocaleData({
			original: ["translated"],
		});

		// Add a filter and then remove it.
		const filter = (text: string) => `[${text}]`;
		hooks.addFilter("i18n.gettext", "test", filter);
		// @ts-ignore
		hooks.removeFilter("i18n.gettext", "test", filter);

		expect(doneTranslations).toEqual([
			"original", // No translations before setLocaleData.
			"translated", // After setLocaleData.
			"[translated]", // After addFilter.
			"translated", // After removeFilter.
		]);
	});
});
