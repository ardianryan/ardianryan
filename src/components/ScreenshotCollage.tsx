import { useState } from 'react'
import type { Screenshot } from '../data/provider'

interface ScreenshotCollageProps {
  projectId?: string
  screenshots?: Screenshot[]
}

export default function ScreenshotCollage({ screenshots = [] }: ScreenshotCollageProps) {
  const [activeId, setActiveId] = useState<string>(screenshots[0]?.id || '')

  if (screenshots.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', border: '3px dashed var(--black)', borderRadius: '10px' }}>
        <p style={{ fontWeight: 'bold' }}>No screenshot assets configured for this project.</p>
      </div>
    )
  }

  const activeScreenshot = screenshots.find((s) => s.id === activeId) || screenshots[0]

  // Render high-fidelity simulated web layouts using CSS when image files are not yet uploaded
  const renderSimulatedUI = (id: string) => {
    switch (id) {
      // AKAS V2 Mockups
      case 'dash':
        return (
          <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--black)' }}>
            <div style={{ background: 'var(--black)', color: '#fff', padding: '4px 8px', borderRadius: '4px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span> akas-v2://dashboard</span>
              <span>v2.0.4</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '10px' }}>
              <div style={{ border: '2px solid #000', padding: '6px', background: 'var(--lime)', textAlign: 'center', fontWeight: 'bold' }}>
                Present<br />1,192
              </div>
              <div style={{ border: '2px solid #000', padding: '6px', background: 'var(--yellow)', textAlign: 'center', fontWeight: 'bold' }}>
                Late<br />48
              </div>
              <div style={{ border: '2px solid #000', padding: '6px', background: 'var(--pink)', color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
                Absent<br />0
              </div>
            </div>
            <div style={{ border: '2px solid #000', padding: '8px', background: '#fff', borderRadius: '4px' }}>
              <strong style={{ color: 'var(--pink)' }}>[System Log]</strong> Gate RFID reader connected.<br />
              <strong style={{ color: 'var(--black)' }}>[07:15]</strong> RFID Student ID *4920 registered.<br />
              <strong style={{ color: 'var(--black)' }}>[07:18]</strong> RFID Student ID *3921 registered.
            </div>
          </div>
        )
      case 'logs':
        return (
          <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--black)' }}>
            <div style={{ background: 'var(--black)', color: '#fff', padding: '4px 8px', borderRadius: '4px', marginBottom: '8px' }}>
              [LOG] gate_incident_ledger_2026.csv
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', background: '#fff' }}>
              <thead>
                <tr style={{ background: 'var(--yellow)', borderBottom: '2px solid #000' }}>
                  <th style={{ padding: '4px', textAlign: 'left', borderRight: '1px solid #000' }}>Time</th>
                  <th style={{ padding: '4px', textAlign: 'left', borderRight: '1px solid #000' }}>Student</th>
                  <th style={{ padding: '4px', textAlign: 'left' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #000' }}>
                  <td style={{ padding: '4px', borderRight: '1px solid #000' }}>07:32</td>
                  <td style={{ padding: '4px', borderRight: '1px solid #000' }}>M. Farhan</td>
                  <td style={{ padding: '4px', color: 'red', fontWeight: 'bold' }}>LATE (12m)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #000' }}>
                  <td style={{ padding: '4px', borderRight: '1px solid #000' }}>07:35</td>
                  <td style={{ padding: '4px', borderRight: '1px solid #000' }}>Alya S.</td>
                  <td style={{ padding: '4px', color: 'red', fontWeight: 'bold' }}>LATE (15m)</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px', borderRight: '1px solid #000' }}>07:42</td>
                  <td style={{ padding: '4px', borderRight: '1px solid #000' }}>Budi T.</td>
                  <td style={{ padding: '4px', color: 'red', fontWeight: 'bold' }}>LATE (22m)</td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      case 'schema':
        return (
          <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--black)' }}>
            <div style={{ border: '2px dashed #000', padding: '10px', background: 'var(--white)', borderRadius: '6px' }}>
              <h5 style={{ fontWeight: 'bold', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
                [STORAGE] Cloudflare R2 Assets Bucket
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>bucket/avatar-student-photos/</div>
                <div style={{ color: '#666', paddingLeft: '12px' }}>
                  ├── student_104920_thumb.webp<br />
                  ├── student_103921_thumb.webp<br />
                  └── student_108422_thumb.webp
                </div>
                <div style={{ background: 'var(--lime)', padding: '4px', border: '1px solid #000', marginTop: '6px', fontSize: '0.7rem' }}>
                  API Endpoint: r2.akas.ppti.me
                </div>
              </div>
            </div>
          </div>
        )

      // SATENYA MAMA LOESYE Mockups
      case 'cashier':
        return (
          <div style={{ fontFamily: 'sans-serif', fontSize: '0.8rem', color: 'var(--black)' }}>
            <div style={{ border: '2px solid #000', borderRadius: '6px', background: '#fff', overflow: 'hidden' }}>
              <div style={{ background: 'var(--pink)', color: '#fff', padding: '6px 10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                <span>SATENYA POS Cashier Terminal</span>
                <span>Active Table: 04</span>
              </div>
              <div style={{ padding: '10px' }}>
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '8px' }}>
                  • 10 Sate Ayam Madura (Rp 25.000)<br />
                  • 5 Sate Kambing Solo (Rp 20.000)<br />
                  • 2 Es Teh Manis (Rp 8.000)
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px' }}>
                  <span>Total Due:</span>
                  <span>Rp 53,000</span>
                </div>
                <button style={{ width: '100%', background: 'var(--lime)', border: '2px solid #000', padding: '6px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '2px 2px 0px #000' }}>
                  GENERATE QRIS BILL
                </button>
              </div>
            </div>
          </div>
        )
      case 'kitchen':
        return (
          <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--black)' }}>
            <div style={{ background: 'var(--black)', color: 'var(--white)', padding: '4px 8px', borderRadius: '4px', marginBottom: '8px', fontWeight: 'bold' }}>
              [LIVE] KITCHEN DISPLAY MONITOR
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              <div style={{ border: '2px solid #000', padding: '6px', background: 'var(--yellow)', borderRadius: '4px' }}>
                <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '4px' }}>ORD #092</div>
                10x Sate Kambing<br />
                <span style={{ color: 'red', fontWeight: 'bold' }}>[PENDING 8m]</span>
              </div>
              <div style={{ border: '2px solid #000', padding: '6px', background: 'var(--lime)', borderRadius: '4px' }}>
                <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '4px' }}>ORD #091</div>
                5x Sate Ayam<br />
                <span style={{ color: 'green', fontWeight: 'bold' }}>[READY TO SERVE]</span>
              </div>
            </div>
          </div>
        )
      case 'qris':
        return (
          <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
            <div style={{ border: '2px solid #000', padding: '10px', background: '#fff', display: 'inline-block', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.75rem', marginBottom: '6px' }}>QRIS DYNAMIC GATEWAY</div>
              {/* Simulated QR Code outline */}
              <div style={{ width: '80px', height: '80px', border: '4px solid #000', margin: '0 auto 6px', background: 'repeating-conic-gradient(from 0deg, #000 0deg 90deg, #fff 90deg 180deg) 0 0/16px 16px' }} />
              <div style={{ fontSize: '0.7rem', background: 'var(--yellow)', padding: '2px 4px', border: '1px solid #000', display: 'inline-block' }}>
                POLL STATUS: AWAITING PAYMENT
              </div>
            </div>
          </div>
        )

      // SCHOLARGATE Mockups
      case 'auth':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'sans-serif', fontSize: '0.8rem' }}>
            <div style={{ border: '2px solid #000', padding: '15px', background: '#fff', borderRadius: '8px', boxShadow: '3px 3px 0px #000', width: '90%' }}>
              <div style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '12px', fontSize: '0.9rem' }}>
                ScholarGate Single Sign-On
              </div>
              <button style={{ width: '100%', background: '#fff', border: '2px solid #000', padding: '6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}>
                Log in with Google Account
              </button>
              <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#666', marginTop: '10px' }}>
                Redirecting to secure callback router
              </div>
            </div>
          </div>
        )
      case 'config':
        return (
          <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--black)' }}>
            <div style={{ background: 'var(--black)', color: '#fff', padding: '4px 8px', borderRadius: '4px', marginBottom: '8px' }}>
              [CONFIG] database.config.json
            </div>
            <div style={{ border: '2px dashed #000', padding: '8px', background: 'var(--white)', overflowX: 'auto' }}>
              <span style={{ color: 'var(--pink)' }}>"connection"</span>: &#123;<br />
              &nbsp;&nbsp;<span style={{ color: 'var(--yellow)' }}>"driver"</span>: "postgresql",<br />
              &nbsp;&nbsp;<span style={{ color: 'var(--yellow)' }}>"host"</span>: "scholargate-db-node",<br />
              &nbsp;&nbsp;<span style={{ color: 'var(--yellow)' }}>"port"</span>: 5432,<br />
              &nbsp;&nbsp;<span style={{ color: 'var(--yellow)' }}>"fallback"</span>: "sqlite_local"<br />
              &#125;
            </div>
          </div>
        )

      // SIEKSA V3 Mockups
      case 'members':
        return (
          <div style={{ fontFamily: 'sans-serif', fontSize: '0.75rem', color: 'var(--black)' }}>
            <div style={{ background: 'var(--black)', color: '#fff', padding: '4px 8px', borderRadius: '4px', marginBottom: '6px', fontWeight: 'bold' }}>
              [ROSTER] Student Roster - OSIS Group
            </div>
            <div style={{ border: '2px solid #000', background: '#fff', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ borderBottom: '1px solid #000', padding: '4px', display: 'flex', justifyContent: 'space-between', background: '#eee' }}>
                <strong>Student Name</strong>
                <strong>Role</strong>
              </div>
              <div style={{ padding: '4px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                <span>Aldi Hermawan</span>
                <span className="open-badge" style={{ padding: '2px 4px', fontSize: '0.65rem' }}>PRESIDENT</span>
              </div>
              <div style={{ padding: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Siti Aminah</span>
                <span className="open-badge" style={{ padding: '2px 4px', fontSize: '0.65rem', background: 'var(--yellow)' }}>SECRETARY</span>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>[ Simulated Screenshot Interface ]</p>
            <p style={{ fontSize: '0.8rem' }}>Image placeholder for path ID: {id}</p>
          </div>
        )
    }
  }

  return (
    <div className="bento-grid" style={{ gap: '16px' }}>
      {/* Active Screen Frame (Desktop: col-7, Mobile: col-12) */}
      <div
        className="col-7"
        style={{
          border: '4px solid var(--black)',
          borderRadius: '16px',
          background: 'var(--white)',
          padding: '20px 16px',
          boxShadow: '6px 6px 0px var(--black)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '300px',
        }}
      >
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {activeScreenshot.imageUrl ? (
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '8px',
                border: '2px solid var(--black)',
                background: '#1a1a1a',
                textAlign: 'center',
              }}
            >
              <img
                src={activeScreenshot.imageUrl}
                alt={activeScreenshot.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '340px',
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
            </div>
          ) : (
            renderSimulatedUI(activeId)
          )}
        </div>

        {/* Paper Cutout Label underneath screenshot */}
        {activeScreenshot && (
          <div
            style={{
              marginTop: '16px',
              borderTop: '2px dashed var(--black)',
              paddingTop: '12px',
              fontFamily: 'sans-serif',
            }}
          >
            <h5 style={{ fontWeight: 'bold', margin: '0 0 4px 0', fontSize: '0.95rem' }}>
              {activeScreenshot.title}
            </h5>
            <p style={{ fontSize: '0.85rem', color: '#555', margin: '0', lineHeight: '1.4' }}>
              {activeScreenshot.desc}
            </p>
          </div>
        )}
      </div>

      {/* Selectable collage grid / filmstrip (Desktop: col-5, Mobile: col-12) */}
      <div className="col-5" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '4px' }}>
          [ SCREENSHOT INDEX ]
        </h4>

        {screenshots.map((s, idx) => (
          <div
            key={s.id}
            onClick={() => setActiveId(s.id)}
            className="paper-note"
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              borderWidth: '3px',
              borderColor: activeId === s.id ? 'var(--pink)' : 'var(--black)',
              background: activeId === s.id ? 'var(--yellow)' : 'var(--white)',
              transform: `rotate(${(idx % 2 === 0 ? 1.5 : -1.5) * 0.8}deg)`,
              boxShadow: activeId === s.id ? '4px 4px 0px var(--black)' : '2px 2px 0px var(--black)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                0{idx + 1}. {s.title}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: activeId === s.id ? '#000' : 'var(--text-muted)' }}>
                {activeId === s.id ? '[ACTIVE]' : 'SELECT'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
