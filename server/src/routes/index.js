const fs = require('fs');
const router = require('express').Router();

fs.readdirSync(__dirname)
  .filter((f) => f.endsWith('.routes.js'))
  .forEach((f) => router.use('/' + f.replace('.routes.js', ''), require('./' + f)));

module.exports = router;