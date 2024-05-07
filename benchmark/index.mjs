/**
 * External dependencies
 */
import b from "benny";

/**
 * Internal dependencies
 */

import {__ as ___} from "@wordpress/i18n";
import {__} from "i18n-next";

b.suite(
  'i18n Testing __ and sprintf',

  b.add('OLD', () => {
    ___('string', 'context');
  }),

  b.add('NEW', () => {
    __('string', 'context');
  }),

  b.cycle(),
  b.complete(),
  b.save({file: 'i18n-__', version: '1.0.0'}),
)


