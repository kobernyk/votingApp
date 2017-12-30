const mongoose = require('mongoose');

// Poll schema
var PollSchema = mongoose.Schema({
	title: {
		type: String
	},
	options: Array,
	username: {
		type: String
	},
	path: String
});

var Poll = module.exports = mongoose.model('polls', PollSchema);

module.exports.createPoll = function(newPoll, callback) {
	let cont;
		Poll.count({}, (err, size) => {
			if (err) throw err;
			do {
				let digits = Math.floor(Math.random()*size+1);
				let short = Math.floor(Math.random()*1000000+1).toString().slice(0,digits);
				let path = '/polls/poll/' + short.toString();
				Poll.count({'path': path}, (err, count) => {
					if (err) throw err;
					if (count > 0) cont = true;
					else {
						cont = false;
						newPoll.path = path;
						newPoll.save(callback);
					}
				});
			} while(cont);
		});
}

module.exports.getPollsByUsername = function(username, callback) {
	Poll.find({'username': username}, callback);
}

module.exports.getAllPolls = function(callback) {
	Poll.find({}, callback);
}

module.exports.getPollByPath = function(path, callback) {
	Poll.findOne({"path": path}, callback);
}