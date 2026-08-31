import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getDatabaseProvider } from '../data/provider'
import EnvAlertSheet from '../components/EnvAlertSheet'

const getAboutDataFn = createServerFn({ method: 'GET' }).handler(async () => {
  const provider = getDatabaseProvider()
  const data = await provider.getData()
  return {
    profile: data.profile,
    envStatus: data.envStatus,
  }
})

export const Route = createFileRoute('/about')({
  loader: async () => {
    return await getAboutDataFn()
  },
  component: About,
})

function About() {
  const { profile, envStatus } = Route.useLoaderData()

  const defaultSections = [
    {
      id: 'devops',
      title: 'DEVOPS, VIRTUALIZATION & CLOUD SERVERS',
      subtitle: 'Proxmox VE, VMware ESXi, VPS Fleet & Docker Orchestration',
      desc: 'Hands-on expertise in deploying, virtualizing, and managing bare-metal and cloud infrastructures. Proficient in configuring Proxmox VE hypervisors, VMware ESXi environments, Linux server security hardening, Docker containerization, Nginx/Caddy reverse proxies, automated backup pipelines, and Cloudflare Zero-Trust edge tunnels.',
      tags: ['Proxmox VE', 'VMware ESXi', 'Docker & Compose', 'Linux Hardening', 'VPS Fleet Mgmt', 'Cloudflare Tunnels'],
      color: 'yellow',
    },
    {
      id: 'networking',
      title: 'ENTERPRISE NETWORKING & ROUTING',
      subtitle: 'MikroTik RouterOS, VLANs, Multi-WAN & VPN',
      desc: 'Extensive practical experience designing and maintaining mission-critical campus & institutional networks. Proficient in MikroTik RouterOS multi-WAN load balancing, policy-based routing, OSPF, VLAN isolation, QoS bandwidth shaping, and secure WireGuard/IPsec VPN tunneling.',
      tags: ['MikroTik RouterOS', 'VLAN Segmentation', 'BGP / OSPF', 'Multi-WAN Load Balancing', 'WireGuard VPN'],
      color: 'white',
    },
    {
      id: 'software',
      title: 'FULLSTACK SOFTWARE DEVELOPMENT',
      subtitle: 'Laravel 11, React SPA, TypeScript & Hyperdrive',
      desc: 'Specialized in delivering robust, high-performance web applications. From architecting scalable Laravel 11 RESTful APIs with Redis caching to building sleek neobrutalist React SPAs, Inertia.js ecosystems, Cloudflare R2 object storage integration, and Hyperdrive database acceleration.',
      tags: ['Laravel 11', 'React & TypeScript', 'Hono.js', 'PostgreSQL / MySQL', 'Cloudflare R2', 'Inertia.js'],
      color: 'pink',
    },
    {
      id: 'edu',
      title: 'EDUCATION & INFORMATICS INSTRUCTION',
      subtitle: 'SMA Negeri 1 Gedeg (Informatics Educator)',
      desc: 'Actively teaching computer science and informatics at SMA Negeri 1 Gedeg. I develop curriculum bridging theoretical computer science with real-world industry tools (JavaScript/TypeScript, Git workflows, REST APIs, DevOps virtualization concepts, and hands-on MikroTik networking labs).',
      tags: ['Informatics Curriculum', 'Hands-on Lab', 'DevOps Concepts', 'Network Topology Training', 'Mentorship'],
      color: 'yellow',
    },
  ]

  const sections = profile?.aboutSections && profile.aboutSections.length > 0
    ? profile.aboutSections
    : defaultSections

  const userName = profile?.name || 'Ryan Ardian'
  const userTitle = profile?.title || 'Fullstack Developer & Network Specialist'
  const userTagline = profile?.tagline || "Fullstack Software Engineer & Network Infrastructure Specialist bridging modern web architectures with robust enterprise routing."
  const userAvatar = profile?.avatarUrl || '/favicon.svg'
  const userBio = profile?.shortBio || "I am a Fullstack Software Engineer and Network Infrastructure Specialist with extensive experience designing, developing, and deploying mission-critical systems across both software and network layers."

  return (
    <div className="container">
      {/* Hero Title */}
      <h1
        className="stroke-text hero-title anim-fade-up"
        data-parallax-depth="0.3"
        style={{
          textAlign: 'center',
          marginBottom: '28px',
          transform: 'rotate(-1deg)',
        }}
      >
        ABOUT THE ENGINEER
      </h1>

      {/* Top Profile Summary Bento */}
      <div className="bento-grid anim-fade-up anim-delay-1" style={{ marginBottom: '32px' }}>
        {/* Left Column: Avatar & Quick Info Card */}
        <div className="col-4">
          <div
            className="sticker"
            data-parallax-depth="0.4"
            style={{
              background: 'var(--yellow)',
              height: '100%',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px 20px',
              transform: 'rotate(-1deg)',
            }}
          >
            <img
              src={userAvatar && userAvatar !== '/minecraft-avatar.png' ? userAvatar : '/favicon.svg'}
              alt={userName}
              className="sticker-outline"
              style={{
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                border: '4px solid #ffffff',
                marginBottom: '16px',
                objectFit: 'contain',
                background: '#ffffff',
                padding: '8px',
              }}
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).src = '/favicon.svg'
              }}
            />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', textTransform: 'uppercase', color: '#0c0c0c', margin: '0 0 4px 0' }}>
              {userName}
            </h2>
            <p style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#333', margin: '0 0 12px 0' }}>
              {userTitle}
            </p>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
              <span className="open-badge pulse-badge">{profile?.badgeText || '#OPENTOWORK'}</span>
              <span style={{ background: 'var(--lime)', color: '#000', border: '2px solid #000', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                MOJOKERTO, ID
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: 'auto' }}>
              <Link to="/" className="sticker-btn" style={{ background: 'var(--pink)', color: '#fff', fontSize: '0.8rem', padding: '6px 12px' }}>
                &larr; Works
              </Link>
              <a
                href="mailto:me@ardianryan.com"
                className="sticker-btn"
                style={{ background: 'var(--lime)', color: '#000', fontSize: '0.8rem', padding: '6px 12px', textDecoration: 'none' }}
              >
                Email Me ✉
              </a>
              <a
                href="https://github.com/ardianryan"
                target="_blank"
                rel="noopener noreferrer"
                className="sticker-btn"
                style={{ background: 'var(--white)', color: '#000', fontSize: '0.8rem', padding: '6px 12px', textDecoration: 'none' }}
              >
                GitHub ↗
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: In-Depth Professional Bio */}
        <div className="col-8">
          <div
            className="paper-note"
            data-parallax-depth="0.2"
            style={{
              height: '100%',
              padding: '32px 28px',
              transform: 'rotate(0.5deg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ borderBottom: '3px solid var(--black)', paddingBottom: '12px', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                [ PROFESSIONAL OVERVIEW & EXPERTISE ]
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text-main)', marginTop: '4px' }}>
                {userTagline}
              </h3>
            </div>

            <div style={{ fontSize: '1.02rem', lineHeight: '1.65', color: 'var(--text-main)' }}>
              {userBio.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx} style={{ marginBottom: '14px' }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sections Grid Title */}
      <div className="scroll-reveal" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', textTransform: 'uppercase', margin: 0 }}>
          CORE COMPETENCIES & PROFESSIONAL PILLARS
        </h2>
      </div>

      {/* Thematic Cards Grid */}
      <div className="bento-grid scroll-reveal">
        {sections.map((sec, idx) => {
          const isFullWidth = sections.length % 2 !== 0 && idx === sections.length - 1
          const colClass = isFullWidth ? 'col-12' : 'col-6'
          const bg = sec.color === 'yellow' ? 'var(--yellow)' : sec.color === 'pink' ? '#fff0f5' : 'var(--white)'
          const borderColor = sec.color === 'pink' ? 'var(--pink)' : 'var(--black)'

          return (
            <div key={sec.id || idx} className={colClass}>
              <div
                className="sticker"
                style={{
                  height: '100%',
                  background: bg,
                  borderColor: borderColor,
                  transform: idx % 2 === 0 ? 'rotate(-0.5deg)' : 'rotate(0.5deg)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.3rem',
                      color: sec.color === 'pink' ? 'var(--pink)' : 'var(--black)',
                      marginBottom: '4px',
                    }}
                  >
                    {sec.title}
                  </h3>
                </div>

                <p style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#555', marginBottom: '10px' }}>
                  {sec.subtitle}
                </p>

                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#333', marginBottom: '16px' }}>
                  {sec.desc}
                </p>

                {sec.tags && sec.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto' }}>
                    {sec.tags.map((t) => (
                      <span key={t} className="tech-badge" style={{ background: '#fff' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Direct Contact & Collaboration Card */}
      <div className="scroll-reveal" style={{ marginTop: '48px' }}>
        <div
          className="sticker"
          style={{
            background: 'var(--yellow)',
            border: '4px solid var(--black)',
            borderRadius: '20px',
            padding: '36px 24px',
            textAlign: 'center',
            boxShadow: '6px 6px 0px var(--black)',
            transform: 'rotate(-0.5deg)',
          }}
        >
          <span style={{ background: '#000', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
            [ LET'S CONNECT & COLLABORATE ]
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: '14px 0 8px 0' }}>
            HAVE A PROJECT OR INFRASTRUCTURE CHALLENGE?
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#333', maxWidth: '640px', margin: '0 auto 20px auto', lineHeight: '1.5' }}>
            Whether you need high-throughput fullstack web development, enterprise MikroTik routing, or Proxmox/Docker server virtualization — feel free to drop a message!
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href="mailto:me@ardianryan.com"
              className="sticker-btn"
              style={{
                background: 'var(--pink)',
                color: 'var(--white)',
                padding: '12px 24px',
                fontSize: '1rem',
                textDecoration: 'none',
              }}
            >
              ✉ Send Email: me@ardianryan.com
            </a>
            <a
              href="https://github.com/ardianryan"
              target="_blank"
              rel="noopener noreferrer"
              className="sticker-btn"
              style={{
                background: 'var(--white)',
                color: 'var(--black)',
                padding: '12px 20px',
                fontSize: '1rem',
                textDecoration: 'none',
              }}
            >
              GitHub Profile ↗
            </a>
          </div>
        </div>
      </div>

      <EnvAlertSheet envStatus={envStatus} />
    </div>
  )
}
