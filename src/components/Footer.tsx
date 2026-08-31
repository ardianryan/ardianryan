export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        borderTop: '4px solid var(--black)',
        background: 'var(--white)',
        padding: '30px 24px',
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
          gap: '16px',
          padding: '0',
        }}
      >
        <p style={{ fontWeight: 'bold' }}>
          &copy; {year} Ardian Ryan. All rights reserved.
        </p>
        <p
          className="open-badge"
          style={{
            margin: '0',
            fontWeight: 'bold',
            background: 'var(--pink)',
            color: 'var(--white)',
          }}
        >
          Built with TanStack Start
        </p>
      </div>
    </footer>
  )
}
