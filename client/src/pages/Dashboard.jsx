import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

function Dashboard() {
  const navigate = useNavigate()

  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ============================================
  // FETCH DASHBOARD DATA
  // ============================================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token')

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
          throw new Error(
            data.message || 'Failed to load dashboard'
          )
        }

        setDashboardData(data)
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
  // LOADING
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
  // ERROR
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
  // DATA FROM BACKEND
  // ============================================

  const user = dashboardData?.user

  const stats = dashboardData?.stats || {
    cgpa: 0,
    attendance: 0,
    pendingAssignments: 0,
    assignmentCompletion: 0
  }

  const upcomingAssignments =
    dashboardData?.upcomingAssignments || []

  // ============================================
  // DASHBOARD UI
  // ============================================

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">

      {/* ========================================
          SIDEBAR
      ======================================== */}

      <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 p-6">

        <h1 className="text-2xl font-bold text-blue-500">
          CampusOne
        </h1>

        <nav className="mt-10 space-y-2">

          {/* DASHBOARD */}

          <button
            className="w-full text-left rounded-lg bg-blue-600 px-4 py-3 font-medium"
          >
            Dashboard
          </button>

          {/* ATTENDANCE */}

          <button
            onClick={() => navigate('/attendance')}
            className="w-full text-left rounded-lg px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Attendance
          </button>

          {/* ASSIGNMENTS */}

          <button
            onClick={() => navigate('/assignments')}
            className="w-full text-left rounded-lg px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Assignments
          </button>

          {/* CGPA */}

          <button
            onClick={() => navigate('/cgpa')}
            className="w-full text-left rounded-lg px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            CGPA Tracker
          </button>

          {/* PLACEMENT */}

          <button
            className="w-full text-left rounded-lg px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Placement
          </button>

          {/* RESUME */}

          <button
            className="w-full text-left rounded-lg px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
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

      {/* ========================================
          MAIN CONTENT
      ======================================== */}

      <main className="flex-1 p-8">

        {/* HEADER */}

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-3xl font-bold">
              Welcome back, {user?.name || 'Student'} 👋
            </h2>

            <p className="mt-2 text-slate-400">
              Here's what's happening with your academics.
            </p>

          </div>

          {/* PROFILE ICON */}

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold">

            {user?.name?.charAt(0).toUpperCase() || 'S'}

          </div>

        </div>

        {/* ========================================
            OVERVIEW CARDS
        ======================================== */}

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          {/* REAL CGPA */}

          <DashboardCard
            title="Current CGPA"
            value={Number(stats.cgpa || 0).toFixed(2)}
            description="Overall academic performance"
          />

          {/* REAL ATTENDANCE */}

          <DashboardCard
            title="Attendance"
            value={`${stats.attendance || 0}%`}
            description="Overall attendance"
          />

          {/* REAL PENDING ASSIGNMENTS */}

          <DashboardCard
            title="Assignments"
            value={stats.pendingAssignments || 0}
            description="Pending assignments"
          />

          {/* REAL ASSIGNMENT COMPLETION */}

          <DashboardCard
            title="Assignment Completion"
            value={`${stats.assignmentCompletion || 0}%`}
            description="Assignments completed"
          />

        </div>

        {/* ========================================
            LOWER SECTION
        ======================================== */}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* ======================================
              UPCOMING ASSIGNMENTS
          ====================================== */}

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">

              <h3 className="text-xl font-semibold">
                Upcoming Assignments
              </h3>

              <button
                onClick={() => navigate('/assignments')}
                className="text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                View all
              </button>

            </div>

            <div className="mt-6 space-y-4">

              {upcomingAssignments.length === 0 ? (

                <div className="rounded-lg bg-slate-800/60 p-6 text-center">

                  <p className="text-slate-400">
                    No upcoming assignments.
                  </p>

                </div>

              ) : (

                upcomingAssignments.map((assignment) => (

                  <Assignment
                    key={assignment._id}
                    subject={assignment.subject}
                    title={assignment.title}
                    dueDate={assignment.dueDate}
                  />

                ))

              )}

            </div>

          </section>

          {/* ======================================
              ACADEMIC OVERVIEW
          ====================================== */}

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <h3 className="text-xl font-semibold">
              Academic Overview
            </h3>

            <div className="mt-6 space-y-6">

              {/* REAL ATTENDANCE */}

              <ProgressBar
                title="Attendance"
                value={stats.attendance}
              />

              {/* REAL ASSIGNMENT COMPLETION */}

              <ProgressBar
                title="Assignment Completion"
                value={stats.assignmentCompletion}
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

function DashboardCard({
  title,
  value,
  description
}) {
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
// ASSIGNMENT CARD
// ============================================

function Assignment({
  subject,
  title,
  dueDate
}) {

  const formattedDate = dueDate
    ? new Date(dueDate).toLocaleDateString(
        'en-IN',
        {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }
      )
    : 'No due date'

  return (
    <div className="rounded-lg bg-slate-800/60 p-4">

      <p className="text-sm font-medium text-blue-400">
        {subject}
      </p>

      <p className="mt-1 font-medium">
        {title}
      </p>

      <p className="mt-2 text-sm text-slate-400">
        Due {formattedDate}
      </p>

    </div>
  )
}


// ============================================
// PROGRESS BAR
// ============================================

function ProgressBar({
  title,
  value
}) {

  const safeValue = Math.min(
    Math.max(Number(value) || 0, 0),
    100
  )

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