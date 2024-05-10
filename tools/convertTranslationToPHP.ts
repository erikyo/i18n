import {readFileSync, writeFileSync} from "node:fs";
import {po} from "gettext-parser";

const TAB = "\t";
const NEWLINE = "\n";
const fileHeader =
    [
        "<?php",
        "/* THIS IS A GENERATED FILE. DO NOT EDIT DIRECTLY. */",
        "$generated_i18n_strings = array(",
    ].join(NEWLINE) + NEWLINE;
const fileFooter =
    NEWLINE +
    [");", "/* THIS IS THE END OF THE GENERATED FILE */"].join(NEWLINE) +
    NEWLINE;

/**
 * Escapes single quotes.
 *
 * @param input The string to be escaped.
 * @return The escaped string.
 */
function escapeSingleQuotes(input: string): string {
    return input.replace(/'/g, "\\'");
}

/**
 * Converts a translation parsed from the POT file to lines of WP PHP.
 *
 * @param translation The translation to convert.
 * @param textdomain  The text domain to use in the WordPress translation function call.
 * @param context     The context for the translation.
 * @return Lines of PHP that match the translation.
 */
function convertTranslationToPHP(
    translation: {
        msgid: string;
        msgid_plural?: string;
        msgctxt?: string;
        msgstr?: string[];
        comments?: {
            reference?: string;
            translator?: string;
            extracted?: string;
        };
    },
    textdomain: string,
    context: string = "",
): string {
    let php = "";

    // The format of gettext-js matches the terminology in gettext itself.
    let original = translation.msgid;
    const comments = translation.comments ?? {};

    if (Object.values(comments).length) {
        if (comments.reference) {
            // All references are split by newlines, add a // Reference prefix to make them tidy.
            php += `${TAB}// Reference: ${comments.reference
                .split(NEWLINE)
                .join(`${NEWLINE + TAB}// Reference: `)}${NEWLINE}`;
        }

        if (comments.translator) {
            // All extracted comments are split by newlines, add a tab to line them up nicely.
            const translator = comments.translator
                .split(NEWLINE)
                .join(`${NEWLINE + TAB}   `);

            php += `${TAB}/* ${translator} */${NEWLINE}`;
        }

        if (comments.extracted) {
            php += `${TAB}/* translators: ${comments.extracted} */${NEWLINE}`;
        }
    }

    if ("" !== original) {
        original = escapeSingleQuotes(original);

        if (!translation.msgid_plural) {
            if (!context) {
                php += `${TAB}__( '${original}', '${textdomain}' )`;
            } else {
                php += `${TAB}_x( '${original}', '${translation.msgctxt}', '${textdomain}' )`;
            }
        } else {
            const plural = escapeSingleQuotes(translation.msgid_plural);

            if (!context) {
                php += `${TAB}_n_noop( '${original}', '${plural}', '${textdomain}' )`;
            } else {
                php += `${TAB}_nx_noop( '${original}',  '${plural}', '${translation.msgctxt}', '${textdomain}' )`;
            }
        }
    }

    return php;
}

/**
 * Converts a POT file to a PHP file using the provided options.
 *
 * @param potFile - The path or identifier of the POT file.
 * @param phpFile - The path or identifier of the PHP file.
 * @param options - The options for the conversion.
 * @param options.textdomain - The text domain for the translations.
 * @return This function does not return a value.
 */
export function convertPOTToPHP(
    potFile: string,
    phpFile: string,
    options: { textdomain: string },
): void {
    if (typeof potFile !== "string") {
        throw new Error("potFile must be a string");
    } else if (typeof phpFile !== "string") {
        throw new Error("phpFile name must be a string");
    }
    const poContents = readFileSync(potFile);
    const parsedPO = po.parse(poContents);

    let output = [];

    for (const context of Object.keys(parsedPO.translations)) {
        const translations = parsedPO.translations[context];

        const newOutput = Object.values(translations)
            .map((translation) =>
                convertTranslationToPHP(translation, options.textdomain, context),
            )
            .filter((php) => php !== "");

        output = [...output, ...newOutput];
    }

    const fileOutput =
        fileHeader + output.join(`,${NEWLINE}${NEWLINE}`) + fileFooter;

    writeFileSync(phpFile, fileOutput);
}
