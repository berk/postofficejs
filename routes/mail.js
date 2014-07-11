var express = require('express');
var postoffice = require('./../lib/postoffice');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {

  postoffice.sendTemplate("helloworld", {name: "Berk"}, {
    from: "test@example.com",
    to: "test@example.com"
  });

  res.redirect('/');
});

module.exports = router;
