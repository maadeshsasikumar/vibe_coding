import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { redo, selectAll, undo } from '@codemirror/commands'

type MarkdownEditorProps = {
  value: string
  theme: 'dark' | 'light'
  onChange: (value: string) => void
  onCreateEditor: (view: EditorView, commands: EditorCommands) => void
}

export type EditorCommands = {
  undo: () => void
  redo: () => void
  selectAll: () => void
}

function MarkdownEditor({ value, theme, onChange, onCreateEditor }: MarkdownEditorProps) {
  return (
    <CodeMirror
      value={value}
      height="100%"
      theme={theme === 'dark' ? oneDark : undefined}
      extensions={[markdown(), EditorView.lineWrapping]}
      onCreateEditor={(view) => onCreateEditor(view, {
        undo: () => undo(view),
        redo: () => redo(view),
        selectAll: () => selectAll(view),
      })}
      onChange={onChange}
    />
  )
}

export default MarkdownEditor
