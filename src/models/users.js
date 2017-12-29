const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	name: {
		type: String
	}
});

UserSchema.index({username: 1}, {unique: 1});
UserSchema.index({email: 1}, {unique: 1});

var User = module.exports = mongoose.model('users', UserSchema);

module.exports.createUser = function (newUser, callback) {
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        // Store hash in your password DB. 
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.getUserByUsername = function(username, callback) {
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.comparePassword = function(candidatePass, hash, callback) {
	bcrypt.compare(candidatePass, hash, function(err, isMatch) {
	    if (err) throw err;
	    callback(null, isMatch);
	});
}

module.exports.getUserById = function(id, callback) {
	User.findById(id, callback);
}