import { useState, useEffect } from 'react'
import Header from './components/Header'
import ActionPanel from './components/ActionPanel'
import MarkdownViewer from './components/MarkdownViewer'
import DirectoryPicker from './components/DirectoryPicker'
import EndpointCards from './components/EndpointCards'

function App() {
  const [serverStatus, setServerStatus] = useState('Checking...')
  const [isGenerating, setIsGenerating] = useState(false)
  const [readmeContent, setReadmeContent] = useState('')
  const [endpoints, setEndpoints] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [projectPath, setProjectPath] = useState('')
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const SERVER_URL = 'http://localhost:3000'

  // Check server status
  const checkStatus = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/`)
      setServerStatus(res.ok ? 'Connected' : 'Error')
    } catch (err) {
      setServerStatus('Disconnected')
    }
  }

  // Fetch README and Endpoints from the project folder
  const fetchData = async () => {
    if (!projectPath || projectPath.trim() === '') return;
    try {
      // Fetch README
      const readmeRes = await fetch(`${SERVER_URL}/readme?path=${encodeURIComponent(projectPath)}`)
      if (readmeRes.ok) {
        const data = await readmeRes.json()
        setReadmeContent(data.content)
      }

      // Fetch Endpoints
      const endpointsRes = await fetch(`${SERVER_URL}/endpoints?path=${encodeURIComponent(projectPath)}`)
      if (endpointsRes.ok) {
        const data = await endpointsRes.json()
        setEndpoints(data.endpoints || [])
      }
    } catch (err) {
      console.error("Fetch data error:", err)
    }
  }

  // Handle tracking flow (Connect Live Folder)
  const handleTrackPath = async () => {
    if (!projectPath || projectPath.trim() === '') return;
    setIsGenerating(true)
    try {
      const res = await fetch(`${SERVER_URL}/track-project`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPath: projectPath })
      })
      
      const data = await res.json()
      if (res.ok) {
        setLastUpdated(new Date())
        setEndpoints(data.endpoints || [])
        // Fetch README after generation
        await fetchData()
      } else {
        alert(data.error || "Failed to track project")
      }
    } catch (err) {
      console.error("Failed to track project:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    checkStatus()
    if (projectPath) fetchData()
    
    // Refresh data every 10 seconds if a project is active to track background changes
    const interval = setInterval(() => {
        checkStatus();
        if (projectPath) fetchData();
    }, 10000)
    
    return () => clearInterval(interval)
  }, [projectPath])

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto flex flex-col gap-8">
      <Header status={serverStatus} />
      
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 sticky top-12">
          <ActionPanel 
            onTrack={handleTrackPath} 
            onBrowse={() => setIsPickerOpen(true)}
            isGenerating={isGenerating} 
            lastUpdated={lastUpdated} 
            projectPath={projectPath}
            setProjectPath={setProjectPath}
          />
        </div>
        
        <div className="lg:col-span-8 flex flex-col gap-10">
          {/* Endpoint Section */}
          {endpoints.length > 0 && <EndpointCards endpoints={endpoints} />}

          {/* Documentation Section */}
          <div className="flex flex-col gap-4">
             {readmeContent && (
               <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 Live Documentation
               </h2>
             )}
             <MarkdownViewer content={readmeContent} />
          </div>
        </div>
      </main>

      <DirectoryPicker 
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        serverUrl={SERVER_URL}
        onSelect={(path) => {
          setProjectPath(path);
          setIsPickerOpen(false);
        }}
      />
    </div>
  )
}

export default App
