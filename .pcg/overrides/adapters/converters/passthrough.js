"use strict";

// dist/adapters/converters/passthrough.js
Object.defineProperty(exports, "__esModule", { value: true });
var converter = {
  convertFrom: async (event) => event,
  convertTo: async (result) => result,
  name: "passthrough"
};
exports.default = converter;
