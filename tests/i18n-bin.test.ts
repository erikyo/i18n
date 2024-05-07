/**
 * WordPress dependencies
 */
import {afterEach, describe, expect, it, Mock, vi, vitest} from "vitest";
import {readFileSync, writeFileSync, writeSync} from "node:fs";

import * as gettextParser from "gettext-parser";
import {GetTextTranslations} from "gettext-parser";
import {convertPOTToPHP} from "../tools/convertTranslationToPHP";

vi.mock('node:fs');
vi.mock('gettext-parser');

describe("convertPOTToPHP", () => {

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("converts POT to PHP", () => {
        // mock the fs.readFileSync and gettextParser.po.parse functions
        const potFile = 'path/to/potFile.pot';
        const phpFile = 'path/to/phpFile.php';
        const options = {textdomain: 'myTextDomain'};

        const poContents = 'po contents';
        const parsedPO: GetTextTranslations = {
            charset: 'utf-8',
            headers: {
                'X-Generator': 'Gettext-Parser',
            },
            translations: {
                context1: {
                    msgid1: {
                        msgid: 'msgid1',
                        msgstr: ['translation1'],
                    },
                    msgid2: {msgid: 'msgid2', msgstr: ['translation2']},
                },
                context2: {
                    msgid3: {msgid: 'msgid3', msgstr: ['translation3']},
                },
            },
        };
        const expectedOutput = [
            '<?php',
            '/* THIS IS A GENERATED FILE. DO NOT EDIT DIRECTLY. */',
            '$generated_i18n_strings = array(',
            '\t_x( \'msgid1\', \'undefined\', \'myTextDomain\' ),',
            '',
            '\t_x( \'msgid2\', \'undefined\', \'myTextDomain\' ),',
            '',
            '\t_x( \'msgid3\', \'undefined\', \'myTextDomain\' )',
            ');',
            '/* THIS IS THE END OF THE GENERATED FILE */',
            '',
        ].join("\n");

        const readMockFn = (readFileSync as Mock).mockReturnValue(potFile);
        const poParseMockFn = (gettextParser.po.parse as Mock).mockReturnValue(parsedPO);

        convertPOTToPHP(potFile, phpFile, options);

        expect(readMockFn).toHaveBeenCalledWith(potFile);
        expect(poParseMockFn).toHaveBeenCalledWith(potFile);
        expect(writeFileSync).toHaveBeenCalledWith(phpFile, expectedOutput);
    })
});
