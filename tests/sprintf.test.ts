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

			expect(consoleMock).not.toHaveBeenCalledOnce();
			expect(result).toBe("Hello %(placeholder-not-provided)s");
		});

		it("replaces placeholders", () => {
			const result = sprintf("bonjour %s", "Riad");

			expect(result).toBe("bonjour Riad");
		});

		it("replaces named placeholders", () => {
			const result = sprintf("bonjour %(name)s", { name: "Riad" });

			expect(result).toBe("bonjour Riad");
		});
	});
});
