import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FileText,
  Download,
  Copy,
  ExternalLink,
  Check,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import PropTypes from "prop-types";

/* 🔹 Helper: detect error */
const isErrorContent = (content) => {
  return (
    typeof content === "string" &&
    (content.toLowerCase().includes("error") ||
      content.toLowerCase().includes("failed"))
  );
};

/* 🔹 Helper: filename generator */
const getFileName = () => {
  const date = new Date().toISOString().split("T")[0];
  return `README-${date}.md`;
};

export default function MarkdownViewer({ content = "" }) {
  const [copied, setCopied] = useState(false);

  const isLoading = content === "Checking...";
  const hasError = isErrorContent(content);
  const isEmpty = !content || content.trim() === "";

  /* 📋 Copy */
  const handleCopy = async () => {
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);

      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  /* ⬇️ Download */
  const handleDownload = () => {
    if (!content) return;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = getFileName();
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

        {/* Actions */}
        <div className="flex gap-2">

          {/* Copy */}
          <button
            onClick={handleCopy}
            disabled={!content}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 disabled:opacity-40"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-green-400" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={!content}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 disabled:opacity-40"
          >
            <Download className="w-3 h-3" />
            Download
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

          /* ❌ Error */
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm">{content}</p>
          </div>

        ) : isEmpty ? (

          /* 📭 Empty */
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3 text-center">
            <ExternalLink className="w-10 h-10 text-slate-600" />
            <p className="text-sm">No documentation generated yet</p>
          </div>

        ) : (

          /* ✅ Markdown */
          <div className="markdown-body prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

/* ✅ PropTypes */
MarkdownViewer.propTypes = {
  content: PropTypes.string,
};