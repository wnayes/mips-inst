/**
 * Parses one or more strings of assembly and outputs the equivalent values in
 * numeric form.
 */
export function parse(input: string | string[]): number | number[];

interface IPrintOptions {
    commas?: boolean;
    include$?: boolean;
    casing?: "toLowerCase" | "toUpperCase";
    numBase?: 16 | 10;
}

/**
 * Prints MIPS assembly strings from one or more numeric values.
 */
export function print(input: number | number[], opts?: IPrintOptions): string | string[];
