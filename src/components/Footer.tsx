export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        borderTop: '4px solid var(--black)',
        background: 'var(--white)',
        padding: '36px 24px',
        marginTop: '80px',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          padding: '0',
        }}
      >
        <div>
          <p style={{ fontWeight: 'bold', fontSize: '1rem', margin: '0 0 6px 0' }}>
            &copy; {year} Ardian Ryan. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
            <a
              href="mailto:me@ardianryan.com"
              style={{ color: 'var(--text-main)', fontWeight: 'bold', textDecoration: 'underline' }}
            >
              me@ardianryan.com
            </a>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <a
              href="https://github.com/ardianryan"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-main)', fontWeight: 'bold', textDecoration: 'underline' }}
            >
              github.com/ardianryan
            </a>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span style={{ color: 'var(--text-muted)' }}>Mojokerto, East Java, Indonesia</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <a
            href="mailto:me@ardianryan.com"
            className="sticker-btn"
            style={{
              background: 'var(--lime)',
              color: '#000',
              padding: '8px 18px',
              fontSize: '0.85rem',
              textDecoration: 'none',
            }}
          >
            ✉ Get in Touch
          </a>
        </div>
      </div>
    </footer>
  )
}
