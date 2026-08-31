import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import type { EnvStatus } from '../data/provider'

interface EnvAlertSheetProps {
  envStatus?: EnvStatus
}

export default function EnvAlertSheet({ envStatus }: EnvAlertSheetProps) {
  const [isDismissed, setIsDismissed] = useState<boolean>(true)

  useEffect(() => {
    // Only show if default env is detected and user hasn't dismissed it in this session
    const dismissed = sessionStorage.getItem('env_alert_dismissed') === 'true'
    if (envStatus?.isDefaultEnv && !dismissed) {
      setIsDismissed(false)
    }
  }, [envStatus])

  const handleDismiss = () => {
    setIsDismissed(true)
    sessionStorage.setItem('env_alert_dismissed', 'true')
  }

  // Never display internal dev fallback alerts in production
  if (import.meta.env.PROD || !envStatus || !envStatus.isDefaultEnv || isDismissed) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 999,
        maxWidth: '420px',
        width: 'calc(100% - 48px)',
        animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
    >
      <div
        className="sticker"
        style={{
          background: 'var(--yellow)',
          border: '4px solid var(--black)',
          borderRadius: '12px',
          boxShadow: '6px 6px 0px var(--black)',
          padding: '16px 20px',
          transform: 'rotate(-0.8deg)',
          position: 'relative',
        }}
      >
        {/* Top Header Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span
            className="open-badge"
            style={{
              background: 'var(--pink)',
              color: '#fff',
              fontSize: '0.75rem',
              padding: '2px 8px',
            }}
          >
            ● DEV / FALLBACK ENV ACTIVE
          </span>
          <button
            onClick={handleDismiss}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '2px 6px',
            }}
            title="Dismiss notification"
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>&times;</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {envStatus.errorMessage && (
            <div style={{ fontSize: '0.85rem', color: '#ffb4b4', background: '#301010', padding: '6px 10px', borderRadius: '4px' }}>
              <span style={{ background: '#d32f2f', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold', marginRight: '6px' }}>DATABASE NOTICE</span>
              <strong>Connection Failed:</strong> {envStatus.errorMessage}. Falling back to local JSON data.
            </div>
          )}

          {!envStatus.errorMessage && envStatus.isUsingFallbackDb && (
            <div style={{ fontSize: '0.85rem', color: '#f0f6fc' }}>
              <span style={{ background: '#1976d2', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold', marginRight: '6px' }}>LOCAL JSON</span>
              <strong>Local JSON Database Active:</strong> Currently reading from <code>src/data/db.json</code>. Set <code>DATABASE_URL</code> in <code>.env</code> to connect PostgreSQL/Supabase.
            </div>
          )}

          {envStatus.isDefaultPassword && (
            <div style={{ fontSize: '0.85rem', color: '#f0f6fc' }}>
              <span style={{ background: '#f57c00', color: '#000', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold', marginRight: '6px' }}>SECURITY</span>
              <strong>Default Password:</strong> Set your secret <code>ADMIN_PASSWORD</code> in <code>.env</code> before deploying.
            </div>
          )}
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '2px dashed #000', paddingTop: '10px' }}>
          <Link
            to="/ctrl-desk"
            className="sticker-btn"
            style={{
              background: 'var(--white)',
              padding: '4px 10px',
              fontSize: '0.75rem',
              boxShadow: '2px 2px 0px #000',
            }}
          >
            Open Control Desk &rarr;
          </Link>
          <button
            onClick={handleDismiss}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Got it, dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
