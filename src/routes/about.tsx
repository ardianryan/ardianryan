import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <div className="container">
      <h1
        className="stroke-text"
        style={{
          fontSize: '3.5rem',
          textAlign: 'center',
          marginBottom: '40px',
          transform: 'rotate(-1.5deg)',
        }}
      >
        ABOUT THE ENGINEER
      </h1>

      <div className="bento-grid">
        {/* Education note */}
        <div className="col-6">
          <div className="paper-note paper-note-pink" style={{ height: '100%', transform: 'rotate(-0.5deg)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--pink)', marginBottom: '12px' }}>
              🎓 EDUCATION & TEACHING
            </h3>
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
              SMA Negeri 1 Gedeg (Surabaya, Indonesia)
            </p>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: '#444' }}>
              Active in the educational sector as an informatics teacher. I combine hands-on network lab training with modern programming methodologies (like React and Node.js) to teach students how the modern web and network stack work in synchronization.
            </p>
          </div>
        </div>

        {/* Credentials sticker */}
        <div className="col-6">
          <div className="sticker" style={{ height: '100%', background: 'var(--yellow)', transform: 'rotate(0.5deg)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '12px' }}>
              🔐 CREDENTIALS
            </h3>
            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>
              MikroTik Certified Professional
            </p>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: '#333', marginBottom: '12px' }}>
              Holding certified network engineering competencies to configure, diagnose, and optimize enterprise network infrastructures. Expert in structuring firewall security layers, traffic shapes, and VPN backbones.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="tech-badge" style={{ background: '#fff' }}>RouterOS</span>
              <span className="tech-badge" style={{ background: '#fff' }}>BGP Routing</span>
              <span className="tech-badge" style={{ background: '#fff' }}>QoS Bandwidth</span>
            </div>
          </div>
        </div>

        {/* Work experience sticker */}
        <div className="col-12" style={{ marginTop: '20px' }}>
          <div className="sticker" style={{ background: 'var(--white)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '16px' }}>
              💼 PROFESSIONAL JOURNEY
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ borderLeft: '4px solid var(--pink)', paddingLeft: '16px' }}>
                <h4 style={{ fontWeight: 'bold', fontSize: '1.15rem' }}>
                  IT Technician & Network Engineer — PPTI
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '6px' }}>
                  Active Position
                </p>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: '#444' }}>
                  Overseeing server deployments, client station connections, and local area network policies. Managing active server virtualizations, Docker container services, and proxy routers mapping internal systems to the web securely.
                </p>
              </div>

              <div style={{ borderLeft: '4px solid var(--yellow)', paddingLeft: '16px' }}>
                <h4 style={{ fontWeight: 'bold', fontSize: '1.15rem' }}>
                  Open Source Systems Contributor
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '6px' }}>
                  Freelance / Independent
                </p>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: '#444' }}>
                  Authoring and maintaining educational and web-based POS utilities like SIEKSA V3 and ScholarGate to help schools throughout Indonesia digitize their administration, student verification, and transaction segments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
