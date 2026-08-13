import { useState } from 'react'
import { useNavigate } from 'react-router'

function Assistant() {
  const navigate = useNavigate()

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])

  const handleSendMessage = (e) => {
    e.preventDefault()

    if (!message.trim()) {
      return
    }

    const newMessage = {
      role: 'user',
      content: message.trim()
    }

    setMessages((previousMessages) => [
      ...previousMessages,
      newMessage
    ])

    setMessage('')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">

      {/* ========================================
          SIDEBAR
      ======================================== */}

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

      {/* ========================================
          MAIN CONTENT
      ======================================== */}

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

        {/* ========================================
            CHAT AREA
        ======================================== */}

        <div className="flex flex-1 flex-col p-8">

          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">

            {/* WELCOME MESSAGE */}

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

                  <div className="mt-6 grid gap-3 md:grid-cols-2">

                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-left">
                      <p className="font-medium">
                        📄 Upload Documents
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Upload PDFs and ask questions about them.
                      </p>
                    </div>

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

            {/* MESSAGES */}

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
                      {item.content}
                    </div>

                  </div>

                ))}

              </div>

            )}

            {/* ========================================
                MESSAGE INPUT
            ======================================== */}

            <form
              onSubmit={handleSendMessage}
              className="mt-6"
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
                  className="rounded-lg bg-blue-600 px-6 py-2 font-medium hover:bg-blue-700"
                >
                  Send
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