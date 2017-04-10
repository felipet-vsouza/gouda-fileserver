export namespace Validation {

    export function isInteger(value: string): boolean {
        let regex = /[+-]?[0-9]{1,10}/g;
        return regex.test(value);
    }

}