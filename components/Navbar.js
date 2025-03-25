import { useState } from "react";
import Link from "next/link";

export default function Navbar({ onUploadClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-logo">Pixaia</Link>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>
      <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <li><button onClick={onUploadClick} className="upload-nav-btn">Upload</button></li>
      </ul>
    </nav>
  );
}
