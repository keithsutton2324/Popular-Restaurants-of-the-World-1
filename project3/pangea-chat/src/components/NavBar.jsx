import React from 'react';
import { Navbar, Button } from 'react-bootstrap';

const NavBar = () => {

window.onload = () => {
   const logOut = document.querySelector(".log-out");
   logOut.addEventListener('click', () => {
       localStorage.clear();
       window.location.reload();
   });
  };

return (

    <>
        <Navbar bg="light" style={{justifyContent: 'space-between'}}>
            <Navbar.Brand href="#home">
                🌎
            </Navbar.Brand>
            <div>
                <h1 className="pangea">Pangea</h1>
            </div>
            <Button variant="outline-danger" className="log-out" >Log Out</Button>{' '}
        </Navbar>
    </>

);
};

export default NavBar;