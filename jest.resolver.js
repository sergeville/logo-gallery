module.exports = (path, options) => {
  // Call the default resolver
  return options.defaultResolver(path, {
    ...options,
    // Enhanced package resolution for ESM compatibility
    packageFilter: pkg => {
      if (pkg.exports) {
        // Try different export formats in order of preference
        pkg.main = pkg.exports['.']?.default ??  // ESM default export
                  pkg.exports['.']?.require ??   // CommonJS export
                  pkg.exports['.']?.node ??      // Node.js specific export
                  pkg.exports['.'] ??            // Direct export
                  pkg.exports?.default ??        // Package default
                  pkg.module ??                  // ES module entry point
                  pkg.main;                      // Fallback to main
      } else if (pkg.module) {
        // Handle legacy module field
        pkg.main = pkg.module;
      }
      return pkg;
    },
  });
}; 