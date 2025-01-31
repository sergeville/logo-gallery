const JSDOMEnvironment = require('jest-environment-jsdom').default;

class CustomTestEnvironment extends JSDOMEnvironment {
  constructor(config, context) {
    super(config, context);
    this.global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    this.global.IntersectionObserver = class IntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    this.global.matchMedia = () => ({
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    });
    this.global.scrollTo = () => {};
    this.global.fetch = () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
      status: 200,
    });
  }
}

module.exports = CustomTestEnvironment; 