import {defaultHooks, type Hooks} from "@wordpress/hooks";
/**
 * External dependencies
 */
import Tannin, {TanninDomainMetadata} from "tannin";
import {DEFAULT_LOCALE_DATA, I18N_HOOK_REGEXP} from "./create-i18n.js";
import {HeaderData, LocaleData, LocaleRow, Subscribe, SubscribeCallback, UnsubscribeCallback} from "./types.js";

/**
 * Create an i18n instance
 * @constructor
 *
 * @param [initialData]   Locale data configuration.
 * @param [initialDomain] Domain for which configuration applies.
 * @param [hooks]         Hooks implementation.
 */
class I18n {
    /**
     * The underlying instance of Tannin to which exported functions interface.
     */
    tannin: Tannin = new Tannin({});

    /**
     * The set of listeners to notify when locale data changes.
     */
    listeners: Set<() => void> = new Set();

    hooks: Hooks = defaultHooks;

    /**
     * The I18n instance constructor.
     *
     * @param initialData - i18n Translation initial dataset
     * @param initialDomain - i18n Translation initial domain (defaults to 'default')
     * @param hooks - i18n Translation hooks
     */
    constructor(
        initialData?: LocaleData,
        initialDomain?: string,
        hooks: Hooks = defaultHooks,
    ) {
        if (initialData) {
            this.setLocaleData(initialData, initialDomain);
        }

        this.hooks = hooks;

        if (this.hooks) {
            /**
             * Notifies listeners that locale data has changed.
             *
             * @param {string} hookName
             */
            const onHookAddedOrRemoved = (hookName: string) => {
                if (I18N_HOOK_REGEXP.test(hookName)) {
                    this.notifyListeners();
                }
            };

            hooks.addAction("hookAdded", "core/i18n", onHookAddedOrRemoved);
            hooks.addAction("hookRemoved", "core/i18n", onHookAddedOrRemoved);
        }
    }

    /**
     * Triggers listeners to notify them that locale data has changed.
     */
    notifyListeners = () => {
        for (const listener of this.listeners) {
            listener();
        }
    };

    /**
     * Subscribe to changes of locale data.
     *
     * @param {SubscribeCallback} callback Subscription callback.
     * @return {UnsubscribeCallback} Unsubscribe callback.
     */
    subscribe: Subscribe = (callback: SubscribeCallback): UnsubscribeCallback => {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    };

    /**
     * Returns locale data by domain in a Jed-formatted JSON object shape.
     * @param domain Optional domain parameter.
     * @returns Locale data.
     */
    getLocaleData = (domain = "default")=> this.tannin.data[domain] as TanninDomainMetadata;

    /**
     * Merges locale data into the Tannin instance by domain.
     * @param data Optional locale data parameter.
     * @param domain Optional domain parameter.
     */
    doSetLocaleData = (data?: LocaleData, domain = "default") => {
        this.tannin.data[domain] = {
            ...this.tannin.data[domain],
            ...data,
        };

        // Populate default domain configuration (supported locale date which omits
        // a plural forms expression).
        this.tannin.data[domain][""] = {
            ...DEFAULT_LOCALE_DATA[""],
            ...this.tannin.data[domain]?.[""],
        };

        // Clean up cached plural forms functions cache as it might be updated.
        delete this.tannin.pluralForms[domain];
    };

    /**
     * Merges locale data into the Tannin instance by domain.
     * @param data Optional locale data parameter.
     * @param domain Optional domain parameter.
     */
    setLocaleData = (data?: LocaleData, domain: string = "default") => {
        this.doSetLocaleData(data, domain);
        this.notifyListeners();
    };

    /**
     * Merges locale data into the Tannin instance by domain.
     * @param data Optional locale data parameter.
     * @param domain Optional domain parameter.
     */
    addLocaleData = (
        data: HeaderData | LocaleRow,
        domain: string | undefined = "default",
    ) => {
        this.tannin.data[domain] = {
            ...this.tannin.data[domain],
            ...data,
            // Populate default domain configuration (supported locale date which omits
            // a plural forms expression).
            "": {
                ...DEFAULT_LOCALE_DATA[""],
                ...this.tannin.data[domain]?.[""],
                ...data?.[""] as LocaleData,
            },
        };

        // Clean up cached plural forms functions cache as it might be updated.
        delete this.tannin.pluralForms[domain];

        this.notifyListeners();
    };

    /**
     * Resets all current Tannin instance locale data and sets the specified locale data for the domain.
     * @param data Optional locale data parameter.
     * @param domain Optional domain parameter.
     */
    resetLocaleData = (data?: LocaleData, domain?: string) => {
        // Reset all current Tannin locale data.
        this.tannin.data = {};

        // Reset cached plural forms functions cache.
        this.tannin.pluralForms = {};

        this.setLocaleData(data, domain);
    };

    /**
     * Wrapper for Tannin's `dcnpgettext`. Populates default locale data if not
     * otherwise previously assigned.
     *
     * @param domain   Domain to retrieve the translated text.
     * @param context  Context information for the translators.
	 * @param single   Text to translate if non-plural, Used as fallback return value on a caught error.
	 * @param [plural] The text to be used if the number is plural.
	 * @param [number] The number to compare against to use either the singular or plural form.
     *
     * @return  The translated string.
     */
    dcnpgettext = (
        domain = "default",
        context?: string,
        single = "",
        plural?: string,
        number?: number,
    ): string => {
        if (!this.tannin.data[domain]) {
            // Use `doSetLocaleData` to set silently, without notifying listeners.
            this.doSetLocaleData(undefined, domain);
        }

        return this.tannin.dcnpgettext(domain, context, single, plural, number);
    };

    /**
     * Retrieve the domain to use when calling domain-specific filters.
	 * @param [domain] Optional domain parameter.
     */
    getFilterDomain = (domain = "default"): string => domain;

    /**
     * Retrieve the translation of text.
     * @param text Text to be translated.
     * @param domain Optional domain parameter.
     * @returns Translated text.
     */
    __ = (text: string, domain?: string): string => {
        let translation = this.dcnpgettext(domain, undefined, text);
        if (!this.hooks) {
            return translation;
        }

        /**
         * Filters text with its translation.
         *
         * @param {string} translation Translated text.
         * @param {string} text        Text to translate.
         * @param {string} domain      Text domain. Unique identifier for retrieving translated strings.
         */
        translation = this.hooks.applyFilters(
            "i18n.gettext",
            translation,
            text,
            domain,
        ) as string;

        return this.hooks.applyFilters(
            `i18n.gettext_${this.getFilterDomain(domain)}`,
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
    _x = (text: string, context: string, domain = "default"): string => {
        let translation = this.dcnpgettext(domain, context, text);
        if (!this.hooks) {
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
        translation = this.hooks.applyFilters(
            "i18n.gettext_with_context",
            translation,
            text,
            context,
            domain,
        ) as string;
        return this.hooks.applyFilters(
            `i18n.gettext_with_context_${this.getFilterDomain(domain)}`,
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
    _n = (
        single: string,
        plural: string,
        number: number,
        domain?: string,
    ): string => {
        let translation = this.dcnpgettext(
            domain,
            undefined,
            single,
            plural,
            number,
        );
        if (!this.hooks) {
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
        translation = this.hooks.applyFilters(
            "i18n.ngettext",
            translation,
            single,
            plural,
            number,
            domain,
        ) as string;
        return this.hooks.applyFilters(
            `i18n.ngettext_${this.getFilterDomain(domain)}`,
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
    _nx = (
        single: string,
        plural: string,
        number: number,
        context: string,
        domain?: string,
    ): string => {
        let translation = this.dcnpgettext(domain, context, single, plural, number);
        if (!this.hooks) {
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
        translation = this.hooks.applyFilters(
            "i18n.ngettext_with_context",
            translation,
            single,
            plural,
            number,
            context,
            domain,
        ) as string;

        return this.hooks.applyFilters(
            `i18n.ngettext_with_context_${this.getFilterDomain(domain)}`,
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
    isRTL = (): boolean => {
        return "rtl" === this._x("ltr", "text direction");
    };

    /**
     * Check if there is a translation for a given string in singular form.
     * @param single Singular string to check translation for.
     * @param context Context for translation.
     * @param domain Optional domain parameter.
     * @returns Boolean indicating whether translation exists.
     */
    hasTranslation = (single: string, context?: string, domain?: string) => {
        const key = context ? `${context}\u0004${single}` : single;
        let result = !!this.tannin.data?.[domain ?? "default"]?.[key];
        if (this.hooks) {
            /**
             * Filters the presence of a translation in the locale data.
             *
             * @param {boolean} hasTranslation Whether the translation is present or not..
             * @param {string}  single         The singular form of the translated text (used as key in locale data)
             * @param {string}  context        Context information for the translators.
             * @param {string}  domain         Text domain. Unique identifier for retrieving translated strings.
             */
            result = this.hooks.applyFilters(
                "i18n.has_translation",
                result,
                single,
                context,
                domain,
            ) as boolean;

            result = this.hooks.applyFilters(
                `i18n.has_translation_${this.getFilterDomain(domain)}`,
                result,
                single,
                context,
                domain,
            ) as boolean;
        }
        return result;
    };
}

export default I18n;
