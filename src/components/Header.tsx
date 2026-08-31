import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="nav-bar">
      <Link
        to="/"
        className="stroke-text logo-text"
        style={{
          textDecoration: 'none',
          letterSpacing: '-0.05em',
        }}
      >
        ARDIAN RYAN
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <nav style={{ display: 'flex', gap: '6px', fontWeight: 'bold' }}>
          <Link
            to="/"
            className="nav-link"
            style={{
              textDecoration: 'none',
              color: 'var(--black)',
              padding: '6px 10px',
              border: '2px solid transparent',
              borderRadius: '6px',
            }}
            activeProps={{
              style: {
                background: 'var(--yellow)',
                border: '2px solid var(--black)',
                boxShadow: '2px 2px 0px var(--black)',
              },
            }}
          >
            Home
          </Link>
          <Link
            to="/about"
            className="nav-link"
            style={{
              textDecoration: 'none',
              color: 'var(--black)',
              padding: '6px 10px',
              border: '2px solid transparent',
              borderRadius: '6px',
            }}
            activeProps={{
              style: {
                background: 'var(--pink)',
                color: 'var(--white)',
                border: '2px solid var(--black)',
                boxShadow: '2px 2px 0px var(--black)',
              },
            }}
          >
            About
          </Link>
          <a
            href="mailto:me@ardianryan.com"
            className="nav-link"
            style={{
              textDecoration: 'none',
              color: 'var(--black)',
              padding: '6px 12px',
              border: '2px solid var(--black)',
              borderRadius: '6px',
              background: 'var(--lime)',
              boxShadow: '2px 2px 0px var(--black)',
              fontSize: '0.9rem',
            }}
          >
            Contact
          </a>
        </nav>

        <ThemeToggle />
      </div>
    </header>
  )
}
