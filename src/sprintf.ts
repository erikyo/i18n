import tSprintf from "@tannin/sprintf";

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
export function sprintf(
	format: string,
	...args: (string | string[] | { [x: string]: string })[]
): string {
	try {
		return tSprintf(format, ...args);
	} catch (error) {
		return format;
	}
}
