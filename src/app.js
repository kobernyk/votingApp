const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');

const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// validator
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

// DB
const mongo = require('mongodb');
const mongoose = require('mongoose');
const DB_URI = process.env.MLAB_URI || 'mongodb://localhost/votingapp';
mongoose.connect(DB_URI);
var db = mongoose.connection;

// routes
let routes = require('./routes/index');
let users = require('./routes/users');
let polls = require('./routes/polls');

// init app
const app = express();
// view engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({
	defaultLayout: "layout",
	layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', 'handlebars');

// body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// express session middleware
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

// passport unit
app.use(passport.initialize());
app.use(passport.session());

// connect flash middleware
app.use(flash());

// global vars for our flash messages
app.use(function(req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	res.locals.warning_msg = req.flash('warning_msg');
	app.set('user', req.user || null);
	next();
});

// middleware for our route files
app.use('/', routes);
app.use('/users', users);
app.use('/polls', polls);

// set port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function() {
	console.log('Server started on port ' + app.get('port'));
});