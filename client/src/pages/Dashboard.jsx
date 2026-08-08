import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import API_URL from '../api'

function Dashboard() {
  const navigate = useNavigate()

  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ============================================
  // PROFILE DROPDOWN
  // ============================================

  const [profileOpen, setProfileOpen] = useState(false)

  // ============================================
  // NOTIFICATIONS
  // ============================================

  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] =
    useState(false)

  const notificationRef = useRef(null)

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

        // ============================================
        // FETCH MAIN DASHBOARD DATA
        // ============================================

        const dashboardResponse = await fetch(
          `${API_URL}/api/user/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const dashboardDataResponse =
          await dashboardResponse.json()

        if (!dashboardResponse.ok) {
          throw new Error(
            dashboardDataResponse.message ||
              'Failed to load dashboard'
          )
        }

        setDashboardData(dashboardDataResponse)

        // ============================================
        // FETCH DATA FOR NOTIFICATIONS
        // ============================================

        const [
          assignmentsResponse,
          attendanceResponse,
          placementsResponse
        ] = await Promise.all([
          fetch(`${API_URL}/api/assignments`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),

          fetch(`${API_URL}/api/attendance`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),

          fetch(`${API_URL}/api/placements`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        ])

        // ============================================
        // READ RESPONSES
        // ============================================

        let assignmentsData = {}
        let attendanceData = {}
        let placementsData = {}

        // --------------------------------------------
        // ASSIGNMENTS
        // --------------------------------------------

        if (assignmentsResponse.ok) {
          assignmentsData =
            await assignmentsResponse.json()
        } else {
          console.error(
            'Failed to fetch assignments for notifications'
          )
        }

        // --------------------------------------------
        // ATTENDANCE
        // --------------------------------------------

        if (attendanceResponse.ok) {
          attendanceData =
            await attendanceResponse.json()
        } else {
          console.error(
            'Failed to fetch attendance for notifications'
          )
        }

        // --------------------------------------------
        // PLACEMENTS
        // --------------------------------------------

        if (placementsResponse.ok) {
          placementsData =
            await placementsResponse.json()
        } else {
          console.error(
            'Failed to fetch placements for notifications'
          )
        }

        // ============================================
        // GENERATE NOTIFICATIONS
        // ============================================

        const generatedNotifications = []

        // ============================================
        // ASSIGNMENT NOTIFICATIONS
        // ============================================

        const assignments =
          assignmentsData.assignments || []

        const today = new Date()

        today.setHours(0, 0, 0, 0)

        assignments.forEach((assignment) => {
          // Ignore completed assignments
          if (assignment.completed) {
            return
          }

          // Ignore assignments without due date
          if (!assignment.dueDate) {
            return
          }

          const dueDate = new Date(
            assignment.dueDate
          )

          dueDate.setHours(0, 0, 0, 0)

          const difference = Math.ceil(
            (dueDate - today) /
              (1000 * 60 * 60 * 24)
          )

          // --------------------------------------------
          // OVERDUE
          // --------------------------------------------

          if (difference < 0) {
            generatedNotifications.push({
              id: `assignment-overdue-${assignment._id}`,
              type: 'error',
              icon: '🔴',
              title: 'Assignment Overdue',
              message: `${assignment.title} is overdue.`,
              route: '/assignments'
            })
          }

          // --------------------------------------------
          // DUE TODAY
          // --------------------------------------------

          else if (difference === 0) {
            generatedNotifications.push({
              id: `assignment-today-${assignment._id}`,
              type: 'warning',
              icon: '🟠',
              title: 'Assignment Due Today',
              message: `${assignment.title} is due today.`,
              route: '/assignments'
            })
          }

          // --------------------------------------------
          // DUE TOMORROW
          // --------------------------------------------

          else if (difference === 1) {
            generatedNotifications.push({
              id: `assignment-tomorrow-${assignment._id}`,
              type: 'warning',
              icon: '🟡',
              title: 'Assignment Due Tomorrow',
              message: `${assignment.title} is due tomorrow.`,
              route: '/assignments'
            })
          }
        })

        // ============================================
        // ATTENDANCE NOTIFICATIONS
        // ============================================

        const subjects =
          attendanceData.subjects || []

        subjects.forEach((subject) => {
          const attended = Number(
            subject.attendedClasses || 0
          )

          const total = Number(
            subject.totalClasses || 0
          )

          // Avoid division by zero
          if (total === 0) {
            return
          }

          const percentage =
            (attended / total) * 100

          // Attendance below 75%
          if (percentage < 75) {
            generatedNotifications.push({
              id: `attendance-${subject._id}`,
              type: 'warning',
              icon: '⚠️',
              title: 'Attendance Warning',
              message: `${subject.subject} attendance is ${percentage.toFixed(
                1
              )}%.`,
              route: '/attendance'
            })
          }
        })

        // ============================================
        // PLACEMENT NOTIFICATIONS
        // ============================================

        const placements =
          placementsData.placements || []

        placements.forEach((placement) => {
          // --------------------------------------------
          // ONLINE ASSESSMENT
          // --------------------------------------------

          if (
            placement.status ===
            'Online Assessment'
          ) {
            generatedNotifications.push({
              id: `placement-online-${placement._id}`,
              type: 'info',
              icon: '📝',
              title: 'Placement Update',
              message: `${placement.company} → Online Assessment`,
              route: '/placement'
            })
          }

          // --------------------------------------------
          // TECHNICAL INTERVIEW
          // --------------------------------------------

          if (
            placement.status ===
            'Technical Interview'
          ) {
            generatedNotifications.push({
              id: `placement-tech-${placement._id}`,
              type: 'info',
              icon: '🔵',
              title: 'Placement Update',
              message: `${placement.company} → Technical Interview`,
              route: '/placement'
            })
          }

          // --------------------------------------------
          // HR INTERVIEW
          // --------------------------------------------

          if (
            placement.status ===
            'HR Interview'
          ) {
            generatedNotifications.push({
              id: `placement-hr-${placement._id}`,
              type: 'info',
              icon: '🟣',
              title: 'Placement Update',
              message: `${placement.company} → HR Interview`,
              route: '/placement'
            })
          }

          // --------------------------------------------
          // SELECTED
          // --------------------------------------------

          if (
            placement.status ===
            'Selected'
          ) {
            generatedNotifications.push({
              id: `placement-selected-${placement._id}`,
              type: 'success',
              icon: '🎉',
              title: 'Congratulations!',
              message: `You have been selected by ${placement.company}.`,
              route: '/placement'
            })
          }
        })

        // ============================================
        // SORT NOTIFICATIONS
        // ============================================

        const notificationPriority = {
          error: 1,
          warning: 2,
          success: 3,
          info: 4
        }

        generatedNotifications.sort(
          (a, b) =>
            notificationPriority[a.type] -
            notificationPriority[b.type]
        )

        // ============================================
        // SAVE NOTIFICATIONS
        // ============================================

        setNotifications(
          generatedNotifications
        )
      } catch (error) {
        console.error(
          'Dashboard error:',
          error
        )

        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [navigate])

  // ============================================
  // CLOSE NOTIFICATIONS WHEN CLICKING OUTSIDE
  // ============================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setShowNotifications(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )
    }
  }, [])

  // ============================================
  // LOGOUT
  // ============================================

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    navigate('/login')
  }

  // ============================================
  // HANDLE NOTIFICATION CLICK
  // ============================================

  const handleNotificationClick = (
    notification
  ) => {
    setShowNotifications(false)
    setProfileOpen(false)

    navigate(notification.route)
  }

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
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
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">

          <h2 className="text-xl font-semibold text-red-400">
            Failed to load dashboard
          </h2>

          <p className="mt-2 text-slate-400">
            {error}
          </p>

          <button
            type="button"
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
    <div className="flex min-h-screen bg-slate-950 text-white">

      {/* ========================================
          SIDEBAR
      ======================================== */}

      <aside className="min-h-screen w-64 border-r border-slate-800 bg-slate-900 p-6">

        <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="text-2xl font-bold text-blue-500 transition hover:text-blue-400"
        >
         CampusOne
        </button>

        <nav className="mt-10 space-y-2">

          {/* DASHBOARD */}

          <button
            type="button"
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-left font-medium"
          >
            Dashboard
          </button>

          {/* ATTENDANCE */}

          <button
            type="button"
            onClick={() =>
              navigate('/attendance')
            }
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Attendance
          </button>

          {/* ASSIGNMENTS */}

          <button
            type="button"
            onClick={() =>
              navigate('/assignments')
            }
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Assignments
          </button>

          {/* CGPA */}

          <button
            type="button"
            onClick={() =>
              navigate('/cgpa')
            }
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            CGPA Tracker
          </button>

          {/* PLACEMENT */}

          <button
            type="button"
            onClick={() =>
              navigate('/placement')
            }
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Placement
          </button>

          {/* RESUME */}

          <button
            type="button"
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Resume Builder
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

      <main className="flex-1 p-8">

        {/* ========================================
            HEADER
        ======================================== */}

        <div className="flex items-center justify-between">

          {/* WELCOME TEXT */}

          <div>

            <h2 className="text-3xl font-bold">
              Welcome back,{' '}
              {user?.name || 'Student'} 👋
            </h2>

            <p className="mt-2 text-slate-400">
              Here's what's happening with your academics.
            </p>

          </div>

          {/* ======================================
              HEADER RIGHT SIDE
          ====================================== */}

          <div className="flex items-center gap-4">

            {/* ====================================
                NOTIFICATION
            ==================================== */}

            <div
              ref={notificationRef}
              className="relative"
            >

              {/* NOTIFICATION BUTTON */}

              <button
                type="button"
                onClick={() => {
                  setShowNotifications(
                    (previous) => !previous
                  )

                  setProfileOpen(false)
                }}
                className="relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-xl transition hover:bg-slate-700"
                aria-label="Notifications"
                aria-expanded={
                  showNotifications
                }
              >

                🔔

                {/* NOTIFICATION COUNT */}

                {notifications.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                    {notifications.length}
                  </span>
                )}

              </button>

              {/* =================================
                  NOTIFICATION DROPDOWN
              ================================= */}

              {showNotifications && (
                <div className="absolute right-0 top-14 z-50 w-96 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">

                  {/* HEADER */}

                  <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">

                    <div>

                      <h3 className="font-semibold text-white">
                        Notifications
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Recent updates from CampusOne
                      </p>

                    </div>

                    {notifications.length > 0 && (
                      <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs text-blue-400">
                        {notifications.length}
                      </span>
                    )}

                  </div>

                  {/* =================================
                      NO NOTIFICATIONS
                  ================================= */}

                  {notifications.length === 0 ? (

                    <div className="px-5 py-10 text-center">

                      <div className="text-3xl">
                        🎉
                      </div>

                      <p className="mt-3 font-medium">
                        You're all caught up!
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        No new notifications right now.
                      </p>

                    </div>

                  ) : (

                    /* =================================
                       NOTIFICATION LIST
                    ================================= */

                    <div className="max-h-96 overflow-y-auto">

                      {notifications.map(
                        (notification) => (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                            className="flex w-full gap-3 border-b border-slate-800 px-5 py-4 text-left transition hover:bg-slate-800"
                          >

                            {/* ICON */}

                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 text-lg">
                              {notification.icon}
                            </div>

                            {/* CONTENT */}

                            <div className="min-w-0 flex-1">

                              <p className="font-medium text-white">
                                {notification.title}
                              </p>

                              <p className="mt-1 text-sm leading-5 text-slate-400">
                                {notification.message}
                              </p>

                              <p className="mt-2 text-xs text-blue-400">
                                Click to view →
                              </p>

                            </div>

                          </button>
                        )
                      )}

                    </div>

                  )}

                </div>
              )}

            </div>

            {/* ====================================
                PROFILE
            ==================================== */}

            <div className="relative">

              {/* PROFILE ICON */}

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(
                    (previous) => !previous
                  )

                  setShowNotifications(false)
                }}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold transition hover:bg-blue-700"
                aria-label="Profile"
                aria-expanded={profileOpen}
              >

                {user?.name
                  ?.charAt(0)
                  .toUpperCase() || 'S'}

              </button>

              {/* PROFILE DROPDOWN */}

              {profileOpen && (
                <div className="absolute right-0 z-50 mt-3 w-72 rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-xl">

                  {/* USER DETAILS */}

                  <div className="border-b border-slate-700 pb-4">

                    <p className="text-lg font-semibold text-white">
                      {user?.name || 'Student'}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {user?.email ||
                        'Email not available'}
                    </p>

                  </div>

                  {/* PROFILE */}

                  <button
                    type="button"
                    className="mt-3 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    Profile
                  </button>

                  {/* LOGOUT */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
                  >
                    Logout
                  </button>

                </div>
              )}

            </div>

          </div>

        </div>

        {/* ========================================
            OVERVIEW CARDS
        ======================================== */}

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <DashboardCard
            title="Current CGPA"
            value={Number(
              stats.cgpa || 0
            ).toFixed(2)}
            description="Overall academic performance"
          />

          <DashboardCard
            title="Attendance"
            value={`${stats.attendance || 0}%`}
            description="Overall attendance"
          />

          <DashboardCard
            title="Assignments"
            value={
              stats.pendingAssignments || 0
            }
            description="Pending assignments"
          />

          <DashboardCard
            title="Assignment Completion"
            value={`${
              stats.assignmentCompletion || 0
            }%`}
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
                type="button"
                onClick={() =>
                  navigate('/assignments')
                }
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

                upcomingAssignments.map(
                  (assignment) => (
                    <Assignment
                      key={assignment._id}
                      subject={assignment.subject}
                      title={assignment.title}
                      dueDate={
                        assignment.dueDate
                      }
                    />
                  )
                )

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

              <ProgressBar
                title="Attendance"
                value={stats.attendance}
              />

              <ProgressBar
                title="Assignment Completion"
                value={
                  stats.assignmentCompletion
                }
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
    ? new Date(
        dueDate
      ).toLocaleDateString(
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