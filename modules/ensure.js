export function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		req.flash('error_msg', 'You are not logged in.');
		res.redirect('/users/login');
	}
}

export function ensureNotAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		req.flash('error_msg', 'You are already logged in.');
		res.redirect('/');
	} else {
		next();
	}
}