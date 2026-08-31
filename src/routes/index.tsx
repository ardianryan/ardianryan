import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/')({ component: PortfolioPage })

interface NetworkNode {
  id: string
  name: string
  tech: string[]
  desc: string
  icon: string
  cx: number
  cy: number
}

function PortfolioPage() {
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)
  const [projectFilter, setProjectFilter] = useState<string>('ALL')

  const networkNodes: NetworkNode[] = [
    {
      id: 'cloud',
      name: 'Cloud Services',
      tech: ['Cloudflare R2', 'Cloudflare DNS', 'WAF'],
      desc: 'Edge networks, global DNS routing, and secure object storage for project assets.',
      icon: '☁️',
      cx: 250,
      cy: 60,
    },
    {
      id: 'router',
      name: 'MikroTik RouterOS',
      tech: ['VLANs', 'QoS Bandwidth Mgmt', 'WireGuard VPN'],
      desc: 'Core routing, firewall rules, user session management, and traffic queueing policies.',
      icon: '🔌',
      cx: 250,
      cy: 160,
    },
    {
      id: 'switch',
      name: 'Managed Switch',
      tech: ['L2/L3 Switching', 'Trunk Ports', 'Network Isolation'],
      desc: 'Local ethernet aggregation segmenting server VLANs from client networks.',
      icon: '⚙️',
      cx: 250,
      cy: 260,
    },
    {
      id: 'server-app',
      name: 'Application Server',
      tech: ['Laravel 11+', 'React SPA', 'Hono.js POS', 'Docker'],
      desc: 'Hosting web services like AKAS v2, ScholarGate SSO, and Satenya Mama Loesye.',
      icon: '💻',
      cx: 120,
      cy: 360,
    },
    {
      id: 'database',
      name: 'Database Node',
      tech: ['PostgreSQL', 'MySQL', 'Prisma ORM'],
      desc: 'Structured storage nodes for school achievements, POS transactions, and user credentials.',
      icon: '📊',
      cx: 250,
      cy: 360,
    },
    {
      id: 'clients',
      name: 'Client Stations',
      tech: ['WiFi Captive Portal', 'POS Terminals', 'PWA Devices'],
      desc: 'End-user devices accessing school systems and POS cashier clients.',
      icon: '📱',
      cx: 380,
      cy: 360,
    },
  ]

  const projects = [
    {
      id: 'akas',
      title: '🏫 AKAS v2 — Academic Security System',
      category: 'WEB',
      tech: ['Laravel', 'React', 'Inertia.js', 'TailwindCSS', 'Cloudflare'],
      desc: 'A comprehensive school discipline & academic monitoring platform. Migrated from legacy PHP Native monolith to modern Laravel API + React SPA architecture with Google OAuth, Cloudflare R2, and Progressive Web App support.',
      status: '🔒 Private · Active',
    },
    {
      id: 'satenya',
      title: '🍢 Satenya Mama Loesye — POS System',
      category: 'WEB',
      tech: ['React', 'Hono.js', 'Prisma', 'TypeScript', 'Docker'],
      desc: 'Point of Sales & catering management system with a bold neobrutalist UI. Features Kitchen Display System synchronization, dynamic QRIS generation, WhatsApp OTP authentication, and delivery radius validation.',
      status: '🌐 Live',
      url: 'https://satenyamamaloesye.ppti.me',
    },
    {
      id: 'scholargate-sso',
      title: '🎓 ScholarGate SSO — Portal & CMS',
      category: 'WEB',
      tech: ['Laravel', 'React', 'PostgreSQL', 'Cloudflare R2', 'OAuth2'],
      desc: 'Central school education portal and CMS designed for shared-hosting or VPS. Supports Google OAuth SSO, portable JSON data backups, and multi-database configurations.',
      status: '🔒 Private · Active',
    },
    {
      id: 'sieksa',
      title: '📋 SIEKSA V3 — Extracurricular System',
      category: 'WEB',
      tech: ['React', 'TypeScript', 'Hono.js', 'PostgreSQL', 'Docker'],
      desc: 'Web-based extracurricular administrative panel managing student directories, meeting logs, performance metrics, and automated achievement verification.',
      status: '🔒 Private · Active',
    },
    {
      id: 'mikrotik-script',
      title: '🌍 MikroTik Network Projects',
      category: 'NET',
      tech: ['RouterOS', 'Bash', 'Python'],
      desc: 'Automation repository featuring custom RouterOS scripts for dynamic failover routing, active bandwidth queues, client captive portal customizations, and Wireshark diagnostics.',
      status: '🔒 Private · Archive',
    },
  ]

  const filteredProjects =
    projectFilter === 'ALL'
      ? projects
      : projects.filter((p) => p.category === projectFilter)

  return (
    <div className="container">
      {/* Hero Section */}
      <section style={{ position: 'relative', padding: '60px 0', textAlign: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {/* Spinning Globe Sticker */}
          <div
            className="floating-sticker rotate-slow sticker-outline"
            style={{
              top: '-40px',
              left: '-60px',
              width: '60px',
              height: '60px',
              background: 'var(--pink)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
            }}
          >
            🌐
          </div>

          <h1
            className="stroke-text"
            style={{
              fontSize: '4.5rem',
              lineHeight: '1',
              marginBottom: '10px',
              transform: 'rotate(-2deg)',
            }}
          >
            PORTFOLIO
          </h1>
          <h2
            className="stroke-text-pink"
            style={{
              fontSize: '2.5rem',
              lineHeight: '1',
              marginBottom: '20px',
              transform: 'rotate(1deg)',
            }}
          >
            DEVELOPMENT & NETWORKING
          </h2>
        </div>

        <p style={{ fontSize: '1.25rem', fontWeight: 'bold', maxWidth: '600px', margin: '20px auto 30px' }}>
          Hi, I'm <span style={{ background: 'var(--yellow)', padding: '2px 8px', border: '2px solid #000' }}>Ardian Ryan</span> 👋 — IT Technician, Network Engineer, and Web Developer building solid software and robust networks.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <a href="#projects" className="sticker-btn">
            Explore Work
          </a>
          <a href="#lab" className="sticker-btn sticker-btn-pink">
            Enter Lab
          </a>
        </div>
      </section>

      {/* About & Profile Split */}
      <section className="bento-grid" style={{ marginTop: '60px' }}>
        {/* Left Side: Avatar Sticker */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            className="sticker"
            style={{
              background: 'var(--yellow)',
              textAlign: 'center',
              width: '100%',
              transform: 'rotate(-1deg)',
            }}
          >
            <img
              src="https://github.com/ardianryan.png"
              alt="Ardian Ryan"
              className="sticker-outline"
              style={{
                width: '100%',
                maxWidth: '220px',
                borderRadius: '50%',
                border: '6px solid var(--white)',
                marginBottom: '16px',
              }}
            />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', textTransform: 'uppercase' }}>
              Ryan Ardian
            </h3>
            <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#555', marginTop: '4px' }}>
              Front-End Developer & Network Engineer
            </p>
            <div style={{ marginTop: '12px' }}>
              <span className="open-badge">#OPENTOWORK</span>
            </div>
          </div>
        </div>

        {/* Right Side: Paper Note Bio */}
        <div className="col-8">
          <div className="paper-note" style={{ height: '100%', transform: 'rotate(0.5deg)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '16px' }}>
              ABOUT ME
            </h3>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '16px' }}>
              I am an **IT Technician & Network Engineer** working at **PPTI**. I design, implement, and secure enterprise network infrastructures while certified as a **MikroTik Certified Professional**.
            </p>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '16px' }}>
              Beyond networking, I have a deep passion for modern web engineering. I build clean, high-performance user interfaces using **React, TypeScript, Hono.js**, and robust backends built on **Laravel**.
            </p>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
              I bridge the gap between software development and network administration, ensuring applications run efficiently in fully optimized containerized environments (Docker) and edge proxy architectures (Cloudflare).
            </p>
          </div>
        </div>
      </section>

      {/* Network Lab Interactive Diagram */}
      <section id="lab" style={{ marginTop: '80px' }}>
        <div className="sticker" style={{ background: 'var(--white)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>
                📡 INTERACTIVE NETWORK LAB
              </h2>
              <p style={{ fontWeight: 'bold', color: '#555', marginTop: '4px' }}>
                Hover or click nodes on the topology diagram below to inspect setup specs.
              </p>
            </div>
            <span className="open-badge" style={{ background: 'var(--yellow)' }}>
              LAB STATS: ACTIVE
            </span>
          </div>

          <div className="bento-grid">
            {/* SVG Canvas column */}
            <div className="col-8" style={{ border: '3px solid #000', borderRadius: '10px', background: '#eef8ff', overflow: 'hidden', padding: '10px' }}>
              <svg viewBox="0 0 500 450" width="100%" height="auto" style={{ background: '#eef8ff' }}>
                {/* Connection lines */}
                {/* Cloud to Router */}
                <line x1="250" y1="60" x2="250" y2="160" stroke="#000" strokeWidth="4" />
                
                {/* Router to Switch */}
                <line x1="250" y1="160" x2="250" y2="260" stroke="#000" strokeWidth="4" className="network-cable" />

                {/* Switch to Servers */}
                <line x1="250" y1="260" x2="120" y2="360" stroke="#000" strokeWidth="4" />
                <line x1="250" y1="260" x2="250" y2="360" stroke="#000" strokeWidth="4" />
                <line x1="250" y1="260" x2="380" y2="360" stroke="#000" strokeWidth="4" />

                {/* Nodes rendering */}
                {networkNodes.map((node) => (
                  <g
                    key={node.id}
                    className="network-node"
                    onClick={() => setSelectedNode(node)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Outline white sticker border */}
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r="28"
                      fill="#fff"
                      stroke="#000"
                      strokeWidth="4"
                      style={{ filter: 'drop-shadow(3px 3px 0px #000)' }}
                    />
                    {/* Node interior fill */}
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r="22"
                      fill={selectedNode?.id === node.id ? 'var(--pink)' : 'var(--yellow)'}
                      stroke="#000"
                      strokeWidth="2"
                    />
                    {/* Icon */}
                    <text
                      x={node.cx}
                      y={node.cy + 6}
                      textAnchor="middle"
                      fontSize="1.3rem"
                      style={{ userSelect: 'none' }}
                    >
                      {node.icon}
                    </text>
                    {/* Label below node */}
                    <text
                      x={node.cx}
                      y={node.cy + 42}
                      textAnchor="middle"
                      fontSize="0.75rem"
                      fontWeight="bold"
                      fill="#000"
                      style={{ userSelect: 'none' }}
                    >
                      {node.name}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Inspector Terminal column */}
            <div className="col-4">
              <div
                className="paper-note"
                style={{
                  height: '100%',
                  background: 'var(--black)',
                  color: '#00ff66',
                  borderColor: '#00ff66',
                  fontFamily: 'monospace',
                  overflowY: 'auto',
                }}
              >
                <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', borderBottom: '2px dashed #00ff66', paddingBottom: '8px' }}>
                  <span style={{ color: '#ff007f' }}>●</span>
                  <span style={{ color: '#ffe600' }}>●</span>
                  <span style={{ color: '#00ff66' }}>●</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#888' }}>
                    INSPECTOR
                  </span>
                </div>

                {selectedNode ? (
                  <div>
                    <h4 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '8px' }}>
                      &gt; {selectedNode.name}
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: '#aaa', lineHeight: '1.4', marginBottom: '12px' }}>
                      {selectedNode.desc}
                    </p>
                    <h5 style={{ color: '#ff55ff', fontSize: '0.9rem', marginBottom: '6px' }}>
                      [Tech Stack Deploy]
                    </h5>
                    <ul style={{ paddingLeft: '20px', fontSize: '0.85rem' }}>
                      {selectedNode.tech.map((t, i) => (
                        <li key={i} style={{ color: '#00ff66', marginBottom: '4px' }}>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', paddingTop: '40px' }}>
                    <p style={{ fontSize: '1rem', color: '#888' }}>
                      [ SYSTEM IDLE ]
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#555', marginTop: '8px' }}>
                      Select a network node to inspect components.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack & Badges */}
      <section style={{ marginTop: '80px' }}>
        <h2
          className="stroke-text"
          style={{ fontSize: '2.5rem', marginBottom: '24px', textAlign: 'center' }}
        >
          🛠️ MY SKILL STICKERS
        </h2>
        <div className="bento-grid">
          {/* Networking & Hardware */}
          <div className="col-4">
            <div className="sticker" style={{ height: '100%' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '16px', borderBottom: '3px solid #000', paddingBottom: '8px' }}>
                NETWORKING 🔌
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['MikroTik', 'RouterOS', 'Cisco', 'Ubiquiti', 'pfSense', 'OpenWrt', 'Wireshark', 'WireGuard', 'ESP32'].map((tech) => (
                  <span key={tech} className="tech-badge">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Software & Languages */}
          <div className="col-4">
            <div className="sticker" style={{ height: '100%', background: 'var(--yellow)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '16px', borderBottom: '3px solid #000', paddingBottom: '8px' }}>
                LANGUAGES & DB 💻
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['PHP', 'JavaScript', 'TypeScript', 'Python', 'Bash', 'MySQL', 'MariaDB', 'PostgreSQL'].map((tech) => (
                  <span key={tech} className="tech-badge" style={{ background: '#fff' }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Frameworks & Deployments */}
          <div className="col-4">
            <div className="sticker" style={{ height: '100%', background: 'var(--pink)', color: '#fff' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '16px', borderBottom: '3px solid #fff', paddingBottom: '8px' }}>
                FRAMEWORKS & OS 🚀
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Laravel', 'Node.js', 'React', 'Hono.js', 'Docker', 'Linux', 'Ubuntu', 'Debian', 'Cloudflare'].map((tech) => (
                  <span key={tech} className="tech-badge" style={{ color: 'var(--black)' }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Bento Grid */}
      <section id="projects" style={{ marginTop: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <h2 className="stroke-text" style={{ fontSize: '2.5rem' }}>
            🚀 FEATURED PROJECTS
          </h2>
          {/* Project Filtering buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'WEB', 'NET'].map((cat) => (
              <button
                key={cat}
                onClick={() => setProjectFilter(cat)}
                className="sticker-btn"
                style={{
                  padding: '6px 16px',
                  fontSize: '0.9rem',
                  border: '3px solid var(--black)',
                  boxShadow: '3px 3px 0px var(--black)',
                  background: projectFilter === cat ? 'var(--pink)' : 'var(--yellow)',
                  color: projectFilter === cat ? 'var(--white)' : 'var(--black)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="bento-grid">
          {filteredProjects.map((p) => (
            <div key={p.id} className="col-6">
              <div className="sticker" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 'bold', fontSize: '1.25rem' }}>
                    {p.title}
                  </h3>
                </div>

                <p style={{ fontSize: '0.95rem', color: '#444', lineHeight: '1.5', flexGrow: 1, marginBottom: '16px' }}>
                  {p.desc}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {p.tech.map((t) => (
                    <span key={t} className="tech-badge" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                      {t}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px dashed #000', paddingTop: '12px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                    Status: {p.status}
                  </span>
                  {'url' in p && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sticker-btn"
                      style={{
                        padding: '4px 12px',
                        fontSize: '0.8rem',
                        boxShadow: '2px 2px 0px var(--black)',
                        background: 'var(--yellow)',
                      }}
                    >
                      Visit Site
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Connect Card */}
      <section style={{ marginTop: '80px' }}>
        <div
          className="sticker"
          style={{
            background: 'var(--pink)',
            color: '#fff',
            textAlign: 'center',
            padding: '40px 24px',
            transform: 'rotate(0.5deg)',
          }}
        >
          <h2
            className="stroke-text"
            style={{ fontSize: '3rem', marginBottom: '10px' }}
          >
            LET'S CONNECT!
          </h2>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '24px' }}>
            Want to build a project, secure your networks, or chat? Get in touch!
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px' }}>
            {[
              { label: 'Website', href: 'https://ardianryan.com', color: 'var(--yellow)' },
              { label: 'Dev Site', href: 'https://ppti.me', color: 'var(--white)' },
              { label: 'GitHub', href: 'https://github.com/ardianryan', color: 'var(--yellow)' },
              { label: 'YouTube', href: 'https://youtube.com/@ardianr94', color: 'var(--white)' },
              { label: 'Instagram', href: 'https://instagram.com/ardianryan_', color: 'var(--yellow)' },
              { label: 'Email', href: 'mailto:inisaya@ardianryan.com', color: 'var(--white)' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="sticker-btn"
                style={{
                  background: link.color,
                  color: 'var(--black)',
                  fontSize: '0.95rem',
                  padding: '8px 20px',
                  boxShadow: '3px 3px 0px var(--black)',
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
