import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-links">
          <a href="https://www.mahiresort.com/terms-and-conditions" target="_blank" rel="noopener noreferrer">T&C</a>
          <a href="https://www.mahiresort.com/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <a href="https://www.mahiresort.com/refund-policy" target="_blank" rel="noopener noreferrer">Refund Policy</a>
          <a href="https://www.mahiresort.com/" target="_blank" rel="noopener noreferrer">About</a>
          <a href="https://www.mahiresort.com/contact" target="_blank" rel="noopener noreferrer">Contact</a>
        </div>
        <div className="footer-copyright">
          <p className='footer-a'>&copy; 2026 <a href="https://www.mahiresort.com/" target="_blank" rel="noopener noreferrer">Mahi Resort</a>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
