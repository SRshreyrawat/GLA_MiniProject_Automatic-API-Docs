# OpenDocs Architecture Diagrams

OpenDocs is a modular client-server application, not a microservice system. The diagrams below describe the actual structure of the codebase and the runtime flow between the React client, Express server, local file system, and the Gemini API.

## 1. System Architecture

```mermaid
flowchart LR
    User((User))
    Browser[Browser]
    Client[React Client\nVite + Components]
    Server[Express Server\nPort 3000]
    FS[(Local Project Files)]
    Gemini[(Google Gemini API)]

    User --> Browser --> Client
    Client -->|HTTP fetch| Server
    Server -->|Read folders and files| FS
    Server -->|Generate docs| Gemini
    Server -->|Write README.md\nendpoints.json| FS
    Server -->|JSON + Markdown| Client
```

## 2. Runtime Flowchart

```mermaid
flowchart TD
    A[App loads in browser] --> B[Client checks server health]
    B --> C{Server reachable?}
    C -->|Yes| D[Show Connected status]
    C -->|No| E[Show Disconnected or Error]

    D --> F[User opens Directory Picker]
    F --> G[Client calls GET /explorer]
    G --> H[Server lists drives or folders]
    H --> I[User selects project folder]
    I --> J[Client sends POST /track-project]
    J --> K[Server starts file watcher]
    K --> L[Server scans .js files]
    L --> M[Server sends combined code to Gemini]
    M --> N[Gemini returns README + endpoints JSON]
    N --> O[Server writes README.md and endpoints.json]
    O --> P[Client fetches /readme and /endpoints]
    P --> Q[MarkdownViewer and EndpointCards update]

    K --> R[Watcher detects file change]
    R --> S[Cooldown and debounce]
    S --> L
```

## 3. Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as React Client
    participant Server as Express Server
    participant FS as Local File System
    participant Gemini as Gemini API

    User->>Client: Select project folder
    Client->>Server: POST /track-project { targetPath }
    Server->>FS: Read project tree and file contents
    Server->>Gemini: Send combined code for analysis
    Gemini-->>Server: JSON with readme and endpoints
    Server->>FS: Write README.md
    Server->>FS: Write endpoints.json
    Server-->>Client: success + endpoints
    Client->>Server: GET /readme?path=...
    Client->>Server: GET /endpoints?path=...
    Server-->>Client: Markdown and endpoint list
    Client-->>User: Render documentation

    FS-->>Server: File watcher event on change
    Server->>Server: Debounce and cooldown
    Server->>Gemini: Re-analyze updated code
    Server->>FS: Overwrite README.md and endpoints.json
```

## 4. UML-Style Module View

```mermaid
classDiagram
    class App {
      -serverStatus
      -isGenerating
      -readmeContent
      -endpoints
      -lastUpdated
      -projectPath
      -isPickerOpen
      +checkStatus()
      +fetchData()
      +handleTrackPath()
    }

    class Header
    class ActionPanel
    class DirectoryPicker
    class MarkdownViewer
    class EndpointCards

    class ServerIndex {
      +GET /
      +GET /explorer
      +GET /readme
      +GET /endpoints
      +POST /track-project
    }

    class FileWatcher {
      +startWatcher(targetPath)
    }

    class FileReader {
      +readFileContent(filePath)
      +readFilesRecursive(dir)
    }

    class GeminiService {
      +generateDocs(code)
    }

    class ReadmeUpdater {
      +updateReadme(newDocs, targetPath)
    }

    App --> Header
    App --> ActionPanel
    App --> DirectoryPicker
    App --> MarkdownViewer
    App --> EndpointCards

    ServerIndex --> FileWatcher
    ServerIndex --> FileReader
    ServerIndex --> GeminiService
    ServerIndex --> ReadmeUpdater
```

## 5. ERD-Like Artifact Model

OpenDocs does not use a database, so this is a conceptual data model for the files it creates and consumes.

```mermaid
erDiagram
    PROJECT ||--o{ SOURCE_FILE : contains
    PROJECT ||--|| README_ARTIFACT : generates
    PROJECT ||--|| ENDPOINT_ARTIFACT : generates
    SOURCE_FILE ||--o{ AI_ANALYSIS : contributes_to
    AI_ANALYSIS ||--|| README_ARTIFACT : produces
    AI_ANALYSIS ||--|| ENDPOINT_ARTIFACT : produces

    PROJECT {
        string targetPath
        string status
        datetime lastScannedAt
    }

    SOURCE_FILE {
        string filePath
        string extension
        string content
    }

    AI_ANALYSIS {
        string model
        string prompt
        string combinedCode
    }

    README_ARTIFACT {
        string path
        string markdownContent
    }

    ENDPOINT_ARTIFACT {
        string path
        string jsonContent
    }
```

## 6. Deployment View

```mermaid
flowchart LR
    subgraph LocalMachine[Local Machine]
        Browser[Browser]
        Client[Client\nVite Dev Server :5173]
        Server[Server\nExpress :3000]
        Project[(Tracked Project Folder)]
    end

    Gemini[(Google Gemini API\nExternal Service)]

    Browser --> Client
    Client --> Server
    Server --> Project
    Server --> Gemini
    Server --> Project
```

## 7. What This Architecture Means

The codebase is best described as a two-tier local application:

- The React client handles UI, folder selection, polling, and rendering.
- The Express server handles filesystem access, live watching, documentation generation, and persistence.
- Gemini is an external dependency, not an internal service.
- The project output is written back into the selected folder as `README.md` and `endpoints.json`.

If you want, I can also split these into separate files for a README section, a presentation slide deck, or a cleaner docs folder.