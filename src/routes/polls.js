import express from 'express';
var router = express.Router();

const ensure = require('../modules/ensure.js').ensureAuthenticated;

const Poll = require('../models/polls');

const prefPath = '/polls/poll/';

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

// custom middleware to check if User is Logged in
router.use(ensure);

// all polls
router.get('/', (req, res) => {
	Poll.getAllPolls((err, polls) => {
		if (err) throw err;
		res.render('index', {
			'polls': polls
		})
	});
});

// new poll
router.get('/new/', (req, res) => {
	res.render('new', {
		script: {
			script1: {script: '/js/newOptionScript.js'}	
		}
	});
});

// user's polls
router.get('/user/', (req, res) => {
	Poll.getPollsByUsername(
			req.app.get('user').username,
			(err, polls) => {
				if (err) throw err;
				res.render('my-polls', {
					'polls': polls,
					'script': {
						script1: {script: '/js/deletePollScript.js'}
					}
				});
			});
});

// submit new poll
router.post('/new/', [
		// validation
		check('title').custom((value, {req, location, path}) => {
			for(let key in req.body) {
				if (!req.body[key]) {
					return false;
				}
			}
			return true;
		}).withMessage('No empty fields are allowed')
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
				let newPoll = Poll({
					'title': req.body.title,
					'options': aux.map((x) => [x, 0]),
					'username': req.app.get('user').username,
					'path': '0'
				});
				Poll.createPoll(newPoll, (err, poll) => {
					if (err) {
						throw err;	
					} else {
						console.log('New poll: ' + poll.title);
						req.flash('success_msg', 'New poll created');
						res.redirect('/polls/user');
					}
				});
			}
		}
	});

// View poll
router.get('/poll/:POLL', (req, res) => {
	Poll.getPollByPath(prefPath + req.params.POLL,
		(err, poll) => {
			if (err) throw err;
			res.render('view-poll', {
				'title': poll.title,
				'options': poll.options,
				'path': poll.path,
				'script': {
					script1: {script: '/js/chartScript.js'},
					script2: {script: '/js/submitNewOption.js'}
				}
			});			
		});
});

// poll answer submission
router.post('/poll/:POLL', (req, res) => {
	console.log(req.body);
	let newOption = true;
	Poll.getPollByPath(prefPath + req.params.POLL,
		(err, poll) => {
			if (err) throw err;
			Poll.findByIdAndUpdate(poll._id,
				{ $set: {
					options: poll.options.map((arr) => {
						if (arr[0] == req.body.poll) {
							arr[1]++;
							newOption = false;
						}
						return arr;
					})
				} },
				{ new: true },
				(err, poll) => {
					if (err) throw err;
					if (!newOption) {
						req.flash('success_msg', 'Submission Succeded');
						res.redirect(poll.path);
					} else {
						let aux = poll.options;
						aux.push([req.body.poll, 0]);
						Poll.findByIdAndUpdate(poll._id,
						{
							$set: {
								options: aux
							}
						},
						{ new: true },
						(err, poll) => {
							if (err) throw err;
							req.flash('success_msg', 'Submission Succeded');
							res.redirect(poll.path);
						});
					}
				});
		});
});

// delete poll
router.get('/delete/:ID', (req, res) => {
	Poll.getPollById(req.params.ID,
		(err, poll) => {
			if (err) throw err;
			poll.remove((err) => {
				if (err) res.json({err: err});
				else {
					req.flash('warning_msg', 'Poll deleted')
					res.json({success: true});
				}
			});
		})
});

module.exports = router;