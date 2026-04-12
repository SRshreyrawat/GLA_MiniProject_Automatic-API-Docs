# GLA_MiniProject_Automatic-API-Docs
# OpenDocs - Automatic API Documentation Generator

## 📋 Project Overview

**OpenDocs** is an AI-powered Automatic API Documentation Generator that automatically analyzes source code and generates professional API documentation in real time. It helps developers eliminate manual documentation effort by intelligently scanning project files, detecting API endpoints, and creating structured README documentation instantly.

The system combines:

* **React Frontend** for interactive user interface
* **Node.js + Express Backend** for server-side processing
* **Google Gemini AI** for intelligent code analysis
* **Chokidar File Watcher** for live documentation updates

OpenDocs ensures that API documentation always stays synchronized with the latest code changes, making development faster, smarter, and more efficient.

---

## 🚀 Key Features

* 🤖 AI-powered documentation generation using Google Gemini
* 📄 Automatic README.md creation
* 🔍 API endpoint detection and extraction
* 🔄 Live file watching with real-time updates
* 🌐 Modern responsive web interface
* 📁 Folder-based project scanning
* ⚡ Fast and scalable architecture

---

## 🛠️ Technologies Used

### Frontend:

* React.js
* Vite
* Tailwind CSS
* React Markdown
* Lucide React

### Backend:

* Node.js
* Express.js
* Chokidar
* Dotenv
* CORS

### AI Integration:

* Google Gemini 2.5 Flash API

---

## 📁 Project Structure

```bash
OpenDocs/
├── Client/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── Server/
│   ├── ai/
│   ├── utils/
│   ├── watcher/
│   ├── index.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd OpenDocs
```

---

### Step 2: Install Backend Dependencies

```bash
cd Server
npm install
```

---

### Step 3: Install Frontend Dependencies

```bash
cd ../Client
npm install
```

---

### Step 4: Configure Environment Variables

Create `.env` file inside Server folder:

```env
GEMINI_API_KEY=your_google_gemini_api_key
```

---

## ▶️ Running the Project

### Start Backend Server

```bash
cd Server
node index.js
```

Server runs on:

```bash
http://localhost:3000
```

---

### Start Frontend Client

Open another terminal:

```bash
cd Client
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

## 🎯 How It Works

1. User selects project folder
2. OpenDocs scans all JavaScript files
3. Source code is combined and sent to Gemini AI
4. AI analyzes API routes and backend logic
5. README.md and endpoints.json are generated automatically
6. Chokidar watches for file changes
7. Documentation updates in real time

---

## 🔌 API Endpoints

### GET `/`

Check server health status

### GET `/explorer`

Browse local file system directories

### GET `/readme`

Fetch generated README documentation

### GET `/endpoints`

Fetch detected API endpoints list

### POST `/track-project`

Start project tracking and documentation generation

---

## 🔄 Live Documentation Updates

Whenever project files are modified:

* Chokidar detects changes
* Files are rescanned automatically
* Gemini regenerates documentation
* README updates instantly

---

## 📦 Example Use Case

If your backend contains:

```javascript
app.get('/users', (req, res) => {
  res.send(users);
});
```

OpenDocs generates:

```bash
GET /users
Description: Fetch all users
```

---

## 🐛 Troubleshooting

| Issue               | Solution                                |
| ------------------- | --------------------------------------- |
| Server disconnected | Ensure backend is running on port 3000  |
| Gemini API error    | Verify GEMINI_API_KEY in .env           |
| No docs generated   | Check selected folder contains JS files |
| Path not found      | Select valid project directory          |

---

## 🚀 Future Enhancements

* Swagger/OpenAPI export support
* Multi-language code support (Python, Java, Go)
* PDF documentation export
* Authentication support
* Cloud deployment integration

---


## 📄 License

ISC License

---

## 🌟 Conclusion

OpenDocs transforms source code into intelligent, real-time, automatically updated API documentation — making documentation smarter, faster, and effortless.
