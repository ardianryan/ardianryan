import fs from 'fs/promises'
import path from 'path'
import pg from 'pg'
import mysql from 'mysql2/promise'
import nodeCrypto from 'crypto'
import defaultSeedData from './db.json'

// Data models
export interface Screenshot {
  id: string
  title: string
  desc: string
  imageUrl?: string
}

export interface Project {
  id: string
  title: string
  work: string
  year: string
  category: string
  tech: string[]
  desc: string
  status: string
  featured?: boolean
  url?: string
  githubUrl?: string
  content?: string
  screenshots?: Screenshot[]
}

export interface NetworkNode {
  id: string
  name: string
  tech: string[]
  desc: string
  icon: string
  cx: number
  cy: number
}

export interface AboutSection {
  id: string
  title: string
  subtitle: string
  desc: string
  tags?: string[]
  color: string
}

export interface GeoConfig {
  region: string
  placename: string
  position: string
  icbm: string
}

export interface SeoConfig {
  siteTitle: string
  metaDescription: string
  keywords: string[]
  faviconUrl: string
  ogImageUrl: string
  canonicalUrl: string
  author: string
  geo: GeoConfig
}

export interface ProfileData {
  name: string
  title: string
  email?: string
  tagline: string
  badgeText: string
  avatarUrl: string
  shortBio: string
  aboutSections: AboutSection[]
  seo?: SeoConfig
}

export interface EnvStatus {
  provider: string
  isDefaultEnv: boolean
  isUsingFallbackDb: boolean
  isDefaultPassword: boolean
  errorMessage?: string
}

export interface PortfolioData {
  projects: Project[]
  networkNodes: NetworkNode[]
  profile?: ProfileData
  envStatus?: EnvStatus
}

// Universal Environment Variable Resolver (Reads safely from process.env / runtime bindings)
export function getEnvVar(name: string, fallback = ''): string {
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name]!
  }
  const g = globalThis as any
  if (g) {
    if (typeof g[name] === 'string') return g[name]
    if (g.env && typeof g.env[name] === 'string') return g.env[name]
    if (g.__env__ && typeof g.__env__[name] === 'string') return g.__env__[name]
  }
  return fallback
}

export function getEnvStatus(providerName: string): EnvStatus {
  const currentPassword = getEnvVar('ADMIN_PASSWORD')
  const isDefaultPassword = !currentPassword || currentPassword === 'your-secret-password-here'
  const isUsingFallbackDb = providerName === 'json'
  const isDefaultEnv = isUsingFallbackDb || isDefaultPassword

  return {
    provider: providerName,
    isDefaultEnv,
    isUsingFallbackDb,
    isDefaultPassword,
  }
}

export interface DatabaseProvider {
  getData(): Promise<PortfolioData>
  saveProject(project: Project): Promise<void>
  deleteProject(id: string): Promise<void>
  saveProfile(profile: ProfileData): Promise<void>
}

// Fallback JSON data reader and writer (Edge & Serverless Safe)
async function readJsonDb(): Promise<PortfolioData> {
  try {
    if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
      const filePath = path.join(process.cwd(), 'src/data/db.json')
      const rawData = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(rawData) as PortfolioData
    }
  } catch {
    // In-memory bundled fallback for serverless / edge (Cloudflare Workers)
  }
  return JSON.parse(JSON.stringify(defaultSeedData)) as PortfolioData
}

async function writeJsonDb(data: PortfolioData): Promise<void> {
  try {
    if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
      const filePath = path.join(process.cwd(), 'src/data/db.json')
      const cleanData = {
        profile: data.profile,
        projects: data.projects,
        networkNodes: data.networkNodes,
      }
      await fs.writeFile(filePath, JSON.stringify(cleanData, null, 2), 'utf-8')
    }
  } catch (err) {
    console.warn('[JsonProvider] writeJsonDb skipped in serverless environment:', (err as Error).message)
  }
}

// 1. JSON Local Provider
class JsonProvider implements DatabaseProvider {
  async getData(): Promise<PortfolioData> {
    const data = await readJsonDb()
    data.envStatus = getEnvStatus('json')
    return data
  }

  async saveProject(project: Project): Promise<void> {
    const data = await readJsonDb()
    const index = data.projects.findIndex((p) => p.id === project.id)
    if (index >= 0) {
      data.projects[index] = project
    } else {
      data.projects.push(project)
    }
    await writeJsonDb(data)
  }

  async deleteProject(id: string): Promise<void> {
    const data = await readJsonDb()
    data.projects = data.projects.filter((p) => p.id !== id)
    await writeJsonDb(data)
  }

  async saveProfile(profile: ProfileData): Promise<void> {
    const data = await readJsonDb()
    data.profile = profile
    await writeJsonDb(data)
  }
}

// Auto-create database if target database does not exist yet (Postgres)
async function ensurePostgresDatabaseExists(connectionString: string): Promise<void> {
  try {
    const url = new URL(connectionString)
    const dbName = url.pathname.replace(/^\//, '')
    if (!dbName || dbName === 'postgres') return

    url.pathname = '/postgres'
    const maintenancePool = new pg.Pool({ connectionString: url.toString() })
    const client = await maintenancePool.connect()
    try {
      const checkRes = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName])
      if (checkRes.rowCount === 0) {
        console.log(`Database "${dbName}" does not exist. Auto-creating database...`)
        const safeName = dbName.replace(/[^a-zA-Z0-9_]/g, '')
        if (safeName) {
          await client.query(`CREATE DATABASE "${safeName}"`)
          console.log(`Database "${safeName}" created successfully!`)
        }
      }
    } finally {
      client.release()
      await maintenancePool.end()
    }
  } catch (err: any) {
    console.warn('Could not auto-create database via maintenance connection:', err?.message || err)
  }
}

// 2. PostgreSQL / Hyperdrive (Postgres) Provider
class PostgresProvider implements DatabaseProvider {
  private pool: pg.Pool
  private connectionString: string
  private label: string

  constructor(connectionString: string, label = 'postgres') {
    this.connectionString = connectionString
    this.label = label
    this.pool = new pg.Pool({
      connectionString,
      ssl: connectionString.includes('sslmode=require') || connectionString.includes('hyperdrive')
        ? { rejectUnauthorized: false }
        : undefined,
    })
  }

  async getData(): Promise<PortfolioData> {
    let client: pg.PoolClient | null = null
    try {
      try {
        client = await this.pool.connect()
      } catch (connErr: any) {
        if (connErr?.message?.includes('does not exist') || connErr?.code === '3D000') {
          await ensurePostgresDatabaseExists(this.connectionString)
          client = await this.pool.connect()
        } else {
          throw connErr
        }
      }

      // 1. Bootstrap tables if they do not exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS profile (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          tagline TEXT NOT NULL,
          badge_text VARCHAR(100) NOT NULL,
          avatar_url TEXT NOT NULL,
          short_bio TEXT NOT NULL
        );
      `)

      await client.query(`
        CREATE TABLE IF NOT EXISTS about_sections (
          id VARCHAR(100) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          subtitle VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          tags TEXT[] NOT NULL,
          color VARCHAR(50) NOT NULL
        );
      `)

      await client.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id VARCHAR(100) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          work VARCHAR(255) NOT NULL,
          year VARCHAR(50) NOT NULL,
          category VARCHAR(255) NOT NULL,
          tech TEXT[] NOT NULL,
          description TEXT NOT NULL,
          status VARCHAR(100) NOT NULL,
          featured BOOLEAN DEFAULT true,
          url TEXT,
          github_url TEXT,
          content TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `)

      // Auto-migrate missing columns if table already existed
      try {
        await client.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT true;`)
        await client.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_url VARCHAR(255);`)
        await client.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS content TEXT;`)
      } catch {}

      await client.query(`
        CREATE TABLE IF NOT EXISTS screenshots (
          id VARCHAR(100) PRIMARY KEY,
          project_id VARCHAR(100) REFERENCES projects(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          image_url TEXT
        );
      `)

      try {
        await client.query(`ALTER TABLE screenshots ADD COLUMN IF NOT EXISTS image_url TEXT;`)
      } catch {}

      await client.query(`
        CREATE TABLE IF NOT EXISTS network_nodes (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          tech TEXT[],
          description TEXT,
          icon VARCHAR(50),
          cx INTEGER,
          cy INTEGER
        );
      `)

      // 2. Check if DB has data, seed if empty
      const checkEmpty = await client.query('SELECT COUNT(*) FROM projects')
      const count = parseInt(checkEmpty.rows[0].count, 10)

      if (count === 0) {
        console.log(`Database [${this.label}] is empty. Bootstrapping seed data from db.json...`)
        const seedData = await readJsonDb()

        if (seedData.profile) {
          await client.query(
            `INSERT INTO profile (id, name, title, email, tagline, badge_text, avatar_url, short_bio)
             VALUES ('main', $1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO NOTHING`,
            [
              seedData.profile.name,
              seedData.profile.title,
              seedData.profile.email || 'me@ardianryan.com',
              seedData.profile.tagline,
              seedData.profile.badgeText,
              seedData.profile.avatarUrl,
              seedData.profile.shortBio,
            ]
          )

          for (const sec of seedData.profile.aboutSections) {
            await client.query(
              `INSERT INTO about_sections (id, title, subtitle, description, tags, color)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [sec.id, sec.title, sec.subtitle, sec.desc, sec.tags || [], sec.color]
            )
          }
        }

        for (const p of seedData.projects) {
          await client.query(
            `INSERT INTO projects (id, title, work, year, category, tech, description, status, featured, url, github_url, content) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
              p.id,
              p.title,
              p.work,
              p.year,
              p.category,
              p.tech,
              p.desc,
              p.status,
              p.featured !== false,
              p.url || null,
              p.githubUrl || null,
              p.content || null,
            ]
          )

          if (p.screenshots) {
            for (const s of p.screenshots) {
              await client.query(
                `INSERT INTO screenshots (id, project_id, title, description, image_url) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [`${p.id}_${s.id}`, p.id, s.title, s.desc, s.imageUrl || null]
              )
            }
          }
        }

        for (const n of seedData.networkNodes) {
          await client.query(
            `INSERT INTO network_nodes (id, name, tech, description, icon, cx, cy) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [n.id, n.name, n.tech, n.desc, n.icon, n.cx, n.cy]
          )
        }
        console.log(`Database [${this.label}] data successfully seeded!`)
      }

      // 3. Fetch data from tables
      const [profileRes, sectionsRes, projectsRes, screenshotsRes, nodesRes] = await Promise.all([
        client.query('SELECT * FROM profile WHERE id = $1', ['main']),
        client.query('SELECT * FROM about_sections'),
        client.query('SELECT * FROM projects'),
        client.query('SELECT * FROM screenshots'),
        client.query('SELECT * FROM network_nodes'),
      ])

      let profileData: ProfileData | undefined
      if (profileRes.rows.length > 0) {
        const pRow = profileRes.rows[0]
        profileData = {
          name: pRow.name,
          title: pRow.title,
          email: pRow.email || 'me@ardianryan.com',
          tagline: pRow.tagline,
          badgeText: pRow.badge_text,
          avatarUrl: pRow.avatar_url,
          shortBio: pRow.short_bio,
          aboutSections: sectionsRes.rows.map((r) => ({
            id: r.id,
            title: r.title,
            subtitle: r.subtitle,
            desc: r.description,
            tags: r.tags,
            color: r.color,
          })),
        }
      }

      // Assemble projects with screenshots array
      const projects: Project[] = projectsRes.rows.map((row) => {
        const rowScreenshots = screenshotsRes.rows
          .filter((s) => s.project_id === row.id)
          .map((s) => ({
            id: s.id.split('_').slice(1).join('_'),
            title: s.title,
            desc: s.description,
            imageUrl: s.image_url || undefined,
          }))

        return {
          id: row.id,
          title: row.title,
          work: row.work,
          year: row.year,
          category: row.category,
          tech: row.tech,
          desc: row.description,
          status: row.status,
          featured: row.featured !== false,
          url: row.url || undefined,
          githubUrl: row.github_url || undefined,
          content: row.content || undefined,
          screenshots: rowScreenshots.length > 0 ? rowScreenshots : undefined,
        }
      })

      const networkNodes: NetworkNode[] = nodesRes.rows.map((row) => ({
        id: row.id,
        name: row.name,
        tech: row.tech,
        desc: row.description,
        icon: row.icon,
        cx: row.cx,
        cy: row.cy,
      }))

      return {
        profile: profileData,
        projects,
        networkNodes,
        envStatus: getEnvStatus(this.label),
      }
    } catch (error: any) {
      console.warn(`⚠️ Could not connect to [${this.label}]. Falling back to local JSON data.`, error?.message || error)
      const data = await readJsonDb()
      data.envStatus = {
        ...getEnvStatus('json'),
        isUsingFallbackDb: true,
        errorMessage: `${this.label} connection error (${error?.message || 'Check credentials'})`,
      }
      return data
    } finally {
      if (client) client.release()
    }
  }

  async saveProject(project: Project): Promise<void> {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')

      await client.query(
        `INSERT INTO projects (id, title, work, year, category, tech, description, status, featured, url, github_url, content)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           work = EXCLUDED.work,
           year = EXCLUDED.year,
           category = EXCLUDED.category,
           tech = EXCLUDED.tech,
           description = EXCLUDED.description,
           status = EXCLUDED.status,
           featured = EXCLUDED.featured,
           url = EXCLUDED.url,
           github_url = EXCLUDED.github_url,
           content = EXCLUDED.content`,
        [
          project.id,
          project.title,
          project.work,
          project.year,
          project.category,
          project.tech,
          project.desc,
          project.status,
          project.featured !== false,
          project.url || null,
          project.githubUrl || null,
          project.content || null,
        ]
      )

      await client.query('DELETE FROM screenshots WHERE project_id = $1', [project.id])
      if (project.screenshots && project.screenshots.length > 0) {
        for (const s of project.screenshots) {
          await client.query(
            `INSERT INTO screenshots (id, project_id, title, description, image_url)
             VALUES ($1, $2, $3, $4, $5)`,
            [`${project.id}_${s.id}`, project.id, s.title, s.desc, s.imageUrl || null]
          )
        }
      }

      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }

  async deleteProject(id: string): Promise<void> {
    const client = await this.pool.connect()
    try {
      await client.query('DELETE FROM projects WHERE id = $1', [id])
    } finally {
      client.release()
    }
  }

  async saveProfile(profile: ProfileData): Promise<void> {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')

      await client.query(
        `INSERT INTO profile (id, name, title, email, tagline, badge_text, avatar_url, short_bio)
         VALUES ('main', $1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           title = EXCLUDED.title,
           email = EXCLUDED.email,
           tagline = EXCLUDED.tagline,
           badge_text = EXCLUDED.badge_text,
           avatar_url = EXCLUDED.avatar_url,
           short_bio = EXCLUDED.short_bio`,
        [
          profile.name,
          profile.title,
          profile.email || 'me@ardianryan.com',
          profile.tagline,
          profile.badgeText,
          profile.avatarUrl,
          profile.shortBio,
        ]
      )

      await client.query('DELETE FROM about_sections')
      for (const sec of profile.aboutSections) {
        await client.query(
          `INSERT INTO about_sections (id, title, subtitle, description, tags, color)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [sec.id, sec.title, sec.subtitle, sec.desc, sec.tags || [], sec.color]
        )
      }

      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }
}

// 3. MySQL / Hyperdrive (MySQL) Provider
class MysqlProvider implements DatabaseProvider {
  private pool: mysql.Pool
  private label: string

  constructor(connectionString: string, label = 'mysql') {
    this.label = label
    this.pool = mysql.createPool({
      uri: connectionString,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: {
        rejectUnauthorized: false,
      },
    })
  }

  async getData(): Promise<PortfolioData> {
    try {
      // 1. Bootstrap tables
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS profile (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          tagline TEXT NOT NULL,
          badge_text VARCHAR(100) NOT NULL,
          avatar_url TEXT NOT NULL,
          short_bio TEXT NOT NULL
        );
      `)

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS about_sections (
          id VARCHAR(100) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          subtitle VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          tags JSON NOT NULL,
          color VARCHAR(50) NOT NULL
        );
      `)

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id VARCHAR(100) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          work VARCHAR(255) NOT NULL,
          year VARCHAR(50) NOT NULL,
          category VARCHAR(255) NOT NULL,
          tech JSON NOT NULL,
          description TEXT NOT NULL,
          status VARCHAR(100) NOT NULL,
          featured BOOLEAN DEFAULT true,
          url VARCHAR(255),
          github_url VARCHAR(255),
          content TEXT
        );
      `)

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS screenshots (
          id VARCHAR(100) PRIMARY KEY,
          project_id VARCHAR(100) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          image_url TEXT
        );
      `)

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS network_nodes (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          tech JSON NOT NULL,
          description TEXT NOT NULL,
          icon VARCHAR(100) NOT NULL,
          cx INT NOT NULL,
          cy INT NOT NULL
        );
      `)

      // Check if empty -> seed from db.json!
      const [countRows]: any = await this.pool.query('SELECT COUNT(*) as count FROM projects')
      const count = countRows[0]?.count || 0

      if (count === 0) {
        console.log(`Database [${this.label}] is empty. Bootstrapping seed data from db.json...`)
        const seedData = await readJsonDb()

        if (seedData.profile) {
          await this.pool.query(
            `INSERT INTO profile (id, name, title, tagline, badge_text, avatar_url, short_bio)
             VALUES ('main', ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE name=VALUES(name)`,
            [
              seedData.profile.name,
              seedData.profile.title,
              seedData.profile.tagline,
              seedData.profile.badgeText,
              seedData.profile.avatarUrl,
              seedData.profile.shortBio,
            ]
          )

          for (const sec of seedData.profile.aboutSections) {
            await this.pool.query(
              `INSERT INTO about_sections (id, title, subtitle, description, tags, color)
               VALUES (?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE title=VALUES(title)`,
              [sec.id, sec.title, sec.subtitle, sec.desc, JSON.stringify(sec.tags || []), sec.color]
            )
          }
        }

        for (const p of seedData.projects) {
          await this.pool.query(
            `INSERT INTO projects (id, title, work, year, category, tech, description, status, featured, url, github_url, content)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              p.id,
              p.title,
              p.work,
              p.year,
              p.category,
              JSON.stringify(p.tech),
              p.desc,
              p.status,
              p.featured !== false,
              p.url || null,
              p.githubUrl || null,
              p.content || null,
            ]
          )

          if (p.screenshots) {
            for (const s of p.screenshots) {
              await this.pool.query(
                `INSERT INTO screenshots (id, project_id, title, description, image_url)
                 VALUES (?, ?, ?, ?, ?)`,
                [`${p.id}_${s.id}`, p.id, s.title, s.desc, s.imageUrl || null]
              )
            }
          }
        }

        for (const n of seedData.networkNodes) {
          await this.pool.query(
            `INSERT INTO network_nodes (id, name, tech, description, icon, cx, cy)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [n.id, n.name, JSON.stringify(n.tech), n.desc, n.icon, n.cx, n.cy]
          )
        }
        console.log(`Database [${this.label}] data successfully seeded!`)
      }

      // Fetch
      const [profileRows]: any = await this.pool.query('SELECT * FROM profile WHERE id = "main"')
      const [sectionRows]: any = await this.pool.query('SELECT * FROM about_sections')
      const [projectRows]: any = await this.pool.query('SELECT * FROM projects')
      const [screenshotRows]: any = await this.pool.query('SELECT * FROM screenshots')
      const [nodeRows]: any = await this.pool.query('SELECT * FROM network_nodes')

      let profileData: ProfileData | undefined
      if (profileRows.length > 0) {
        const pRow = profileRows[0]
        profileData = {
          name: pRow.name,
          title: pRow.title,
          tagline: pRow.tagline,
          badgeText: pRow.badge_text,
          avatarUrl: pRow.avatar_url,
          shortBio: pRow.short_bio,
          aboutSections: sectionRows.map((r: any) => ({
            id: r.id,
            title: r.title,
            subtitle: r.subtitle,
            desc: r.description,
            tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags,
            color: r.color,
          })),
        }
      }

      const projects: Project[] = projectRows.map((row: any) => {
        const rowScreenshots = screenshotRows
          .filter((s: any) => s.project_id === row.id)
          .map((s: any) => ({
            id: s.id.split('_').slice(1).join('_'),
            title: s.title,
            desc: s.description,
            imageUrl: s.image_url || undefined,
          }))

        return {
          id: row.id,
          title: row.title,
          work: row.work,
          year: row.year,
          category: row.category,
          tech: typeof row.tech === 'string' ? JSON.parse(row.tech) : row.tech,
          desc: row.description,
          status: row.status,
          featured: row.featured !== 0 && row.featured !== false,
          url: row.url || undefined,
          githubUrl: row.github_url || undefined,
          content: row.content || undefined,
          screenshots: rowScreenshots.length > 0 ? rowScreenshots : undefined,
        }
      })

      const networkNodes: NetworkNode[] = nodeRows.map((row: any) => ({
        id: row.id,
        name: row.name,
        tech: typeof row.tech === 'string' ? JSON.parse(row.tech) : row.tech,
        desc: row.description,
        icon: row.icon,
        cx: row.cx,
        cy: row.cy,
      }))

      return {
        profile: profileData,
        projects,
        networkNodes,
        envStatus: getEnvStatus(this.label),
      }
    } catch (error: any) {
      console.warn(`⚠️ Could not connect to [${this.label}]. Falling back to local JSON data.`, error?.message || error)
      const data = await readJsonDb()
      data.envStatus = {
        ...getEnvStatus('json'),
        isUsingFallbackDb: true,
        errorMessage: `${this.label} connection error (${error?.message || 'Check credentials'})`,
      }
      return data
    }
  }

  async saveProject(project: Project): Promise<void> {
    const conn = await this.pool.getConnection()
    try {
      await conn.beginTransaction()
      await conn.query(
        `INSERT INTO projects (id, title, work, year, category, tech, description, status, featured, url, github_url, content)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           work = VALUES(work),
           year = VALUES(year),
           category = VALUES(category),
           tech = VALUES(tech),
           description = VALUES(description),
           status = VALUES(status),
           featured = VALUES(featured),
           url = VALUES(url),
           github_url = VALUES(github_url),
           content = VALUES(content)`,
        [
          project.id,
          project.title,
          project.work,
          project.year,
          project.category,
          JSON.stringify(project.tech),
          project.desc,
          project.status,
          project.featured !== false,
          project.url || null,
          project.githubUrl || null,
          project.content || null,
        ]
      )

      await conn.query('DELETE FROM screenshots WHERE project_id = ?', [project.id])
      if (project.screenshots && project.screenshots.length > 0) {
        for (const s of project.screenshots) {
          await conn.query(
            `INSERT INTO screenshots (id, project_id, title, description, image_url)
             VALUES (?, ?, ?, ?, ?)`,
            [`${project.id}_${s.id}`, project.id, s.title, s.desc, s.imageUrl || null]
          )
        }
      }
      await conn.commit()
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }
  }

  async deleteProject(id: string): Promise<void> {
    await this.pool.query('DELETE FROM projects WHERE id = ?', [id])
  }

  async saveProfile(profile: ProfileData): Promise<void> {
    const conn = await this.pool.getConnection()
    try {
      await conn.beginTransaction()
      await conn.query(
        `INSERT INTO profile (id, name, title, tagline, badge_text, avatar_url, short_bio)
         VALUES ('main', ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           title = VALUES(title),
           tagline = VALUES(tagline),
           badge_text = VALUES(badge_text),
           avatar_url = VALUES(avatar_url),
           short_bio = VALUES(short_bio)`,
        [
          profile.name,
          profile.title,
          profile.tagline,
          profile.badgeText,
          profile.avatarUrl,
          profile.shortBio,
        ]
      )

      await conn.query('DELETE FROM about_sections')
      for (const sec of profile.aboutSections) {
        await conn.query(
          `INSERT INTO about_sections (id, title, subtitle, description, tags, color)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [sec.id, sec.title, sec.subtitle, sec.desc, JSON.stringify(sec.tags || []), sec.color]
        )
      }
      await conn.commit()
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }
  }
}

// 4. Supabase REST API Provider
class SupabaseProvider implements DatabaseProvider {
  private url: string
  private key: string

  constructor(url: string, key: string) {
    this.url = url.replace(/\/$/, '')
    this.key = key
  }

  async getData(): Promise<PortfolioData> {
    try {
      const headers = {
        apikey: this.key,
        Authorization: `Bearer ${this.key}`,
        'Content-Type': 'application/json',
      }

      const [projectsRes, screenshotsRes, nodesRes] = await Promise.all([
        fetch(`${this.url}/rest/v1/projects?select=*`, { headers }).then((res) => res.json()),
        fetch(`${this.url}/rest/v1/screenshots?select=*`, { headers }).then((res) => res.json()),
        fetch(`${this.url}/rest/v1/network_nodes?select=*`, { headers }).then((res) => res.json()),
      ])

      if (!Array.isArray(projectsRes) || projectsRes.length === 0) {
        console.warn('Supabase Rest response empty or invalid. Falling back to local JSON.')
        return readJsonDb()
      }

      const projects: Project[] = projectsRes.map((p: any) => {
        const projectScreenshots = Array.isArray(screenshotsRes)
          ? screenshotsRes
              .filter((s: any) => s.project_id === p.id)
              .map((s: any) => ({
                id: s.id,
                title: s.title,
                desc: s.description,
                imageUrl: s.image_url || undefined,
              }))
          : []

        return {
          id: p.id,
          title: p.title,
          work: p.work,
          year: p.year,
          category: p.category,
          tech: Array.isArray(p.tech) ? p.tech : JSON.parse(p.tech || '[]'),
          desc: p.description || p.desc,
          status: p.status,
          featured: p.featured !== false,
          url: p.url || undefined,
          githubUrl: p.github_url || undefined,
          content: p.content || undefined,
          screenshots: projectScreenshots.length > 0 ? projectScreenshots : undefined,
        }
      })

      const networkNodes: NetworkNode[] = nodesRes.map((n: any) => ({
        id: n.id,
        name: n.name,
        tech: Array.isArray(n.tech) ? n.tech : JSON.parse(n.tech || '[]'),
        desc: n.description || n.desc,
        icon: n.icon,
        cx: n.cx,
        cy: n.cy,
      }))

      return { projects, networkNodes, envStatus: getEnvStatus('supabase') }
    } catch (error) {
      console.error('Error fetching data from Supabase REST API:', error)
      return readJsonDb()
    }
  }

  async saveProject(project: Project): Promise<void> {
    const jsonProv = new JsonProvider()
    await jsonProv.saveProject(project)
  }

  async deleteProject(id: string): Promise<void> {
    const jsonProv = new JsonProvider()
    await jsonProv.deleteProject(id)
  }

  async saveProfile(profile: ProfileData): Promise<void> {
    const jsonProv = new JsonProvider()
    await jsonProv.saveProfile(profile)
  }
}

// 5. Appwrite DB API Provider
class AppwriteProvider implements DatabaseProvider {
  private endpoint: string
  private projectId: string
  private databaseId: string
  private projectsCollectionId: string
  private nodesCollectionId: string
  private apiKey?: string

  constructor(
    endpoint: string,
    projectId: string,
    databaseId: string,
    projectsCollectionId: string,
    nodesCollectionId: string,
    apiKey?: string
  ) {
    this.endpoint = endpoint.replace(/\/$/, '')
    this.projectId = projectId
    this.databaseId = databaseId
    this.projectsCollectionId = projectsCollectionId
    this.nodesCollectionId = nodesCollectionId
    this.apiKey = apiKey
  }

  async getData(): Promise<PortfolioData> {
    try {
      const headers: Record<string, string> = {
        'X-Appwrite-Project': this.projectId,
      }

      if (this.apiKey) {
        headers['X-Appwrite-Key'] = this.apiKey
      }

      const [projectsUrl, nodesUrl] = [
        `${this.endpoint}/databases/${this.databaseId}/collections/${this.projectsCollectionId}/documents`,
        `${this.endpoint}/databases/${this.databaseId}/collections/${this.nodesCollectionId}/documents`,
      ]

      const [projectsRes, nodesRes] = await Promise.all([
        fetch(projectsUrl, { headers }).then((res) => res.json()),
        fetch(nodesUrl, { headers }).then((res) => res.json()),
      ])

      if (!projectsRes.documents || !Array.isArray(projectsRes.documents)) {
        console.warn('Appwrite response empty or invalid. Falling back to local JSON.')
        return readJsonDb()
      }

      const projects: Project[] = projectsRes.documents.map((doc: any) => {
        let screenshotsArr: Screenshot[] | undefined
        if (doc.screenshots) {
          try {
            screenshotsArr = typeof doc.screenshots === 'string' 
              ? JSON.parse(doc.screenshots) 
              : doc.screenshots
          } catch {
            screenshotsArr = undefined
          }
        }

        return {
          id: doc.id || doc.$id,
          title: doc.title,
          work: doc.work,
          year: doc.year,
          category: doc.category,
          tech: typeof doc.tech === 'string' ? JSON.parse(doc.tech) : doc.tech,
          desc: doc.description || doc.desc,
          status: doc.status,
          featured: doc.featured !== false,
          url: doc.url || undefined,
          githubUrl: doc.github_url || undefined,
          content: doc.content || undefined,
          screenshots: screenshotsArr,
        }
      })

      const networkNodes: NetworkNode[] = nodesRes.documents.map((doc: any) => ({
        id: doc.id || doc.$id,
        name: doc.name,
        tech: typeof doc.tech === 'string' ? JSON.parse(doc.tech) : doc.tech,
        desc: doc.description || doc.desc,
        icon: doc.icon,
        cx: doc.cx,
        cy: doc.cy,
      }))

      return { projects, networkNodes, envStatus: getEnvStatus('appwrite') }
    } catch (error) {
      console.error('Error fetching data from Appwrite DB API:', error)
      return readJsonDb()
    }
  }

  async saveProject(project: Project): Promise<void> {
    const jsonProv = new JsonProvider()
    await jsonProv.saveProject(project)
  }

  async deleteProject(id: string): Promise<void> {
    const jsonProv = new JsonProvider()
    await jsonProv.deleteProject(id)
  }

  async saveProfile(profile: ProfileData): Promise<void> {
    const jsonProv = new JsonProvider()
    await jsonProv.saveProfile(profile)
  }
}

// Resolver: returns dynamically selected DatabaseProvider based on environment configuration
export function getDatabaseProvider(): DatabaseProvider {
  const provider = (getEnvVar('DATABASE_PROVIDER') || '').toLowerCase()
  const hyperdriveUrl = getEnvVar('HYPERDRIVE_URL') || getEnvVar('HYPERDRIVE_CONNECTION_STRING')
  const databaseUrl = getEnvVar('DATABASE_URL')

  if (provider === 'json') {
    return new JsonProvider()
  }

  // 1. Cloudflare Hyperdrive Acceleration (Postgres & MySQL)
  if (provider === 'hyperdrive' || hyperdriveUrl) {
    const connStr = hyperdriveUrl || databaseUrl
    if (connStr.startsWith('mysql://') || connStr.startsWith('mysql2://')) {
      console.log('Database Provider: Cloudflare Hyperdrive (MySQL)')
      return new MysqlProvider(connStr, 'hyperdrive (mysql)')
    }
    console.log('Database Provider: Cloudflare Hyperdrive (PostgreSQL)')
    return new PostgresProvider(connStr, 'hyperdrive (postgres)')
  }

  // 2. MySQL / MariaDB
  if (provider === 'mysql' || databaseUrl.startsWith('mysql://') || databaseUrl.startsWith('mysql2://')) {
    console.log('Database Provider: MySQL / MariaDB')
    return new MysqlProvider(databaseUrl, 'mysql')
  }

  // 3. PostgreSQL
  if (provider === 'postgres' && databaseUrl) {
    return new PostgresProvider(databaseUrl, 'postgres')
  }

  // 4. Supabase
  const supabaseUrl = getEnvVar('SUPABASE_URL')
  const supabaseKey = getEnvVar('SUPABASE_ANON_KEY')
  if (provider === 'supabase' && supabaseUrl && supabaseKey) {
    return new SupabaseProvider(supabaseUrl, supabaseKey)
  }

  // 5. Appwrite
  const appwriteEndpoint = getEnvVar('APPWRITE_ENDPOINT')
  const appwriteProj = getEnvVar('APPWRITE_PROJECT_ID')
  const appwriteDb = getEnvVar('APPWRITE_DATABASE_ID')
  const appwriteProjsCol = getEnvVar('APPWRITE_PROJECTS_COLLECTION_ID')
  const appwriteNodesCol = getEnvVar('APPWRITE_NODES_COLLECTION_ID')
  const appwriteKey = getEnvVar('APPWRITE_API_KEY')
  if (
    provider === 'appwrite' &&
    appwriteEndpoint &&
    appwriteProj &&
    appwriteDb &&
    appwriteProjsCol &&
    appwriteNodesCol
  ) {
    return new AppwriteProvider(
      appwriteEndpoint,
      appwriteProj,
      appwriteDb,
      appwriteProjsCol,
      appwriteNodesCol,
      appwriteKey
    )
  }

  if (databaseUrl) {
    if (databaseUrl.startsWith('mysql://') || databaseUrl.startsWith('mysql2://')) {
      return new MysqlProvider(databaseUrl, 'mysql')
    }
    console.log('Database Provider auto-resolved: PostgreSQL (via DATABASE_URL)')
    return new PostgresProvider(databaseUrl, 'postgres')
  }

  console.log('Database Provider auto-resolved: Local JSON file fallback')
  return new JsonProvider()
}

// Secret Password Verification Helper (Timing-safe comparison)
export function verifyAdminPassword(inputPassword: string): boolean {
  if (!inputPassword || typeof inputPassword !== 'string') return false
  const secret = getEnvVar('ADMIN_PASSWORD')
  if (!secret) return false
  
  if (inputPassword === secret) {
    return true
  }

  try {
    const inputBuffer = Buffer.from(inputPassword)
    const secretBuffer = Buffer.from(secret)

    if (inputBuffer.length !== secretBuffer.length) {
      try {
        nodeCrypto.timingSafeEqual(inputBuffer, inputBuffer)
      } catch {}
      return false
    }

    return nodeCrypto.timingSafeEqual(inputBuffer, secretBuffer)
  } catch {
    return false
  }
}
