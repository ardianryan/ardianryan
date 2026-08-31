import type { PortfolioData } from '../data/provider'

/**
 * Generate standard /llms.txt markdown for AI models (ChatGPT, Claude, Perplexity, Cursor)
 */
export function generateLlmsTxt(data: PortfolioData): string {
  const profile = data.profile || {
    name: 'Ardian Ryan',
    title: 'Fullstack Developer & Network Systems Specialist',
    tagline: '',
    badgeText: '#OPENTOWORK',
    shortBio: 'Software engineer building web apps, cloud infrastructure, and network systems.',
    avatarUrl: '/favicon.svg',
    aboutSections: [],
    seo: {
      siteTitle: 'Ardian Ryan - Fullstack Developer & Network Specialist',
      metaDescription: '',
      keywords: [],
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
    },
  }

  const siteUrl = profile.seo?.canonicalUrl || 'https://ardianryan.com'

  let doc = `# ${profile.name}\n\n`
  doc += `> ${profile.title}\n\n`
  doc += `## Summary\n${profile.shortBio}\n\n`

  doc += `## Core Expertise & Skills\n`
  const allTech = Array.from(new Set(data.projects.flatMap((p) => p.tech)))
  doc += allTech.map((t) => `- ${t}`).join('\n') + '\n\n'

  doc += `## Featured Projects & Case Studies\n`
  for (const p of data.projects) {
    doc += `### ${p.title} (${p.year})\n`
    doc += `- **Category:** ${p.category}\n`
    doc += `- **Status:** ${p.status}\n`
    doc += `- **Tech:** ${p.tech.join(', ')}\n`
    doc += `- **Description:** ${p.desc}\n`
    if (p.url) doc += `- **Live App:** ${p.url}\n`
    if (p.githubUrl) doc += `- **Source Code:** ${p.githubUrl}\n`
    doc += `- **Case Study Page:** ${siteUrl}/projects/${p.id}\n\n`
  }

  doc += `## Network Infrastructure & Labs\n`
  for (const n of data.networkNodes) {
    doc += `- **${n.name}**: ${n.desc} (${n.tech.join(', ')})\n`
  }
  doc += `\n## Contact & Links\n`
  doc += `- Website: ${siteUrl}\n`
  doc += `- Case Studies: ${siteUrl}/projects\n`
  doc += `- Full LLM Documentation: ${siteUrl}/llms-full.txt\n`

  return doc
}

/**
 * Generate comprehensive /llms-full.txt markdown containing deep technical context
 */
export function generateLlmsFullTxt(data: PortfolioData): string {
  const profile = data.profile || {
    name: 'Ardian Ryan',
    title: 'Fullstack Developer & Network Systems Specialist',
    tagline: '',
    badgeText: '#OPENTOWORK',
    shortBio: '',
    avatarUrl: '/favicon.svg',
    aboutSections: [],
    seo: {
      siteTitle: 'Ardian Ryan - Fullstack Developer',
      metaDescription: '',
      keywords: [],
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
    },
  }

  const siteUrl = profile.seo?.canonicalUrl || 'https://ardianryan.com'

  let doc = `# Full Technical Knowledge Base: ${profile.name}\n\n`
  doc += `Title: ${profile.title}\n`
  doc += `Badge: ${profile.badgeText || 'Open for Innovation'}\n`
  doc += `Canonical Site: ${siteUrl}\n\n`

  doc += `## Engineering Biography & Overview\n`
  doc += `${profile.shortBio}\n\n`

  if (profile.aboutSections && profile.aboutSections.length > 0) {
    doc += `## Career & Technical Milestones\n`
    for (const sec of profile.aboutSections) {
      doc += `### ${sec.title} — ${sec.subtitle}\n`
      doc += `${sec.desc}\n`
      if (sec.tags && sec.tags.length > 0) {
        doc += `Tags: ${sec.tags.join(', ')}\n`
      }
      doc += `\n`
    }
  }

  doc += `## Comprehensive Project Architecture & Deep Dives\n\n`
  for (const p of data.projects) {
    doc += `------------------------------------------------------------\n`
    doc += `### PROJECT: ${p.title}\n`
    doc += `ID: ${p.id} | Year: ${p.year} | Category: ${p.category} | Status: ${p.status}\n`
    doc += `Technologies: ${p.tech.join(', ')}\n`
    if (p.url) doc += `Live Demo: ${p.url}\n`
    if (p.githubUrl) doc += `GitHub Repository: ${p.githubUrl}\n`
    doc += `URL: ${siteUrl}/projects/${p.id}\n\n`
    doc += `**Summary:**\n${p.desc}\n\n`

    if (p.content) {
      doc += `**Technical Architecture & Case Study Blog:**\n`
      doc += `${p.content}\n\n`
    }

    if (p.screenshots && p.screenshots.length > 0) {
      doc += `**Screenshots & UI Modules:**\n`
      for (const s of p.screenshots) {
        doc += `- ${s.title}: ${s.desc} ${s.imageUrl ? `(${s.imageUrl})` : ''}\n`
      }
      doc += `\n`
    }
  }

  doc += `## Distributed Network Topology\n`
  for (const n of data.networkNodes) {
    doc += `### Node: ${n.name} (Position: ${n.cx}, ${n.cy})\n`
    doc += `- Description: ${n.desc}\n`
    doc += `- Stack: ${n.tech.join(', ')}\n\n`
  }

  return doc
}

/**
 * Generate AEO (Answer Engine Optimization) JSON-LD structured schema
 */
export function generateAeoJsonLd(data: PortfolioData): object {
  const profile = data.profile || {
    name: 'Ardian Ryan',
    title: 'Fullstack Developer & Network Systems Specialist',
    tagline: '',
    badgeText: '#OPENTOWORK',
    shortBio: '',
    avatarUrl: '/favicon.svg',
    aboutSections: [],
    seo: {
      siteTitle: 'Ardian Ryan - Fullstack Developer',
      metaDescription: '',
      keywords: [],
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
    },
  }

  const siteUrl = profile.seo?.canonicalUrl || 'https://ardianryan.com'

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${siteUrl}/#person`,
        name: profile.name,
        jobTitle: profile.title,
        description: profile.shortBio,
        image: profile.avatarUrl,
        url: siteUrl,
        sameAs: [
          'https://github.com/ardianryan',
          'https://linkedin.com/in/ardianryan',
          'https://static.ardianryan.com',
        ],
        knowsAbout: Array.from(new Set(data.projects.flatMap((p) => p.tech))),
        address: {
          '@type': 'PostalAddress',
          addressLocality: profile.seo?.geo?.placename || 'Mojokerto',
          addressRegion: profile.seo?.geo?.region || 'East Java',
          addressCountry: 'Indonesia',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: `${profile.name} - Engineering Portfolio`,
        publisher: {
          '@id': `${siteUrl}/#person`,
        },
      },
      {
        '@type': 'ItemList',
        name: 'Portfolio Projects & Engineering Works',
        itemListElement: data.projects.map((p, idx) => ({
          '@type': 'SoftwareApplication',
          position: idx + 1,
          name: p.title,
          description: p.desc,
          applicationCategory: p.category,
          url: `${siteUrl}/projects/${p.id}`,
        })),
      },
    ],
  }
}
