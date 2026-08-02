import { useNavigate } from 'react-router'
import { useEffect, useState } from 'react'

function Dashboard() {
  const navigate = useNavigate()

  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Get logged-in user from localStorage
  const storedUser = localStorage.getItem('user')
  const user = storedUser ? JSON.parse(storedUser) : null

  // ============================================
  // FETCH DASHBOARD DATA FROM BACKEND
  // ============================================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token')

        // If token doesn't exist, send user to login
        if (!token) {
          navigate('/login')
          return
        }

        const response = await fetch('/api/user/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load dashboard')
        }

        setDashboardData(data.user)
      } catch (error) {
        console.error('Dashboard error:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [navigate])

  // ============================================
  // LOGOUT
  // ============================================

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    navigate('/login')
  }

  // ============================================
  // LOADING SCREEN
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-lg text-slate-400">
          Loading dashboard...
        </p>
      </div>
    )
  }

  // ============================================
  // ERROR SCREEN
  // ============================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">

          <h2 className="text-xl font-semibold text-red-400">
            Failed to load dashboard
          </h2>

          <p className="mt-2 text-slate-400">
            {error}
          </p>

          <button
            onClick={handleLogout}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            Back to Login
          </button>

        </div>
      </div>
    )
  }

  // ============================================
  // DASHBOARD
  // ============================================

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">

      {/* SIDEBAR */}

      <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 p-6">

        {/* LOGO */}

        <h1 className="text-2xl font-bold text-blue-500">
          CampusOne
        </h1>

        {/* NAVIGATION */}

        <nav className="mt-10 space-y-2">

          <button className="w-full text-left rounded-lg bg-blue-600 px-4 py-3 font-medium">
            Dashboard
          </button>

          <button
            onClick={() => navigate('/attendance')}
             className="w-full text-left rounded-lg px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
  Attendance
</button>

          <button
          onClick={() => navigate('/assignments')}
          className="w-full text-left rounded-lg px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
  Assignments
</button>

          <button className="w-full text-left rounded-lg px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white">
            CGPA Tracker
          </button>

          <button className="w-full text-left rounded-lg px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white">
            Placement
          </button>

          <button className="w-full text-left rounded-lg px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white">
            Resume Builder
          </button>

        </nav>

        {/* LOGOUT */}

        <div className="mt-10">

          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-red-500/30 px-4 py-3 text-left text-red-400 hover:bg-red-500/10"
          >
            Logout
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="flex-1 p-8">

        {/* HEADER */}

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-3xl font-bold">
              Welcome back, {dashboardData?.name || user?.name || 'Student'} 👋
            </h2>

            <p className="mt-2 text-slate-400">
              Here's what's happening with your academics.
            </p>

          </div>

          {/* PROFILE ICON */}

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold">

            {dashboardData?.name?.charAt(0).toUpperCase() ||
              user?.name?.charAt(0).toUpperCase() ||
              'S'}

          </div>

        </div>

        {/* ========================================= */}
        {/* OVERVIEW CARDS */}
        {/* ========================================= */}

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <DashboardCard
            title="Current CGPA"
            value={dashboardData?.cgpa ?? 0}
            description="Overall academic performance"
          />

          <DashboardCard
            title="Attendance"
            value={`${dashboardData?.attendance ?? 0}%`}
            description="Overall attendance"
          />

          <DashboardCard
            title="Assignments"
            value="0"
            description="Pending assignments"
          />

          <DashboardCard
            title="Placement Progress"
            value={`${dashboardData?.placementProgress ?? 0}%`}
            description="Profile completion"
          />

        </div>

        {/* ========================================= */}
        {/* LOWER SECTION */}
        {/* ========================================= */}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* UPCOMING ASSIGNMENTS */}

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">

              <h3 className="text-xl font-semibold">
                Upcoming Assignments
              </h3>

              <button className="text-sm font-medium text-blue-400 hover:text-blue-300">
                View all
              </button>

            </div>

            <div className="mt-6 space-y-4">

              <Assignment
                subject="Data Mining"
                title="Association Rule Mining"
                due="Due tomorrow"
              />

              <Assignment
                subject="Computer Networks"
                title="Checksum Implementation"
                due="Due in 3 days"
              />

              <Assignment
                subject="Web Development"
                title="React Dashboard"
                due="Due in 5 days"
              />

            </div>

          </section>

          {/* ========================================= */}
          {/* ACADEMIC OVERVIEW */}
          {/* ========================================= */}

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <h3 className="text-xl font-semibold">
              Academic Overview
            </h3>

            <div className="mt-6 space-y-6">

              <ProgressBar
                title="Semester Progress"
                value={dashboardData?.semesterProgress ?? 0}
              />

              <ProgressBar
                title="Attendance"
                value={dashboardData?.attendance ?? 0}
              />

              <ProgressBar
                title="Assignment Completion"
                value={dashboardData?.assignmentCompletion ?? 0}
              />

              <ProgressBar
                title="Placement Preparation"
                value={dashboardData?.placementProgress ?? 0}
              />

            </div>

          </section>

        </div>

      </main>

    </div>
  )
}


// ============================================
// DASHBOARD CARD
// ============================================

function DashboardCard({ title, value, description }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <h3 className="mt-3 text-3xl font-bold">
        {value}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>

    </div>
  )
}


// ============================================
// ASSIGNMENT
// ============================================

function Assignment({ subject, title, due }) {
  return (
    <div className="rounded-lg bg-slate-800/60 p-4">

      <p className="text-sm font-medium text-blue-400">
        {subject}
      </p>

      <p className="mt-1 font-medium">
        {title}
      </p>

      <p className="mt-2 text-sm text-slate-400">
        {due}
      </p>

    </div>
  )
}


// ============================================
// PROGRESS BAR
// ============================================

function ProgressBar({ title, value }) {

  // Prevent values below 0 or above 100
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), 100)

  return (
    <div>

      <div className="mb-2 flex justify-between text-sm">

        <span className="text-slate-300">
          {title}
        </span>

        <span className="text-slate-400">
          {safeValue}%
        </span>

      </div>

      <div className="h-2 rounded-full bg-slate-800">

        <div
          className="h-2 rounded-full bg-blue-600 transition-all duration-500"
          style={{
            width: `${safeValue}%`
          }}
        />

      </div>

    </div>
  )
}

export default Dashboard