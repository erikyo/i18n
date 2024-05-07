#!/usr/bin/env node
/**
 * External dependencies
 */
import {convertPOTToPHP} from "./convertTranslationToPHP.js";

const args: string[] = process.argv.slice(2);

convertPOTToPHP(args[0], args[1], {
	textdomain: args[2],
});
