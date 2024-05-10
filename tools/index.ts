#!/usr/bin/env node
/**
 * External dependencies
 */
import {convertPOTToPHP} from "./convertTranslationToPHP.js";

/**
 * Fire the conversion from POT to PHP.
 *
 * @var {Array} args - The options for the conversion.
 * @property {string} args[0] potFile - The path or identifier of the POT file.
 * @property {string} args[1] phpFile - The path or identifier of the PHP file.
 * @property {string} args[2] textdomain - The text domain.
 */
const args: string[] = process.argv.slice(2);

convertPOTToPHP(args[0], args[1], {
	textdomain: args[2],
});
