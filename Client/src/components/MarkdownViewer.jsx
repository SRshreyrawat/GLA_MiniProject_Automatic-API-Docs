import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, Download, Copy, ExternalLink } from "lucide-react";
import PropTypes from "prop-types";

export default function MarkdownViewer({ content = "" }) {
  const isLoading = content === "Checking...";
  const hasError =
    typeof content === "string" &&
    (content.includes("Error") || content.includes("Failed"));

  /* 📋 Copy handler */
  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  /* ⬇️ Download handler */
  const handleDownload = () => {
    if (!content) return;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card rounded-2xl flex flex-col h-full overflow-hidden border border-slate-800/80">
      
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-200">
          <FileText className="w-4 h-4 text-blue-400" />
          Project Documentation
        </h2>

        <div className="flex gap-2">

            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 overflow-y-auto max-h-[75vh] markdown-container">
        
        {/* Loading */}
        {isLoading ? (
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-8 bg-slate-800/50 rounded w-1/3" />
            <div className="h-4 bg-slate-800/50 rounded w-full" />
            <div className="h-4 bg-slate-800/50 rounded w-5/6" />
            <div className="h-4 bg-slate-800/50 rounded w-4/6" />
            <div className="h-32 bg-slate-800/50 rounded w-full mt-4" />
          </div>
        ) : hasError ? (
          
          /* Error */
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3 text-center">
            <ExternalLink className="w-10 h-10 text-slate-600 mb-2" />
            <p>{content}</p>
          </div>
        ) : (
          
          /* Markdown */
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>

            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}


