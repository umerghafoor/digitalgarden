import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { buildNoteTree, getFolderStats, TreeNode } from '@/lib/noteTree'
import GraphNodeVisualizer from '@/components/GraphNodeVisualizer'

interface Note {
  slug: string
  title: string
  excerpt: string
  date: string | null
}

interface HomeProps {
  notes: Note[]
  tree: TreeNode[]
  stats: { folders: number; files: number }
}

export default function Home({ notes, tree, stats }: HomeProps) {
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

  return (
    <>
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

      {/* Hero Section */}
      <main className="container-main">
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
          <h1 className="section-title">🌱 Umer Ghafoor's Digital Garden</h1>
          <p className="section-subtitle">A curated collection of thoughts, notes, and explorations in technology, philosophy, and personal growth</p>
        </div>

        {/* Stats Section */}
        <div className="stats-grid" style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <div className="stat-card">
            <div className="stat-number">{notes.length}</div>
            <div className="stat-label">Total Notes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.folders}</div>
            <div className="stat-label">Folders</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.files}</div>
            <div className="stat-label">Files</div>
          </div>
        </div>

        {/* Notes Grid Section */}
        {notes.length > 0 && (
          <>
            <h2 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
              📚 Latest Notes
            </h2>
            <div className="notes-grid">
              {notes.slice(0, 6).map((note) => (
                <Link key={note.slug} href={`/notes/${note.slug}`} className="note-card">
                  <h3 className="note-card-title">{note.title}</h3>
                  {note.date && (
                    <div className="note-card-date">
                      📅 {new Date(note.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  )}
                  <p className="note-card-excerpt">{note.excerpt || 'No description available'}</p>
                  <div className="note-card-footer">
                    <span className="note-card-link">Read more →</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Tree View */}
        {tree.length > 0 && (
          <div className="notes-tree">
            <h2 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              🧠 Your Knowledge Graph
            </h2>
            <GraphNodeVisualizer tree={tree} stats={stats} />
          </div>
        )}

        {/* No Notes Message */}
        {notes.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
            <p style={{ fontSize: 'var(--fs-lg)', color: 'var(--text-secondary)' }}>
              No notes found yet. Start adding some markdown files to <code>src/site/notes/</code>
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>💚 Umer Ghafoor's Digital Garden</p>
        <p style={{ fontSize: 'var(--fs-sm)', marginTop: 'var(--spacing-sm)', opacity: 0.7 }}>
          Exploring Robotics, IoT, Philosophy & Knowledge Management | © 2025 All notes are mine to share. Keep growing!
        </p>
      </footer>
    </>
  )
}

export async function getStaticProps() {
  const notesDirectory = path.join(process.cwd(), 'src/site/notes')
  const notes: Note[] = []

  function readFilesRecursively(dir: string) {
    const files = fs.readdirSync(dir, { withFileTypes: true })

    files.forEach((file) => {
      const fullPath = path.join(dir, file.name)

      if (file.isDirectory()) {
        readFilesRecursively(fullPath)
      } else if (file.name.endsWith('.md')) {
        const fileContent = fs.readFileSync(fullPath, 'utf-8')
        const { data, content } = matter(fileContent)
        const slug = path
          .relative(notesDirectory, fullPath)
          .replace(/\.md$/, '')
          .replace(/\\/g, '/')

        // Skip if marked as not published
        if (data['dg-publish'] === false) {
          return
        }

        notes.push({
          slug,
          title: data.title || file.name.replace('.md', ''),
          excerpt: content.substring(0, 150).replace(/[#*`_\[\]]/g, '').trim(),
          date: data.date ? data.date : (data.created ? data.created : null),
        })
      }
    })
  }

  if (fs.existsSync(notesDirectory)) {
    readFilesRecursively(notesDirectory)
  }

  // Sort by date if available
  notes.sort((a, b) => {
    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    }
    return 0
  })

  // Build tree structure
  const tree = buildNoteTree(notes)
  const stats = getFolderStats(tree)

  return {
    props: { notes, tree, stats },
    revalidate: 3600, // Revalidate every hour
  }
}
