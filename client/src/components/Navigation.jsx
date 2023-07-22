import { Navbar, Nav, Form, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogoutButton, LoginButton } from './Auth';

const NavigationBar = (props) => {
	const navigate = useNavigate();
	const location = useLocation();
	const locationPath = location.pathname;

	let backOffice = '';
	if (locationPath.includes('backoffice')) {
		backOffice = 'Back-Office';
	}

	return (
		<Navbar bg='light' variant='light' fixed='top'>
			<Container className='justify-content-start'>
				<Link to='/' className='router-link'>
					<Navbar.Brand>
						<i className='bi bi-laptop' /> {props.websiteName + ' ' + backOffice}
					</Navbar.Brand>
				</Link>
			</Container>
			<Container className='justify-content-start'></Container>
			<Nav className='justify-content-end'>
				<Form className='mx-5'>
					{props.loggedIn ? (
						<Container className='mx-2'>
							<NavDropdown title={props.user.name} id='basic-nav-dropdown' className='text-center'>
								<NavDropdown.Item onClick={() => navigate('backoffice')} className='text-center'>
									Back-Office
								</NavDropdown.Item>
								{props.user.role === 'Admin' && (
									<NavDropdown.Item
										onClick={() => navigate('backoffice/website-name')}
										className='text-center'
									>
										Edit Website Name
									</NavDropdown.Item>
								)}
								<NavDropdown.Divider />
								<NavDropdown.Item className='text-center'>
									<LogoutButton logout={props.logout} />
								</NavDropdown.Item>
							</NavDropdown>
						</Container>
					) : (
						<LoginButton />
					)}
				</Form>
				<Container />
			</Nav>
		</Navbar>
	);
};

export { NavigationBar };
