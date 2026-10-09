import { Copy } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section'

function MarkdownPreview({ content }: { content: string }) {
  return (
    <article>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children, ...props }) => <h1 id={slugify(String(children))} {...props}>{children}</h1>,
          h2: ({ children, ...props }) => <h2 id={slugify(String(children))} {...props}>{children}</h2>,
          h3: ({ children, ...props }) => <h3 id={slugify(String(children))} {...props}>{children}</h3>,
          h4: ({ children, ...props }) => <h4 id={slugify(String(children))} {...props}>{children}</h4>,
          h5: ({ children, ...props }) => <h5 id={slugify(String(children))} {...props}>{children}</h5>,
          h6: ({ children, ...props }) => <h6 id={slugify(String(children))} {...props}>{children}</h6>,
          img: ({ alt, ...props }) => (
            <img
              {...props}
              alt={alt?.trim() || 'Article image'}
              loading="lazy"
              decoding="async"
            />
          ),
          code: ({ className, children, ...props }) => {
            const text = String(children).replace(/\n$/, '')
            const isInline = !className && !String(children).includes('\n')
            if (isInline) return <code className={className} {...props}>{children}</code>

            return (
              <div className="code-block-shell">
                <div className="code-block-header">
                  <span>{className?.replace('language-', '') || 'plaintext'}</span>
                  <button className="copy-code" onClick={() => navigator.clipboard.writeText(text)}>
                    <Copy size={14} /> Copy
                  </button>
                </div>
                <pre className="hljs"><code className={className} {...props}>{children}</code></pre>
              </div>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}

export default MarkdownPreview
