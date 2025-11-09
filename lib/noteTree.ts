export interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  path?: string;
  children?: TreeNode[];
  title?: string;
}

export function buildNoteTree(notes: { slug: string; title: string }[]): TreeNode[] {
  const tree: Map<string, TreeNode> = new Map();
  const paths: Map<string, TreeNode[]> = new Map();
  paths.set('', []); // Root level

  notes.forEach((note) => {
    const parts = note.slug.split('/');

    // Create all parent folders
    for (let i = 0; i < parts.length; i++) {
      const pathKey = parts.slice(0, i).join('/');
      const partName = parts[i];
      const fullPath = parts.slice(0, i + 1).join('/');

      if (i === parts.length - 1) {
        // This is a file
        const fileNode: TreeNode = {
          name: partName,
          type: 'file',
          path: note.slug,
          title: note.title,
        };
        if (!paths.has(pathKey)) {
          paths.set(pathKey, []);
        }
        paths.get(pathKey)!.push(fileNode);
      } else {
        // This is a folder
        if (!paths.has(fullPath)) {
          const folderNode: TreeNode = {
            name: partName,
            type: 'folder',
            children: [],
          };
          if (!paths.has(pathKey)) {
            paths.set(pathKey, []);
          }
          paths.get(pathKey)!.push(folderNode);
          paths.set(fullPath, folderNode.children!);
        }
      }
    }
  });

  // Sort and return root level
  const rootNodes = paths.get('')!;
  sortNodes(rootNodes);
  return rootNodes;
}

function sortNodes(nodes: TreeNode[]): void {
  nodes.sort((a, b) => {
    // Folders first, then files
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  // Recursively sort children
  nodes.forEach((node) => {
    if (node.children && node.children.length > 0) {
      sortNodes(node.children);
    }
  });
}

export function getFolderStats(
  tree: TreeNode[],
  stats: { folders: number; files: number } = { folders: 0, files: 0 }
): { folders: number; files: number } {
  tree.forEach((node) => {
    if (node.type === 'folder') {
      stats.folders++;
      if (node.children) {
        getFolderStats(node.children, stats);
      }
    } else {
      stats.files++;
    }
  });
  return stats;
}
