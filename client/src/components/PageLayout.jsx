import { LoginForm } from './Auth';
import { WebsiteNameForm } from './WebsiteName';
import { React, useContext, useState, useEffect } from 'react';
import { Row, Col, Button, Container, Spinner } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { PagesList } from './PagesList';
import { PageComponent, PageForm } from './PageForm';
import MessageContext from '../messageCtx';
import API from '../API';

function FrontOfficeLayout(props) {
	const { handleErrors } = useContext(MessageContext);

	useEffect(() => {
		API.getPublishedPages()
			.then((pages) => {
				props.setPages(pages);
			})
			.catch((e) => {
				handleErrors(e);
			});
	}, []);

	return (
		<Row className='below-nav'>
			<PagesList pages={props.pages} />
		</Row>
	);
}

function BackOfficeLayout(props) {
	const { handleErrors } = useContext(MessageContext);

	useEffect(() => {
		API.getPages()
			.then((pages) => {
				props.setPages(pages);
			})
			.catch((e) => {
				handleErrors(e);
			});
	}, []);

	return (
		<Row className='below-nav'>
			<PagesList
				pages={props.pages}
				setPages={props.setPages}
				getDraftPages={API.getDraftPages}
				getScheduledPages={API.getScheduledPages}
				getPublishedPages={API.getPublishedPages}
				getAllPages={API.getPages}
				user={props.user}
				deletePage={props.deletePage}
			/>
		</Row>
	);
}
function NotFoundLayout() {
	return (
		<Container className='text-center'>
			<Row className=' '>
				<Col md={12} className='below-nav'>
					<h2>Error! Resource Not Found</h2>
					<Link to='/'>
						<Button variant='primary'>Home</Button>
					</Link>
				</Col>
			</Row>
		</Container>
	);
}

function LoginLayout(props) {
	return (
		<Row>
			<Col md={12} className='below-nav'>
				<LoginForm login={props.login} />
			</Col>
		</Row>
	);
}

function WebsiteNameLayout(props) {
	return (
		<Row>
			<Col md={12} className='below-nav text-center'>
				<WebsiteNameForm
					websiteName={props.websiteName}
					setWebsiteName={props.setWebsiteName}
					editWebsiteName={props.editWebsiteName}
				/>
			</Col>
		</Row>
	);
}

function LoadingLayout() {
	return (
		<Row>
			<Col></Col>
			<Col className='below-nav text-center'>
				<Spinner animation='border' />
			</Col>
			<Col></Col>
		</Row>
	);
}

function SinglePageLayout(props) {
	const { handleErrors } = useContext(MessageContext);
	const { pageId } = useParams();
	const [page, setPage] = useState(null);

	useEffect(() => {
		API.getPage(pageId)
			.then((page) => {
				setPage(page);
			})
			.catch((e) => {
				handleErrors(e);
			});
	}, [pageId]);

	return page ? (
		<Row>
			<Col md={12} className='below-nav'>
				<PageComponent
					page={page}
					editPage={props.editPage}
					deletePage={props.deletePage}
					user={props.user}
				/>
			</Col>
		</Row>
	) : (
		<LoadingLayout />
	);
}

function EditPageLayout(props) {
	const { handleErrors } = useContext(MessageContext);
	const { pageId } = useParams();
	const [page, setPage] = useState(null);

	useEffect(() => {
		API.getPage(pageId)
			.then((page) => {
				setPage(page);
			})
			.catch((e) => {
				handleErrors(e);
			});
	}, [pageId]);

	return page ? (
		<Row>
			<Col md={12} className='below-nav'>
				<PageForm
					page={page}
					editPage={props.editPage}
					deletePage={props.deletePage}
					user={props.user}
				/>
			</Col>
		</Row>
	) : (
		<LoadingLayout />
	);
}

function AddPageLayout(props) {
	return (
		<Row>
			<Col md={12} className='below-nav'>
				<PageForm createPage={props.createPage} user={props.user} />
			</Col>
		</Row>
	);
}

export {
	NotFoundLayout,
	LoginLayout,
	LoadingLayout,
	WebsiteNameLayout,
	FrontOfficeLayout,
	BackOfficeLayout,
	SinglePageLayout,
	EditPageLayout,
	AddPageLayout,
};
