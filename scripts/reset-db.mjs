import fs from 'fs/promises'
import path from 'path'
import pg from 'pg'

async function resetDb() {
  console.log('🔄 Starting Database Reset...')

  const dbJsonPath = path.resolve(process.cwd(), 'src/data/db.json')
  const rawData = await fs.readFile(dbJsonPath, 'utf-8')
  const seedData = JSON.parse(rawData)

  const provider = process.env.DATABASE_PROVIDER || 'postgres'
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

  if (provider === 'postgres' && dbUrl) {
    console.log(`📡 Connecting to PostgreSQL at ${dbUrl.replace(/:[^:@]+@/, ':****@')}...`)
    const pool = new pg.Pool({
      connectionString: dbUrl,
    })

    try {
      const client = await pool.connect()
      console.log('Connected to PostgreSQL. Dropping existing tables for clean reset...')
      
      await client.query('DROP TABLE IF EXISTS screenshots CASCADE;')
      await client.query('DROP TABLE IF EXISTS projects CASCADE;')
      await client.query('DROP TABLE IF EXISTS about_sections CASCADE;')
      await client.query('DROP TABLE IF EXISTS network_nodes CASCADE;')
      await client.query('DROP TABLE IF EXISTS profile CASCADE;')
      console.log('Old tables dropped successfully.')

      // Recreate tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS profile (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          email VARCHAR(255),
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
      console.log('Tables recreated with fresh schema.')

      // Insert fresh profile
      if (seedData.profile) {
        const p = seedData.profile
        const s = p.seo || {}
        const g = s.geo || {}

        await client.query(
          `INSERT INTO profile (
            id, name, title, email, tagline, badge_text, avatar_url, short_bio,
            site_title, meta_description, keywords, favicon_url, og_image_url,
            canonical_url, author, geo_region, geo_placename, geo_position, geo_icbm
          ) VALUES ('main', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
          [
            p.name,
            p.title,
            p.email || 'me@ardianryan.com',
            p.tagline,
            p.badgeText,
            p.avatarUrl,
            p.shortBio,
            s.siteTitle || '',
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
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [sec.id, sec.title, sec.subtitle, sec.desc, sec.tags || [], sec.color]
          )
        }
      }

      // Insert fresh projects
      for (const p of seedData.projects || []) {
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

      // Insert fresh network nodes
      for (const n of seedData.networkNodes || []) {
        await client.query(
          `INSERT INTO network_nodes (id, name, tech, description, icon, cx, cy)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [n.id, n.name, n.tech, n.desc, n.icon, n.cx, n.cy]
        )
      }

      client.release()
      await pool.end()
      console.log('PostgreSQL database fully reset and re-seeded with fresh data!')
    } catch (err) {
      console.error('PostgreSQL connection error during reset:', err.message)
      console.log('Local JSON fallback db.json is preserved and clean.')
    }
  } else {
    console.log('Database provider is JSON. db.json is cleanly reset.')
  }

  // Also sync /llms.txt and /llms-full.txt
  console.log('Syncing static /public/llms.txt & /public/llms-full.txt...')
  const { generateLlmsTxt, generateLlmsFullTxt } = await import('../src/utils/llmsGenerator.ts')
  const llmsTxt = generateLlmsTxt(seedData)
  const llmsFullTxt = generateLlmsFullTxt(seedData)

  const publicDir = path.resolve(process.cwd(), 'public')
  await fs.writeFile(path.join(publicDir, 'llms.txt'), llmsTxt, 'utf-8')
  await fs.writeFile(path.join(publicDir, 'llms-full.txt'), llmsFullTxt, 'utf-8')
  console.log('Static LLMs files regenerated successfully.')
  console.log('Database reset completed 100%!')
}

resetDb()
