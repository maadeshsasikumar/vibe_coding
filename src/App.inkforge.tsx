import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { EditorView } from '@codemirror/view'
import {
  ArrowUpDown,
  BookOpenText,
  Download,
  FolderOpenDot,
  Keyboard,
  LayoutPanelLeft,
  ListFilter,
  Moon,
  MoreHorizontal,
  NotebookPen,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  SunMedium,
  Undo2,
  Redo2,
  X,
} from 'lucide-react'
import 'highlight.js/styles/github-dark.css'
import WeatherCard from './WeatherCard'

const MarkdownEditor = lazy(() => import('./MarkdownEditor'))
const MarkdownPreview = lazy(() => import('./MarkdownPreview'))

type ThemeMode = 'dark' | 'light'
type PaneMode = 'split' | 'editor' | 'preview'
type DocStatus = 'draft' | 'published'

type DocumentItem = {
  id: string
  title: string
  subtitle: string
  author: string
  status: DocStatus
  category: string
  tags: string[]
  coverImage: string
  slug: string
  featured: boolean
  starred: boolean
  createdAt: string
  lastEdited: string
  content: string
}

const STORAGE_KEY = 'inkforge-studio-documents'
const THEME_KEY = 'inkforge-studio-theme'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section'

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))

const countWords = (value: string) => {
  const words = value.trim().match(/\S+/g)
  return words ? words.length : 0
}

const defaultMarkdown = `# Midnight Launch Notes

## Why this release matters

InkForge Studio is designed for writers who want fast, elegant publishing without sacrificing craft.

> Create with clarity, ship with confidence, and keep every draft close at hand.

### Highlights

- Rich Markdown editing with smart formatting
- Live preview with syntax-highlighted code blocks
- Durable drafts backed by local storage
- SEO-friendly metadata and clean publication flow

### Example snippet

\`\`\`tsx
export function PostSummary({ title, author }: { title: string; author: string }) {
  return <article>{title} by {author}</article>
}
\`\`\`

| Feature | Status |
| --- | --- |
| Editor | Ready |
| Live preview | Ready |
| Export | Ready |
| Publishing workflow | In progress |

**Pro tip:** use the toolbar for quick inserts, then polish in the preview pane.
`

const defaultDocuments: DocumentItem[] = [
  {
    id: 'post-aurora',
    title: 'Midnight Aurora Release',
    subtitle: 'Launching the new editorial workflow for product stories',
    author: 'Aarav Menon',
    status: 'published',
    category: 'Product',
    tags: ['launch', 'design', 'ai'],
    coverImage: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1200&auto=format&fit=crop',
    slug: 'midnight-aurora-release',
    featured: true,
    starred: true,
    createdAt: '2026-10-04T10:15:00.000Z',
    lastEdited: '2026-10-09T08:45:00.000Z',
    content: defaultMarkdown,
  },
  {
    id: 'post-journal',
    title: 'Notes from the engineering desk',
    subtitle: 'Systems, rituals, and small wins that keep teams moving',
    author: 'Leah Chen',
    status: 'draft' as const,
    category: 'Engineering',
    tags: ['workflow', 'systems', 'team'],
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop',
    slug: 'notes-from-the-engineering-desk',
    featured: false,
    starred: false,
    createdAt: '2026-10-06T09:30:00.000Z',
    lastEdited: '2026-10-08T13:12:00.000Z',
    content: `# Notes from the engineering desk\n\n## Shipping better loops\n\n- Clear handoff rituals\n- Ship earlier, observe longer\n- Keep design debt visible\n\n### Feedback capture\n\n> We optimize for learning velocity, not perfection.\n\n\`\`\`python\ndef buildLoop():\n    return "fast feedback"\n\`\`\``,
  },
  {
    id: 'post-brand',
    title: 'Brand story: a calmer launch rhythm',
    subtitle: 'A tighter editorial cadence for teams with ambitious ideas',
    author: 'Nina Patel',
    status: 'draft',
    category: 'Marketing',
    tags: ['narrative', 'brand'],
    coverImage: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop',
    slug: 'brand-story-calm-launch-rhythm',
    featured: false,
    starred: true,
    createdAt: '2026-10-01T14:00:00.000Z',
    lastEdited: '2026-10-07T18:45:00.000Z',
    content: '# Brand story\n\n## A calmer launch rhythm\n\nThe best content plans feel like a conversation, not a sprint.\n\n- Define the narrative arc\n- Edit for signal, not noise\n- Release with a human voice\n\n**Result:** a clearer story and a calmer team.\n',
  },
]

const createNewDocument = (title = 'Untitled draft'): DocumentItem => ({
  id: `doc-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  title,
  subtitle: 'A fresh story waiting for its voice',
  author: 'InkForge Writer',
  status: 'draft',
  category: 'General',
  tags: [],
  coverImage: '',
  slug: slugify(title),
  featured: false,
  starred: false,
  createdAt: new Date().toISOString(),
  lastEdited: new Date().toISOString(),
  content: `# ${title}\n\nStart writing your next story here...`,
})

const getSidebarLabel = (value: string) => {
  switch (value) {
    case 'all':
      return 'All Posts'
    case 'drafts':
      return 'Drafts'
    case 'published':
      return 'Published'
    case 'starred':
      return 'Starred'
    case 'recent':
      return 'Recently Edited'
    default:
      return 'All Posts'
  }
}

function App() {
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    if (typeof window === 'undefined') return defaultDocuments

    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaultDocuments

    try {
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) && parsed.length ? parsed : defaultDocuments
    } catch {
      return defaultDocuments
    }
  })

  const [selectedDocId, setSelectedDocId] = useState<string>(() => {
    if (typeof window === 'undefined') return defaultDocuments[0].id

    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaultDocuments[0].id

    try {
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) && parsed.length ? parsed[0].id : defaultDocuments[0].id
    } catch {
      return defaultDocuments[0].id
    }
  })

  const [activeFilter, setActiveFilter] = useState<'all' | 'drafts' | 'published' | 'starred' | 'recent'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'dark'
    const saved = window.localStorage.getItem(THEME_KEY)
    return saved === 'light' ? 'light' : 'dark'
  })
  const [saveState, setSaveState] = useState<'Saved' | 'Saving' | 'Unsaved'>('Saved')
  const [paneMode, setPaneMode] = useState<PaneMode>('split')
  const [splitRatio, setSplitRatio] = useState(0.5)
  const [shortcutOpen, setShortcutOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [menuDocId, setMenuDocId] = useState<string | null>(null)
  const [editorSearch, setEditorSearch] = useState('')
  const editorViewRef = useRef<EditorView | null>(null)
  const editorCommandsRef = useRef<{ undo: () => void; redo: () => void; selectAll: () => void } | null>(null)

  const selectedDoc = useMemo(
    () => documents.find((document) => document.id === selectedDocId) ?? documents[0],
    [documents, selectedDocId],
  )

  const filteredDocuments = useMemo(() => {
    const lower = searchQuery.trim().toLowerCase()
    return documents.filter((document) => {
      const matchesQuery =
        !lower ||
        document.title.toLowerCase().includes(lower) ||
        document.subtitle.toLowerCase().includes(lower) ||
        document.content.toLowerCase().includes(lower) ||
        document.tags.some((tag) => tag.toLowerCase().includes(lower))

      if (!matchesQuery) return false

      switch (activeFilter) {
        case 'drafts':
          return document.status === 'draft'
        case 'published':
          return document.status === 'published'
        case 'starred':
          return document.starred
        case 'recent':
          return new Date(document.lastEdited).getTime() > Date.now() - 1000 * 60 * 60 * 24 * 7
        default:
          return true
      }
    })
  }, [activeFilter, documents, searchQuery])

  useEffect(() => {
    document.body.dataset.theme = theme
    window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    if (!selectedDoc) return
    setSaveState('Saving')
    const id = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(documents))
      setSaveState('Saved')
    }, 300)
    return () => window.clearTimeout(id)
  }, [documents, selectedDoc])

  useEffect(() => {
    if (selectedDoc && !filteredDocuments.some((document) => document.id === selectedDoc.id)) {
      setSelectedDocId(filteredDocuments[0]?.id ?? selectedDoc.id)
    }
  }, [filteredDocuments, selectedDoc])

  const updateSelectedDoc = (updates: Partial<DocumentItem>) => {
    setDocuments((current) =>
      current.map((document) =>
        document.id === selectedDocId
          ? { ...document, ...updates, lastEdited: new Date().toISOString() }
          : document,
      ),
    )
    setSaveState('Unsaved')
  }

  const applyEditorAction = (prefix: string, suffix = '', fallback = 'text') => {
    const editorView = editorViewRef.current
    if (!editorView) return

    const selection = editorView.state.selection.main
    const from = selection.from
    const to = selection.to
    const selectedText = editorView.state.sliceDoc(from, to) || fallback
    const inserted = `${prefix}${selectedText}${suffix}`

    editorView.dispatch({
      changes: { from, to, insert: inserted },
      selection: { anchor: from + inserted.length, head: from + inserted.length },
    })
    editorView.focus()
  }

  const handleQuickInsert = (command: string) => {
    switch (command) {
      case 'heading-1':
        applyEditorAction('# ', '', 'Heading 1')
        break
      case 'heading-2':
        applyEditorAction('## ', '', 'Heading 2')
        break
      case 'heading-3':
        applyEditorAction('### ', '', 'Heading 3')
        break
      case 'bold':
        applyEditorAction('**', '**', 'bold text')
        break
      case 'italic':
        applyEditorAction('*', '*', 'emphasis')
        break
      case 'strike':
        applyEditorAction('~~', '~~', 'struck text')
        break
      case 'inline-code':
        applyEditorAction('`', '`', 'code')
        break
      case 'code-block':
        applyEditorAction('```\n', '\n```', 'code')
        break
      case 'quote':
        applyEditorAction('> ', '', 'Quoted text')
        break
      case 'ul':
        applyEditorAction('- ', '', 'List item')
        break
      case 'ol':
        applyEditorAction('1. ', '', 'List item')
        break
      case 'task':
        applyEditorAction('- [ ] ', '', 'Task item')
        break
      case 'link':
        applyEditorAction('[', '](https://example.com)', 'Link label')
        break
      case 'image':
        applyEditorAction('![', '](https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1200)', 'Image alt text')
        break
      case 'divider':
        applyEditorAction('\n---\n', '', 'divider')
        break
      case 'table':
        applyEditorAction('| Column | Column |\n| --- | --- |\n| Value | Value |', '', '')
        break
      default:
        break
    }
  }

  const handleNewDocument = () => {
    const next = createNewDocument(`Draft ${documents.length + 1}`)
    setDocuments((current) => [next, ...current])
    setSelectedDocId(next.id)
    setMenuDocId(null)
  }

  const handleDuplicate = (documentId: string) => {
    const doc = documents.find((item) => item.id === documentId)
    if (!doc) return

    const duplicate = {
      ...doc,
      id: `doc-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      title: `${doc.title} copy`,
      slug: `${doc.slug}-copy`,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      lastEdited: new Date().toISOString(),
      featured: false,
      starred: false,
    }

    setDocuments((current) => [duplicate, ...current])
    setSelectedDocId(duplicate.id)
    setMenuDocId(null)
  }

  const handleDeleteDocument = (documentId: string) => {
    if (documents.length === 1) return
    const confirmed = window.confirm('Delete this document permanently?')
    if (!confirmed) return

    const remaining = documents.find((document) => document.id !== documentId)
    setDocuments((current) => current.filter((document) => document.id !== documentId))
    if (remaining) setSelectedDocId(remaining.id)
    setMenuDocId(null)
  }

  const exportMarkdown = () => {
    const content = selectedDoc.content
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${selectedDoc.slug || 'article'}.md`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const tableOfContents = useMemo(() => {
    const matches = [...selectedDoc.content.matchAll(/^(#{1,6})\s+(.*)$/gm)]
    return matches.map((match, index) => ({
      id: `${slugify(match[2])}-${index}`,
      level: match[1].length,
      title: match[2].trim(),
    }))
  }, [selectedDoc.content])

  const editorActions = [
    ['heading-1', 'H1'],
    ['heading-2', 'H2'],
    ['heading-3', 'H3'],
    ['bold', 'B'],
    ['italic', 'I'],
    ['strike', 'S'],
    ['inline-code', '</>'],
    ['code-block', '```'],
    ['quote', '❝'],
    ['ul', '•'],
    ['ol', '1.'],
    ['task', '☑'],
    ['link', 'link'],
    ['image', 'img'],
    ['divider', '—'],
    ['table', 'grid'],
  ] as const

  const currentWordCount = countWords(selectedDoc.content)
  const currentCharacterCount = selectedDoc.content.length

  return (
    <div className="inkforge-shell">
      <div className="bg-glow glow-a" />
      <div className="bg-glow glow-b" />

      <aside className="sidebar-panel">
        <div className="sidebar-header">
          <div className="brand-mark"><NotebookPen size={18} /></div>
          <div>
            <div className="eyebrow">Workspace</div>
            <h2>InkForge Studio</h2>
          </div>
        </div>

        <div className="sidebar-actions">
          <button className="primary-btn" onClick={handleNewDocument}><Plus size={16} /> New post</button>
        </div>

        <nav className="sidebar-nav">
          {(['all', 'drafts', 'published', 'starred', 'recent'] as const).map((filter) => (
            <button key={filter} className={`nav-chip ${activeFilter === filter ? 'active' : ''}`} onClick={() => setActiveFilter(filter)}>
              <FolderOpenDot size={15} />
              {getSidebarLabel(filter)}
            </button>
          ))}
        </nav>

        <WeatherCard />

        <div className="search-box">
          <Search size={15} />
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search posts" />
        </div>

        <div className="doc-list-header">
          <span>{getSidebarLabel(activeFilter)}</span>
          <span>{filteredDocuments.length}</span>
        </div>

        <div className="doc-list">
          {filteredDocuments.length === 0 ? (
            <div className="empty-state"><BookOpenText size={18} /><p>No posts found</p></div>
          ) : (
            filteredDocuments.map((document) => (
              <div key={document.id} className={`doc-item ${selectedDocId === document.id ? 'selected' : ''}`} onClick={() => setSelectedDocId(document.id)}>
                <div className="doc-item-main">
                  <div className="doc-meta-row">
                    <span className="doc-title">{document.title}</span>
                    <button className="ghost-icon" onClick={(event) => { event.stopPropagation(); setMenuDocId(menuDocId === document.id ? null : document.id) }}>
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                  <div className="doc-subtitle">{document.subtitle}</div>
                  <div className="doc-stats">
                    <span>{formatDate(document.lastEdited)}</span>
                    <span>{countWords(document.content)} words</span>
                  </div>
                  <div className="doc-status-row">
                    <span className={`status-pill ${document.status}`}>{document.status}</span>
                    {document.starred && <Star size={12} fill="currentColor" />}
                  </div>
                </div>

                {menuDocId === document.id && (
                  <div className="context-menu" onClick={(event) => event.stopPropagation()}>
                    <button onClick={() => {
                      const nextTitle = window.prompt('Rename document', document.title)
                      if (nextTitle) {
                        setDocuments((current) => current.map((doc) =>
                          doc.id === document.id ? { ...doc, title: nextTitle, slug: slugify(nextTitle), lastEdited: new Date().toISOString() } : doc,
                        ))
                        setMenuDocId(null)
                      }
                    }}>Rename</button>
                    <button onClick={() => handleDuplicate(document.id)}>Duplicate</button>
                    <button onClick={() => handleDeleteDocument(document.id)}>Delete</button>
                    <button onClick={exportMarkdown}>Export</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </aside>

      <main className="workspace-panel">
        <header className="top-bar">
          <div className="topbar-heading">
            <div className="workspace-pill">Project</div>
            <span className="workspace-title">Aurora editorial vault</span>
          </div>

          <div className="topbar-actions">
            <div className={`save-indicator ${saveState.toLowerCase()}`}><div className="dot" />{saveState}</div>
            <button className="icon-btn" title="Undo" onClick={() => editorCommandsRef.current?.undo()}><Undo2 size={16} /></button>
            <button className="icon-btn" title="Redo" onClick={() => editorCommandsRef.current?.redo()}><Redo2 size={16} /></button>
            <button className="icon-btn" title="Theme" onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}>{theme === 'dark' ? <SunMedium size={16} /> : <Moon size={16} />}</button>
            <button className="icon-btn" title="Shortcuts" onClick={() => setShortcutOpen((current) => !current)}><Keyboard size={16} /></button>
            <button className="icon-btn" title="Settings" onClick={() => setSettingsOpen((current) => !current)}><Settings size={16} /></button>
            <button className="primary-btn" onClick={exportMarkdown}><Download size={16} /> Export</button>
          </div>
        </header>

        <section className="editor-toolbar">
          <div className="toolbar-group">
            <div className="doc-heading-block">
              <span className="eyebrow">Current draft</span>
              <div className="doc-title-row">
                <h1>{selectedDoc.title}</h1>
                <button className="ghost-pill" onClick={() => updateSelectedDoc({ starred: !selectedDoc.starred })}><Star size={14} fill={selectedDoc.starred ? 'currentColor' : 'none'} /></button>
              </div>
            </div>
          </div>

          <div className="toolbar-group inline-actions">
            <button className="ghost-btn" onClick={() => setPaneMode('editor')}><LayoutPanelLeft size={14} /> Editor</button>
            <button className="ghost-btn" onClick={() => setPaneMode('split')}><ArrowUpDown size={14} /> Split</button>
            <button className="ghost-btn" onClick={() => setPaneMode('preview')}><BookOpenText size={14} /> Preview</button>
          </div>
        </section>

        <section className="editor-shell">
          {paneMode !== 'preview' && (
            <div className="editor-panel" style={{ flexBasis: `${splitRatio * 100}%` }}>
              <div className="editor-controls">
                <div className="toolbar-matrix">
                  {editorActions.map(([command, label]) => (
                    <button key={command} className="tool-btn" onClick={() => handleQuickInsert(command)}>{label}</button>
                  ))}
                </div>
                <div className="right-tools">
                  <button className="icon-btn" onClick={() => editorCommandsRef.current?.selectAll()}><ListFilter size={15} /></button>
                  <button className="icon-btn" onClick={() => setEditorSearch((value) => value || selectedDoc.content.slice(0, 40))}><Search size={15} /></button>
                </div>
              </div>

              <div className="search-strip">
                <input value={editorSearch} onChange={(event) => setEditorSearch(event.target.value)} placeholder="Find in document" />
              </div>

              <div className="code-editor-wrap">
                <Suspense fallback={<div className="editor-loading" role="status">Loading editor…</div>}>
                  <MarkdownEditor
                    value={selectedDoc.content}
                    theme={theme}
                    onCreateEditor={(view, commands) => {
                      editorViewRef.current = view
                      editorCommandsRef.current = commands
                    }}
                    onChange={(value) => updateSelectedDoc({ content: value })}
                  />
                </Suspense>
              </div>
            </div>
          )}

          {paneMode !== 'editor' && (
            <div className="preview-panel" style={{ flexBasis: paneMode === 'preview' ? '100%' : `${(1 - splitRatio) * 100}%` }}>
              <div className="preview-header">
                <span>Live preview</span>
                <button className="ghost-btn" onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}>{theme === 'dark' ? 'Light preview' : 'Dark preview'}</button>
              </div>

              <div className="preview-body markdown-body">
                <Suspense fallback={<article className="preview-loading" role="status">Loading preview…</article>}>
                  <MarkdownPreview content={selectedDoc.content} />
                </Suspense>

                <aside className="toc-panel">
                  <div className="toc-header">Table of contents</div>
                  <ul>
                    {tableOfContents.length === 0 ? (
                      <li className="toc-empty">Add headings to generate a table of contents.</li>
                    ) : (
                      tableOfContents.map((heading) => (
                        <li key={heading.id} style={{ marginLeft: `${(heading.level - 1) * 12}px` }}>
                          <a href={`#${slugify(heading.title)}`}>{heading.title}</a>
                        </li>
                      ))
                    )}
                  </ul>
                </aside>
              </div>
            </div>
          )}

          {paneMode === 'split' && (
            <div className="split-divider" onMouseDown={() => {
              const handleMove = (event: MouseEvent) => {
                const container = document.querySelector('.editor-shell') as HTMLElement | null
                if (!container) return
                const rect = container.getBoundingClientRect()
                const nextRatio = (event.clientX - rect.left) / rect.width
                setSplitRatio(Math.min(Math.max(nextRatio, 0.28), 0.72))
              }

              const handleStop = () => {
                window.removeEventListener('mousemove', handleMove)
                window.removeEventListener('mouseup', handleStop)
              }

              window.addEventListener('mousemove', handleMove)
              window.addEventListener('mouseup', handleStop)
            }} />
          )}
        </section>

        <aside className="metadata-panel">
          <div className="meta-header">
            <div>
              <span className="eyebrow">Metadata</span>
              <h3>Article settings</h3>
            </div>
            <button className="ghost-pill" onClick={() => updateSelectedDoc({ status: selectedDoc.status === 'draft' ? 'published' : 'draft' })}><Sparkles size={14} /> {selectedDoc.status === 'draft' ? 'Publish' : 'Draft'}</button>
          </div>

          <div className="field-grid">
            <label>
              <span>Article title</span>
              <input value={selectedDoc.title} onChange={(event) => updateSelectedDoc({ title: event.target.value })} />
            </label>
            <label>
              <span>Subtitle</span>
              <input value={selectedDoc.subtitle} onChange={(event) => updateSelectedDoc({ subtitle: event.target.value })} />
            </label>
            <label>
              <span>Author</span>
              <input value={selectedDoc.author} onChange={(event) => updateSelectedDoc({ author: event.target.value })} />
            </label>
            <label>
              <span>Category</span>
              <input value={selectedDoc.category} onChange={(event) => updateSelectedDoc({ category: event.target.value })} />
            </label>
            <label>
              <span>URL slug</span>
              <input value={selectedDoc.slug} onChange={(event) => updateSelectedDoc({ slug: slugify(event.target.value) })} />
            </label>
            <label>
              <span>Featured story</span>
              <div className="toggle-row">
                <input type="checkbox" checked={selectedDoc.featured} onChange={(event) => updateSelectedDoc({ featured: event.target.checked })} />
                <span>{selectedDoc.featured ? 'Enabled' : 'Disabled'}</span>
              </div>
            </label>
            <label className="full-span">
              <span>Cover image URL</span>
              <input value={selectedDoc.coverImage} onChange={(event) => updateSelectedDoc({ coverImage: event.target.value })} />
            </label>
            <label className="full-span">
              <span>Tags</span>
              <input value={selectedDoc.tags.join(', ')} onChange={(event) => updateSelectedDoc({ tags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })} />
            </label>
          </div>

          <div className="stats-row">
            <div><span className="eyebrow">Words</span><strong>{currentWordCount}</strong></div>
            <div><span className="eyebrow">Characters</span><strong>{currentCharacterCount}</strong></div>
            <div><span className="eyebrow">Updated</span><strong>{formatDate(selectedDoc.lastEdited)}</strong></div>
          </div>
        </aside>
      </main>

      {shortcutOpen && (
        <div className="modal-backdrop" onClick={() => setShortcutOpen(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Keyboard shortcuts</h3>
              <button className="icon-btn" onClick={() => setShortcutOpen(false)}><X size={16} /></button>
            </div>
            <div className="shortcut-grid">
              <span><kbd>Ctrl/Cmd</kbd> + <kbd>S</kbd></span><span>Save document</span>
              <span><kbd>Ctrl/Cmd</kbd> + <kbd>B</kbd></span><span>Bold</span>
              <span><kbd>Ctrl/Cmd</kbd> + <kbd>I</kbd></span><span>Italic</span>
              <span><kbd>Ctrl/Cmd</kbd> + <kbd>K</kbd></span><span>Insert link</span>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="modal-backdrop" onClick={() => setSettingsOpen(false)}>
          <div className="modal-card small" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Workspace settings</h3>
              <button className="icon-btn" onClick={() => setSettingsOpen(false)}><X size={16} /></button>
            </div>
            <div className="settings-list">
              <label>
                <span>Editor font size</span>
                <input type="range" min="12" max="22" value={16} readOnly />
              </label>
              <label>
                <span>Preview theme</span>
                <div className="toggle-row">
                  <input type="checkbox" checked={theme === 'dark'} onChange={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />
                  <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
                </div>
              </label>
              <label>
                <span>Autosave</span>
                <div className="toggle-row">
                  <input type="checkbox" checked readOnly />
                  <span>Enabled</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
