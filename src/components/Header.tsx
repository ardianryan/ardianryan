import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="nav-bar">
      <Link
        to="/"
        className="stroke-text"
        style={{
          fontSize: '1.5rem',
          textDecoration: 'none',
          letterSpacing: '-0.05em',
        }}
      >
        ARDIAN RYAN
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <nav style={{ display: 'flex', gap: '16px', fontWeight: 'bold' }}>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              color: 'var(--black)',
              padding: '6px 12px',
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
            style={{
              textDecoration: 'none',
              color: 'var(--black)',
              padding: '6px 12px',
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
        </nav>

        <ThemeToggle />
      </div>
    </header>
  )
}
