import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { getDatabaseProvider } from '../data/provider'
import type { NetworkNode } from '../data/provider'
import ScreenshotCollage from '../components/ScreenshotCollage'
import EnvAlertSheet from '../components/EnvAlertSheet'

const getPortfolioDataFn = createServerFn({ method: 'GET' }).handler(async () => {
  const provider = getDatabaseProvider()
  return await provider.getData()
})

export const Route = createFileRoute('/')({
  loader: async () => {
    return await getPortfolioDataFn()
  },
  component: PortfolioPage,
})

function PortfolioPage() {
  const { projects, networkNodes, profile, envStatus } = Route.useLoaderData()
  const [activeProject, setActiveProject] = useState<string>('akas')
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)

  const userProfile = profile || {
    name: 'Ryan Ardian',
    title: 'Web Developer & Network Specialist',
    tagline: "Hi, I'm Ardian Ryan — a developer building web applications and managing network environments.",
    badgeText: '#OPENTOWORK',
    avatarUrl: 'https://github.com/ardianryan.png',
    shortBio: 'I am a developer who loves building web applications and managing network setups. I focus on designing and implementing secure, high-performance systems.\n\nOn the frontend, I work with React, TypeScript, and Hono.js, and I build reliable backend services using Laravel.\n\nI also have practical experience with containerized environments using Docker and configuring edge network setups with Cloudflare.',
  }

  // Separate featured TOC projects from additional ones
  const featuredProjects = projects.filter((p) => p.featured !== false)
  const moreProjects = projects.filter((p) => p.featured === false)
  const currentProject = projects.find((p) => p.id === activeProject)

  const renderNodeIcon = (id: string, cx: number, cy: number) => {
    const transform = `translate(${cx - 12}, ${cy - 12})` // 24x24 viewport
    const stroke = '#000'
    const strokeWidth = 2.2
    const fill = 'none'

    switch (id) {
      case 'cloud':
        return (
          <g transform={transform}>
            <path
              d="M17.5 15a4.5 4.5 0 0 0 .5-8.9 5.5 5.5 0 0 0-10.7-1 4 4 0 0 0-3.3 3.9 4 4 0 0 0 4 4H17.5Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )
      case 'router':
        return (
          <g transform={transform}>
            <rect x="2" y="10" width="20" height="7" rx="1.5" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
            <circle cx="6" cy="13.5" r="1" fill={stroke} />
            <circle cx="10" cy="13.5" r="1" fill={stroke} />
            <circle cx="14" cy="13.5" r="1" fill={stroke} />
            <circle cx="18" cy="13.5" r="1" fill={stroke} />
            <path d="M12 10V4m-3 2.5L12 4l3 2.5" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )
      case 'switch':
        return (
          <g transform={transform}>
            <rect x="2" y="6" width="20" height="12" rx="2" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
            <rect x="5" y="9" width="3" height="3" fill="none" stroke={stroke} strokeWidth={1.5} />
            <rect x="11" y="9" width="3" height="3" fill="none" stroke={stroke} strokeWidth={1.5} />
            <rect x="17" y="9" width="3" height="3" fill="none" stroke={stroke} strokeWidth={1.5} />
            <line x1="5" y1="15" x2="19" y2="15" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
          </g>
        )
      case 'server-app':
        return (
          <g transform={transform}>
            <rect x="3" y="4" width="18" height="11" rx="2" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
            <path d="M7 20h10M12 15v5" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
          </g>
        )
      case 'database':
        return (
          <g transform={transform}>
            <path d="M4 6c0 1.66 3.58 3 8 3s8-1.34 8-3-3.58-3-8-3-8 1.34-8 3Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
            <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
            <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          </g>
        )
      case 'clients':
        return (
          <g transform={transform}>
            <rect x="6" y="3" width="12" height="18" rx="2" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
            <line x1="10" y1="17" x2="14" y2="17" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
          </g>
        )
      default:
        return null
    }
  }

  // Pre-configured sticker colors and positions for TOC (High contrast in light & dark mode)
  const tocStyles = [
    { color: 'var(--pink)', textColor: '#ffffff', rotate: '-4deg', left: '15%', top: '20%' },
    { color: 'var(--lime)', textColor: '#0c0c0c', rotate: '5deg', left: '68%', top: '22%' },
    { color: 'var(--yellow)', textColor: '#0c0c0c', rotate: '-6deg', left: '10%', top: '65%' },
    { color: 'var(--pink)', textColor: '#ffffff', rotate: '4deg', left: '65%', top: '68%' },
    { color: 'var(--lime)', textColor: '#0c0c0c', rotate: '-3deg', left: '38%', top: '78%' },
  ]

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="anim-fade-up" style={{ position: 'relative', padding: '24px 0 16px', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
          {/* Spinning Globe Sticker (SVG Icon) */}
          <div
            className="floating-sticker rotate-slow sticker-outline parallax-float"
            data-parallax-depth="1.8"
            style={{
              top: '-16px',
              left: '-8px',
              width: '48px',
              height: '48px',
              background: 'var(--pink)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg viewBox="0 0 24 24" width="26" height="26" stroke="var(--white)" strokeWidth="2.5" fill="none">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
          </div>

          <h1 className="stroke-text hero-title" data-parallax-depth="0.3">
            PORTFOLIO
          </h1>
          <h2 className="stroke-text-pink hero-subtitle" data-parallax-depth="0.5">
            DEVELOPMENT & NETWORKING
          </h2>
        </div>

        <p className="anim-fade-up anim-delay-1" style={{ fontSize: 'clamp(1rem, 3.5vw, 1.25rem)', fontWeight: 'bold', maxWidth: '600px', margin: '16px auto 24px', lineHeight: '1.45', padding: '0 8px' }}>
          {userProfile.tagline}
        </p>
      </section>

      {/* Profile Box & Bio Split */}
      <section className="bento-grid anim-fade-up anim-delay-2">
        {/* Left Side: Avatar Sticker */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            className="sticker"
            data-parallax-depth="0.4"
            style={{
              background: 'var(--yellow)',
              color: '#0c0c0c',
              textAlign: 'center',
              width: '100%',
              transform: 'rotate(-1deg)',
            }}
          >
            <img
              src={userProfile.avatarUrl && userProfile.avatarUrl !== '/minecraft-avatar.png' ? userProfile.avatarUrl : '/favicon.svg'}
              alt={userProfile.name}
              className="sticker-outline"
              style={{
                width: '100%',
                maxWidth: '220px',
                aspectRatio: '1/1',
                objectFit: 'contain',
                borderRadius: '50%',
                border: '4px solid #ffffff',
                background: '#ffffff',
                padding: '12px',
                marginBottom: '16px',
              }}
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).src = '/favicon.svg'
              }}
            />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', textTransform: 'uppercase', color: '#0c0c0c' }}>
              {userProfile.name}
            </h3>
            <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#333', marginTop: '4px' }}>
              {userProfile.title}
            </p>
            <div style={{ marginTop: '12px' }}>
              <span className="open-badge pulse-badge">{userProfile.badgeText}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Paper Note Bio */}
        <div className="col-8">
          <div className="paper-note" data-parallax-depth="0.3" style={{ height: '100%', transform: 'rotate(0.5deg)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '16px' }}>
              ABOUT ME
            </h3>
            {userProfile.shortBio.split('\n\n').map((paragraph, pIdx) => (
              <p key={pIdx} style={{ fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '14px' }}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Table of Contents Section (Playful Sticker Board) */}
      <section className="scroll-reveal" style={{ marginTop: '60px' }}>
        <h2 className="stroke-text" style={{ fontSize: '2.5rem', marginBottom: '24px', textAlign: 'center' }}>
          SELECT A SEGMENT
        </h2>

        <div className="toc-container">
          {/* Main Title Center Sticker */}
          <div className="toc-center-title">
            TABLE OF CONTENTS
          </div>

          {/* Featured Projects Oval Stickers */}
          {featuredProjects.map((item, idx) => {
            const styleConf = tocStyles[idx % tocStyles.length]
            return (
              <div
                key={item.id}
                onClick={() => setActiveProject(item.id)}
                className={`toc-sticker ${activeProject === item.id ? 'toc-sticker-active' : ''}`}
                style={{
                  left: styleConf.left,
                  top: styleConf.top,
                  transform: `rotate(${styleConf.rotate})`,
                  backgroundColor: styleConf.color,
                  color: styleConf.textColor,
                }}
              >
                {idx + 1}. {item.title.split('-')[0].trim().toUpperCase()}
              </div>
            )
          })}

          {/* Network Lab Sticker (always included in TOC) */}
          <div
            onClick={() => setActiveProject('lab')}
            className={`toc-sticker ${activeProject === 'lab' ? 'toc-sticker-active' : ''}`}
            style={{
              left: '38%',
              top: '78%',
              transform: 'rotate(-3deg)',
              backgroundColor: 'var(--lime)',
              color: '#0c0c0c',
            }}
          >
            {featuredProjects.length + 1}. NETWORK LAB
          </div>
        </div>
      </section>

      {/* Active Selection Details Display */}
      <section className="scroll-reveal" style={{ marginTop: '40px' }}>
        {activeProject !== 'lab' && currentProject ? (
          <div className="sticker">
            {/* Header Metadata */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                borderBottom: '2px solid var(--card-border)',
                paddingBottom: '12px',
                marginBottom: '24px',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                color: 'var(--text-muted)',
              }}
            >
              <span>WORK - {currentProject.work.toUpperCase()}</span>
              <span>YEAR - {currentProject.year}</span>
              <span>CATEGORY - {currentProject.category.toUpperCase()}</span>
            </div>

            <div className="bento-grid">
              {/* Screenshot Collage Component */}
              <div className="col-8">
                <ScreenshotCollage
                  projectId={currentProject.id}
                  screenshots={currentProject.screenshots}
                />
              </div>

              {/* Specs & Notes column */}
              <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div
                  className="paper-note"
                  style={{
                    borderRadius: '20px',
                    border: '2px solid var(--card-border)',
                    padding: '24px',
                    background: 'var(--yellow)',
                    color: '#0c0c0c',
                    boxShadow: '4px 4px 0px var(--card-shadow)',
                    transform: 'rotate(1deg)',
                  }}
                >
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '8px', color: '#0c0c0c' }}>
                    {currentProject.title}
                  </h3>
                  <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: '#222' }}>
                    {currentProject.desc}
                  </p>
                </div>

                {/* Tech stack */}
                <div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.0rem', marginBottom: '10px' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto', borderTop: '2px dashed var(--black)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                      Status: {currentProject.status}
                    </span>
                    <Link
                      to="/projects/$projectId"
                      params={{ projectId: currentProject.id }}
                      className="sticker-btn"
                      style={{
                        background: 'var(--yellow)',
                        padding: '6px 14px',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                      }}
                    >
                      Case Study & Details &rarr;
                    </Link>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {currentProject.url && (
                      <a
                        href={currentProject.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sticker-btn"
                        style={{
                          background: 'var(--lime)',
                          flex: '1',
                          padding: '6px 12px',
                          fontSize: '0.85rem',
                          textDecoration: 'none',
                        }}
                      >
                        Visit Site ↗
                      </a>
                    )}
                    {currentProject.githubUrl && (
                      <a
                        href={currentProject.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sticker-btn"
                        style={{
                          flex: '1',
                          padding: '6px 12px',
                          fontSize: '0.85rem',
                          textDecoration: 'none',
                        }}
                      >
                        GitHub ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Active Project is "lab" (Interactive topology) */
          <div className="sticker">
            {/* Header Metadata */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                borderBottom: '2px solid var(--card-border)',
                paddingBottom: '12px',
                marginBottom: '24px',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                color: 'var(--text-muted)',
              }}
            >
              <span>WORK - PPTI / NETWORK INFRASTRUCTURE</span>
              <span>YEAR - 2026</span>
              <span>CATEGORY - INTERACTIVE TOPOLOGY</span>
            </div>

            <div className="bento-grid">
              {/* SVG Canvas column */}
              <div style={{ border: '2px solid var(--card-border)', borderRadius: '10px', background: 'var(--card-bg)', overflow: 'hidden', padding: '10px' }} className="col-8">
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
                      
                      {renderNodeIcon(node.icon, node.cx, node.cy)}

                      <rect
                        x={node.cx - 60}
                        y={node.cy + 30}
                        width="120"
                        height="18"
                        fill="#fff"
                        stroke="#000"
                        strokeWidth="2"
                        rx="4"
                        style={{ filter: 'drop-shadow(2px 2px 0px #000)' }}
                      />
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
                    background: '#1a1a1a',
                    color: '#00ff66',
                    fontFamily: 'monospace',
                    borderRadius: '12px',
                    border: '3px solid #000',
                    boxShadow: '4px 4px 0px #000',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '12px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f', display: 'inline-block' }} />
                    <span style={{ color: '#888', fontSize: '0.8rem', marginLeft: 'auto' }}>node_inspector.sh</span>
                  </div>

                  <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '12px' }}>
                    {selectedNode ? selectedNode.name : 'CLICK ANY NODE'}
                  </h3>

                  <p style={{ color: '#bbb', fontSize: '0.85rem', marginBottom: '16px', lineHeight: '1.4' }}>
                    {selectedNode
                      ? selectedNode.desc
                      : 'Interactive topology diagram showing how services, routing firewalls, and server containers synchronize.'}
                  </p>

                  {selectedNode && (
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '8px' }}>
                        TECH STACK:
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {selectedNode.tech.map((t) => (
                          <span
                            key={t}
                            style={{
                              background: '#333',
                              color: '#fff',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =================================================================== */}
      {/* SECONDARY LIST: "MORE WORKS & EXPERIMENTS" (Non-featured projects) */}
      {/* =================================================================== */}
      {moreProjects.length > 0 && (
        <section style={{ marginTop: '70px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 className="stroke-text" style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
              MORE WORKS & EXPERIMENTS
            </h2>
            <p style={{ fontWeight: 'bold', color: '#444', fontSize: '1rem' }}>
              Additional utilities, administrative systems, and side experiments.
            </p>
          </div>

          <div className="bento-grid">
            {moreProjects.map((p) => (
              <div key={p.id} className="col-6">
                <div
                  className="sticker"
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: 'var(--white)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="open-badge" style={{ fontSize: '0.75rem' }}>
                        {p.category}
                      </span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {p.year} · {p.status}
                      </span>
                    </div>

                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '8px' }}>
                      {p.title}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '12px' }}>
                      {p.desc}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                      {p.tech.map((t) => (
                        <span key={t} className="tech-badge" style={{ fontSize: '0.75rem', padding: '2px 6px' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderTop: '2px dashed var(--card-border)', paddingTop: '10px', marginTop: '12px' }}>
                    <Link
                      to="/projects/$projectId"
                      params={{ projectId: p.id }}
                      className="sticker-btn"
                      style={{ padding: '4px 12px', fontSize: '0.8rem', textDecoration: 'none' }}
                    >
                      Details &rarr;
                    </Link>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {p.githubUrl && (
                        <a
                          href={p.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sticker-btn"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                          GitHub ↗
                        </a>
                      )}
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sticker-btn"
                          style={{ background: 'var(--lime)', color: '#0c0c0c', padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                          Visit ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Connect Card */}
      <section className="scroll-reveal" style={{ marginTop: '80px' }}>
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
            Want to build a project, deploy virtualization clusters, or collaborate? Drop an email at <strong>me@ardianryan.com</strong>
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '14px' }}>
            {[
              { label: '✉ me@ardianryan.com', href: 'mailto:me@ardianryan.com', color: 'var(--lime)' },
              { label: 'GitHub Profile', href: 'https://github.com/ardianryan', color: 'var(--yellow)' },
              { label: 'Dev Site (ppti.me)', href: 'https://ppti.me', color: 'var(--white)' },
              { label: 'YouTube', href: 'https://youtube.com/@ardianr94', color: 'var(--white)' },
              { label: 'Instagram', href: 'https://instagram.com/ardianryan_', color: 'var(--yellow)' },
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
                  padding: '10px 22px',
                  boxShadow: '3px 3px 0px var(--black)',
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Env Default Warning Sheet */}
      <EnvAlertSheet envStatus={envStatus} />
    </div>
  )
}
