import * as _ from "lodash";

export function convertToBytes(sprite: Uint8Array): number[] {
    let parts = _.chunk(sprite, 8);
    return convertToInt(parts);
}

export function convertToInt(parts: number[][]): number[] {
    return parts.map((x) => {
        let val = 0;
        for (let i = 0; i < 8; i++) {
            val += x[7-i] == 0 ? 0 : Math.pow(2, i);
        }
        return val;
    });
}

export function toHexString(value: number): string {
    return '$' + _.padStart(value.toString(16), 2, '0');
}
