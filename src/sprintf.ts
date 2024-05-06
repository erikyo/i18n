/**
 * External dependencies
 */
import memoize from "memize";
import * as sprintfjs from "sprintf-js";

/**
 * Log to console, once per message; or more precisely, per referentially equal
 * argument set. Because Jed throws errors, we log these to the console instead
 * to avoid crashing the application.
 *
 * @param args Arguments to pass to `console.error`
 */
const logErrorOnce = memoize(console.error); // eslint-disable-line no-console

/**
 * Returns a formatted string. If an error occurs in applying the format, the
 * original format string is returned.
 *
 * @param format The format of the string to generate.
 * @param args   Arguments to apply to the format.
 *
 * @see https://www.npmjs.com/package/sprintf-js
 *
 * @return {string} The formatted string.
 */
export function sprintf(format: string, ...args: any[]): string {
	try {
		return sprintfjs.sprintf(format, ...args);
	} catch (error) {
		if (error instanceof Error) {
			logErrorOnce(`sprintf error: \n\n${error.toString()}`);
		}
		return format;
	}
}
