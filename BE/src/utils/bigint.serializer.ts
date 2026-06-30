export {};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

Object.defineProperty(BigInt.prototype, "toJSON", {
  value: function (this: bigint) {
    return this.toString();
  },
  writable: true,
  configurable: true,
});
