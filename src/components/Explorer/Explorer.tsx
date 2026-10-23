import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import type { FileNode } from '../../types';
import './Explorer.css';

function FileTreeItem({
  node,
  depth = 0,
}: {
  node: FileNode;
  depth?: number;
}) {
  const { openFile, activeTabId, renamingId, setRenamingId, renameFile, deleteFile } = useApp();
  const [expanded, setExpanded] = useState(true);
  const isFolder = node.type === 'folder';
  const isActive = !isFolder && activeTabId === node.id;

  const name =
    renamingId === node.id ? (
      <input
        className="tree-rename"
        autoFocus
        defaultValue={node.name}
        onFocus={(e) => e.currentTarget.select()}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Enter') renameFile(node.id, e.currentTarget.value);
          if (e.key === 'Escape') setRenamingId(null);
        }}
        onBlur={() => setRenamingId(null)}
      />
    ) : (
      <span className="tree-name">{node.name}</span>
    );

  const actions = (
    <span className="tree-actions" onClick={(e) => e.stopPropagation()}>
      <button title="Rename" onClick={() => setRenamingId(node.id)}>✎</button>
      <button title="Delete" onClick={() => deleteFile(node.id)}>🗑</button>
    </span>
  );

  const icon = isFolder
    ? expanded ? '📂' : '📁'
    : node.language === 'python' ? '🐍'
    : node.language === 'javascript' ? '🟨'
    : node.language === 'java' ? '☕'
    : node.language === 'markdown' ? '📝'
    : '📄';

  return (
    <div className={isFolder ? 'tree-folder' : undefined}>
      <div
        className={`tree-row ${isFolder ? 'folder' : 'file'} ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        onClick={() => (isFolder ? setExpanded((e) => !e) : openFile(node))}
      >
        <span className="tree-icon">{icon}</span>
        {name}
        {actions}
      </div>
      {isFolder &&
        expanded &&
        node.children?.map((child) => (
          <FileTreeItem key={child.id} node={child} depth={depth + 1} />
        ))}
    </div>
  );
}

export function Explorer() {
  const { files, settings, createNewFile } = useApp();

  if (!settings.showExplorer) return null;

  return (
    <aside className="explorer">
      <div className="explorer-header">
        <span className="explorer-title">EXPLORER</span>
        <button className="icon-btn" onClick={createNewFile} title="New File (Alt+N)">
          +
        </button>
      </div>
      <div className="explorer-tree">
        {files.map((node) => (
          <FileTreeItem key={node.id} node={node} />
        ))}
      </div>
    </aside>
  );
}
