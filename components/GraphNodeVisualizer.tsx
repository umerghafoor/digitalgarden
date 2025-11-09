import { TreeNode } from '@/lib/noteTree'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface GraphNodeVisualizerProps {
  tree: TreeNode[]
  stats: { folders: number; files: number }
}

export default function GraphNodeVisualizer({ tree, stats }: GraphNodeVisualizerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedFolders(newExpanded)
  }

  const flattenTree = (nodes: TreeNode[], parentPath = ''): Array<TreeNode & { depth: number; fullPath: string }> => {
    const flattened: Array<TreeNode & { depth: number; fullPath: string }> = []
    
    nodes.forEach((node, index) => {
      const fullPath = parentPath ? `${parentPath}/${node.name}` : node.name
      flattened.push({
        ...node,
        depth: parentPath.split('/').filter(Boolean).length,
        fullPath,
      })

      if (node.type === 'folder' && node.children && expandedFolders.has(fullPath)) {
        flattened.push(...flattenTree(node.children, fullPath))
      }
    })

    return flattened
  }

  const flatNodes = flattenTree(tree)

  return (
    <div className="graph-container">
      <div className="graph-header">
        <div className="graph-stats">
          <div className="graph-stat">
            <span className="graph-stat-icon">📚</span>
            <span className="graph-stat-text">{stats.folders + stats.files} Items</span>
          </div>
          <div className="graph-stat">
            <span className="graph-stat-icon">📂</span>
            <span className="graph-stat-text">{stats.folders} Folders</span>
          </div>
          <div className="graph-stat">
            <span className="graph-stat-icon">📄</span>
            <span className="graph-stat-text">{stats.files} Notes</span>
          </div>
        </div>
      </div>

      <div className="graph-nodes">
        {flatNodes.map((node, idx) => (
          <div
            key={`${node.fullPath}-${idx}`}
            className={`graph-node-item ${node.type}`}
            style={{
              marginLeft: `calc(var(--spacing-lg) * ${node.depth})`,
              opacity: hoveredNode === null || hoveredNode === node.fullPath ? 1 : 0.4,
              transition: 'opacity var(--transition-fast)',
            }}
            onMouseEnter={() => setHoveredNode(node.fullPath)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            {node.type === 'folder' ? (
              <div
                className="graph-node-content"
                onClick={() => toggleFolder(node.fullPath)}
                role="button"
                tabIndex={0}
              >
                <span className={`graph-node-connector ${expandedFolders.has(node.fullPath) ? 'expanded' : ''}`}>
                  ▶
                </span>
                <span className="graph-node-icon">📂</span>
                <span className="graph-node-label folder">{node.name}</span>
                <span className="graph-node-badge">{node.children?.length || 0}</span>
              </div>
            ) : (
              <Link href={`/notes/${node.path}`}>
                <span className="graph-node-content file-link">
                  <span className="graph-node-connector">•</span>
                  <span className="graph-node-icon">📄</span>
                  <span className="graph-node-label file">{node.title}</span>
                </span>
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="graph-legend">
        <div className="legend-item">
          <span className="legend-icon folder">📂</span>
          <span>Folder</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon file">📄</span>
          <span>Note</span>
        </div>
      </div>
    </div>
  )
}
