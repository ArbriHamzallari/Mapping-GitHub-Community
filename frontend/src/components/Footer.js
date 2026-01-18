import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <p className="footer-text">
        Cosmic Network Explorer &copy; {new Date().getFullYear()} | 
        Mapping GitHub Community Constellations
      </p>
    </footer>
  );
}

export default Footer;
