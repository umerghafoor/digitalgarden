import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'
import Link from 'next/link'

interface Note {
  slug: string
  title: string
  excerpt: string
  date?: string
}

export default function Home({ notes }: { notes: Note[] }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">🌱 Digital Garden</h1>
          <p className="text-gray-600 mt-2">A collection of my thoughts and notes</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No notes found yet. Start adding some!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <Link
                key={note.slug}
                href={`/notes/${note.slug}`}
                className="group"
              >
                <div className="h-full bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 p-6 cursor-pointer transform hover:scale-105 transition-transform duration-300">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {note.title}
                  </h2>
                  {note.date && (
                    <p className="text-xs text-gray-400 mb-3">{note.date}</p>
                  )}
                  <p className="text-gray-600 line-clamp-3 text-sm">
                    {note.excerpt || 'No description available'}
                  </p>
                  <div className="mt-4 text-blue-600 text-sm font-medium group-hover:text-blue-800">
                    Read more →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-600 text-center">
            Made with 💚 • Your Digital Garden
          </p>
        </div>
      </footer>
    </div>
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

  return {
    props: { notes },
    revalidate: 3600, // Revalidate every hour
  }
}
