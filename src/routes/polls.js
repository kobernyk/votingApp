import express from 'express';
var router = express.Router();

const ensure = require('../modules/ensure.js');

const Poll = require('../models/polls');

const prefPath = '/polls/poll/';

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

// custom middleware to check if User is Logged in
router.all('/new/', ensure.ensureAuthenticated);
router.all('/delete/*', ensure.ensureAuthenticated);
router.all('/user/', ensure.ensureAuthenticated);

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
				"errors": errors.array(),
				'script': {
					script1: {script: '/js/newOptionScript.js'}
				}
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
					'path': '0',
					'users': []
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
			if (err) {
				throw err;
			}
			if(poll) {
				res.render('view-poll', {
					'title': poll.title,
					'options': poll.options,
					'path': poll.path,
					'script': {
						script1: {script: '/js/chartScript.js'},
						script2: {script: '/js/submitNewOption.js'}
					}
				});
			} else {
				req.flash('error_msg', 'No such poll.');
				res.redirect('/polls');
			}
		});
});

// poll answer submission
router.post('/poll/:POLL', (req, res) => {
	console.log(req.body);
	let newOption = true;
	Poll.getPollByPath(prefPath + req.params.POLL,
		(err, poll) => {
			if (err) throw err;

			// get ip
			let ipAd = null;
			if (req.headers['x-forwarded-for']) {
				ipAd = req.headers['x-forwarded-for'].split(',')[0];
			}
			else {
				ipAd = req.ip;
			}
			if((req.app.get('user') && 
				poll.users.indexOf(req.app.get('user').username) == -1) ||
				(!req.app.get('user') &&
					poll.users.indexOf(ipAd) == -1) &&
				req.body.poll) {
				let usersUpdated = poll.users;
				let newUser;
				if (req.app.get('user')) newUser = req.app.get('user').username;
				else newUser = ipAd;
				usersUpdated.push(newUser);
				Poll.findByIdAndUpdate(poll._id,
					{ 
						$set: {
							options: poll.options.map((arr) => {
								if (arr[0] == req.body.poll) {
									arr[1]++;
									newOption = false;
								}
								return arr;
							})
						}
					},
					{ new: true },
					(err, poll) => {
						if (err) throw err;
						let aux = poll.options;
						if (newOption) {
							aux.push([req.body.poll, 1]);
						}
						Poll.findByIdAndUpdate(poll._id,
							{
								$set: {
									options: aux,
									users: usersUpdated
								}
							},
							{ new: true },
							(err, poll) => {
								if (err) throw err;
								req.flash('success_msg', 'Submission Succeded');
								res.redirect(poll.path);
							}
						);
					}
				);
			} else if (!req.body.poll) {
				req.flash('error_msg', 'No empty fields are allowed');
				res.redirect(poll.path);
			} else {
				req.flash('error_msg', 'You can only vote once');
				res.redirect(poll.path);
			}
			
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