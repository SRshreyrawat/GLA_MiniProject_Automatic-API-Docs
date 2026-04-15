import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FileText, Download, Copy, ExternalLink } from 'lucide-react'

export default function MarkdownViewer({ content }) {
  const isLoading = content === 'Checking...'
  const hasError = content?.includes('Error') || content?.includes('Failed')

  return (
    <div className="glass-card rounded-2xl flex flex-col h-full overflow-hidden border border-slate-800/80">
      <div className="bg-slate-900/50 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-200">
          <FileText className="w-4 h-4 text-blue-400" />
          Project Documentation
        </h2>
        <div className="flex gap-2">
          <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Copy Content">
            <Copy className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Download File">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-8 overflow-y-auto max-h-[75vh] markdown-container">
        {isLoading ? (
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-8 bg-slate-800/50 rounded w-1/3"></div>
            <div className="h-4 bg-slate-800/50 rounded w-full"></div>
            <div className="h-4 bg-slate-800/50 rounded w-5/6"></div>
            <div className="h-4 bg-slate-800/50 rounded w-4/6"></div>
            <div className="h-32 bg-slate-800/50 rounded w-full mt-4"></div>
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
            <ExternalLink className="w-10 h-10 text-slate-600 mb-2" />
            <p>{content}</p>
          </div>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || '*Documentation has not been generated yet.*'}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}

