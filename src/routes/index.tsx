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

interface Project {
  id: string
  title: string
  work: string
  year: string
  category: string
  tech: string[]
  desc: string
  status: string
  url?: string
}

function PortfolioPage() {
  const [activeProject, setActiveProject] = useState<string>('akas')
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)

  const projects: Project[] = [
    {
      id: 'akas',
      title: 'AKAS V2 — Academic Security System',
      work: 'PPTI',
      year: '2026',
      category: 'Academic Security App',
      tech: ['Laravel 11', 'React SPA', 'Inertia.js', 'TailwindCSS', 'Cloudflare R2'],
      desc: 'A comprehensive school discipline & academic monitoring platform. Migrated from legacy PHP Native monolith to modern Laravel API + React SPA architecture with Google OAuth, Cloudflare R2, and Progressive Web App support.',
      status: '🔒 Private · Active Development',
    },
    {
      id: 'satenya',
      title: 'Satenya Mama Loesye — POS & Management System',
      work: 'Satenya Mama Loesye',
      year: '2026',
      category: 'POS & Catering System',
      tech: ['React', 'Hono.js', 'Prisma ORM', 'TypeScript', 'Docker'],
      desc: 'Point of Sales & catering management system with a bold neobrutalist UI. Features Kitchen Display System synchronization, dynamic QRIS generation, WhatsApp OTP authentication, and delivery radius validation.',
      status: '🌐 Live',
      url: 'https://satenyamamaloesye.ppti.me',
    },
    {
      id: 'scholargate',
      title: 'ScholarGate SSO — Portal & CMS',
      work: 'ScholarGate',
      year: '2026',
      category: 'SSO & School CMS',
      tech: ['Laravel', 'React', 'PostgreSQL', 'Cloudflare R2', 'OAuth2'],
      desc: 'Central school education portal and CMS designed for shared-hosting or VPS. Supports Google OAuth SSO, portable JSON data backups, and multi-database configurations.',
      status: '🔒 Private · Active',
    },
    {
      id: 'sieksa',
      title: 'SIEKSA V3 — Extracurricular System',
      work: 'Open Source Project',
      year: '2026',
      category: 'Extracurricular Panel',
      tech: ['React', 'TypeScript', 'Hono.js', 'PostgreSQL', 'Docker'],
      desc: 'Web-based extracurricular administrative panel managing student directories, meeting logs, performance metrics, and automated achievement verification.',
      status: '🔒 Private · Active',
    },
  ]

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

  const currentProject = projects.find((p) => p.id === activeProject)

  return (
    <div className="container">
      {/* Hero Section */}
      <section style={{ position: 'relative', padding: '40px 0 20px', textAlign: 'center' }}>
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
      </section>

      {/* Profile Box & Bio Split */}
      <section className="bento-grid">
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
              I am an <strong>IT Technician & Network Engineer</strong> working at <strong>PPTI</strong>. I design, implement, and secure enterprise network infrastructures while certified as a <strong>MikroTik Certified Professional</strong>.
            </p>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '16px' }}>
              Beyond networking, I have a deep passion for modern web engineering. I build clean, high-performance user interfaces using <strong>React, TypeScript, Hono.js</strong>, and robust backends built on <strong>Laravel</strong>.
            </p>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
              I bridge the gap between software development and network administration, ensuring applications run efficiently in fully optimized containerized environments (Docker) and edge proxy architectures (Cloudflare).
            </p>
          </div>
        </div>
      </section>

      {/* Table of Contents Section (Playful Sticker Board style matching Image 1) */}
      <section style={{ marginTop: '80px' }}>
        <h2 className="stroke-text" style={{ fontSize: '2.5rem', marginBottom: '24px', textAlign: 'center' }}>
          📂 SELECT A SEGMENT
        </h2>

        <div className="toc-container">
          {/* Main Title Center Sticker */}
          <div className="toc-center-title">
            TABLE OF CONTENTS
          </div>

          {/* Project Segment Oval Stickers */}
          {[
            { id: 'akas', label: '1. AKAS V2', color: 'var(--black)', textColor: 'var(--white)', rotate: '-4deg', left: '15%', top: '20%' },
            { id: 'satenya', label: '2. SATENYA POS', color: 'var(--pink)', textColor: 'var(--white)', rotate: '5deg', left: '68%', top: '22%' },
            { id: 'scholargate', label: '3. SCHOLARGATE', color: 'var(--yellow)', textColor: 'var(--black)', rotate: '-6deg', left: '10%', top: '65%' },
            { id: 'sieksa', label: '4. SIEKSA V3', color: 'var(--pink)', textColor: 'var(--white)', rotate: '4deg', left: '65%', top: '68%' },
            { id: 'lab', label: '5. NETWORK LAB', color: 'var(--lime)', textColor: 'var(--black)', rotate: '-3deg', left: '38%', top: '78%' },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveProject(item.id)}
              className={`toc-sticker ${activeProject === item.id ? 'toc-sticker-active' : ''}`}
              style={{
                left: item.left,
                top: item.top,
                transform: `rotate(${item.rotate})`,
                backgroundColor: item.color,
                color: item.textColor,
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Segment Sheet (Playful Scrapbook style matching Image 2/3/4) */}
      <section style={{ marginTop: '40px' }}>
        {currentProject ? (
          <div className="sticker" style={{ background: 'var(--white)' }}>
            {/* Header Metadata */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                borderBottom: '3px solid var(--black)',
                paddingBottom: '12px',
                marginBottom: '24px',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                fontWeight: 'bold',
              }}
            >
              <span>WORK - {currentProject.work.toUpperCase()}</span>
              <span>YEAR - {currentProject.year}</span>
              <span>CATEGORY - {currentProject.category.toUpperCase()}</span>
            </div>

            <div className="bento-grid">
              {/* Left Column: Visual Mockup / Simulated Screen */}
              <div
                className="col-6"
                style={{
                  border: '4px solid var(--black)',
                  borderRadius: '12px',
                  background: 'var(--paper)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  boxShadow: '4px 4px 0px var(--black)',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '260px',
                }}
              >
                {/* Visual decorations matching sticker aesthetics */}
                <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '1.5rem' }}>
                  🍥
                </div>

                {activeProject === 'akas' && (
                  <div style={{ fontFamily: 'monospace' }}>
                    <div style={{ background: 'var(--black)', color: '#fff', padding: '6px 12px', borderRadius: '4px', marginBottom: '12px' }}>
                      🏫 academic-security-dashboard
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      <div style={{ border: '2px solid #000', padding: '8px', background: 'var(--yellow)', fontWeight: 'bold' }}>
                        Active Students: 1,240
                      </div>
                      <div style={{ border: '2px solid #000', padding: '8px', background: 'var(--pink)', color: '#fff', fontWeight: 'bold' }}>
                        Gate Alerts: 0
                      </div>
                      <div style={{ border: '2px solid #000', padding: '8px', background: '#fff', gridColumn: 'span 2' }}>
                        • Cloudflare R2 Connected<br />
                        • Google OAuth Active
                      </div>
                    </div>
                  </div>
                )}

                {activeProject === 'satenya' && (
                  <div>
                    <div
                      className="sticker-outline"
                      style={{
                        background: 'var(--pink)',
                        border: '3px solid #000',
                        borderRadius: '8px',
                        padding: '12px',
                        color: '#fff',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        transform: 'rotate(-2deg)',
                      }}
                    >
                      🍢 SATENYA POS CLIENT
                      <div style={{ background: '#fff', color: '#000', padding: '4px', marginTop: '8px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        Total: Rp 125,000<br />
                        [ GENERATE QRIS ]
                      </div>
                    </div>
                  </div>
                )}

                {activeProject === 'scholargate' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ background: 'var(--yellow)', border: '2px solid #000', padding: '6px 12px', fontWeight: 'bold', borderRadius: '4px' }}>
                      🔑 Single Sign-On Gateway
                    </div>
                    <div style={{ background: '#fff', border: '2px solid #000', padding: '6px 12px', fontSize: '0.85rem' }}>
                      Integrated across:
                      <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                        <li>Academic CMS Portal</li>
                        <li>Extracurricular Panel</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeProject === 'sieksa' && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ background: 'var(--black)', color: '#fff', padding: '8px', borderRadius: '4px', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                      📋 SIEKSA-V3 ADMIN
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                      <span className="tech-badge">Members: 420</span>
                      <span className="tech-badge" style={{ background: 'var(--pink)', color: '#fff' }}>V3</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Descriptions & Badges */}
              <div className="col-6" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Oval layout description matching Image 2 */}
                <div
                  className="paper-note"
                  style={{
                    borderRadius: '30px',
                    border: '3px solid var(--black)',
                    padding: '24px',
                    background: 'var(--yellow)',
                    boxShadow: '4px 4px 0px var(--black)',
                    transform: 'rotate(1deg)',
                  }}
                >
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '8px' }}>
                    {currentProject.title}
                  </h3>
                  <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {currentProject.desc}
                  </p>
                </div>

                {/* Tech stack */}
                <div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '10px' }}>
                    [ TECHNOLOGIES INVOLVED ]
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {currentProject.tech.map((t) => (
                      <span key={t} className="tech-badge">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status & Redirects */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '2px dashed var(--black)', paddingTop: '16px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    Status: {currentProject.status}
                  </span>
                  {currentProject.url && (
                    <a
                      href={currentProject.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sticker-btn"
                      style={{
                        padding: '6px 16px',
                        fontSize: '0.9rem',
                        boxShadow: '3px 3px 0px var(--black)',
                      }}
                    >
                      Visit Site 🌐
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Active Project is "lab" (Render network interactive lab inline in the segment view!) */
          <div className="sticker" style={{ background: 'var(--white)' }}>
            {/* Header Metadata */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                borderBottom: '3px solid var(--black)',
                paddingBottom: '12px',
                marginBottom: '24px',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                fontWeight: 'bold',
              }}
            >
              <span>WORK - PPTI / NETWORK INFRASTRUCTURE</span>
              <span>YEAR - 2026</span>
              <span>CATEGORY - INTERACTIVE TOPOLOGY</span>
            </div>

            <div className="bento-grid">
              {/* SVG Canvas column */}
              <div className="col-8" style={{ border: '3px solid #000', borderRadius: '10px', background: '#eef8ff', overflow: 'hidden', padding: '10px' }}>
                <svg viewBox="0 0 500 450" width="100%" height="auto" style={{ background: '#eef8ff' }}>
                  {/* Connection lines */}
                  <line x1="250" y1="60" x2="250" y2="160" stroke="#000" strokeWidth="4" />
                  <line x1="250" y1="160" x2="250" y2="260" stroke="#000" strokeWidth="4" className="network-cable" />
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
                      <circle
                        cx={node.cx}
                        cy={node.cy}
                        r="28"
                        fill="#fff"
                        stroke="#000"
                        strokeWidth="4"
                        style={{ filter: 'drop-shadow(3px 3px 0px #000)' }}
                      />
                      <circle
                        cx={node.cx}
                        cy={node.cy}
                        r="22"
                        fill={selectedNode?.id === node.id ? 'var(--pink)' : 'var(--yellow)'}
                        stroke="#000"
                        strokeWidth="2"
                      />
                      <text
                        x={node.cx}
                        y={node.cy + 6}
                        textAnchor="middle"
                        fontSize="1.3rem"
                        style={{ userSelect: 'none' }}
                      >
                        {node.icon}
                      </text>
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
                    minHeight: '260px',
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
        )}
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
