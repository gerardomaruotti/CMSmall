import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import MessageContext from './messageCtx';
import API from './API';
import { Container, Alert, Button } from 'react-bootstrap/';
import { React, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NavigationBar } from './components/Navigation';
import {
	LoginLayout,
	FrontOfficeLayout,
	BackOfficeLayout,
	NotFoundLayout,
	WebsiteNameLayout,
	SinglePageLayout,
	EditPageLayout,
	AddPageLayout,
} from './components/PageLayout';

function App() {
	const [websiteName, setWebsiteName] = useState('');
	const [loggedIn, setLoggedIn] = useState(false);
	const [user, setUser] = useState(null);
	const [message, setMessage] = useState('');
	const [pages, setPages] = useState([]);

	const handleErrors = (err) => {
		let msg = '';
		if (err.error) msg = err.error;
		else if (String(err) === 'string') msg = String(err);
		else msg = 'Unknown Error';
		setMessage(msg);
	};

	useEffect(() => {
		API.getWebsiteName()
			.then((name) => {
				setWebsiteName(name);
			})
			.catch((e) => handleErrors(e));
	}, [websiteName]);

	const handleLogin = async (credentials) => {
		try {
			const user = await API.logIn(credentials);
			setUser(user);
			setLoggedIn(true);
		} catch (err) {
			throw err;
		}
	};

	const editWebsiteName = (name) => {
		API.editWebsiteName(name)
			.then(() => {
				setWebsiteName(name);
			})
			.catch((e) => handleErrors(e));
	};

	const handleLogout = async () => {
		await API.logOut();
		setLoggedIn(false);
		setUser(null);
	};

	const createPage = (page) => {
		API.createPage(page)
			.then(() => {})
			.catch((e) => handleErrors(e));
	};

	const editPage = (page) => {
		API.updatePage(page)
			.then(() => {})
			.catch((e) => handleErrors(e));
	};

	const deletePage = (pageId) => {
		API.deletePage(pageId)
			.then(() => {
				API.getPages()
					.then((pages) => {
						setPages(pages);
					})
					.catch((e) => handleErrors(e));
			})
			.catch((e) => handleErrors(e));
	};

	return (
		<BrowserRouter>
			<MessageContext.Provider value={{ handleErrors }}>
				<Container fluid className='p-0'>
					{message && (
						<Container className='below-nav'>
							<Alert variant='danger' onClose={() => setMessage('')} dismissible>
								{message}
							</Alert>
						</Container>
					)}
					<NavigationBar
						logout={handleLogout}
						user={user}
						loggedIn={loggedIn}
						websiteName={websiteName}
					/>

					<Routes>
						<Route path='/'>
							<Route index element={<FrontOfficeLayout pages={pages} setPages={setPages} />} />

							<Route
								path=':pageId'
								element={
									<SinglePageLayout
										pages={pages}
										editPage={editPage}
										deletePage={deletePage}
										setPages={setPages}
									/>
								}
							/>
							<Route
								path='backoffice'
								element={
									loggedIn ? (
										<BackOfficeLayout
											pages={pages}
											setPages={setPages}
											user={user}
											deletePage={deletePage}
										/>
									) : (
										<Navigate replace to='/login' />
									)
								}
							/>
							<Route
								path='backoffice/add'
								element={
									loggedIn ? (
										<AddPageLayout
											pages={pages}
											setPages={setPages}
											user={user}
											createPage={createPage}
										/>
									) : (
										<Navigate replace to='/login' />
									)
								}
							/>
							<Route
								path='backoffice/website-name'
								element={
									loggedIn ? (
										<WebsiteNameLayout
											websiteName={websiteName}
											editWebsiteName={editWebsiteName}
										/>
									) : (
										<Navigate replace to='/login' />
									)
								}
							/>
							<Route
								path='backoffice/:pageId'
								element={
									loggedIn ? (
										<SinglePageLayout editPage={editPage} deletePage={deletePage} user={user} />
									) : (
										<Navigate replace to='/login' />
									)
								}
							/>
							<Route
								path='backoffice/:pageId/edit'
								element={
									loggedIn ? (
										<EditPageLayout editPage={editPage} deletePage={deletePage} user={user} />
									) : (
										<Navigate replace to='/login' />
									)
								}
							/>
							<Route path='*' element={<NotFoundLayout />} />
						</Route>
						<Route
							path='/login'
							element={
								!loggedIn ? <LoginLayout login={handleLogin} /> : <Navigate replace to='/' />
							}
						/>
					</Routes>
				</Container>
			</MessageContext.Provider>
		</BrowserRouter>
	);
}

export default App;
