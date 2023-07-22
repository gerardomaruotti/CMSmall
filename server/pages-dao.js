'use-strict';

const db = require('./db');
const dayjs = require('dayjs');

const specialCharacter = '\n';

const formatPageOutputContent = (content) => {
	const regex = new RegExp('^![HPI]');
	const lines = content.split(specialCharacter);

	const filteredLines = lines.filter((line) => regex.test(line));
	const formattedLines = filteredLines.map((line) => {
		//check if line starts with !H and then it adds a type property to the object with the value 'Header'
		if (line.startsWith('!H')) {
			return { type: 'Header', body: line.slice(2) };
		}
		//check if line starts with !P and then it adds a type property to the object with the value 'Paragraph'
		else if (line.startsWith('!P')) {
			return { type: 'Paragraph', body: line.slice(2) };
		}
		//check if line starts with !I and then it adds a type property to the object with the value 'Image'
		else if (line.startsWith('!I')) {
			return { type: 'Image', body: line.slice(2) };
		}
	});
	return formattedLines;
};

const formatPageInputContent = (content) => {
	const filteredContent = content.map((section) => {
		section.body = section.body.replace(specialCharacter, ' ');
		return section;
	});
	const formattedLines = filteredContent.map((line) => {
		if (line.type === 'Header') {
			return '!H' + line.body;
		} else if (line.type === 'Paragraph') {
			return '!P' + line.body;
		} else if (line.type === 'Image') {
			return '!I' + line.body;
		}
	});
	return formattedLines.join(specialCharacter);
};

exports.getAllPages = () => {
	return new Promise((resolve, reject) => {
		const sql = 'SELECT * FROM pages';
		db.all(sql, (err, rows) => {
			if (err) reject(err);
			else {
				const pages = rows.map((p) => ({
					id: p.id,
					title: p.title,
					author: p.author,
					creation_date: p.creation_date ? p.creation_date : '',
					publication_date: p.publication_date,
					content: p.content,
				}));
				pages.map((p) => {
					p.content = formatPageOutputContent(p.content);
				});
				resolve(pages);
			}
		});
	});
};

exports.getDraftPages = () => {
	return new Promise((resolve, reject) => {
		const sql = 'SELECT * FROM pages WHERE publication_date IS NULL';
		db.all(sql, (err, rows) => {
			if (err) reject(err);
			else {
				const pages = rows.map((p) => ({
					id: p.id,
					title: p.title,
					author: p.author,
					creation_date: p.creation_date,
					publication_date: null,
					content: p.content,
				}));
				pages.map((p) => {
					p.content = formatPageOutputContent(p.content);
				});
				resolve(pages);
			}
		});
	});
};

exports.getScheduledPages = () => {
	return new Promise((resolve, reject) => {
		const sql = 'SELECT * FROM pages WHERE publication_date IS NOT NULL';
		db.all(sql, (err, rows) => {
			if (err) reject(err);
			else {
				const pages = rows.map((p) => ({
					id: p.id,
					title: p.title,
					author: p.author,
					creation_date: p.creation_date,
					publication_date: p.publication_date,
					content: p.content,
				}));
				const filteredPages = pages.filter((p) => dayjs(p.publication_date).isAfter(dayjs()));
				filteredPages.map((p) => {
					p.content = formatPageOutputContent(p.content);
				});
				filteredPages.sort((a, b) => {
					if (dayjs(a.publication_date).isBefore(dayjs(b.publication_date))) {
						return 1;
					} else if (dayjs(a.publication_date).isAfter(dayjs(b.publication_date))) {
						return -1;
					} else {
						return 0;
					}
				});
				resolve(filteredPages);
			}
		});
	});
};

exports.getPublishedPages = () => {
	return new Promise((resolve, reject) => {
		const sql = 'SELECT * FROM pages WHERE publication_date IS NOT NULL';
		db.all(sql, (err, rows) => {
			if (err) reject(err);
			else {
				const pages = rows.map((p) => ({
					id: p.id,
					title: p.title,
					author: p.author,
					creation_date: p.creation_date,
					publication_date: p.publication_date,
					content: p.content,
				}));
				const filteredPages = pages.filter((p) => !dayjs(p.publication_date).isAfter(dayjs()));
				filteredPages.map((p) => {
					p.content = formatPageOutputContent(p.content);
				});
				filteredPages.sort((a, b) => {
					if (dayjs(a.publication_date).isBefore(dayjs(b.publication_date))) {
						return 1;
					} else if (dayjs(a.publication_date).isAfter(dayjs(b.publication_date))) {
						return -1;
					} else {
						return 0;
					}
				});
				resolve(filteredPages);
			}
		});
	});
};

exports.getPage = (id) => {
	return new Promise((resolve, reject) => {
		const sql = 'SELECT * FROM pages WHERE id=?';
		db.get(sql, [id], (err, row) => {
			if (err) reject(err);
			else if (row === undefined) resolve({ error: 'Page not found.' });
			else {
				const page = {
					id: row.id,
					title: row.title,
					author: row.author,
					creation_date: row.creation_date,
					publication_date: row.publication_date,
					content: row.content,
				};
				page.content = formatPageOutputContent(page.content);
				resolve(page);
			}
		});
	});
};

exports.getPlainPage = (id) => {
	return new Promise((resolve, reject) => {
		const sql = 'SELECT * FROM pages WHERE id=?';
		db.get(sql, [id], (err, row) => {
			if (err) reject(err);
			else if (row === undefined) resolve({ error: 'Page not found.' });
			else {
				const page = {
					id: row.id,
					title: row.title,
					author: row.author,
					creation_date: row.creation_date,
					publication_date: row.publication_date,
					content: row.content,
				};
				resolve(page);
			}
		});
	});
};

exports.deletePage = (id) => {
	return new Promise((resolve, reject) => {
		const sql = 'DELETE FROM pages WHERE id=?';
		db.run(sql, [id], (err) => {
			if (err) reject(err);
			else resolve(null);
		});
	});
};

exports.createPage = (title, author, content, publication_date) => {
	return new Promise((resolve, reject) => {
		const formattedContent = formatPageInputContent(content);
		const creation_date = dayjs().format('YYYY-MM-DD').toString();
		publication_date = publication_date
			? dayjs(publication_date).format('YYYY-MM-DD').toString()
			: null;
		const sql =
			'INSERT INTO pages (title, author, creation_date, publication_date, content) VALUES (?, ?, ?, ?, ?)';
		db.run(sql, [title, author, creation_date, publication_date, formattedContent], function (err) {
			if (err) reject(err);
			else resolve(null);
		});
	});
};

exports.editPage = (id, title, author, content, publication_date) => {
	return new Promise((resolve, reject) => {
		const formattedContent = formatPageInputContent(content);
		const sql = 'UPDATE pages SET title=?, author=?, content=?, publication_date=? WHERE id=?';
		db.run(sql, [title, author, formattedContent, publication_date, id], (err) => {
			if (err) reject(err);
			else resolve(null);
		});
	});
};

exports.editWebsiteName = (name) => {
	return new Promise((resolve, reject) => {
		const sql = 'UPDATE website SET name=?';
		db.run(sql, [name], (err) => {
			if (err) reject(err);
			else resolve(null);
		});
	});
};

exports.getWebsiteName = () => {
	return new Promise((resolve, reject) => {
		const sql = 'SELECT * FROM website';
		db.get(sql, (err, row) => {
			if (err) reject(err);
			else if (row === undefined) resolve({ error: 'Website not found.' });
			else resolve(row.name);
		});
	});
};
