import dayjs from 'dayjs';

const SERVER_URL = 'http://localhost:3001/api/';

function getJson(httpResponsePromise) {
	return new Promise((resolve, reject) => {
		httpResponsePromise
			.then((response) => {
				if (response.ok) {
					response
						.json()
						.then((json) => resolve(json))
						.catch((err) => reject({ error: 'Cannot parse server response' }));
				} else {
					response
						.json()
						.then((obj) => reject(obj))
						.catch((err) => reject({ error: 'Cannot parse server response' }));
				}
			})
			.catch((err) => reject({ error: 'Cannot communicate' }));
	});
}

async function getPages() {
	return getJson(fetch(SERVER_URL + 'pages', { credentials: 'include' })).then((json) => {
		return json.map((page) => {
			const clientPage = {
				id: page.id,
				title: page.title,
				author: page.author,
				publication_date: page.publication_date,
				creation_date: page.creation_date,
				contents: page.contents,
			};
			if (page.publication_date && page.publication_date !== '')
				clientPage.publication_date = dayjs(page.publication_date);
			clientPage.creation_date = dayjs(page.creation_date);
			return clientPage;
		});
	});
}

async function getPublishedPages() {
	return getJson(fetch(SERVER_URL + 'pages/published')).then((json) => {
		return json.map((page) => {
			const clientPage = {
				id: page.id,
				title: page.title,
				author: page.author,
				publication_date: page.publication_date,
				creation_date: page.creation_date,
				contents: page.contents,
			};
			if (page.publication_date && page.publication_date !== '')
				clientPage.publication_date = dayjs(page.publication_date);
			clientPage.creation_date = dayjs(page.creation_date);
			return clientPage;
		});
	});
}

async function getScheduledPages() {
	return getJson(fetch(SERVER_URL + 'pages/scheduled', { credentials: 'include' })).then((json) => {
		return json.map((page) => {
			const clientPage = {
				id: page.id,
				title: page.title,
				author: page.author,
				publication_date: page.publication_date,
				creation_date: page.creation_date,
				contents: page.contents,
			};
			if (page.publication_date && page.publication_date !== '')
				clientPage.publication_date = dayjs(page.publication_date);
			clientPage.creation_date = dayjs(page.creation_date);
			return clientPage;
		});
	});
}

async function getDraftPages() {
	return getJson(fetch(SERVER_URL + 'pages/drafts', { credentials: 'include' })).then((json) => {
		return json.map((page) => {
			const clientPage = {
				id: page.id,
				title: page.title,
				author: page.author,
				publication_date: page.publication_date,
				creation_date: page.creation_date,
				contents: page.contents,
			};
			if (page.publication_date && page.publication_date !== '')
				clientPage.publication_date = dayjs(page.publication_date);
			clientPage.creation_date = dayjs(page.creation_date);
			return clientPage;
		});
	});
}

async function getPage(pageId) {
	return getJson(fetch(SERVER_URL + 'pages/' + pageId, { credentials: 'include' })).then((page) => {
		const clientPage = {
			id: page.id,
			title: page.title,
			author: page.author,
			publication_date: page.publication_date,
			creation_date: page.creation_date,
			content: page.content,
		};
		if (page.publication_date && page.publication_date !== '')
			clientPage.publication_date = dayjs(page.publication_date);
		clientPage.creation_date = dayjs(page.creation_date);
		return clientPage;
	});
}

async function updatePage(page) {
	if (page && page.publication_date && page.publication_date instanceof dayjs) {
		page.publication_date = page.publication_date.format('YYYY-MM-DD');
	}
	if (page && page.creation_date && page.creation_date instanceof dayjs)
		page.creation_date = page.creation_date.format('YYYY-MM-DD');

	return getJson(
		fetch(SERVER_URL + 'pages/' + page.id, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify(page),
		})
	);
}

async function createPage(page) {
	return getJson(
		fetch(SERVER_URL + 'pages/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify(page),
		})
	);
}

async function deletePage(pageId) {
	return getJson(
		fetch(SERVER_URL + 'pages/' + pageId, {
			method: 'DELETE',
			credentials: 'include',
		})
	);
}

async function getWebsiteName() {
	return getJson(fetch(SERVER_URL + 'website'));
}

async function editWebsiteName(name) {
	return getJson(
		fetch(SERVER_URL + 'website', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify(name),
		})
	);
}

async function logIn(credentials) {
	return getJson(
		fetch(SERVER_URL + 'sessions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify(credentials),
		})
	);
}

async function getUserInfo() {
	return getJson(
		fetch(SERVER_URL + 'sessions/current', {
			credentials: 'include',
		})
	);
}

async function logOut() {
	return getJson(
		fetch(SERVER_URL + 'sessions/current', {
			method: 'DELETE',
			credentials: 'include',
		})
	);
}

const API = {
	getPages,
	getPage,
	updatePage,
	createPage,
	deletePage,
	getPublishedPages,
	getScheduledPages,
	getDraftPages,
	getWebsiteName,
	editWebsiteName,
	logIn,
	getUserInfo,
	logOut,
};

export default API;
