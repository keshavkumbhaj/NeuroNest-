function Topbar() {
  return (
    <header className="topbar">
      <a href="#" className="brand" aria-label="NeuroNest home">
        <span className="brand-icon">✦</span>
        <span>NeuroNest</span>
      </a>

      <nav className="nav-links" aria-label="Primary navigation">
        <a href="#progress">Dashboard</a>
        <a href="#progress">Progress</a>
        <a href="#coach">AI Coach</a>
      </nav>
    </header>
  );
}

export default Topbar;
