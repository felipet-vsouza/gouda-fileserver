export namespace Validation {

    export function isInteger(value: string): boolean {
        return /[+-]?[0-9]{1,10}/g.test(value);
    }

    export function isBoolean(value: string): boolean {
        return /(^true$|^false$)/g.test(value);
    }

}