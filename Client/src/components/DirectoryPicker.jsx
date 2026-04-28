import { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  Folder,
  ChevronRight,
  ArrowLeft,
  HardDrive,
  Search,
  Check,
} from "lucide-react";
import PropTypes from "prop-types";

/* 🔹 Helper: normalize path */
const normalizePath = (path) => {
  if (!path) return "";
  return path.replace(/\\/g, "/");
};

/* 🔹 Helper: filter folders */
const filterFoldersBySearch = (folders, search) => {
  if (!search) return folders;
  return folders.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );
};

export default function DirectoryPicker({
  isOpen,
  onClose,
  onSelect,
  serverUrl,
}) {
  const [currentPath, setCurrentPath] = useState("");
  const [folders, setFolders] = useState([]);
  const [parentPath, setParentPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  const inputRef = useRef(null);

  /* 🔁 Fetch folders */
  const fetchFolders = async (path = "") => {
    const normalized = normalizePath(path);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${serverUrl}/explorer?path=${encodeURIComponent(normalized)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch folders");
      }

      const data = await response.json();

      setFolders(data.folders || []);
      setCurrentPath(data.currentPath || "");
      setParentPath(data.parentPath || "");
    } catch (error) {
      console.error("Directory fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /* 🔄 Load on open */
  useEffect(() => {
    if (isOpen) {
      fetchFolders(currentPath);
    }
  }, [isOpen]);

  /* ⌨️ ESC to close */
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  /* 🔍 Auto-focus search */
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  /* 🔍 Filtered folders */
  const filteredFolders = useMemo(() => {
    return filterFoldersBySearch(folders, search);
  }, [folders, search]);

  /* ⛔ Don't render if closed */
  if (!isOpen) return null;

  /* 📂 Breadcrumb */
  const pathParts = currentPath.split(/[\\\/]/).filter((p) => p);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl h-[600px] bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">

        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Folder className="w-5 h-5 text-purple-400" />
              Choose Project Directory
            </h3>
            <p className="text-sm text-slate-400 mt-1 truncate">
              {currentPath || "My Computer"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="bg-slate-800/30 border-b border-slate-800 flex flex-col">

          {/* Breadcrumb */}
          <div className="p-4 flex items-center gap-3">
            <button
              onClick={() => fetchFolders("")}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
            >
              <HardDrive className="w-5 h-5" />
            </button>

            <div className="flex-1 flex items-center gap-1 overflow-x-auto text-sm">
              <span className="text-slate-500">This PC</span>

              {pathParts.map((part, i) => {
                const path =
                  pathParts.slice(0, i + 1).join("\\") +
                  (i === 0 ? "\\" : "");

                return (
                  <div key={i} className="flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <button
                      onClick={() => fetchFolders(path)}
                      className="text-slate-300 hover:text-white"
                    >
                      {part}
                    </button>
                  </div>
                );
              })}
            </div>

            {currentPath && (
              <button
                onClick={() => fetchFolders(parentPath)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-white text-xs"
              >
                <ArrowLeft className="w-3 h-3 inline mr-1" />
                Back
              </button>
            )}
          </div>

          {/* 🔍 Search */}
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search folders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-purple-600/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : filteredFolders.length > 0 ? (
            <div className="grid gap-1">
              {filteredFolders.map((folder) => (
                <button
                  key={folder.path}
                  onClick={() => fetchFolders(folder.path)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-purple-600/10"
                >
                  <div className="flex items-center gap-3">
                    {folder.isDrive ? (
                      <HardDrive className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Folder className="w-5 h-5 text-slate-400" />
                    )}
                    <span className="text-sm text-slate-200">
                      {folder.name}
                    </span>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <Folder className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">
                {search ? "No matching folders found" : "No folders available"}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-2 text-xs text-purple-400"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-between items-center">
          <div className="text-xs text-slate-500">
            Selection: {currentPath || "Root"}
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="text-slate-400">
              Close
            </button>

            <button
              onClick={() => onSelect(currentPath)}
              disabled={!currentPath}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl disabled:bg-slate-700"
            >
              <Check className="w-4 h-4 inline mr-1" />
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ✅ Prop Types */
DirectoryPicker.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  serverUrl: PropTypes.string.isRequired,
};