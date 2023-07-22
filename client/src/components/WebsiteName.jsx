import { Button, Col, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function WebsiteNameForm(props) {
	const [name, setName] = useState(props.websiteName);
	const navigate = useNavigate();

	const handleSubmit = (event) => {
		event.preventDefault();
		const newName = { name: name };
		props.editWebsiteName(newName);
		navigate('/');
	};

	return (
		<Row className='vh-100 justify-content-center'>
			<Col md={4}>
				<Form onSubmit={handleSubmit} className='justify-content-center'>
					<Form.Group controlId='formBasicEmail' className='mb-3'>
						<Form.Label>
							<h1>Website Name</h1>
						</Form.Label>
						<Form.Control
							type='text'
							placeholder='Enter website name'
							value={name}
							onChange={(ev) => setName(ev.target.value)}
							required
						/>
					</Form.Group>

					<Button variant='primary' type='submit'>
						Change
					</Button>
				</Form>
			</Col>
		</Row>
	);
}

export { WebsiteNameForm };
