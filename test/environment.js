const NodeEnvironment = require('jest-environment-node').default;
const { TextEncoder, TextDecoder } = require('util');

class CustomEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();
    
    // Add DOM-like globals
    this.global.window = {};
    this.global.document = {
      createElement: () => ({
        setAttribute: () => {},
        getElementsByTagName: () => [],
        appendChild: () => {}
      }),
      getElementsByTagName: () => [],
      querySelector: () => null,
      querySelectorAll: () => []
    };
    this.global.navigator = {
      userAgent: 'node'
    };
    
    // Add TextEncoder and TextDecoder
    this.global.TextEncoder = TextEncoder;
    this.global.TextDecoder = TextDecoder;
    
    // Add other required globals
    this.global.ArrayBuffer = ArrayBuffer;
    this.global.Uint8Array = Uint8Array;
    
    // Add fetch-related globals
    this.global.Headers = class Headers {};
    this.global.Request = class Request {};
    this.global.Response = class Response {};
    this.global.fetch = () => Promise.resolve(new this.global.Response());
  }

  async teardown() {
    await super.teardown();
  }
}

module.exports = CustomEnvironment; 