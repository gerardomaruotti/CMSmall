import { Container, Col, Button, Card, Row, Dropdown } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

function PagesList(props) {
	const navigate = useNavigate();
	const location = useLocation();
	const isBackOffice = location.pathname.includes('backoffice');
	const user = props.user;

	function filterDrafts() {
		props.getDraftPages().then((drafts) => {
			props.setPages(drafts);
		});
	}

	function filterScheduled() {
		props.getScheduledPages().then((scheduled) => {
			props.setPages(scheduled);
		});
	}

	function filterPublished() {
		props.getPublishedPages().then((published) => {
			props.setPages(published);
		});
	}

	function filterAll() {
		props.getAllPages().then((all) => {
			props.setPages(all);
		});
	}

	return (
		<Container>
			{isBackOffice ? (
				<Row className='top-row-pages-list'>
					<Col className='text-start'>
						<Dropdown>
							<Dropdown.Toggle variant='primary'>
								<i className='bi bi-filter'></i>
							</Dropdown.Toggle>
							<Dropdown.Menu>
								<Dropdown.Item onClick={() => filterAll()}>All</Dropdown.Item>
								<Dropdown.Divider />
								<Dropdown.Item onClick={() => filterPublished()}>Published</Dropdown.Item>
								<Dropdown.Item onClick={() => filterScheduled()}>Scheduled</Dropdown.Item>
								<Dropdown.Item onClick={() => filterDrafts()}>Drafts</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
					</Col>
					<Col></Col>
					<Col className='text-end'>
						<Button variant='primary' className='ml-auto' onClick={() => navigate('add')}>
							<i className='bi bi-plus-lg'></i>
						</Button>
					</Col>
				</Row>
			) : (
				<> </>
			)}
			<Row xs={1} className='g-3 card-list'>
				{Array.from(props.pages).map((page) => (
					<Col key={page.id}>
						<Card border='primary' className=''>
							<Card.Body>
								<Row>
									<Col>
										<Card.Title>{page.title}</Card.Title>
										<Card.Text>{page.author}</Card.Text>
										<Card.Text>
											{page.publication_date ? page.publication_date.format('YYYY-MM-DD') : 'Draft'}
										</Card.Text>
									</Col>
									<Col className='text-end'>
										{isBackOffice && (user.role === 'Admin' || user.name === page.author) ? (
											<Container>
												<Button
													className='pages-list-buttons'
													variant='danger'
													onClick={() => {
														props.deletePage(page.id);
														navigate('/backoffice');
													}}
												>
													<i className='bi bi-trash-fill'></i>
												</Button>

												<Button
													className='pages-list-buttons'
													variant='primary'
													onClick={() => navigate(`${page.id}/edit`)}
												>
													<i className='bi bi-pencil-square'></i>
												</Button>
												<Button
													variant='primary'
													onClick={() => navigate(`/backoffice/${page.id}`)}
												>
													<i className='bi bi-arrow-right'></i>
												</Button>
											</Container>
										) : (
											<Button variant='primary' onClick={() => navigate(`/${page.id}`)}>
												<i className='bi bi-arrow-right'></i>
											</Button>
										)}
									</Col>
								</Row>
							</Card.Body>
						</Card>
					</Col>
				))}
			</Row>
		</Container>
	);
}

export { PagesList };
