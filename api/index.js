const app = require('../backend/dist/index').default || require('../backend/dist/index');

module.exports = (req, res) => {
  // Ensure requests are routed cleanly to Express
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
};
