import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState, useEffect, useRef } from 'react'
import { getDatabaseProvider, verifyAdminPassword, getEnvVar } from '../data/provider'
import type { Project, Screenshot, ProfileData, AboutSection, SeoConfig } from '../data/provider'
import { convertAndOptimizeToWebP } from '../utils/imageOptimizer'
import { uploadBase64ToR2, isR2Configured } from '../utils/r2Uploader'
import { verifyTurnstileToken } from '../utils/turnstile'
import { generateLlmsTxt, generateLlmsFullTxt } from '../utils/llmsGenerator'
import { syncStaticLlmsFiles } from '../utils/llmsWriter.server'
import EnvAlertSheet from '../components/EnvAlertSheet'

// In-Memory Rate Limiter for Login Protection
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>()

function checkRateLimit(identifier: string = 'global'): void {
  const now = Date.now()
  const record = loginAttempts.get(identifier)

  if (record) {
    if (record.lockedUntil > now) {
      const waitSec = Math.ceil((record.lockedUntil - now) / 1000)
      throw new Error(`Security Lockout: Too many failed login attempts. Please wait ${waitSec}s before trying again.`)
    }
    if (now - record.lockedUntil > 300000) {
      loginAttempts.delete(identifier)
    }
  }
}

function recordLoginFailure(identifier: string = 'global'): void {
  const now = Date.now()
  const record = loginAttempts.get(identifier) || { count: 0, lockedUntil: 0 }
  record.count += 1

  if (record.count >= 5) {
    record.lockedUntil = now + 60000 // 60s lockout
  }
  loginAttempts.set(identifier, record)
}

function resetLoginAttempts(identifier: string = 'global'): void {
  loginAttempts.delete(identifier)
}

// Server Functions
const verifyAuthFn = createServerFn({ method: 'POST' })
  .validator((data: { password: string; turnstileToken?: string; isSessionRestore?: boolean }) => data)
  .handler(async ({ data }) => {
    checkRateLimit()

    if (!data.isSessionRestore) {
      const isTokenValid = await verifyTurnstileToken(data.turnstileToken)
      if (!isTokenValid) {
        recordLoginFailure()
        throw new Error('Bot validation failed: Turnstile verification did not pass.')
      }
    }

    const isValid = verifyAdminPassword(data.password)
    if (!isValid) {
      recordLoginFailure()
      // Artificial delay to prevent brute-force timing enumeration
      await new Promise((resolve) => setTimeout(resolve, 350))
      return false
    }

    resetLoginAttempts()
    return true
  })

const uploadMediaToR2Fn = createServerFn({ method: 'POST' })
  .validator((data: { password: string; base64Data: string; fileName: string }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminPassword(data.password)) {
      throw new Error('Unauthorized: Invalid admin password')
    }
    return await uploadBase64ToR2({
      base64Data: data.base64Data,
      fileName: data.fileName,
    })
  })

const saveProjectFn = createServerFn({ method: 'POST' })
  .validator((data: { password: string; project: Project }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminPassword(data.password)) {
      throw new Error('Unauthorized: Invalid admin password')
    }
    const provider = getDatabaseProvider()
    await provider.saveProject(data.project)
    const updatedData = await provider.getData()
    await syncStaticLlmsFiles(updatedData)
    return { success: true }
  })

const deleteProjectFn = createServerFn({ method: 'POST' })
  .validator((data: { password: string; id: string }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminPassword(data.password)) {
      throw new Error('Unauthorized: Invalid admin password')
    }
    const provider = getDatabaseProvider()
    await provider.deleteProject(data.id)
    const updatedData = await provider.getData()
    await syncStaticLlmsFiles(updatedData)
    return { success: true }
  })

const saveProfileFn = createServerFn({ method: 'POST' })
  .validator((data: { password: string; profile: ProfileData }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminPassword(data.password)) {
      throw new Error('Unauthorized: Invalid admin password')
    }
    const provider = getDatabaseProvider()
    await provider.saveProfile(data.profile)
    const updatedData = await provider.getData()
    await syncStaticLlmsFiles(updatedData)
    return { success: true }
  })

const syncLlmsFilesFn = createServerFn({ method: 'POST' })
  .validator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminPassword(data.password)) {
      throw new Error('Unauthorized: Invalid admin password')
    }
    const provider = getDatabaseProvider()
    const updatedData = await provider.getData()
    await syncStaticLlmsFiles(updatedData)
    return {
      success: true,
      llmsTxt: generateLlmsTxt(updatedData),
      llmsFullTxt: generateLlmsFullTxt(updatedData),
    }
  })

const getCtrlDataFn = createServerFn({ method: 'GET' }).handler(async () => {
  const provider = getDatabaseProvider()
  const portfolio = await provider.getData()
  return {
    ...portfolio,
    turnstileSiteKey: getEnvVar('TURNSTILE_SITE_KEY', ''),
    isR2Ready: isR2Configured(),
  }
})

export const Route = createFileRoute('/ctrl-desk')({
  loader: async () => {
    return await getCtrlDataFn()
  },
  component: CtrlDeskPage,
})

function CtrlDeskPage() {
  const router = useRouter()
  const data = Route.useLoaderData()
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [passwordInput, setPasswordInput] = useState<string>('')
  const [activePassword, setActivePassword] = useState<string>('')
  const [turnstileToken, setTurnstileToken] = useState<string>('')
  const [authError, setAuthError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [uploadingState, setUploadingState] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'projects' | 'profile' | 'seo'>('projects')

  const turnstileContainerRef = useRef<HTMLDivElement>(null)

  // Projects states
  const [projectsList, setProjectsList] = useState<Project[]>(data.projects)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [techInput, setTechInput] = useState<string>('')
  const [statusMessage, setStatusMessage] = useState<string>('')

  // Profile states
  const defaultProfile: ProfileData = data.profile || {
    name: 'Ryan Ardian',
    title: 'Fullstack Developer & Network Specialist',
    tagline: "Fullstack Software Engineer & Network Infrastructure Specialist bridging modern web architectures with robust enterprise routing.",
    badgeText: '#OPENTOWORK',
    avatarUrl: '/favicon.svg',
    shortBio: 'I am a Fullstack Software Engineer and Network Infrastructure Specialist with extensive experience designing, developing, and deploying mission-critical systems across both software and network layers.',
    aboutSections: [
      {
        id: 'edu',
        title: 'EDUCATION & INFORMATICS INSTRUCTION',
        subtitle: 'SMA Negeri 1 Gedeg (Informatics Educator)',
        desc: 'Actively teaching computer science and informatics at SMA Negeri 1 Gedeg.',
        tags: ['Informatics', 'Web Curriculum'],
        color: 'pink',
      },
    ],
  }
  const [profileForm, setProfileForm] = useState<ProfileData>(defaultProfile)

  // SEO & AEO & LLMS states
  const defaultSeo: SeoConfig = defaultProfile.seo || {
    siteTitle: 'Ardian Ryan - Fullstack Developer & Network Specialist',
    metaDescription: 'Portfolio of Ardian Ryan — Web Developer & Network Systems Specialist specializing in React, TypeScript, Laravel, Docker, Cloudflare R2/Hyperdrive, and RouterOS infrastructure.',
    keywords: [
      'Ardian Ryan',
      'Fullstack Developer',
      'Network Specialist',
      'Laravel',
      'React',
      'TypeScript',
      'Cloudflare R2',
      'Cloudflare Hyperdrive',
      'Mojokerto Developer',
      'PPTI',
    ],
    faviconUrl: '/favicon.svg',
    ogImageUrl: '/favicon.png',
    canonicalUrl: 'https://ardianryan.com',
    author: 'Ardian Ryan',
    geo: {
      region: 'ID-JI',
      placename: 'Mojokerto, East Java, Indonesia',
      position: '-7.4726;112.4385',
      icbm: '-7.4726, 112.4385',
    },
  }
  const [seoForm, setSeoForm] = useState<SeoConfig>(defaultSeo)
  const [keywordsText, setKeywordsText] = useState<string>((defaultSeo.keywords || []).join(', '))
  const [llmsSyncStatus, setLlmsSyncStatus] = useState<string>('')
  const [isDraggingScreenshots, setIsDraggingScreenshots] = useState<boolean>(false)

  // Restore authentication session from browser storage across page reloads
  useEffect(() => {
    try {
      const savedPass = localStorage.getItem('ctrl_desk_session_pwd') || sessionStorage.getItem('ctrl_desk_session_pwd')
      if (savedPass) {
        verifyAuthFn({
          data: {
            password: savedPass,
            isSessionRestore: true,
          },
        }).then((isValid) => {
          if (isValid) {
            setIsAuthenticated(true)
            setActivePassword(savedPass)
          } else {
            localStorage.removeItem('ctrl_desk_session_pwd')
            sessionStorage.removeItem('ctrl_desk_session_pwd')
          }
        }).catch(() => {})
      }
    } catch {}
  }, [])

  // Turnstile script & widget injection (only if turnstileSiteKey is provided)
  useEffect(() => {
    if (!isAuthenticated && data.turnstileSiteKey) {
      const scriptId = 'cf-turnstile-script'
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script')
        script.id = scriptId
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        script.async = true
        script.defer = true
        script.onload = () => {
          if ((window as any).turnstile && turnstileContainerRef.current) {
            ;(window as any).turnstile.render(turnstileContainerRef.current, {
              sitekey: data.turnstileSiteKey,
              callback: (token: string) => setTurnstileToken(token),
            })
          }
        }
        document.head.appendChild(script)
      } else if ((window as any).turnstile && turnstileContainerRef.current) {
        ;(window as any).turnstile.render(turnstileContainerRef.current, {
          sitekey: data.turnstileSiteKey,
          callback: (token: string) => setTurnstileToken(token),
        })
      }
    }
  }, [isAuthenticated, data.turnstileSiteKey])

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setAuthError('')
    try {
      const isValid = await verifyAuthFn({
        data: {
          password: passwordInput,
          turnstileToken: turnstileToken || undefined,
        },
      })

      if (isValid) {
        setIsAuthenticated(true)
        setActivePassword(passwordInput)
        try {
          localStorage.setItem('ctrl_desk_session_pwd', passwordInput)
          sessionStorage.setItem('ctrl_desk_session_pwd', passwordInput)
        } catch {}
      } else {
        setAuthError('Access Denied: Incorrect secret password!')
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Server verification error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Lock desk & clear session
  const handleLockDesk = () => {
    setIsAuthenticated(false)
    setActivePassword('')
    setPasswordInput('')
    try {
      localStorage.removeItem('ctrl_desk_session_pwd')
      sessionStorage.removeItem('ctrl_desk_session_pwd')
    } catch {}
  }

  // Auto WebP Conversion & R2 Upload handler
  const handleUploadMedia = async (
    file: File,
    onSuccess: (url: string) => void
  ) => {
    setUploadingState('Optimizing image to WebP...')
    try {
      const { base64, fileName, size } = await convertAndOptimizeToWebP(file)
      setUploadingState(`Uploading ${(size / 1024).toFixed(1)} KB WebP to Cloudflare R2...`)

      const res = await uploadMediaToR2Fn({
        data: {
          password: activePassword,
          base64Data: base64,
          fileName,
        },
      })

      onSuccess(res.url)
      setUploadingState('Upload complete!')
      setTimeout(() => setUploadingState(''), 2500)
    } catch (err: any) {
      alert(`Upload error: ${err?.message || 'Failed to upload to R2'}`)
      setUploadingState('')
    }
  }

  // Open edit modal for an existing project
  const handleEdit = (project: Project) => {
    setEditingProject({
      ...project,
      featured: project.featured !== false,
      screenshots: project.screenshots ? [...project.screenshots] : [],
    })
    setTechInput(project.tech.join(', '))
    setStatusMessage('')
  }

  // Open create modal for a new project
  const handleCreateNew = () => {
    const newProj: Project = {
      id: `project-${Date.now()}`,
      title: 'New Project Title',
      work: 'Personal',
      year: new Date().getFullYear().toString(),
      category: 'Web App',
      featured: false,
      tech: ['React', 'TypeScript'],
      desc: 'Project overview and details here.',
      status: 'Active',
      screenshots: [
        { id: 'screen-1', title: 'Main Screen', desc: 'Overview of the application' },
      ],
    }
    setEditingProject(newProj)
    setTechInput(newProj.tech.join(', '))
    setStatusMessage('')
  }

  // Save project changes to database
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProject) return

    setLoading(true)
    setStatusMessage('')

    const updatedTech = techInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const finalProject: Project = {
      ...editingProject,
      tech: updatedTech,
    }

    try {
      await saveProjectFn({
        data: {
          password: activePassword,
          project: finalProject,
        },
      })

      setProjectsList((prev) => {
        const idx = prev.findIndex((p) => p.id === finalProject.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = finalProject
          return next
        }
        return [...prev, finalProject]
      })

      setStatusMessage('Project saved successfully to database!')
      router.invalidate()
      setTimeout(() => setEditingProject(null), 800)
    } catch (err: any) {
      setStatusMessage(`Error saving: ${err?.message || 'Failed'}`)
    } finally {
      setLoading(false)
    }
  }

  // Delete project handler
  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete project ID: "${id}"?`)) return

    setLoading(true)
    try {
      await deleteProjectFn({
        data: {
          password: activePassword,
          id,
        },
      })

      setProjectsList((prev) => prev.filter((p) => p.id !== id))
      router.invalidate()
    } catch (err: any) {
      alert(`Delete failed: ${err?.message || 'Error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Save profile changes to database
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatusMessage('')
    try {
      await saveProfileFn({
        data: {
          password: activePassword,
          profile: profileForm,
        },
      })
      setStatusMessage('Profile & About Me updated successfully and LLMs.txt synchronized!')
      router.invalidate()
    } catch (err: any) {
      setStatusMessage(`Error updating profile: ${err?.message || 'Failed'}`)
    } finally {
      setLoading(false)
    }
  }

  // Save SEO, GEO, and Favicon settings
  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatusMessage('')
    try {
      const updatedProfile: ProfileData = {
        ...profileForm,
        seo: {
          ...seoForm,
          keywords: keywordsText.split(',').map((k) => k.trim()).filter(Boolean),
        },
      }
      await saveProfileFn({
        data: {
          password: activePassword,
          profile: updatedProfile,
        },
      })
      setProfileForm(updatedProfile)
      setStatusMessage('SEO, GEO, Favicon & AEO settings saved! /llms.txt & /llms-full.txt auto-updated.')
      router.invalidate()
    } catch (err: any) {
      setStatusMessage(`Error saving SEO: ${err?.message || 'Failed'}`)
    } finally {
      setLoading(false)
    }
  }

  // Manual re-sync of static LLMs files
  const handleManualSyncLlms = async () => {
    setLoading(true)
    setLlmsSyncStatus('Regenerating LLMs.txt & LLMs-Full.txt...')
    try {
      await syncLlmsFilesFn({
        data: {
          password: activePassword,
        },
      })
      setLlmsSyncStatus('/llms.txt and /llms-full.txt successfully regenerated & written to /public.')
      setTimeout(() => setLlmsSyncStatus(''), 4000)
    } catch (err: any) {
      setLlmsSyncStatus(`Sync error: ${err?.message || 'Failed'}`)
    } finally {
      setLoading(false)
    }
  }

  // Add / Remove Screenshot
  const handleAddScreenshot = () => {
    if (!editingProject) return
    const newScreenshot: Screenshot = {
      id: `screen-${Date.now()}`,
      title: 'New Screenshot',
      desc: 'Screenshot description here',
    }
    setEditingProject({
      ...editingProject,
      screenshots: [...(editingProject.screenshots || []), newScreenshot],
    })
  }

  const handleRemoveScreenshot = (idx: number) => {
    if (!editingProject || !editingProject.screenshots) return
    const next = [...editingProject.screenshots]
    next.splice(idx, 1)
    setEditingProject({
      ...editingProject,
      screenshots: next,
    })
  }

  // Batch upload and auto-convert multiple screenshots to WebP -> R2
  const handleUploadMultipleScreenshots = async (files: FileList | File[]) => {
    if (!editingProject) return
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (fileArray.length === 0) return

    setUploadingState(`Preparing ${fileArray.length} image(s) for WebP conversion...`)
    const newScreenshots: Screenshot[] = []

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      setUploadingState(`[${i + 1}/${fileArray.length}] Optimizing ${file.name} to WebP...`)
      try {
        const { base64, fileName, size } = await convertAndOptimizeToWebP(file)
        setUploadingState(`[${i + 1}/${fileArray.length}] Uploading ${(size / 1024).toFixed(1)} KB WebP to Cloudflare R2...`)

        const res = await uploadMediaToR2Fn({
          data: {
            password: activePassword,
            base64Data: base64,
            fileName,
          },
        })

        const cleanTitle = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())

        newScreenshots.push({
          id: `screen_${Date.now()}_${i}`,
          title: cleanTitle || `Screenshot ${i + 1}`,
          desc: `UI screenshot for ${cleanTitle}`,
          imageUrl: res.url,
        })
      } catch (err: any) {
        alert(`Error uploading ${file.name}: ${err?.message || 'Failed'}`)
      }
    }

    if (newScreenshots.length > 0) {
      setEditingProject({
        ...editingProject,
        screenshots: [...(editingProject.screenshots || []), ...newScreenshots],
      })
      setUploadingState(`✅ Successfully converted & uploaded ${newScreenshots.length} screenshot(s) to R2!`)
      setTimeout(() => setUploadingState(''), 3000)
    } else {
      setUploadingState('')
    }
  }

  // Add / Remove About Sections
  const handleAddAboutSection = () => {
    const newSec: AboutSection = {
      id: `sec-${Date.now()}`,
      title: 'New Section Title',
      subtitle: 'Organization / Specialty',
      desc: 'Detailed narrative description of experience or teaching journey.',
      tags: ['Topic 1', 'Topic 2'],
      color: 'white',
    }
    setProfileForm({
      ...profileForm,
      aboutSections: [...profileForm.aboutSections, newSec],
    })
  }

  const handleRemoveAboutSection = (idx: number) => {
    const next = [...profileForm.aboutSections]
    next.splice(idx, 1)
    setProfileForm({
      ...profileForm,
      aboutSections: next,
    })
  }

  // =========================================================================
  // VIEW 1: GATEWAY LOGIN SCREEN (With Turnstile protection)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="container" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          className="sticker"
          style={{
            maxWidth: '460px',
            width: '100%',
            background: 'var(--white)',
            textAlign: 'center',
            padding: '36px 24px',
            transform: 'rotate(-1deg)',
          }}
        >
          <div
            className="sticker-outline"
            style={{
              background: 'var(--yellow)',
              border: '3px solid #000',
              padding: '6px 12px',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              display: 'inline-block',
              marginBottom: '16px',
            }}
          >
            [ RESTRICTED CONSOLE ]
          </div>

          <h2 className="stroke-text" style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
            CTRL DESK
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#555', marginBottom: '24px', fontWeight: 'bold' }}>
            Enter your secret admin key to manage portfolio projects, case studies, and bio.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="password"
              placeholder="Enter ADMIN_PASSWORD..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '3px solid var(--black)',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'monospace',
                background: 'var(--paper)',
                boxShadow: '3px 3px 0px var(--black)',
                outline: 'none',
              }}
              required
            />

            {/* Cloudflare Turnstile Widget Container (Only shown when configured) */}
            {data.turnstileSiteKey ? (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                <div ref={turnstileContainerRef} />
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: '#777', background: '#f5f5f5', border: '1px dashed #ccc', padding: '4px 8px', borderRadius: '4px' }}>
                [Dev Mode] Turnstile bypass enabled for development
              </div>
            )}

            {authError && (
              <div style={{ background: '#ffebee', border: '2px solid red', color: 'red', padding: '8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="sticker-btn"
              style={{
                background: 'var(--pink)',
                color: 'var(--white)',
                padding: '12px',
                fontSize: '1.05rem',
                cursor: 'pointer',
              }}
            >
              {loading ? 'Verifying Key...' : 'UNLOCK DESK'}
            </button>

            <Link to="/" style={{ fontSize: '0.85rem', color: '#666', fontWeight: 'bold', marginTop: '10px' }}>
              &larr; Return to Public Portfolio
            </Link>
          </form>
        </div>
      </div>
    )
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED MANAGEMENT DESK
  // =========================================================================
  return (
    <div className="container" style={{ padding: '30px 16px' }}>
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          borderBottom: '4px solid var(--black)',
          paddingBottom: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 className="stroke-text" style={{ fontSize: '2.5rem', margin: '0' }}>
            CTRL DESK
          </h1>
          <p style={{ fontWeight: 'bold', color: '#555', margin: '4px 0 0 0' }}>
            Portfolio Database, R2 Media & Content Manager
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="sticker-btn" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
            View Site ↗
          </Link>
          <button
            onClick={handleLockDesk}
            className="sticker-btn sticker-btn-pink"
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          >
            Lock Desk
          </button>
        </div>
      </div>

      {/* Uploading Status Banner */}
      {uploadingState && (
        <div
          style={{
            background: 'var(--lime)',
            color: '#000',
            border: '3px solid var(--card-border)',
            padding: '10px 16px',
            borderRadius: '8px',
            fontWeight: 'bold',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', background: '#000', color: '#fff', padding: '2px 6px', borderRadius: '3px' }}>UPLOADING</span> {uploadingState}
        </div>
      )}

      {/* Tab Navigation Switcher */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className="sticker-btn"
          style={{
            background: activeTab === 'projects' ? 'var(--yellow)' : 'var(--card-bg)',
            color: activeTab === 'projects' ? '#000' : 'var(--text-main)',
            padding: '10px 20px',
            fontSize: '0.95rem',
            transform: activeTab === 'projects' ? 'rotate(-1deg) scale(1.02)' : 'none',
          }}
        >
          PROJECTS & WORKS ({projectsList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className="sticker-btn"
          style={{
            background: activeTab === 'profile' ? 'var(--pink)' : 'var(--card-bg)',
            color: activeTab === 'profile' ? '#fff' : 'var(--text-main)',
            padding: '10px 20px',
            fontSize: '0.95rem',
            transform: activeTab === 'profile' ? 'rotate(1deg) scale(1.02)' : 'none',
          }}
        >
          PROFILE & ABOUT ME
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className="sticker-btn"
          style={{
            background: activeTab === 'seo' ? 'var(--lime)' : 'var(--card-bg)',
            color: activeTab === 'seo' ? '#000' : 'var(--text-main)',
            padding: '10px 20px',
            fontSize: '0.95rem',
            transform: activeTab === 'seo' ? 'rotate(-0.5deg) scale(1.02)' : 'none',
          }}
        >
          SEO, GEO & AI (LLMS)
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: PROJECTS LIST & MANAGER */}
      {/* ===================================================================== */}
      {activeTab === 'projects' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Tip: Check <strong>"Featured in Table of Contents"</strong> for primary showcase projects.
            </span>
            <button
              onClick={handleCreateNew}
              className="sticker-btn"
              style={{ background: 'var(--lime)', padding: '8px 16px', fontSize: '0.9rem' }}
            >
              + ADD NEW PROJECT
            </button>
          </div>

          <div className="bento-grid">
            {projectsList.map((proj) => (
              <div key={proj.id} className="col-6">
                <div
                  className="sticker"
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span className="open-badge" style={{ fontSize: '0.75rem' }}>
                          {proj.category}
                        </span>
                        {proj.featured !== false ? (
                          <span style={{ background: 'var(--yellow)', color: '#000', border: '2px solid var(--card-border)', borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            [FEATURED IN TOC]
                          </span>
                        ) : (
                          <span style={{ background: 'var(--badge-bg)', border: '2px solid var(--card-border)', borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                            IN "MORE WORKS"
                          </span>
                        )}
                      </div>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {proj.year} · {proj.status}
                      </span>
                    </div>

                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '8px' }}>
                      {proj.title}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '12px' }}>
                      {proj.desc}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      {proj.tech.map((t) => (
                        <span key={t} className="tech-badge" style={{ fontSize: '0.75rem', padding: '2px 6px' }}>
                          {t}
                        </span>
                      ))}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--card-border)', paddingTop: '8px' }}>
                      Screenshots: {proj.screenshots?.length || 0} screens · Case study: {proj.content ? 'Configured' : 'Draft'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '2px solid var(--card-border)', paddingTop: '12px' }}>
                    <button
                      onClick={() => handleEdit(proj)}
                      className="sticker-btn"
                      style={{ flex: '1', padding: '6px', fontSize: '0.85rem' }}
                    >
                      Edit Project & Media
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="sticker-btn"
                      style={{ background: '#e11d48', color: '#fff', padding: '6px 12px', fontSize: '0.85rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: PROFILE & ABOUT ME EDITOR */}
      {/* ===================================================================== */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="bento-grid">
            {/* Left Card: Basic Profile & Photo */}
            <div className="col-5">
              <div className="sticker" style={{ background: 'var(--white)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                  AVATAR & IDENTITY
                </h3>

                {/* Avatar Live Preview */}
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <img
                    src={profileForm.avatarUrl || 'https://github.com/ardianryan.png'}
                    alt="Preview"
                    className="sticker-outline"
                    style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #fff', objectFit: 'cover' }}
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).src = 'https://github.com/ardianryan.png'
                    }}
                  />
                  <div style={{ marginTop: '10px' }}>
                    <label
                      className="sticker-btn"
                      style={{
                        background: 'var(--lime)',
                        display: 'inline-block',
                        cursor: 'pointer',
                        padding: '4px 12px',
                        fontSize: '0.75rem',
                      }}
                    >
                      Upload New Avatar (WebP Auto-Convert)
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleUploadMedia(file, (url) => {
                              setProfileForm({ ...profileForm, avatarUrl: url })
                            })
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Avatar Image URL (or R2 Link):</label>
                    <input
                      type="url"
                      value={profileForm.avatarUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                      placeholder="https://github.com/ardianryan.png"
                      style={{ width: '100%', padding: '8px', border: '2px solid #000', borderRadius: '4px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Full Name (Sticker Display):</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '2px solid #000', borderRadius: '4px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Role / Headline:</label>
                    <input
                      type="text"
                      value={profileForm.title}
                      onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '2px solid #000', borderRadius: '4px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Status Badge Text:</label>
                    <input
                      type="text"
                      value={profileForm.badgeText}
                      onChange={(e) => setProfileForm({ ...profileForm, badgeText: e.target.value })}
                      placeholder="#OPENTOWORK"
                      style={{ width: '100%', padding: '8px', border: '2px solid #000', borderRadius: '4px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Contact Email:</label>
                    <input
                      type="email"
                      value={profileForm.email || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="me@ardianryan.com"
                      style={{ width: '100%', padding: '8px', border: '2px solid #000', borderRadius: '4px' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Homepage Bio & Tagline */}
            <div className="col-7">
              <div className="sticker" style={{ background: 'var(--white)', height: '100%' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                  HOMEPAGE BIO COPY
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Hero Intro Tagline:</label>
                    <input
                      type="text"
                      value={profileForm.tagline}
                      onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '2px solid #000', borderRadius: '4px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>About Me Card (Homepage Paragraph):</label>
                    <textarea
                      value={profileForm.shortBio}
                      onChange={(e) => setProfileForm({ ...profileForm, shortBio: e.target.value })}
                      rows={7}
                      style={{ width: '100%', padding: '8px', border: '2px solid #000', borderRadius: '4px', resize: 'vertical' }}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Full /about Page Cards Editor */}
            <div className="col-12">
              <div className="sticker" style={{ background: 'var(--paper)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', margin: 0 }}>
                    FULL "/ABOUT" PAGE SECTIONS & CARDS
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddAboutSection}
                    className="sticker-btn"
                    style={{ background: 'var(--lime)', padding: '4px 12px', fontSize: '0.8rem' }}
                  >
                    + Add Section Card
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {profileForm.aboutSections.map((sec, idx) => (
                    <div
                      key={sec.id || idx}
                      style={{
                        background: '#fff',
                        border: '2px solid #000',
                        borderRadius: '8px',
                        padding: '16px',
                        boxShadow: '3px 3px 0px #000',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Card #{idx + 1}</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <select
                            value={sec.color}
                            onChange={(e) => {
                              const next = [...profileForm.aboutSections]
                              next[idx].color = e.target.value
                              setProfileForm({ ...profileForm, aboutSections: next })
                            }}
                            style={{ padding: '4px', border: '1px solid #000', borderRadius: '4px', fontSize: '0.8rem' }}
                          >
                            <option value="pink">Pink Theme</option>
                            <option value="yellow">Yellow Theme</option>
                            <option value="white">White Theme</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveAboutSection(idx)}
                            style={{ background: '#ff4444', color: '#fff', border: '1px solid #000', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Title:</label>
                          <input
                            type="text"
                            value={sec.title}
                            onChange={(e) => {
                              const next = [...profileForm.aboutSections]
                              next[idx].title = e.target.value
                              setProfileForm({ ...profileForm, aboutSections: next })
                            }}
                            style={{ width: '100%', padding: '6px', border: '1px solid #000' }}
                            required
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Subtitle / Entity:</label>
                          <input
                            type="text"
                            value={sec.subtitle}
                            onChange={(e) => {
                              const next = [...profileForm.aboutSections]
                              next[idx].subtitle = e.target.value
                              setProfileForm({ ...profileForm, aboutSections: next })
                            }}
                            style={{ width: '100%', padding: '6px', border: '1px solid #000' }}
                            required
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Tags (comma-separated):</label>
                        <input
                          type="text"
                          value={sec.tags ? sec.tags.join(', ') : ''}
                          onChange={(e) => {
                            const next = [...profileForm.aboutSections]
                            next[idx].tags = e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                            setProfileForm({ ...profileForm, aboutSections: next })
                          }}
                          placeholder="RouterOS, Laravel, Docker"
                          style={{ width: '100%', padding: '6px', border: '1px solid #000' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Narrative Description:</label>
                        <textarea
                          value={sec.desc}
                          onChange={(e) => {
                            const next = [...profileForm.aboutSections]
                            next[idx].desc = e.target.value
                            setProfileForm({ ...profileForm, aboutSections: next })
                          }}
                          rows={3}
                          style={{ width: '100%', padding: '6px', border: '1px solid #000', resize: 'vertical' }}
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Status Message and Save Bar */}
          {statusMessage && (
            <div style={{ background: statusMessage.includes('Error') ? '#ffebee' : '#e8f5e9', padding: '12px', border: '2px solid #000', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem' }}>
              {statusMessage}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="submit"
              disabled={loading}
              className="sticker-btn"
              style={{ background: 'var(--pink)', color: '#fff', padding: '12px 32px', fontSize: '1.05rem' }}
            >
              {loading ? 'Saving Profile...' : 'SAVE PROFILE & ABOUT ME'}
            </button>
          </div>
        </form>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: SEO, GEO, AEO & LLMS.TXT ENGINE MANAGER */}
      {/* ===================================================================== */}
      {activeTab === 'seo' && (
        <form onSubmit={handleSaveSeo} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="bento-grid">
            {/* Card 1: Favicon & App Icons */}
            <div className="col-4">
              <div className="sticker" style={{ background: 'var(--card-bg)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '16px', borderBottom: '2px solid var(--card-border)', paddingBottom: '8px' }}>
                  FAVICON & APP ICON
                </h3>

                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '100px',
                      height: '100px',
                      margin: '0 auto 12px auto',
                      borderRadius: '16px',
                      border: '3px solid var(--card-border)',
                      background: 'var(--paper)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '4px 4px 0px var(--card-shadow)',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={seoForm.faviconUrl || '/favicon.svg'}
                      alt="Favicon Preview"
                      style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).src = '/favicon.svg'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setSeoForm({ ...seoForm, faviconUrl: '/favicon.svg', ogImageUrl: '/favicon.svg' })}
                      className="sticker-btn"
                      style={{ background: 'var(--yellow)', padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      Set Default Favicon (favicon.svg)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSeoForm({ ...seoForm, faviconUrl: '/favicon.png', ogImageUrl: '/favicon.png' })}
                      className="sticker-btn"
                      style={{ background: 'var(--paper)', padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      Set PNG Icon (favicon.png)
                    </button>

                    <label
                      className="sticker-btn"
                      style={{
                        background: 'var(--lime)',
                        display: 'inline-block',
                        cursor: 'pointer',
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                      }}
                    >
                      Upload Favicon (WebP/R2)
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleUploadMedia(file, (url) => {
                              setSeoForm({ ...seoForm, faviconUrl: url })
                            })
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Favicon Image URL:</label>
                  <input
                    type="text"
                    value={seoForm.faviconUrl}
                    onChange={(e) => setSeoForm({ ...seoForm, faviconUrl: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '2px solid var(--card-border)', borderRadius: '4px', background: 'var(--card-bg)', color: 'var(--text-main)' }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Core SEO & Social Meta */}
            <div className="col-8">
              <div className="sticker" style={{ background: 'var(--card-bg)', height: '100%' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '16px', borderBottom: '2px solid var(--card-border)', paddingBottom: '8px' }}>
                  CORE SEARCH ENGINE OPTIMIZATION (SEO)
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Page & Site Title:</label>
                    <input
                      type="text"
                      value={seoForm.siteTitle}
                      onChange={(e) => setSeoForm({ ...seoForm, siteTitle: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '2px solid var(--card-border)', borderRadius: '4px', background: 'var(--card-bg)', color: 'var(--text-main)' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Meta Description (Google Snippet):</label>
                    <textarea
                      value={seoForm.metaDescription}
                      onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
                      rows={3}
                      style={{ width: '100%', padding: '8px', border: '2px solid var(--card-border)', borderRadius: '4px', resize: 'vertical', background: 'var(--card-bg)', color: 'var(--text-main)' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Canonical Site URL:</label>
                      <input
                        type="url"
                        value={seoForm.canonicalUrl}
                        onChange={(e) => setSeoForm({ ...seoForm, canonicalUrl: e.target.value })}
                        style={{ width: '100%', padding: '8px', border: '2px solid var(--card-border)', borderRadius: '4px', background: 'var(--card-bg)', color: 'var(--text-main)' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Author Name:</label>
                      <input
                        type="text"
                        value={seoForm.author}
                        onChange={(e) => setSeoForm({ ...seoForm, author: e.target.value })}
                        style={{ width: '100%', padding: '8px', border: '2px solid var(--card-border)', borderRadius: '4px', background: 'var(--card-bg)', color: 'var(--text-main)' }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Keywords (comma-separated):</label>
                    <input
                      type="text"
                      value={keywordsText}
                      onChange={(e) => setKeywordsText(e.target.value)}
                      placeholder="Laravel, React, TypeScript, Cloudflare R2, RouterOS"
                      style={{ width: '100%', padding: '8px', border: '2px solid var(--card-border)', borderRadius: '4px', background: 'var(--card-bg)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>OpenGraph / Social Share Image URL:</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={seoForm.ogImageUrl}
                        onChange={(e) => setSeoForm({ ...seoForm, ogImageUrl: e.target.value })}
                        style={{ flex: 1, padding: '8px', border: '2px solid var(--card-border)', borderRadius: '4px', background: 'var(--card-bg)', color: 'var(--text-main)' }}
                      />
                      <label
                        className="sticker-btn"
                        style={{
                          background: 'var(--lime)',
                          cursor: 'pointer',
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Upload OG Image
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleUploadMedia(file, (url) => {
                                setSeoForm({ ...seoForm, ogImageUrl: url })
                              })
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: GEO Meta Tags */}
            <div className="col-12">
              <div className="sticker" style={{ background: 'var(--paper)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '14px', borderBottom: '2px solid var(--card-border)', paddingBottom: '6px' }}>
                  GEO LOCATION META TAGS (Local Search Anchoring)
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Geo Region (ISO):</label>
                    <input
                      type="text"
                      value={seoForm.geo.region}
                      onChange={(e) => setSeoForm({ ...seoForm, geo: { ...seoForm.geo, region: e.target.value } })}
                      placeholder="ID-JI"
                      style={{ width: '100%', padding: '6px', border: '1px solid var(--card-border)', borderRadius: '4px', background: 'var(--card-bg)', color: 'var(--text-main)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Placename:</label>
                    <input
                      type="text"
                      value={seoForm.geo.placename}
                      onChange={(e) => setSeoForm({ ...seoForm, geo: { ...seoForm.geo, placename: e.target.value } })}
                      placeholder="Mojokerto, East Java, Indonesia"
                      style={{ width: '100%', padding: '6px', border: '1px solid var(--card-border)', borderRadius: '4px', background: 'var(--card-bg)', color: 'var(--text-main)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>GPS Coordinates (Lat;Long):</label>
                    <input
                      type="text"
                      value={seoForm.geo.position}
                      onChange={(e) => setSeoForm({ ...seoForm, geo: { ...seoForm.geo, position: e.target.value } })}
                      placeholder="-7.4726;112.4385"
                      style={{ width: '100%', padding: '6px', border: '1px solid var(--card-border)', borderRadius: '4px', background: 'var(--card-bg)', color: 'var(--text-main)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>ICBM Format (Lat, Long):</label>
                    <input
                      type="text"
                      value={seoForm.geo.icbm}
                      onChange={(e) => setSeoForm({ ...seoForm, geo: { ...seoForm.geo, icbm: e.target.value } })}
                      placeholder="-7.4726, 112.4385"
                      style={{ width: '100%', padding: '6px', border: '1px solid var(--card-border)', borderRadius: '4px', background: 'var(--card-bg)', color: 'var(--text-main)' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: AI Engine Optimization (AEO) & LLMS.TXT */}
            <div className="col-12">
              <div className="sticker" style={{ background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', borderBottom: '2px solid var(--card-border)', paddingBottom: '10px' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', margin: 0 }}>
                      AI ENGINE OPTIMIZATION (AEO) & /llms.txt
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                      Enables AI models (ChatGPT, Claude, Perplexity, Cursor) to index your case studies & technical milestones cleanly.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <a
                      href="/llms.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sticker-btn"
                      style={{ background: 'var(--yellow)', padding: '6px 14px', fontSize: '0.8rem', textDecoration: 'none' }}
                    >
                      Open /llms.txt ↗
                    </a>
                    <a
                      href="/llms-full.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sticker-btn"
                      style={{ background: 'var(--pink)', color: '#fff', padding: '6px 14px', fontSize: '0.8rem', textDecoration: 'none' }}
                    >
                      Open /llms-full.txt ↗
                    </a>
                    <button
                      type="button"
                      onClick={handleManualSyncLlms}
                      disabled={loading}
                      className="sticker-btn"
                      style={{ background: 'var(--lime)', padding: '6px 14px', fontSize: '0.8rem' }}
                    >
                      Re-Sync Static LLMs
                    </button>
                  </div>
                </div>

                {llmsSyncStatus && (
                  <div style={{ background: '#e8f5e9', border: '2px solid #2e7d32', color: '#1b5e20', padding: '10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '16px' }}>
                    {llmsSyncStatus}
                  </div>
                )}

                {/* Real-time LLMs.txt preview */}
                <div>
                  <label style={{ fontWeight: 'bold', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>
                    Live Generated /llms.txt Preview:
                  </label>
                  <pre
                    style={{
                      background: '#0d1117',
                      color: '#58a6ff',
                      padding: '14px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                      maxHeight: '260px',
                      overflowY: 'auto',
                      border: '2px solid #30363d',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {generateLlmsTxt({
                      projects: projectsList,
                      networkNodes: data.networkNodes,
                      profile: {
                        ...profileForm,
                        seo: {
                          ...seoForm,
                          keywords: keywordsText.split(',').map((k) => k.trim()).filter(Boolean),
                        },
                      },
                    })}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Status Message and Save Bar */}
          {statusMessage && (
            <div style={{ background: statusMessage.includes('Error') ? '#ffebee' : '#e8f5e9', padding: '12px', border: '2px solid #000', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem' }}>
              {statusMessage}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="submit"
              disabled={loading}
              className="sticker-btn"
              style={{ background: 'var(--lime)', color: '#000', padding: '12px 36px', fontSize: '1.05rem' }}
            >
              {loading ? 'Saving SEO & Syncing LLMs...' : 'SAVE SEO, GEO & SYNC LLMS'}
            </button>
          </div>
        </form>
      )}

      {/* ===================================================================== */}
      {/* EDIT / CREATE PROJECT MODAL OVERLAY */}
      {/* ===================================================================== */}
      {editingProject && (
        <div
          style={{
            position: 'fixed',
            inset: '0',
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 1000,
            overflowY: 'auto',
          }}
        >
          <div
            className="sticker"
            style={{
              background: 'var(--white)',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', margin: 0 }}>
                {editingProject.id ? `EDIT PROJECT: ${editingProject.id}` : 'NEW PROJECT'}
              </h2>
              <button
                onClick={() => setEditingProject(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Project ID (Slug):</label>
                  <input
                    type="text"
                    value={editingProject.id}
                    onChange={(e) => setEditingProject({ ...editingProject, id: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '2px solid #000', borderRadius: '4px' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Work / Entity:</label>
                  <input
                    type="text"
                    value={editingProject.work}
                    onChange={(e) => setEditingProject({ ...editingProject, work: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '2px solid #000', borderRadius: '4px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Project Title:</label>
                <input
                  type="text"
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '2px solid #000', borderRadius: '4px' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Year:</label>
                  <input
                    type="text"
                    value={editingProject.year}
                    onChange={(e) => setEditingProject({ ...editingProject, year: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '2px solid #000', borderRadius: '4px' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Category:</label>
                  <input
                    type="text"
                    value={editingProject.category}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '2px solid #000', borderRadius: '4px' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Status:</label>
                  <input
                    type="text"
                    value={editingProject.status}
                    onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '2px solid #000', borderRadius: '4px' }}
                    required
                  />
                </div>
              </div>

              {/* Featured in Table of Contents Checkbox */}
              <div style={{ background: 'var(--yellow)', padding: '10px 14px', border: '2px solid #000', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={editingProject.featured !== false}
                  onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="featuredToggle" style={{ fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>
                  Feature in Table of Contents (Sticker Showcase)
                  <span style={{ fontWeight: 'normal', fontSize: '0.8rem', display: 'block', color: '#333' }}>
                    If unchecked, it will appear cleanly in the "More Works & Experiments" list below.
                  </span>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Live URL (Optional):</label>
                  <input
                    type="url"
                    value={editingProject.url || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, url: e.target.value })}
                    placeholder="https://..."
                    style={{ width: '100%', padding: '8px', border: '2px solid #000', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>GitHub Repo URL (Optional):</label>
                  <input
                    type="url"
                    value={editingProject.githubUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    style={{ width: '100%', padding: '8px', border: '2px solid #000', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Technologies (comma-separated):</label>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="React, TypeScript, Hono.js, Docker"
                  style={{ width: '100%', padding: '8px', border: '2px solid #000', borderRadius: '4px' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Short Overview (Homepage summary):</label>
                <textarea
                  value={editingProject.desc}
                  onChange={(e) => setEditingProject({ ...editingProject, desc: e.target.value })}
                  rows={2}
                  style={{ width: '100%', padding: '8px', border: '2px solid #000', borderRadius: '4px', resize: 'vertical' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Dedicated Case Study / Blog Post (Markdown / Paragraphs):</label>
                <textarea
                  value={editingProject.content || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, content: e.target.value })}
                  rows={5}
                  placeholder="Write detailed background, system architecture, key challenges, and solutions for the dedicated project page..."
                  style={{ width: '100%', padding: '8px', border: '2px solid #000', borderRadius: '4px', resize: 'vertical' }}
                />
              </div>

              {/* Screenshots Manager (Auto-Convert WebP to Cloudflare R2) */}
              <div style={{ border: '2px solid var(--card-border)', padding: '16px', borderRadius: '8px', background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontWeight: 'bold', fontSize: '0.95rem', display: 'block' }}>
                      📸 Screenshots & UI Media (Auto-Convert WebP ➔ Cloudflare R2)
                    </label>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Drag & drop image files below to automatically optimize to WebP and upload to your R2 bucket.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddScreenshot}
                    style={{ background: 'var(--yellow)', border: '2px solid #000', padding: '4px 10px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}
                  >
                    + Add Blank Card
                  </button>
                </div>

                {/* Drag & Drop Multi-Upload Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDraggingScreenshots(true)
                  }}
                  onDragLeave={() => setIsDraggingScreenshots(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDraggingScreenshots(false)
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleUploadMultipleScreenshots(e.dataTransfer.files)
                    }
                  }}
                  onClick={() => {
                    document.getElementById('multi-screenshot-input')?.click()
                  }}
                  style={{
                    border: `2px dashed ${isDraggingScreenshots ? 'var(--pink)' : '#000'}`,
                    borderRadius: '8px',
                    padding: '24px 16px',
                    textAlign: 'center',
                    background: isDraggingScreenshots ? 'rgba(255, 0, 127, 0.08)' : 'var(--paper)',
                    marginBottom: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    id="multi-screenshot-input"
                    type="file"
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleUploadMultipleScreenshots(e.target.files)
                      }
                    }}
                  />
                  <div style={{ fontSize: '2.2rem', marginBottom: '4px' }}>🖼️</div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    {uploadingState || 'Drag & drop image files here, or click to browse'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Supports PNG, JPG, JPEG, WebP (Multi-selection enabled) • Auto-optimizes to WebP and uploads to Cloudflare R2 CDN
                  </div>
                </div>

                {/* List of Screenshot Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(!editingProject.screenshots || editingProject.screenshots.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No screenshots added yet. Drag and drop images above to get started!
                    </div>
                  )}

                  {editingProject.screenshots?.map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--paper)',
                        border: '2px solid var(--card-border)',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'grid',
                        gridTemplateColumns: '120px 1fr auto',
                        gap: '12px',
                        alignItems: 'center',
                      }}
                    >
                      {/* Left: Thumbnail Preview or Upload Trigger */}
                      <div
                        style={{
                          width: '120px',
                          height: '80px',
                          borderRadius: '6px',
                          border: '2px solid #000',
                          background: '#111',
                          overflow: 'hidden',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {s.imageUrl ? (
                          <img
                            src={s.imageUrl}
                            alt={s.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#fff', textAlign: 'center', padding: '4px' }}>
                            No Image
                          </span>
                        )}
                        <label
                          title="Replace Image"
                          style={{
                            position: 'absolute',
                            bottom: '2px',
                            right: '2px',
                            background: 'var(--yellow)',
                            border: '1px solid #000',
                            borderRadius: '3px',
                            padding: '1px 5px',
                            fontSize: '0.65rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            color: '#000',
                          }}
                        >
                          Change
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleUploadMedia(file, (url) => {
                                  const next = [...(editingProject.screenshots || [])]
                                  next[idx].imageUrl = url
                                  setEditingProject({ ...editingProject, screenshots: next })
                                })
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* Middle: Title, Description & R2 URL status */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <input
                          type="text"
                          placeholder="Screenshot Title (e.g. Admin Dashboard Overview)"
                          value={s.title}
                          onChange={(e) => {
                            const next = [...(editingProject.screenshots || [])]
                            next[idx].title = e.target.value
                            setEditingProject({ ...editingProject, screenshots: next })
                          }}
                          style={{ padding: '6px 8px', border: '1.5px solid #000', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}
                        />
                        <input
                          type="text"
                          placeholder="Brief description / caption..."
                          value={s.desc}
                          onChange={(e) => {
                            const next = [...(editingProject.screenshots || [])]
                            next[idx].desc = e.target.value
                            setEditingProject({ ...editingProject, screenshots: next })
                          }}
                          style={{ padding: '6px 8px', border: '1.5px solid #000', borderRadius: '4px', fontSize: '0.8rem' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontFamily: 'monospace',
                              padding: '2px 6px',
                              borderRadius: '3px',
                              background: s.imageUrl ? 'var(--lime)' : '#eee',
                              color: '#000',
                              fontWeight: 'bold',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {s.imageUrl ? '⚡ R2 WebP Ready' : '⚠️ No Link'}
                          </span>
                          <input
                            type="text"
                            value={s.imageUrl || ''}
                            readOnly
                            placeholder="R2 CDN link will automatically appear here once uploaded"
                            style={{
                              flex: '1',
                              padding: '3px 6px',
                              fontSize: '0.72rem',
                              fontFamily: 'monospace',
                              border: '1px solid #ccc',
                              borderRadius: '3px',
                              background: '#f9f9f9',
                              color: '#555',
                            }}
                          />
                        </div>
                      </div>

                      {/* Right: Delete button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveScreenshot(idx)}
                        title="Delete Screenshot"
                        style={{
                          background: '#ff4444',
                          color: '#fff',
                          border: '2px solid #000',
                          borderRadius: '4px',
                          padding: '6px 10px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {statusMessage && (
                <div style={{ background: statusMessage.includes('Error') ? '#ffebee' : '#e8f5e9', padding: '8px', border: '2px solid #000', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                  {statusMessage}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="sticker-btn"
                  style={{ background: 'var(--white)', padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="sticker-btn"
                  style={{ background: 'var(--pink)', color: '#fff', padding: '8px 20px' }}
                >
                  {loading ? 'Saving to Database...' : 'SAVE CHANGES'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Env Warning Bottom Sheet */}
      <EnvAlertSheet envStatus={data.envStatus} />
    </div>
  )
}
