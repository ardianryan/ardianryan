import React from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

/**
 * Clean & lightweight Neobrutalist Markdown renderer
 * Parses headings, bold, italic, lists, code blocks, and paragraphs without third-party bloat.
 */
export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null

  // Split into block segments by double newline or heading boundaries
  const lines = content.split('\n')
  const blocks: React.ReactNode[] = []
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'ul') {
        blocks.push(
          <ul
            key={`list-${blocks.length}`}
            style={{
              paddingLeft: '24px',
              marginBottom: '16px',
              lineHeight: '1.7',
            }}
          >
            {currentList.items.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '8px' }}>
                {renderInlineFormatting(item)}
              </li>
            ))}
          </ul>
        )
      } else {
        blocks.push(
          <ol
            key={`list-${blocks.length}`}
            style={{
              paddingLeft: '24px',
              marginBottom: '16px',
              lineHeight: '1.7',
            }}
          >
            {currentList.items.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '8px' }}>
                {renderInlineFormatting(item)}
              </li>
            ))}
          </ol>
        )
      }
      currentList = null
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    const trimmed = rawLine.trim()

    if (!trimmed) {
      flushList()
      continue
    }

    // Heading 1
    if (trimmed.startsWith('# ')) {
      flushList()
      blocks.push(
        <h1
          key={`h1-${i}`}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            marginTop: '24px',
            marginBottom: '12px',
            color: 'var(--text-main)',
          }}
        >
          {renderInlineFormatting(trimmed.substring(2))}
        </h1>
      )
      continue
    }

    // Heading 2
    if (trimmed.startsWith('## ')) {
      flushList()
      blocks.push(
        <h2
          key={`h2-${i}`}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.35rem',
            marginTop: '22px',
            marginBottom: '10px',
            color: 'var(--text-main)',
            borderBottom: '2px solid var(--black)',
            paddingBottom: '4px',
          }}
        >
          {renderInlineFormatting(trimmed.substring(3))}
        </h2>
      )
      continue
    }

    // Heading 3
    if (trimmed.startsWith('### ')) {
      flushList()
      blocks.push(
        <div key={`h3-${i}`} style={{ marginTop: '20px', marginBottom: '10px' }}>
          <span
            style={{
              display: 'inline-block',
              background: 'var(--yellow)',
              color: '#000',
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              padding: '4px 12px',
              border: '2px solid var(--black)',
              borderRadius: '6px',
              boxShadow: '2px 2px 0px var(--black)',
            }}
          >
            {renderInlineFormatting(trimmed.substring(4))}
          </span>
        </div>
      )
      continue
    }

    // Unordered List (- item or * item)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemText = trimmed.substring(2)
      if (currentList && currentList.type === 'ul') {
        currentList.items.push(itemText)
      } else {
        flushList()
        currentList = { type: 'ul', items: [itemText] }
      }
      continue
    }

    // Ordered List (1. item, 2. item)
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/)
    if (olMatch) {
      const itemText = olMatch[2]
      if (currentList && currentList.type === 'ol') {
        currentList.items.push(itemText)
      } else {
        flushList()
        currentList = { type: 'ol', items: [itemText] }
      }
      continue
    }

    // Blockquote (> quote)
    if (trimmed.startsWith('> ')) {
      flushList()
      blocks.push(
        <blockquote
          key={`quote-${i}`}
          style={{
            borderLeft: '4px solid var(--pink)',
            paddingLeft: '14px',
            margin: '16px 0',
            fontStyle: 'italic',
            color: 'var(--text-muted)',
          }}
        >
          {renderInlineFormatting(trimmed.substring(2))}
        </blockquote>
      )
      continue
    }

    // Regular Paragraph
    flushList()
    blocks.push(
      <p
        key={`p-${i}`}
        style={{
          fontSize: '1.02rem',
          lineHeight: '1.65',
          marginBottom: '14px',
          color: 'var(--text-main)',
        }}
      >
        {renderInlineFormatting(trimmed)}
      </p>
    )
  }

  flushList()

  return <div className={`markdown-content ${className}`}>{blocks}</div>
}

/**
 * Parses inline formatting like **bold**, *italic*, `code`, and [link](url)
 */
function renderInlineFormatting(text: string): React.ReactNode[] {
  // Regex to split by bold (**text**), inline code (`code`), and link ([text](url))
  const parts: React.ReactNode[] = []
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = tokenRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    const token = match[0]

    if (token.startsWith('**') && token.endsWith('**')) {
      // Bold
      parts.push(
        <strong key={`b-${match.index}`} style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>
          {token.slice(2, -2)}
        </strong>
      )
    } else if (token.startsWith('`') && token.endsWith('`')) {
      // Inline Code
      parts.push(
        <code
          key={`c-${match.index}`}
          style={{
            background: 'var(--card-bg, #fff)',
            border: '1.5px solid var(--black)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.9em',
            boxShadow: '1px 1px 0px var(--black)',
          }}
        >
          {token.slice(1, -1)}
        </code>
      )
    } else if (token.startsWith('[') && token.includes('](')) {
      // Link
      const closeBracket = token.indexOf('](')
      const label = token.slice(1, closeBracket)
      const url = token.slice(closeBracket + 2, -1)
      parts.push(
        <a
          key={`a-${match.index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--pink)',
            textDecoration: 'underline',
            fontWeight: 'bold',
          }}
        >
          {label}
        </a>
      )
    }

    lastIndex = match.index + token.length
  }

  // Add trailing text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts
}
