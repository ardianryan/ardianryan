import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { createServerFn } from '@tanstack/react-start'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { getDatabaseProvider } from '../data/provider'
import { generateAeoJsonLd } from '../utils/llmsGenerator'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

// Load SEO & AEO metadata on server
const getRootMetadataFn = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const provider = getDatabaseProvider()
    const data = await provider.getData()
    const aeoSchema = generateAeoJsonLd(data)
    return {
      profile: data.profile,
      aeoSchema,
    }
  } catch (err) {
    return {
      profile: undefined,
      aeoSchema: undefined,
    }
  }
})

export const Route = createRootRoute({
  loader: async () => {
    return await getRootMetadataFn()
  },
  head: ({ loaderData }) => {
    const profile = loaderData?.profile
    const seo = profile?.seo || {
      siteTitle: 'Ardian Ryan - Fullstack Developer & Network Specialist',
      metaDescription: 'Portfolio of Ardian Ryan — Fullstack Developer & Network Specialist building scalable web applications and distributed network topologies.',
      keywords: ['Fullstack Developer', 'Network Specialist', 'Laravel', 'React', 'TypeScript', 'Docker', 'MikroTik'],
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

    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { title: seo.siteTitle },
        { name: 'description', content: seo.metaDescription },
        { name: 'keywords', content: (seo.keywords || []).join(', ') },
        { name: 'author', content: seo.author },
        
        // Open Graph / Facebook / LinkedIn
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: seo.canonicalUrl },
        { property: 'og:title', content: seo.siteTitle },
        { property: 'og:description', content: seo.metaDescription },
        { property: 'og:image', content: seo.ogImageUrl || '/favicon.png' },
        { property: 'og:site_name', content: seo.siteTitle },

        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: seo.siteTitle },
        { name: 'twitter:description', content: seo.metaDescription },
        { name: 'twitter:image', content: seo.ogImageUrl || '/favicon.png' },

        // GEO Optimization (Local SEO)
        { name: 'geo.region', content: seo.geo?.region || 'ID-JI' },
        { name: 'geo.placename', content: seo.geo?.placename || 'Mojokerto, East Java, Indonesia' },
        { name: 'geo.position', content: seo.geo?.position || '-7.4726;112.4385' },
        { name: 'ICBM', content: seo.geo?.icbm || '-7.4726, 112.4385' },
      ],
      links: [
        { rel: 'icon', type: 'image/svg+xml', href: seo.faviconUrl || '/favicon.svg' },
        { rel: 'apple-touch-icon', href: seo.faviconUrl || '/favicon.svg' },
        { rel: 'canonical', href: seo.canonicalUrl || 'https://ardianryan.com' },
        { rel: 'stylesheet', href: appCss },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;700&display=swap',
        },
      ],
    }
  },
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function NotFound() {
  return (
    <div className="container" style={{ padding: '80px 16px', textAlign: 'center' }}>
      <div className="sticker" style={{ background: 'var(--yellow)', display: 'inline-block', padding: '36px', transform: 'rotate(-2deg)' }}>
        <h1 className="stroke-text" style={{ fontSize: '4rem', margin: '0 0 10px 0' }}>404</h1>
        <p style={{ fontWeight: 'bold', fontSize: '1.2rem', margin: '0 0 20px 0', color: '#000' }}>PAGE NOT FOUND</p>
        <a href="/" className="sticker-btn" style={{ background: 'var(--pink)', color: '#fff' }}>
          Back to Home
        </a>
      </div>
    </div>
  )
}

import ParallaxProvider from '../components/ParallaxProvider'

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body
        suppressHydrationWarning
        className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(255,0,127,0.24)]"
      >
        <ParallaxProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </ParallaxProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
