declare module 'simple-linear-scale' {
    export default (scale1: number[], scale2: number[], withinRange?: boolean) => (number) => number;
}
