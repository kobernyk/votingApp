const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const ensure = require('../modules/ensure');


const express = require('express');
var router = express.Router();

const User = require('../models/users');

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

// register
router.get('/register', ensure.ensureNotAuthenticated,(req, res) => {
	res.render('register');
});

// login
router.get('/login', ensure.ensureNotAuthenticated,(req, res) => {
	res.render('login');
});

// register user
router.post('/register', [
		// Validation
		check('name', 'Name is required').isLength({min: 1}),
		check('email', 'Email is required')
			.isLength({min: 1})
			.isEmail().withMessage('Email not valid'),
		check('username', 'Username is required')
			.isLength({min: 1})
			.isAlphanumeric().withMessage("Invalid Username"),
		check('password', 'Password is required').isLength({min: 1}),
		check('password2', 'Password do not match')
			.exists()
			.custom((value, {req}) => value === req.body.password)
	],
	(req, res) => {
		var name = req.body.name;
		var email = req.body.email;
		var username = req.body.username;
		var password = req.body.password;
		var password2 = req.body.password2;

		// validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.render('register', {
				"errors": errors.array()
			});
		} else {
			var newUser = new User({
				name: name,
				email: email,
				username: username,
				password: password
			});

			User.createUser(newUser, (err, user) => {
				if (err) {
					console.log("Err: " + err.errmsg);
					if (err.code === 11000) {
						req.flash("error_msg", "Username or Email already in use.");
						res.redirect('/users/register');
					} else {
						throw err;
					}
				}
				else {
					console.log("Added user: " + user.username);
					req.flash('success_msg', 'You are registered and can now login');
					res.redirect('/users/login');
				}
			});

		}
	}
);

passport.use(new LocalStrategy(
	function(username, password, done) {
		User.getUserByUsername(username, function(err, user) {
			if (err) throw err;
			if (!user) {
				return done(null, false, {
					message: 'Unknown user'
				});
			}

			User.comparePassword(password, user.password, function(err, isMatch) {
				if (err) throw err;
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, {message: 'Invalid password'});
				}
			});
		})
	}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/users/login',
		failureFlash: true
	}),
	(req, res) => {
		res.redirect('/');
	});


// log out
router.get('/logout', ensure.ensureAuthenticated,(req, res) => {
	req.logout();
	res.redirect('/users/login');
});

module.exports = router;