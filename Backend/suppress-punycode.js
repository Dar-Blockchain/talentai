// suppress-punycode.js
// Preload to intercept and ignore specifically the DeprecationWarning related to the `punycode` builtin module.
// Load Node with: node -r ./suppress-punycode.js app.js

const Module = require('module');
const path = require('path');

// Intercept require('punycode') and redirect to the userland npm package
// located in this project's node_modules. This prevents Node from loading
// the builtin deprecated punycode module which emits DEP0040.
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === 'punycode') {
    try {
      // Try to load the project's installed `punycode` package by absolute path
      const alt = path.join(__dirname, 'node_modules', 'punycode');
      return originalLoad.call(this, alt, parent, isMain);
    } catch (e) {
      // Fallback to original behaviour if something goes wrong
      return originalLoad.call(this, request, parent, isMain);
    }
  }
  return originalLoad.call(this, request, parent, isMain);
};

// Keep a filter to ignore the noisy DEP0040 warning if it still appears for any reason
process.on('warning', (warning) => {
  try {
    if (warning && warning.name === 'DeprecationWarning') {
      const msg = (warning.stack || warning.message || '').toString();
      if (/punycode/.test(msg) || /DEP0040/.test(msg)) {
        return; // suppress
      }
    }
  } catch (e) {
    console.warn(warning.name + ': ' + warning.message);
  }
});

// nothing else - the app will be loaded after this preloaded module
