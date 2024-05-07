import {TanninLocaleDomain} from "tannin";

/**
 * Default locale data to use for Tannin domain when not otherwise provided.
 * Assumes an English plural forms expression.
 */
export const DEFAULT_LOCALE_DATA: TanninLocaleDomain = {
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
export const I18N_HOOK_REGEXP: RegExp =
	/^i18n\.(n?gettext|has_translation)(_|$)/;
