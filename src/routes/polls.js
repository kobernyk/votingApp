import express from 'express';
var router = express.Router();


const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

// all polls
router.get('/', (req, res) => {
	res.render('polls');
});

// new poll
router.get('/new/', (req, res) => {
	res.render('new', {
		script: '/js/newOptionScript.js'
	});
});

// user's polls
router.get('/user/', (req, res) => {
	res.render('my-polls');
});

// submit new poll
router.post('/new/', [
		// validation
		check('title', 'Please, write a Title').isLength({min: 1}),
	], (req, res) => {
		// handle errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.render('new', {
				"errors": errors.array()
			});
		} else {
			// check if all options are differents
			let aux = [], differents = true;
			console.log(req.body);
			for (let option in req.body) {
				if (option === 'title') continue;
				let value = req.body[option];
				if (aux.indexOf(value) !== -1) {
					differents = false;
					break;
				}
				aux.push(value);
			}
			if (!differents) {
				req.flash("error_msg", "Options should be different.");
				res.redirect('/polls/new');
			} else {
				console.log('New Poll created');
				res.redirect('/');
			}
		}
	});

module.exports = router;