const app = require('./dist/bundle.js');

module.exports = app.default || app;
