/**
 * External dependencies
 */
import b from "benny";

/**
 * Internal dependencies
 */
import NEW from "../build/index.js";

import OLD from "@wordpress/i18n";

b.suite(
		'Example',

	b.add('OLD', () => {
		OLD.__( 'Translate' );
	}),

		b.add('NEW', () => {
			NEW.__( 'Translate' );
		}),

		b.cycle(),
		b.complete(),
		b.save({ file: 'i18n-__', version: '1.0.0' }),
	)


