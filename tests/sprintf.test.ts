import { describe, expect, it, test } from "vitest";
import { vi } from "vitest";
/**
 * Internal dependencies
 */
import { sprintf } from "../src";

describe("i18n", () => {
    describe("sprintf", () => {
        it("absorbs errors", () => {
            // Mock memoization as identity function. Inline since Jest errors on out-of-scope references in a mock callback.
            const consoleMock = vi.spyOn(console, "error");
            // Disable reason: Failing case is the purpose of the test.
            // eslint-disable-next-line @wordpress/valid-sprintf
            const result = sprintf("Hello %(placeholder-not-provided)s");

            expect(consoleMock).not.toThrowError();
            expect(consoleMock).toHaveBeenCalledOnce();
            expect(result).toBe("Hello %(placeholder-not-provided)s");
        });

        it("replaces placeholders", () => {
            const result = sprintf("bonjour %s", "erik");
            expect(result).toBe("bonjour erik");
        });

        it("replaces named placeholders", () => {
            const result = sprintf("bonjour %(names)s", { names: "erik" });
            expect(result).toBe("bonjour erik");
        });
    });
});


describe("tests sprintf types", () => {
    it("it works as expected", () => {
        sprintf('this is a %s and it is %d years old, right?%b %D', 'erik', 20, true, new Date()); // ok, it checks for different types
        sprintf('this is a %s and it is %b years old, right?%d %D', 'erik', 20, true, new Date()); // not ok, wrong type
        sprintf('this is a %s and it is %b%b%b%byears old, right?%d %D', 'erik', 20, true, new Date()); // not ok, too many arguments
        sprintf('Hello %s', 'John'); // ok
        sprintf('Hello %s', 'John', 'Doe'); // not ok, too many arguments
        sprintf('Hello %s', false); // not ok, wrong type
        sprintf('Hello %s', false); // not ok, wrong type
        sprintf("Ciao %(names)s", {names: "erik"}) // ok named placeholder
        sprintf("Ciao %(names)s %(years)d", {names: "erik", years: 20});// ok multiple named placeholder
        sprintf("Ciao %(names)s %(years)d", {names: "erik", years: "20"});// not ok, wrong type
    });
})
