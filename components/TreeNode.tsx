import Link from 'next/link'
import { TreeNode } from '@/lib/noteTree'
import { useState } from 'react'

interface TreeNodeComponentProps {
  node: TreeNode
  level?: number
}

export default function TreeNodeComponent({ node, level = 0 }: TreeNodeComponentProps) {
  const [expanded, setExpanded] = useState(level === 0) // Expand root folders by default

  if (node.type === 'file') {
    return (
      <li className="tree-node tree-file" style={{ marginLeft: `calc(var(--spacing-lg) * ${level})` }}>
        <div className="tree-node-wrapper">
          <span className="tree-toggle empty">→</span>
          <span className="tree-icon">📄</span>
          <div className="tree-label">
            <Link href={`/notes/${node.path}`}>{node.title}</Link>
          </div>
        </div>
      </li>
    )
  }

  return (
    <li className="tree-node tree-folder" style={{ marginLeft: `calc(var(--spacing-lg) * ${level})` }}>
      <div
        className="tree-node-wrapper"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded(!expanded)
          }
        }}
      >
        <span className={`tree-toggle ${expanded ? 'expanded' : ''}`}>▶</span>
        <span className="tree-icon">{expanded ? '📂' : '📁'}</span>
        <div className="tree-label">{node.name}</div>
      </div>
      {node.children && node.children.length > 0 && expanded && (
        <ul className="tree-children">
          {node.children.map((child) => (
            <TreeNodeComponent key={`${child.type}-${child.name}`} node={child} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}

