/**
 * Parses one or more strings of assembly and outputs the equivalent values in
 * numeric form.
 */
export function parse(input: string): number;
export function parse(input: string[]): number[];
export function parse(input: object): number;
export function parse(input: object[]): number[];
export function parse(input: string | string[] | object | object[]): number | number[];

interface IPrintOptions {
    commas?: boolean;
    include$?: boolean;
    casing?: "toLowerCase" | "toUpperCase";
    numBase?: 16 | 10;
}

/**
 * Prints MIPS assembly strings from one or more numeric values.
 */
export function print(input: number): string;
export function print(input: number[]): string[];
export function print(input: object): string;
export function print(input: object[]): string[];
export function print(input: ArrayBuffer): string[];
export function print(input: DataView): string[];
export function print(
    input: number | number[] | object | object[] | ArrayBuffer | DataView,
    opts?: IPrintOptions): string | string[];
