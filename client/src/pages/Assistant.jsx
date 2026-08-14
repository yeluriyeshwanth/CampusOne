import { useState } from 'react'
import { useNavigate } from 'react-router'
import API_URL from '../api'

function Assistant() {
  const navigate = useNavigate()

  // ======================================================
  // CHAT STATE
  // ======================================================

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [sending, setSending] = useState(false)

  // ======================================================
  // DOCUMENT UPLOAD STATE
  // ======================================================

  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')

  // ======================================================
  // SEND MESSAGE
  // ======================================================

  const handleSendMessage = async (e) => {
  e.preventDefault()

  if (!message.trim() || sending) {
    return
  }

  const question = message.trim()

  const userMessage = {
    role: 'user',
    content: question
  }

  setMessages((previousMessages) => [
    ...previousMessages,
    userMessage
  ])

  setMessage('')
  setSending(true)

  try {
    const token = localStorage.getItem('token')

    if (!token) {
      throw new Error(
        'No login token found. Please login again.'
      )
    }

    const response = await fetch(
      `${API_URL}/api/ai/ask`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
          question: question
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.message || 'Failed to get AI response'
      )
    }

    const aiMessage = {
      role: 'assistant',
      content: data.answer,
      sources: data.sources || []
    }

    setMessages((previousMessages) => [
      ...previousMessages,
      aiMessage
    ])

  } catch (error) {

    console.error('AI request error:', error)

    const errorMessage = {
      role: 'assistant',
      content:
        error.message ||
        'Something went wrong while contacting CampusOne AI.'
    }

    setMessages((previousMessages) => [
      ...previousMessages,
      errorMessage
    ])

  } finally {
    setSending(false)
  }
}

  // ======================================================
  // FILE SELECTION
  // ======================================================

  const handleFileChange = (e) => {
    const file = e.target.files[0]

    // Clear previous messages
    setUploadError('')
    setUploadSuccess('')

    if (!file) {
      setSelectedFile(null)
      return
    }

    // Check file type
    if (
      file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      setSelectedFile(null)
      setUploadError('Only PDF files are allowed.')
      return
    }

    // Check file size
    if (file.size > 10 * 1024 * 1024) {
      setSelectedFile(null)
      setUploadError('PDF size must be less than 10 MB.')
      return
    }

    setSelectedFile(file)
  }

  // ======================================================
  // UPLOAD PDF
  // ======================================================

 const handleUpload = async (e) => {
  e.preventDefault()

  console.log("========== UPLOAD STARTED ==========")

  if (!selectedFile) {
    console.log("❌ No file selected")
    setUploadError("Please select a PDF file first.")
    return
  }

  console.log("Selected file:", selectedFile)
  console.log("File name:", selectedFile.name)
  console.log("File type:", selectedFile.type)
  console.log("File size:", selectedFile.size)

  try {
    setUploading(true)
    setUploadError("")
    setUploadSuccess("")

    const token = localStorage.getItem("token")

    console.log("Token exists:", !!token)

    if (!token) {
      throw new Error("No login token found. Please login again.")
    }

    const formData = new FormData()

    formData.append("document", selectedFile)

    console.log("API URL:", API_URL)
    console.log(
      "Upload URL:",
      `${API_URL}/api/documents/upload`
    )

    const response = await fetch(
      `${API_URL}/api/documents/upload`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      }
    )

    console.log("Response status:", response.status)
    console.log("Response OK:", response.ok)

    const data = await response.json()

    console.log("Response data:", data)

    if (!response.ok) {
      throw new Error(
        data.message || "Upload failed"
      )
    }

    setUploadSuccess(
      `${data.document.originalName} uploaded successfully!`
    )

    setSelectedFile(null)

    console.log("✅ UPLOAD SUCCESSFUL")

  } catch (error) {

    console.error("========== UPLOAD ERROR ==========")
    console.error(error)

    setUploadError(
      error.message || "Failed to upload document"
    )

  } finally {
    setUploading(false)
  }
}

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    navigate('/login')
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="min-h-screen w-64 border-r border-slate-800 bg-slate-900 p-6">

        {/* LOGO */}

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="text-2xl font-bold text-blue-500 transition hover:text-blue-400"
        >
          CampusOne
        </button>

        {/* NAVIGATION */}

        <nav className="mt-10 space-y-2">

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => navigate('/attendance')}
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Attendance
          </button>

          <button
            type="button"
            onClick={() => navigate('/assignments')}
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Assignments
          </button>

          <button
            type="button"
            onClick={() => navigate('/cgpa')}
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            CGPA Tracker
          </button>

          <button
            type="button"
            onClick={() => navigate('/placement')}
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Placement
          </button>

          <button
            type="button"
            onClick={() => navigate('/resume')}
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Resume Builder
          </button>

          {/* AI ASSISTANT */}

          <button
            type="button"
            onClick={() => navigate('/assistant')}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-left font-medium"
          >
            🤖 AI Assistant
          </button>

        </nav>

        {/* LOGOUT */}

        <div className="mt-10">

          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg border border-red-500/30 px-4 py-3 text-left text-red-400 hover:bg-red-500/10"
          >
            Logout
          </button>

        </div>

      </aside>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main className="flex flex-1 flex-col">

        {/* HEADER */}

        <header className="border-b border-slate-800 bg-slate-900 px-8 py-6">

          <h1 className="text-3xl font-bold">
            AI Assistant
          </h1>

          <p className="mt-2 text-slate-400">
            Ask questions and get help with your academic documents.
          </p>

        </header>

        {/* ==================================================
            CHAT AREA
        ================================================== */}

        <div className="flex flex-1 flex-col p-8">

          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">

            {/* ==================================================
                WELCOME MESSAGE
            ================================================== */}

            {messages.length === 0 && (

              <div className="flex flex-1 items-center justify-center">

                <div className="max-w-xl text-center">

                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 text-4xl">
                    🤖
                  </div>

                  <h2 className="mt-6 text-2xl font-bold">
                    Welcome to CampusOne AI
                  </h2>

                  <p className="mt-3 leading-7 text-slate-400">
                    Your AI academic assistant will help you
                    understand your study materials, assignments,
                    notes and other uploaded documents.
                  </p>

                  {/* INFORMATION CARDS */}

                  <div className="mt-6 grid gap-3 md:grid-cols-2">

                    {/* UPLOAD CARD */}

                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-left">

                      <p className="font-medium">
                        📄 Upload Documents
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Upload PDFs and ask questions about them.
                      </p>

                    </div>

                    {/* QUESTIONS CARD */}

                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-left">

                      <p className="font-medium">
                        💬 Ask Questions
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Get answers based on your documents.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            )}

            {/* ==================================================
                MESSAGES
            ================================================== */}

            {messages.length > 0 && (

              <div className="flex-1 space-y-4 overflow-y-auto">

                {messages.map((item, index) => (

                  <div
                    key={index}
                    className={`flex ${
                      item.role === 'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >

                    <div
  className={`max-w-2xl rounded-2xl px-5 py-3 ${
    item.role === 'user'
      ? 'bg-blue-600 text-white'
      : 'bg-slate-800 text-slate-200'
  }`}
>
  <div className="whitespace-pre-wrap">
    {item.content}
  </div>

  {item.role === 'assistant' &&
    item.sources &&
    item.sources.length > 0 && (
      <div className="mt-4 border-t border-slate-700 pt-3">

        <p className="text-xs font-semibold text-slate-400">
          📚 Sources
        </p>

        <div className="mt-2 space-y-1">

          {item.sources.map((source, sourceIndex) => (
            <p
              key={sourceIndex}
              className="text-xs text-slate-500"
            >
              Document chunk {source.chunkIndex}
            </p>
          ))}

        </div>

      </div>
    )}
</div>

                  </div>

                ))}

              </div>

            )}
            {sending && (
  <div className="mt-4 flex justify-start">
    <div className="rounded-2xl bg-slate-800 px-5 py-3 text-slate-400">
      🤖 CampusOne AI is thinking...
    </div>
  </div>
)}

            {/* ==================================================
                DOCUMENT UPLOAD
            ================================================== */}

            <div className="mt-6 rounded-xl border border-slate-700 bg-slate-900 p-5">

              <div className="flex flex-col gap-4">

                <div>

                  <h3 className="font-semibold">
                    📄 Upload Academic Document
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Upload a PDF document up to 10 MB.
                  </p>

                </div>

                {/* FILE INPUT */}

                <input
                  id="document-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="block w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700"
                />

                {/* SELECTED FILE */}

                {selectedFile && (

                  <div className="rounded-lg bg-slate-800 px-4 py-3">

                    <p className="text-sm text-slate-300">
                      Selected file:
                    </p>

                    <p className="mt-1 font-medium text-white">
                      📄 {selectedFile.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                  </div>

                )}

                {/* ERROR */}

                {uploadError && (

                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    ❌ {uploadError}
                  </div>

                )}

                {/* SUCCESS */}

                {uploadSuccess && (

                  <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                    ✅ {uploadSuccess}
                  </div>

                )}

                {/* UPLOAD BUTTON */}

                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className={`rounded-lg px-5 py-3 font-medium transition ${
                    !selectedFile || uploading
                      ? 'cursor-not-allowed bg-slate-700 text-slate-500'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {uploading
                    ? 'Uploading...'
                    : 'Upload PDF'}
                </button>

              </div>

            </div>

            {/* ==================================================
                MESSAGE INPUT
            ================================================== */}

            <form
              onSubmit={handleSendMessage}
              className="mt-4"
            >

              <div className="flex gap-3 rounded-xl border border-slate-700 bg-slate-900 p-3">

                <input
                  type="text"
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  placeholder="Ask CampusOne AI..."
                  className="flex-1 bg-transparent px-3 py-2 text-white outline-none placeholder:text-slate-500"
                />

                <button
  type="submit"
  disabled={sending || !message.trim()}
  className={`rounded-lg px-6 py-2 font-medium ${
    sending || !message.trim()
      ? 'cursor-not-allowed bg-slate-700 text-slate-500'
      : 'bg-blue-600 text-white hover:bg-blue-700'
  }`}
>
  {sending ? 'Thinking...' : 'Send'}
</button>

              </div>

            </form>

          </div>

        </div>

      </main>

    </div>
  )
}

export default Assistant