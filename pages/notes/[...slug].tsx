import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'
import Link from 'next/link'
import Head from 'next/head'
import { useState, useEffect } from 'react'

interface NotePageProps {
  title: string
  content: string
  slug: string
  date?: string
}

export default function NotePage({ title, content, slug, date }: NotePageProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check system preference or stored preference
    const stored = localStorage.getItem('theme')
    const isDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDarkMode(isDark)
    applyTheme(isDark)
  }, [])

  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }

  const toggleTheme = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    applyTheme(newMode)
  }

  // Extract folder path for breadcrumbs
  const breadcrumbs = slug.split('/').filter(Boolean)

  return (
    <>
      <Head>
        <title>{title} | Digital Garden</title>
        <meta name="description" content={title} />
      </Head>

      {/* Header */}
      <header className="header">
        <div className="header-container">
          <Link href="/" className="logo">
            🌱 Digital <span>Garden</span>
          </Link>
          <nav style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-main">
        <article style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', padding: 'var(--spacing-2xl)', boxShadow: 'var(--shadow-md)' }}>
          {/* Back Link */}
          <Link href="/" style={{ color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)', textDecoration: 'none', transition: 'color var(--transition-fast)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-secondary)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}>
            ← Back to Garden
          </Link>

          {/* Breadcrumbs */}
          {breadcrumbs.length > 1 && (
            <nav style={{ marginBottom: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-lg)', borderBottom: '1px solid var(--border-color)' }}>
              <ol style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', listStyle: 'none', padding: 0, margin: 0 }}>
                <li>
                  <Link href="/" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
                    Home
                  </Link>
                </li>
                {breadcrumbs.slice(0, -1).map((crumb, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <span>/</span>
                    <span style={{ textTransform: 'capitalize' }}>{crumb}</span>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Title */}
          <h1 style={{ fontSize: 'var(--fs-4xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--spacing-lg)', lineHeight: 1.2 }}>
            {title}
          </h1>

          {/* Date */}
          {date && (
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--fs-sm)', marginBottom: 'var(--spacing-2xl)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              📅 Published on {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}

          {/* Content */}
          <div className="markdown-content" style={{ color: 'var(--text-primary)' }} dangerouslySetInnerHTML={{ __html: content }} />
        </article>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>💚 Umer Ghafoor's Digital Garden</p>
        <p style={{ fontSize: 'var(--fs-sm)', marginTop: 'var(--spacing-sm)', opacity: 0.7 }}>
          Exploring Robotics, IoT, Philosophy & Knowledge Management | © 2025
        </p>
      </footer>
    </>
  )
}

export async function getStaticProps({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/')
  const notesDirectory = path.join(process.cwd(), 'src/site/notes')
  const filePath = path.join(notesDirectory, `${slug}.md`)

  if (!fs.existsSync(filePath)) {
    return { notFound: true }
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(fileContent)

  // Skip if marked as not published
  if (data['dg-publish'] === false) {
    return { notFound: true }
  }

  const htmlContent = await marked(content)

  return {
    props: {
      title: data.title || 'Untitled',
      content: htmlContent,
      slug,
      date: data.date ? data.date : (data.created ? data.created : null),
    },
    revalidate: 3600, // Revalidate every hour
  }
}

export async function getStaticPaths() {
  const notesDirectory = path.join(process.cwd(), 'src/site/notes')
  const paths: string[] = []

  function readFilesRecursively(dir: string) {
    const files = fs.readdirSync(dir, { withFileTypes: true })

    files.forEach((file) => {
      const fullPath = path.join(dir, file.name)

      if (file.isDirectory()) {
        readFilesRecursively(fullPath)
      } else if (file.name.endsWith('.md')) {
        const fileContent = fs.readFileSync(fullPath, 'utf-8')
        const { data } = matter(fileContent)

        // Skip if marked as not published
        if (data['dg-publish'] === false) {
          return
        }

        const slug = path
          .relative(notesDirectory, fullPath)
          .replace(/\.md$/, '')
          .replace(/\\/g, '/')

        paths.push(slug)
      }
    })
  }

  if (fs.existsSync(notesDirectory)) {
    readFilesRecursively(notesDirectory)
  }

  return {
    paths: paths.map((slug) => ({
      params: { slug: slug.split('/') },
    })),
    fallback: 'blocking',
  }
}
