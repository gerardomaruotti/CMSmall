import {
	Button,
	Col,
	Container,
	Image,
	Row,
	Form,
	FloatingLabel,
	Dropdown,
	Alert,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import dayjs from 'dayjs';

function PageView(props) {
	const navigate = useNavigate();
	const page = props.page;
	const { user } = props;

	return (
		<Container className='text-center'>
			<Row>
				<Col xs={2} className='text-start page-buttons'>
					<Button variant='outline-primary' onClick={() => navigate(-1)}>
						<i className='bi bi-arrow-left'></i>
					</Button>
				</Col>
				<Col xs={8}>
					<h1>{page.title}</h1>
					<strong>{'Author: ' + page.author}</strong>
					<Row className='mb-3'>
						<Col>
							<strong>Creation Date: </strong>
							{page.creation_date.format('YYYY-MM-DD')}
						</Col>
						<Col>
							<strong>Publication Date: </strong>
							{page.publication_date ? page.publication_date.format('YYYY-MM-DD') : 'Draft'}
						</Col>
					</Row>
					<Row>
						{Array.from(page.content).map((content, index) =>
							content.type === 'Header' ? (
								<h2 key={index}>{content.body}</h2>
							) : content.type === 'Paragraph' ? (
								<p key={index}>{content.body}</p>
							) : content.type === 'Image' ? (
								<Image
									key={index}
									src={'/' + content.body + '.jpg'}
									alt={content.body}
									className='page-img'
									rounded
								/>
							) : (
								''
							)
						)}
					</Row>
				</Col>
				<Col xs={2} className='text-end'>
					{user === undefined ? (
						<></>
					) : user.role === 'Admin' || user.name === page.author ? (
						<Container>
							<Col className='page-buttons'>
								<Button
									variant='outline-primary'
									onClick={() => navigate(`/backoffice/${page.id}/edit`)}
								>
									<i className='bi bi-pencil-square'></i>
								</Button>
							</Col>
							<Col className='form-buttons'>
								<Button
									variant='outline-danger'
									onClick={() => {
										props.deletePage(page.id);
										navigate('/backoffice');
									}}
								>
									<i className='bi bi-trash-fill'></i>
								</Button>
							</Col>
						</Container>
					) : (
						<Container></Container>
					)}
				</Col>
			</Row>
		</Container>
	);
}

function PageForm(props) {
	const [errors, setErrors] = useState([]);
	const navigate = useNavigate();
	const { user } = props;
	const [page, setPage] = useState(props.page ? props.page : null);
	const [title, setTitle] = useState(page ? page.title : '');
	const [author, setAuthor] = useState(page ? page.author : user.name);
	const [content, setContent] = useState(
		page
			? page.content
			: [
					{ type: 'Header', body: '' },
					{ type: 'Paragraph', body: '' },
			  ]
	);
	const [publication_date, set_publication_date] = useState(page ? page.publication_date : null);
	const creation_date = page ? page.creation_date : dayjs();
	const images = [
		{ id: 0, src: '/Image_0.jpg' },
		{ id: 1, src: '/Image_1.jpg' },
		{ id: 2, src: '/Image_2.jpg' },
		{ id: 3, src: '/Image_3.jpg' },
		{ id: 4, src: '/Image_4.jpg' },
		{ id: 5, src: '/Image_5.jpg' },
		{ id: 6, src: '/Image_6.jpg' },
		{ id: 7, src: '/Image_7.jpg' },
		{ id: 8, src: '/Image_8.jpg' },
		{ id: 9, src: '/Image_9.jpg' },
	];

	function validateContent() {
		let contentTypes = 0;
		const hasHeader = content.some((section) => section.type === 'Header');
		const hasParagraph = content.some((section) => section.type === 'Paragraph');
		const hasImage = content.some((section) => section.type === 'Image');
		const hasInvalidText = content.some((section) => section.body.includes('\n'));
		const isPublicationPriorToCreation =
			publication_date !== null && publication_date.isBefore(creation_date, 'day');
		const newErrors = [];

		if (isPublicationPriorToCreation) {
			newErrors.push(
				`Publication date cannot be prior to creation date! (${creation_date.format('YYYY-MM-DD')})`
			);
		}
		if (!hasHeader) {
			newErrors.push('There must be at least one header');
		} else {
			contentTypes++;
		}
		if (hasParagraph) {
			contentTypes++;
		}
		if (hasImage) {
			contentTypes++;
		}
		if (contentTypes < 2) {
			newErrors.push('There must be at least one header and another type of block!');
		}
		if (hasInvalidText) {
			const newContent = content.map((section) => {
				section.body = section.body.replace(/\n/g, ' ');
				return section;
			});
			setContent(newContent);
		}
		setErrors(newErrors);

		return newErrors.length === 0;
	}

	function moveSectionUp(index) {
		if (index > 0) {
			const newContent = [...content];
			const temp = newContent[index];
			newContent[index] = newContent[index - 1];
			newContent[index - 1] = temp;
			setContent(newContent);
		}
	}

	function moveSectionDown(index) {
		if (index < content.length - 1) {
			const newContent = [...content];
			const temp = newContent[index];
			newContent[index] = newContent[index + 1];
			newContent[index + 1] = temp;
			setContent(newContent);
		}
	}

	function updateContent(event, index, type) {
		const newContent = [...content];
		newContent[index] = { type: type, body: event.target.value };
		setContent(newContent);
	}

	function handlePublicationDate(event) {
		if (event.target.value === '') {
			set_publication_date(null);
		} else if (dayjs(event.target.value).isValid()) {
			set_publication_date(dayjs(event.target.value));
		} else {
			set_publication_date(null);
		}
	}

	function deleteSection(index) {
		const newContent = content.filter((_, i) => i !== index);
		setContent(newContent);
	}

	function handleSubmit(event) {
		event.preventDefault();
		const new_page = {
			id: page ? page.id : null,
			title: title,
			creation_date: page ? page.creation_date : null,
			publication_date: publication_date,
			author: author,
			content: content,
		};
		if (validateContent()) {
			page ? props.editPage(new_page) : props.createPage(new_page);
			navigate('/backoffice');
		}
	}

	return (
		<Container fluid className='text-center'>
			<Row>
				<Col></Col>
				<Col xs={10}>
					<Form onSubmit={handleSubmit}>
						{errors.length > 0 && (
							<Alert variant='danger'>
								{errors.map((error, index) => (
									<div key={index}>{error}</div>
								))}
							</Alert>
						)}
						<Container className='mb-3'>
							<strong>Creation Date:</strong> {creation_date.format('YYYY-MM-DD')}
						</Container>
						<Form.Group className='mb-3'>
							<FloatingLabel label='Title'>
								<Form.Control
									type='text'
									placeholder='Title'
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									required
								/>
							</FloatingLabel>
						</Form.Group>

						<Row>
							{user && user.role === 'Admin' ? (
								<Col>
									<Form.Group className='mb-3'>
										<FloatingLabel label='Author'>
											<Form.Select
												aria-label='Author Selection'
												onChange={(e) => setAuthor(e.target.value)}
											>
												<option>{author}</option>
												{author !== 'admin' ? <option value='admin'>admin</option> : <></>}
												{author !== 'user1' ? <option value='user1'>user1</option> : <></>}
												{author !== 'user2' ? <option value='user2'>user2</option> : <></>}
												{author !== 'user3' ? <option value='user3'>user3</option> : <></>}
											</Form.Select>
										</FloatingLabel>
									</Form.Group>
								</Col>
							) : (
								<></>
							)}
							<Col>
								<Form.Group className='mb-3'>
									<FloatingLabel label='Publication Date'>
										<Form.Control
											type='date'
											placeholder='Publication Date'
											value={publication_date ? dayjs(publication_date).format('YYYY-MM-DD') : ''}
											onChange={(e) => handlePublicationDate(e)}
										/>
									</FloatingLabel>
								</Form.Group>
							</Col>
						</Row>
						{Array.from(content).map((section, index) =>
							section.type === 'Header' ? (
								<Row className='align-items-center' key={'Row-' + index}>
									<Col xs={1}>
										<Button
											variant='outline-primary'
											disabled={index === 0}
											onClick={() => moveSectionUp(index)}
										>
											<i className='bi bi-arrow-up'></i>
										</Button>
									</Col>
									<Col xs={1}>
										<Button
											variant='outline-primary'
											disabled={index === content.length - 1}
											onClick={() => moveSectionDown(index)}
										>
											<i className='bi bi-arrow-down'></i>
										</Button>
									</Col>
									<Col key={'formHeader' + index}>
										<Form.Group className='mb-3'>
											<FloatingLabel label='Header'>
												<Form.Control
													required
													type='text'
													value={section.body}
													onChange={(e) => updateContent(e, index, 'Header')}
												/>
											</FloatingLabel>
										</Form.Group>
									</Col>
									<Col xs={1}>
										<Button variant='outline-danger' onClick={() => deleteSection(index)}>
											<i className='bi bi-trash-fill'></i>
										</Button>
									</Col>
								</Row>
							) : section.type === 'Paragraph' ? (
								<Row key={'Row-' + index}>
									<Col xs={1}>
										<Button
											variant='outline-primary'
											disabled={index === 0}
											onClick={() => moveSectionUp(index)}
										>
											<i className='bi bi-arrow-up'></i>
										</Button>
									</Col>
									<Col xs={1}>
										<Button
											variant='outline-primary'
											disabled={index === content.length - 1}
											onClick={() => moveSectionDown(index)}
										>
											<i className='bi bi-arrow-down'></i>
										</Button>
									</Col>
									<Col key={'formParagraph' + index}>
										<Form.Group className='mb-3'>
											<FloatingLabel label='Paragraph'>
												<Form.Control
													required
													as='textarea'
													rows='auto'
													type='text'
													value={section.body}
													placeholder='Content'
													onChange={(e) => updateContent(e, index, 'Paragraph')}
												/>
											</FloatingLabel>
										</Form.Group>
									</Col>
									<Col xs={1}>
										<Button variant='outline-danger' onClick={() => deleteSection(index)}>
											<i className='bi bi-trash-fill'></i>
										</Button>
									</Col>
								</Row>
							) : section.type === 'Image' ? (
								<Row key={'Row-' + index}>
									<Col xs={1}>
										<Button
											variant='outline-primary'
											disabled={index === 0}
											onClick={() => moveSectionUp(index)}
										>
											<i className='bi bi-arrow-up'></i>
										</Button>
									</Col>
									<Col xs={1}>
										<Button
											variant='outline-primary'
											disabled={index === content.length - 1}
											onClick={() => moveSectionDown(index)}
										>
											<i className='bi bi-arrow-down'></i>
										</Button>
									</Col>
									<Col key={'formImage' + index}>
										<Form.Group>
											<Row className='d-flex align-items-center'>
												<Col xs={1}>
													{section.body && (
														<Image
															src={'/' + section.body + '.jpg'}
															alt='Selected photo'
															className='me-3'
															style={{ height: '50px' }}
														/>
													)}
												</Col>
												<Col>
													<FloatingLabel label='Image'>
														<Form.Select
															aria-label='Select photo'
															onChange={(e) => updateContent(e, index, 'Image')}
															value={section.body}
														>
															<option>{'Select an Image'}</option>
															{images.map((image) => (
																<option key={image.id} value={image.src.substring(1).slice(0, -4)}>
																	{image.src.substring(1).slice(0, -4)}
																</option>
															))}
														</Form.Select>
													</FloatingLabel>
												</Col>
											</Row>
										</Form.Group>
									</Col>
									<Col xs={1} className='form-buttons'>
										<Button variant='outline-danger' onClick={() => deleteSection(index)}>
											<i className='bi bi-trash-fill'></i>
										</Button>
									</Col>
								</Row>
							) : (
								''
							)
						)}
						<Row className='form-buttons'>
							<Col>
								<Button variant='outline-danger' onClick={() => navigate(-1)}>
									Cancel
								</Button>
							</Col>
							<Col>
								<Dropdown>
									<Dropdown.Toggle variant='outline-primary'>Add</Dropdown.Toggle>
									<Dropdown.Menu>
										<Dropdown.Item
											onClick={() => setContent([...content, { type: 'Header', body: '' }])}
										>
											Header
										</Dropdown.Item>
										<Dropdown.Item
											onClick={() => setContent([...content, { type: 'Paragraph', body: '' }])}
										>
											Paragraph
										</Dropdown.Item>
										<Dropdown.Item
											onClick={() => setContent([...content, { type: 'Image', body: '' }])}
										>
											Image
										</Dropdown.Item>
									</Dropdown.Menu>
								</Dropdown>
							</Col>
							<Col>
								<Button variant='success' type='submit'>
									Done
								</Button>
							</Col>
						</Row>
					</Form>
				</Col>
				<Col></Col>
			</Row>
		</Container>
	);
}

export { PageView as PageComponent, PageForm };
