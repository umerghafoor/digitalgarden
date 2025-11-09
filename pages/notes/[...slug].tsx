import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'
import Link from 'next/link'
import Head from 'next/head'

interface NotePageProps {
  title: string
  content: string
  slug: string
  date?: string
}

export default function NotePage({ title, content, slug, date }: NotePageProps) {
  // Extract folder path for breadcrumbs
  const breadcrumbs = slug.split('/').filter(Boolean)

  return (
    <>
      <Head>
        <title>{title} | Digital Garden</title>
        <meta name="description" content={title} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← Back to Garden
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <article className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            {/* Breadcrumbs */}
            {breadcrumbs.length > 1 && (
              <nav className="mb-6 pb-6 border-b border-gray-200">
                <ol className="flex flex-wrap gap-2 text-sm text-gray-600">
                  <li>
                    <Link href="/" className="hover:text-blue-600">
                      Home
                    </Link>
                  </li>
                  {breadcrumbs.slice(0, -1).map((crumb, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span>/</span>
                      <span className="capitalize">{crumb}</span>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {title}
            </h1>

            {/* Date */}
            {date && (
              <p className="text-gray-500 text-sm mb-8">
                Published on {new Date(date).toLocaleDateString()}
              </p>
            )}

            {/* Content */}
            <div
              className="markdown-content prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </article>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-gray-600 text-center">
              Made with 💚 • Your Digital Garden
            </p>
          </div>
        </footer>
      </div>
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
