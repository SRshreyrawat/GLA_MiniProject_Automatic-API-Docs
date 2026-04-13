import { useState, useEffect } from 'react'
import { X, Folder, ChevronRight, ArrowLeft, HardDrive, Search, Check } from 'lucide-react'

export default function DirectoryPicker({ isOpen, onClose, onSelect, serverUrl }) {
  const [currentPath, setCurrentPath] = useState("")
  const [folders, setFolders] = useState([])
  const [parentPath, setParentPath] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")

  const fetchFolders = async (path = "") => {
    setIsLoading(true)
    try {
      const res = await fetch(`${serverUrl}/explorer?path=${encodeURIComponent(path)}`)
      const data = await res.json()
      if (res.ok) {
        setFolders(data.folders || [])
        setCurrentPath(data.currentPath || "")
        setParentPath(data.parentPath || "")
      }
    } catch (err) {
      console.error("Failed to fetch folders:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchFolders(currentPath)
    }
  }, [isOpen])

  if (!isOpen) return null

  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl h-[600px] bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Folder className="w-5 h-5 text-purple-400" />
              Choose Project Directory
            </h3>
            <p className="text-sm text-slate-400 mt-1 truncate max-w-full">
              {currentPath || "My Computer"}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Breadcrumb & Navigation Control */}
        <div className="bg-slate-800/30 border-b border-slate-800 flex flex-col">
          <div className="p-4 flex items-center gap-3">
            <button 
              onClick={() => fetchFolders("")}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors flex-shrink-0"
              title="This PC"
            >
              <HardDrive className="w-5 h-5" />
            </button>
            
            <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar text-sm py-1">
               <span className="text-slate-500 whitespace-nowrap">This PC</span>
               {currentPath.split(/[\\\/]/).filter(p => p).map((part, i, arr) => (
                  <div key={i} className="flex items-center gap-1">
                     <ChevronRight className="w-3 h-3 text-slate-600" />
                     <button 
                       onClick={() => {
                          const path = arr.slice(0, i + 1).join('\\') + (i === 0 ? '\\' : '');
                          fetchFolders(path);
                       }}
                       className="text-slate-300 hover:text-white whitespace-nowrap px-1 rounded transition-colors"
                     >
                       {part}
                     </button>
                  </div>
               ))}
            </div>

            {currentPath !== "" && (
              <button 
                onClick={() => fetchFolders(parentPath)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-white flex items-center gap-2 text-xs font-bold transition-all shadow-md group flex-shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                Back
              </button>
            )}
          </div>

          <div className="px-4 pb-4">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400" />
                <input 
                  type="text" 
                  placeholder="Search folders..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-1.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                />
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-purple-600/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : filteredFolders.length > 0 ? (
            <div className="grid grid-cols-1 gap-1">
              {filteredFolders.map((folder) => (
                <button
                  key={folder.path}
                  onClick={() => fetchFolders(folder.path)}
                  className="group w-full flex items-center justify-between p-3 rounded-xl hover:bg-purple-600/10 border border-transparent hover:border-purple-500/20 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    {folder.isDrive ? (
                      <HardDrive className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Folder className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
                    )}
                    <div>
                      <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                        {folder.name}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-500 transform group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
               <div className="bg-slate-800 p-4 rounded-full mb-4">
                 <Search className="w-8 h-8" />
               </div>
               <p>No matching folders available.</p>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur">
          <div className="text-xs text-slate-500 font-mono truncate max-w-[50%]">
            Selection: {currentPath || "Root"}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>
            <button 
              onClick={() => onSelect(currentPath)}
              disabled={!currentPath}
              className={`px-6 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all shadow-lg ${
                !currentPath 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30 hover:shadow-purple-500/50 active:scale-95'
              }`}
            >
              <Check className="w-4 h-4" />
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
