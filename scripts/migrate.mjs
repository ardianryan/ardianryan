import pg from 'pg'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const seedFilePath = path.resolve(__dirname, '../src/data/db.json')

async function runSmartMigration() {
  console.log('🔄 Running Safe Smart Database Migration...')

  const connectionString =
    process.env.DATABASE_URL ||
    process.env.HYPERDRIVE_URL ||
    'postgresql://repoardiporto:jpK5LJ7Wz8x34LfG@panel-asia.ppti.me:5432/repoardiporto'

  const client = new pg.Client({
    connectionString,
    ssl: connectionString.includes('sslmode=require') || connectionString.includes('hyperdrive')
      ? { rejectUnauthorized: false }
      : false,
  })

  try {
    await client.connect()
    console.log('📡 Connected to PostgreSQL database.')

    // 1. Safe Table Creation (Preserves existing tables)
    await client.query(`
      CREATE TABLE IF NOT EXISTS profile (
        id VARCHAR(50) PRIMARY KEY DEFAULT 'main',
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        email VARCHAR(255) DEFAULT 'me@ardianryan.com',
        tagline TEXT,
        badge_text VARCHAR(100),
        avatar_url TEXT,
        short_bio TEXT,
        site_title VARCHAR(255),
        meta_description TEXT,
        keywords TEXT[],
        favicon_url TEXT,
        og_image_url TEXT,
        canonical_url TEXT,
        author VARCHAR(255),
        geo_region VARCHAR(50),
        geo_placename VARCHAR(255),
        geo_position VARCHAR(100),
        geo_icbm VARCHAR(100),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS about_sections (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        description TEXT,
        tags TEXT[],
        color VARCHAR(50) DEFAULT 'white',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        work VARCHAR(255),
        year VARCHAR(20),
        category VARCHAR(100),
        tech TEXT[],
        description TEXT,
        status VARCHAR(100),
        featured BOOLEAN DEFAULT true,
        url TEXT,
        github_url TEXT,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS screenshots (
        id VARCHAR(100) PRIMARY KEY,
        project_id VARCHAR(100) REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url TEXT
      );
    `)

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

    // 2. Safe Schema Upgrades (ADD COLUMN IF NOT EXISTS)
    const columnChecks = [
      { table: 'projects', col: 'content', type: 'TEXT' },
      { table: 'projects', col: 'featured', type: 'BOOLEAN DEFAULT true' },
      { table: 'profile', col: 'site_title', type: 'VARCHAR(255)' },
      { table: 'profile', col: 'meta_description', type: 'TEXT' },
      { table: 'profile', col: 'keywords', type: 'TEXT[]' },
      { table: 'profile', col: 'geo_region', type: 'VARCHAR(50)' },
      { table: 'profile', col: 'geo_placename', type: 'VARCHAR(255)' },
      { table: 'profile', col: 'geo_position', type: 'VARCHAR(100)' },
      { table: 'profile', col: 'geo_icbm', type: 'VARCHAR(100)' },
    ]

    for (const check of columnChecks) {
      await client.query(`
        ALTER TABLE ${check.table} ADD COLUMN IF NOT EXISTS ${check.col} ${check.type};
      `)
    }

    console.log('✅ Schema verified & updated with zero data loss.')

    // 3. Seed Missing Records (ON CONFLICT DO NOTHING — Never overwrites existing production edits)
    if (fs.existsSync(seedFilePath)) {
      const seedData = JSON.parse(fs.readFileSync(seedFilePath, 'utf-8'))

      if (seedData.profile) {
        const p = seedData.profile
        const s = p.seo || {}
        const g = s.geo || {}

        await client.query(
          `INSERT INTO profile (
            id, name, title, email, tagline, badge_text, avatar_url, short_bio,
            site_title, meta_description, keywords, favicon_url, og_image_url, canonical_url,
            author, geo_region, geo_placename, geo_position, geo_icbm
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
          ON CONFLICT (id) DO NOTHING`,
          [
            'main',
            p.name,
            p.title,
            p.email || 'me@ardianryan.com',
            p.tagline,
            p.badgeText,
            p.avatarUrl,
            p.shortBio,
            s.siteTitle || 'Ardian Ryan - Fullstack Developer & Network Specialist',
            s.metaDescription || '',
            s.keywords || [],
            s.faviconUrl || '/favicon.svg',
            s.ogImageUrl || '/favicon.png',
            s.canonicalUrl || 'https://ardianryan.com',
            s.author || 'Ardian Ryan',
            g.region || 'ID-JI',
            g.placename || 'Mojokerto, East Java, Indonesia',
            g.position || '-7.4726;112.4385',
            g.icbm || '-7.4726, 112.4385',
          ]
        )

        for (const sec of p.aboutSections || []) {
          await client.query(
            `INSERT INTO about_sections (id, title, subtitle, description, tags, color)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (id) DO NOTHING`,
            [sec.id, sec.title, sec.subtitle, sec.desc, sec.tags || [], sec.color]
          )
        }
      }

      for (const p of seedData.projects || []) {
        await client.query(
          `INSERT INTO projects (id, title, work, year, category, tech, description, status, featured, url, github_url, content)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO NOTHING`,
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
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (id) DO NOTHING`,
              [`${p.id}_${s.id}`, p.id, s.title, s.desc, s.imageUrl || null]
            )
          }
        }
      }

      for (const node of seedData.networkNodes || []) {
        await client.query(
          `INSERT INTO network_nodes (id, name, tech, description, icon, cx, cy)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [node.id, node.name, node.tech, node.desc, node.icon, node.cx, node.cy]
        )
      }
    }

    console.log('🎉 Smart Migration completed successfully with ZERO data overwrite!')
  } catch (err) {
    console.error('Migration error:', err)
  } finally {
    await client.end()
  }
}

runSmartMigration()
