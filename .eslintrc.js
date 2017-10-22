const os = require('os');

module.exports = {
  "rules": {
    "indent": [
      "error",
      2,
      {
        "SwitchCase": 1
      }
    ],
    "linebreak-style": [
      "error",
      os.platform() !== 'win32' ? "unix" : "windows"
    ],
    "no-console": [
      "off"
    ],
    "no-unused-vars": [
      "error",
      {
        "args": "none"
      }
    ],
    "no-var": [
      "error"
    ],
    "prefer-arrow-callback": [
      "error"
    ],
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ]
  },
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "extends": "eslint:recommended"
}
