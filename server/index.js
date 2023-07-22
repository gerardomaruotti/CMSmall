'use strict';

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const userDao = require('./users-dao');
const pagesDao = require('./pages-dao');

const { check, validationResult } = require('express-validator');

const app = new express();
const port = 3001;
app.use(morgan('dev'));
app.use(express.json());

const corsOptions = {
	origin: 'http://localhost:5173',
	credentials: true,
};
app.use(cors(corsOptions));

passport.use(
	new LocalStrategy(async function verify(username, password, callback) {
		const user = await userDao.getUser(username, password);
		if (!user) return callback(null, false, 'Incorrect username or password');
		return callback(null, user);
	})
);

passport.serializeUser(function (user, callback) {
	callback(null, user);
});

passport.deserializeUser(function (user, callback) {
	return callback(null, user);
});

app.use(
	session({
		secret: "shhhhh... it's a secret!",
		resave: false,
		saveUninitialized: false,
	})
);
app.use(passport.authenticate('session'));

const isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	return res.status(401).json({ error: 'Not authorized' });
};

const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
	return `${location}[${param}]: ${msg}`;
};

//APIs
//Users APIS
app.post('/api/sessions', (req, res, next) => {
	passport.authenticate('local', (err, user, info) => {
		if (err) return next(err);
		if (!user) {
			return res.status(401).json({ error: info });
		}
		req.login(user, (err) => {
			if (err) return next(err);
			return res.json(req.user);
		});
	})(req, res, next);
});

app.get('/api/sessions/current', (req, res) => {
	if (req.isAuthenticated()) {
		res.status(200).json(req.user);
	} else res.status(401).json({ error: 'Not authenticated' });
});

app.delete('/api/sessions/current', (req, res) => {
	req.logout(() => {
		res.status(200).json({});
	});
});

//Pages APIS
app.get('/api/pages', isLoggedIn, (req, res) => {
	pagesDao
		.getAllPages()
		.then((pages) => res.json(pages))
		.catch((err) => res.status(500).json(err));
});

app.get('/api/pages/published', (req, res) => {
	pagesDao
		.getPublishedPages()
		.then((pages) => res.json(pages))
		.catch((err) => res.status(500).json(err));
});

app.get('/api/pages/drafts', isLoggedIn, (req, res) => {
	pagesDao
		.getDraftPages()
		.then((pages) => {
			res.json(pages);
		})
		.catch((err) => res.status(500).json(err));
});

app.get('/api/pages/scheduled', isLoggedIn, (req, res) => {
	pagesDao
		.getScheduledPages()
		.then((pages) => res.json(pages))
		.catch((err) => res.status(500).json(err));
});

app.get('/api/pages/:id', (req, res) => {
	pagesDao
		.getPage(req.params.id)
		.then((page) => res.json(page))
		.catch((err) => res.status(500).json(err));
});

app.post(
	'/api/pages',
	isLoggedIn,
	[
		check('title').isLength({ min: 1 }).isString(),
		check('author').isLength({ min: 1 }).isString(),
		check('content').isArray(),
		check('content.*.type').isString(),
		check('content.*.body').isLength({ min: 1 }).isString(),
	],
	(req, res) => {
		const errors = validationResult(req).formatWith(errorFormatter);
		if (!errors.isEmpty()) {
			return res.status(422).json({ error: errors.array().join(', ') });
		}
		let { title, author, content, publication_date } = req.body;
		if (!title || !content) {
			return res.status(400).json({ error: 'Missing fields' });
		}
		if (req.user.username !== author && req.user.role !== 'Admin') {
			author = req.user.name;
		}
		pagesDao
			.createPage(title, author, content, publication_date)
			.then(() => res.status(201).json({ message: 'Page created' }))
			.catch((err) => res.status(500).json(err));
	}
);

app.put(
	'/api/pages/:id',
	isLoggedIn,
	[
		check('title').isLength({ min: 1 }).isString(),
		check('author').isLength({ min: 1 }).isString(),
		check('content').isArray(),
		check('content.*.type').isString(),
		check('content.*.body').isLength({ min: 1 }).isString(),
	],
	(req, res) => {
		let { title, author, content, publication_date } = req.body;
		const id = req.params.id;
		if (author && req.user.name !== author && req.user.role !== 'Admin') {
			return res.status(401).json({ error: 'Not authorized' });
		} else if (author) {
			userDao
				.getUserByName(author)
				.then((user) => {
					if (!user) {
						return res.status(404).json({ error: 'Author not found' });
					}
				})
				.catch((err) => res.status(500).json(err));
		}
		pagesDao
			.editPage(id, title, author, content, publication_date)
			.then(() => res.json({ message: 'Page updated' }))
			.catch((err) => res.status(500).json(err));
	}
);

app.delete('/api/pages/:id', isLoggedIn, (req, res) => {
	pagesDao
		.getPage(req.params.id)
		.then((page) => {
			if (req.user.name !== page.author && req.user.role !== 'Admin') {
				return res.status(401).json({ error: 'Not authorized' });
			}
			pagesDao
				.deletePage(req.params.id)
				.then(() => res.status(200).json({ message: 'Page deleted' }))
				.catch((err) => res.status(500).json(err));
		})
		.catch((err) => res.status(500).json(err));
});

app.get('/api/website', (req, res) => {
	pagesDao
		.getWebsiteName()
		.then((name) => res.json(name))
		.catch((err) => res.status(500).json(err));
});

app.put('/api/website', isLoggedIn, [check('name').isLength({ min: 1 }).isString()], (req, res) => {
	const name = req.body.name;
	if (req.user.role !== 'Admin') {
		return res.status(401).json({ error: 'Not authorized' });
	}
	pagesDao
		.editWebsiteName(name)
		.then((name) => res.status(200).json(name))
		.catch((err) => res.status(500).json(err));
});

app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});
