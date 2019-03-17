export const browserSyncConfig = {
  "ui": false,
  "proxy": 'localhost:3000',
  "port": 8000,
  "logLevel": "none",
  "logConnections": false,
  "logFileChanges": false,
  "reloadOnRestart": true,
  "notify": false,
  "snippetOptions": {
    "rule": {
      "match": /<script id=['"]browsersync-snippet['"]><\/script>/,
      "fn": (snippet, _match) => snippet
    }
  }
};
