import tSprintf from "@tannin/sprintf";

type Specifiers = {
    's': string,
    'd': number,
    'b': boolean,
    'D': Date
};
type S = keyof Specifiers;

type ExtractNamedPlaceholders<T extends string> =
    T extends `${any}%(${infer Key})${infer Spec}${infer Rest}`
        ? Spec extends S
            ? { [K in Key]: Specifiers[Spec]} & ExtractNamedPlaceholders<Rest>
            : never
        : {};

type ExtractUnnamedPlaceholders<T extends string> =
    T extends `${any}%${infer Spec}${infer Rest}`
        ? Spec extends S
            ? [Specifiers[Spec], ...ExtractUnnamedPlaceholders<Rest>]
            : never
        : [];

type SprintfArgs<T extends string> =
    ExtractUnnamedPlaceholders<T> extends never
        ? [values: ExtractNamedPlaceholders<T>]
        : ExtractUnnamedPlaceholders<T>;


/**
 * Returns a formatted string. If an error occurs in applying the format, the
 * original format string is returned.
 *
 * @param format The format of the string to generate.
 * @param values   Arguments to apply to the format.
 *
 * @return {string} The formatted string.
 */
export function sprintf<T extends string>(
    format: T,
    ...values: SprintfArgs<T>
): string {
    try {
        return tSprintf(format, ...values);
    } catch (error) {
        return format;
    }
}
