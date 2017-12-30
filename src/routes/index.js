const express = require('express');
const ensure = require('../modules/ensure');
var router = express.Router();

// set homepage
router.get('/', ensure.ensureAuthenticated,function(req, res) {
	res.redirect('/polls/');
});

module.exports = router;