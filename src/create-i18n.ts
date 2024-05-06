/**
 * External dependencies
 */
import Tannin, { TanninDomainMetadata, type TanninLocaleDomain } from "tannin";
import type {
	LocaleData,
	Subscribe,
	SubscribeCallback,
	UnsubscribeCallback,
} from "./types.js";

/**
 * Wordpress dependencies
 */
import { type Hooks, defaultHooks } from "@wordpress/hooks";

/**
 * Default locale data to use for Tannin domain when not otherwise provided.
 * Assumes an English plural forms expression.
 *
 * @type {LocaleData}
 */
const DEFAULT_LOCALE_DATA: TanninLocaleDomain = {
	"": {
		plural_forms(n: number) {
			return n === 1 ? 0 : 1;
		},
	},
};

/*
 * Regular expression that matches i18n hooks like `i18n.gettext`, `i18n.ngettext`,
 * `i18n.gettext_domain` or `i18n.ngettext_with_context` or `i18n.has_translation`.
 */
const I18N_HOOK_REGEXP = /^i18n\.(n?gettext|has_translation)(_|$)/;

/**
 * Create an i18n instance
 *
 * @param [initialData]   Locale data configuration.
 * @param [initialDomain] Domain for which configuration applies.
 * @param [hooks]         Hooks implementation.
 */
const createI18n = (
	initialData?: LocaleData,
	initialDomain?: string,
	hooks: Hooks = defaultHooks,
) => {
	/**
	 * The underlying instance of Tannin to which exported functions interface.
	 */
	const tannin: Tannin = new Tannin({});

	/**
	 * The set of listeners to notify when locale data changes.
	 */
	const listeners: Set<() => void> = new Set();

	/**
	 * Triggers listeners to notify them that locale data has changed.
	 */
	const notifyListeners = () => {
		for (const listener of listeners) {
			listener();
		}
	};

	/**
	 * Subscribe to changes of locale data.
	 *
	 * @param {SubscribeCallback} callback Subscription callback.
	 * @return {UnsubscribeCallback} Unsubscribe callback.
	 */
	const subscribe: Subscribe = (
		callback: SubscribeCallback,
	): UnsubscribeCallback => {
		listeners.add(callback);
		return () => listeners.delete(callback);
	};

	/**
	 * Returns locale data by domain in a Jed-formatted JSON object shape.
	 * @param domain Optional domain parameter.
	 * @returns Locale data.
	 */
	const getLocaleData = (domain = "default"): LocaleData => tannin.data[domain];

	/**
	 * Merges locale data into the Tannin instance by domain.
	 * @param data Optional locale data parameter.
	 * @param domain Optional domain parameter.
	 */
	const doSetLocaleData = (data?: LocaleData, domain = "default") => {
		tannin.data[domain] = {
			...tannin.data[domain],
			...data,
		};

		// Populate default domain configuration (supported locale date which omits
		// a plural forms expression).
		tannin.data[domain][""] = {
			...DEFAULT_LOCALE_DATA[""],
			...tannin.data[domain]?.[""],
		};

		// Clean up cached plural forms functions cache as it might be updated.
		delete tannin.pluralForms[domain];
	};

	/**
	 * Merges locale data into the Tannin instance by domain.
	 * @param data Optional locale data parameter.
	 * @param domain Optional domain parameter.
	 */
	const setLocaleData = (data?: LocaleData, domain?: string) => {
		doSetLocaleData(data, domain);
		notifyListeners();
	};

	/**
	 * Merges locale data into the Tannin instance by domain.
	 * @param data Optional locale data parameter.
	 * @param domain Optional domain parameter.
	 */
	const addLocaleData = (
		data: LocaleData,
		domain: string | undefined = "default",
	) => {
		tannin.data[domain] = {
			...tannin.data[domain],
			...data,
			// Populate default domain configuration (supported locale date which omits
			// a plural forms expression).
			"": {
				...DEFAULT_LOCALE_DATA[""],
				...tannin.data[domain]?.[""],
				...data?.[""],
			},
		};

		// Clean up cached plural forms functions cache as it might be updated.
		delete tannin.pluralForms[domain];

		notifyListeners();
	};

	/**
	 * Resets all current Tannin instance locale data and sets the specified locale data for the domain.
	 * @param data Optional locale data parameter.
	 * @param domain Optional domain parameter.
	 */
	const resetLocaleData = (data?: LocaleData, domain?: string) => {
		// Reset all current Tannin locale data.
		tannin.data = {};

		// Reset cached plural forms functions cache.
		tannin.pluralForms = {};

		setLocaleData(data, domain);
	};

	/**
	 * Wrapper for Tannin's `dcnpgettext`. Populates default locale data if not
	 * otherwise previously assigned.
	 *
	 * @param domain   Domain to retrieve the translated text.
	 * @param context  Context information for the translators.
	 * @param            single   Text to translate if non-plural. Used as
	 *                                    fallback return value on a caught error.
	 * @param            [plural] The text to be used if the number is
	 *                                    plural.
	 * @param            [number] The number to compare against to use
	 *                                    either the singular or plural form.
	 *
	 * @return  The translated string.
	 */
	const dcnpgettext = (
		domain = "default",
		context?: string,
		single = "",
		plural?: string,
		number?: number,
	): string => {
		if (!tannin.data[domain]) {
			// Use `doSetLocaleData` to set silently, without notifying listeners.
			doSetLocaleData(undefined, domain);
		}

		return tannin.dcnpgettext(domain, context, single, plural, number);
	};

	/**
	 * Retrieve the domain to use when calling domain-specific filters.
	 * @param {GetFilterDomain} [domain] Optional domain parameter.
	 * @returns {string}
	 */
	const getFilterDomain = (domain = "default"): string => domain;

	/**
	 * Retrieve the translation of text.
	 * @param text Text to be translated.
	 * @param domain Optional domain parameter.
	 * @returns Translated text.
	 */
	const __ = (text: string, domain?: string): string => {
		let translation = dcnpgettext(domain, undefined, text);
		if (!hooks) {
			return translation;
		}

		/**
		 * Filters text with its translation.
		 *
		 * @param {string} translation Translated text.
		 * @param {string} text        Text to translate.
		 * @param {string} domain      Text domain. Unique identifier for retrieving translated strings.
		 */
		translation = hooks.applyFilters(
			"i18n.gettext",
			translation,
			text,
			domain,
		) as string;

		return hooks.applyFilters(
			"i18n.gettext_" + getFilterDomain(domain),
			translation,
			text,
			domain,
		) as string;
	};

	/**
	 * Retrieve translated string with gettext context.
	 * @param text Singular string to be translated.
	 * @param context Context for translation.
	 * @param domain Optional domain parameter.
	 * @returns Translated text.
	 */
	const _x = (text: string, context: string, domain = "default"): string => {
		let translation = dcnpgettext(domain, context, text);
		if (!hooks) {
			return translation;
		}

		/**
		 * Filters text with its translation based on context information.
		 *
		 * @param translation Translated text.
		 * @param text        Text to translate.
		 * @param context     Context information for the translators.
		 * @param domain      Text domain. Unique identifier for retrieving translated strings.
		 */
		translation = hooks.applyFilters(
			"i18n.gettext_with_context",
			translation,
			text,
			context,
			domain,
		) as string;
		return hooks.applyFilters(
			"i18n.gettext_with_context_" + getFilterDomain(domain),
			translation,
			text,
			context,
			domain,
		) as string;
	};

	/**
	 * Translates and retrieves the singular or plural form based on the supplied number.
	 * @param single Singular string.
	 * @param plural Plural string.
	 * @param number Number to determine plural form.
	 * @param domain Optional domain parameter.
	 * @returns Translated string.
	 */
	const _n = (
		single: string,
		plural: string,
		number: number,
		domain?: string,
	): string => {
		let translation = dcnpgettext(domain, undefined, single, plural, number);
		if (!hooks) {
			return translation;
		}

		/**
		 * Filters the singular or plural form of a string.
		 *
		 * @param {string} translation Translated text.
		 * @param {string} single      The text to be used if the number is singular.
		 * @param {string} plural      The text to be used if the number is plural.
		 * @param {string} number      The number to compare against to use either the singular or plural form.
		 * @param {string} domain      Text domain. Unique identifier for retrieving translated strings.
		 */
		translation = hooks.applyFilters(
			"i18n.ngettext",
			translation,
			single,
			plural,
			number,
			domain,
		) as string;
		return hooks.applyFilters(
			`i18n.ngettext_${getFilterDomain(domain)}`,
			translation,
			single,
			plural,
			number,
			domain,
		) as string;
	};

	/**
	 * Translates and retrieves the singular or plural form based on the supplied number, with gettext context.
	 * @param single Singular string.
	 * @param plural Plural string.
	 * @param number Number to determine plural form.
	 * @param context Context for translation.
	 * @param domain Optional domain parameter.
	 * @returns Translated string.
	 */
	const _nx = (
		single: string,
		plural: string,
		number: number,
		context: string,
		domain?: string,
	): string => {
		let translation = dcnpgettext(domain, context, single, plural, number);
		if (!hooks) {
			return translation;
		}

		/**
		 * Filters the singular or plural form of a string with gettext context.
		 *
		 * @param {string} translation Translated text.
		 * @param {string} single      The text to be used if the number is singular.
		 * @param {string} plural      The text to be used if the number is plural.
		 * @param {string} number      The number to compare against to use either the singular or plural form.
		 * @param {string} context     Context information for the translators.
		 * @param {string} domain      Text domain. Unique identifier for retrieving translated strings.
		 */
		translation = hooks.applyFilters(
			"i18n.ngettext_with_context",
			translation,
			single,
			plural,
			number,
			context,
			domain,
		) as string;

		return hooks.applyFilters(
			"i18n.ngettext_with_context_" + getFilterDomain(domain),
			translation,
			single,
			plural,
			number,
			context,
			domain,
		) as string;
	};

	/**
	 * Check if the current locale is RTL.
	 * @returns Boolean indicating whether the current locale is RTL.
	 */
	const isRTL = (): boolean => {
		return "rtl" === _x("ltr", "text direction");
	};

	/**
	 * Check if there is a translation for a given string in singular form.
	 * @param single Singular string to check translation for.
	 * @param context Context for translation.
	 * @param domain Optional domain parameter.
	 * @returns Boolean indicating whether translation exists.
	 */
	const hasTranslation = (
		single: string,
		context?: string,
		domain?: string,
	) => {
		const key = context ? `${context}\u0004${single}` : single;
		let result = !!tannin.data?.[domain ?? "default"]?.[key];
		if (hooks) {
			/**
			 * Filters the presence of a translation in the locale data.
			 *
			 * @param {boolean} hasTranslation Whether the translation is present or not..
			 * @param {string}  single         The singular form of the translated text (used as key in locale data)
			 * @param {string}  context        Context information for the translators.
			 * @param {string}  domain         Text domain. Unique identifier for retrieving translated strings.
			 */
			result = hooks.applyFilters(
				"i18n.has_translation",
				result,
				single,
				context,
				domain,
			) as boolean;

			result = hooks.applyFilters(
				`i18n.has_translation_${getFilterDomain(domain)}`,
				result,
				single,
				context,
				domain,
			) as boolean;
		}
		return result;
	};

	if (initialData) {
		setLocaleData(initialData, initialDomain);
	}

	if (hooks) {
		/**
		 * Notifies listeners that locale data has changed.
		 *
		 * @param {string} hookName
		 */
		const onHookAddedOrRemoved = (hookName: string) => {
			if (I18N_HOOK_REGEXP.test(hookName)) {
				notifyListeners();
			}
		};

		hooks.addAction("hookAdded", "core/i18n", onHookAddedOrRemoved);
		hooks.addAction("hookRemoved", "core/i18n", onHookAddedOrRemoved);
	}

	return {
		getLocaleData,
		setLocaleData,
		addLocaleData,
		resetLocaleData,
		subscribe,
		__,
		_x,
		_n,
		_nx,
		isRTL,
		hasTranslation,
	};
};

export default createI18n;
