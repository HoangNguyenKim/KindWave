Object.defineProperty(BigInt.prototype, "toJSON", {
    value: function () {
        return this.toString();
    },
    writable: true,
    configurable: true,
});
export {};
