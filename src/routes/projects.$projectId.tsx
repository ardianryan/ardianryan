import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { getDatabaseProvider } from '../data/provider'
import ScreenshotCollage from '../components/ScreenshotCollage'
import EnvAlertSheet from '../components/EnvAlertSheet'
import MarkdownRenderer from '../components/MarkdownRenderer'

const getProjectDetailFn = createServerFn({ method: 'GET' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data: { id } }) => {
    const provider = getDatabaseProvider()
    const portfolio = await provider.getData()
    const project = portfolio.projects.find((p) => p.id === id)
    return {
      project: project || null,
      envStatus: portfolio.envStatus,
    }
  })

export const Route = createFileRoute('/projects/$projectId')({
  loader: async ({ params: { projectId } }) => {
    return await getProjectDetailFn({ data: { id: projectId } })
  },
  component: ProjectDetailPage,
})

function ProjectDetailPage() {
  const { project, envStatus } = Route.useLoaderData()
  const [activeImageZoom, setActiveImageZoom] = useState<string | null>(null)

  if (!project) {
    return (
      <div className="container" style={{ padding: '80px 16px', textAlign: 'center' }}>
        <div className="sticker" style={{ background: 'var(--yellow)', display: 'inline-block', padding: '36px', transform: 'rotate(-1deg)' }}>
          <h1 className="stroke-text" style={{ fontSize: '3rem', marginBottom: '10px' }}>
            PROJECT NOT FOUND
          </h1>
          <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '20px' }}>
            The requested project case study could not be located in the database.
          </p>
          <Link to="/" className="sticker-btn" style={{ background: 'var(--pink)', color: '#fff' }}>
            &larr; Return to Portfolio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '30px 16px' }}>
      {/* Top Back Navigation Bar */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          to="/"
          className="sticker-btn"
          style={{
            background: 'var(--white)',
            fontSize: '0.9rem',
            padding: '8px 18px',
            boxShadow: '3px 3px 0px var(--black)',
          }}
        >
          &larr; Back to Portfolio
        </Link>
      </div>

      {/* Main Project Hero Card */}
      <div className="sticker anim-fade-up" style={{ background: 'var(--white)', marginBottom: '32px' }}>
        {/* Metadata Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            borderBottom: '3px solid var(--black)',
            paddingBottom: '12px',
            marginBottom: '20px',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            fontWeight: 'bold',
          }}
        >
          <span>WORK - {project.work.toUpperCase()}</span>
          <span>YEAR - {project.year}</span>
          <span className="open-badge" style={{ fontSize: '0.8rem' }}>
            {project.category.toUpperCase()}
          </span>
          <span style={{ color: '#555' }}>STATUS: {project.status}</span>
        </div>

        {/* Title & Headline */}
        <h1 className="stroke-text hero-title" style={{ color: 'var(--black)', marginBottom: '12px' }}>
          {project.title}
        </h1>

        <p style={{ fontSize: '1.15rem', lineHeight: '1.6', color: '#333', maxWidth: '800px', marginBottom: '24px' }}>
          {project.desc}
        </p>

        {/* Action Buttons: Live URL & GitHub */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="sticker-btn"
              style={{
                background: 'var(--lime)',
                color: 'var(--black)',
                padding: '10px 22px',
                fontSize: '0.95rem',
              }}
            >
              Visit Live App ↗
            </a>
          )}

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sticker-btn"
              style={{
                background: 'var(--yellow)',
                color: 'var(--black)',
                padding: '10px 22px',
                fontSize: '0.95rem',
              }}
            >
              View on GitHub ↗
            </a>
          )}
        </div>

        {/* Tech Stack Chips */}
        <div style={{ borderTop: '2px dashed var(--black)', paddingTop: '16px' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', marginBottom: '10px' }}>
            [ TECHNOLOGIES & STACK ]
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {project.tech.map((t) => (
              <span key={t} className="tech-badge" style={{ fontSize: '0.85rem', padding: '4px 10px' }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Screenshot Showcase Section */}
      {project.screenshots && project.screenshots.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2 className="stroke-text" style={{ fontSize: '2rem', marginBottom: '16px' }}>
            INTERFACE & SCREENSHOTS
          </h2>
          <ScreenshotCollage projectId={project.id} screenshots={project.screenshots} />
        </section>
      )}

      {/* Engineering Case Study / Blog Post Section */}
      <section className="scroll-reveal" style={{ marginBottom: '40px' }}>
        <div
          className="paper-note"
          style={{
            background: 'var(--paper)',
            border: '3px solid var(--black)',
            padding: '32px 24px',
            borderRadius: '16px',
            boxShadow: '6px 6px 0px var(--black)',
            transform: 'none',
          }}
        >
          <div style={{ borderBottom: '3px solid var(--black)', paddingBottom: '12px', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', margin: 0 }}>
              ENGINEERING CASE STUDY & ARCHITECTURE
            </h2>
          </div>

          {project.content ? (
            <MarkdownRenderer content={project.content} />
          ) : (
            <div style={{ fontSize: '1rem', lineHeight: '1.6', color: '#444' }}>
              <p style={{ marginBottom: '12px' }}>
                This project is actively maintained and designed with a strong focus on high-throughput performance, clean decoupled architecture, and seamless cloud edge deployment.
              </p>
              <p>
                To customize or add in-depth architectural breakdowns for this project, visit the <strong>Control Desk (/ctrl-desk)</strong> and edit the Case Study content.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox / Zoom Modal */}
      {activeImageZoom && (
        <div
          onClick={() => setActiveImageZoom(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000,
            cursor: 'zoom-out',
          }}
        >
          <img
            src={activeImageZoom}
            alt="Enlarged screenshot"
            style={{
              maxWidth: '95vw',
              maxHeight: '90vh',
              borderRadius: '8px',
              border: '4px solid #fff',
              boxShadow: '0 0 24px rgba(0,0,0,0.8)',
            }}
          />
        </div>
      )}

      {/* Env Warning Bottom Sheet */}
      <EnvAlertSheet envStatus={envStatus} />
    </div>
  )
}
