import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import API_URL from '../api'

function Assignments() {
  const navigate = useNavigate()

  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    subject: '',
    title: '',
    description: '',
    dueDate: ''
  })

  const token = localStorage.getItem('token')

  // ============================================
  // FETCH ASSIGNMENTS
  // ============================================

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch(`${API_URL}/api/assignments`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to load assignments'
          )
        }

        setAssignments(data.assignments || [])
      } catch (error) {
        console.error(error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (!token) {
      navigate('/login')
      return
    }

    fetchAssignments()
  }, [navigate, token])

  // ============================================
  // HANDLE INPUT
  // ============================================

  const handleChange = (e) => {
    setFormData((previousData) => ({
      ...previousData,
      [e.target.name]: e.target.value
    }))
  }

  // ============================================
  // ADD ASSIGNMENT
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')

    try {
      const response = await fetch(`${API_URL}/api/assignments`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
          subject: formData.subject,
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to add assignment'
        )
      }

      setAssignments((previousAssignments) => [
        ...previousAssignments,
        data.assignment
      ])

      setFormData({
        subject: '',
        title: '',
        description: '',
        dueDate: ''
      })
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

  // ============================================
  // TOGGLE COMPLETE / PENDING
  // ============================================

  const toggleAssignment = async (id) => {
    setError('')

    try {
      const response = await fetch(
  `${API_URL}/api/assignments/${id}/toggle`,
        {
          method: 'PUT',

          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to update assignment'
        )
      }

      setAssignments((previousAssignments) =>
        previousAssignments.map((assignment) =>
          assignment._id === id
            ? data.assignment
            : assignment
        )
      )
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

  // ============================================
  // DELETE ASSIGNMENT
  // ============================================

  const deleteAssignment = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this assignment?'
    )

    if (!confirmed) {
      return
    }

    setError('')

    try {
      const response = await fetch(
  `${API_URL}/api/assignments/${id}`,
        {
          method: 'DELETE',

          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to delete assignment'
        )
      }

      setAssignments((previousAssignments) =>
        previousAssignments.filter(
          (assignment) => assignment._id !== id
        )
      )
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

  // ============================================
  // CALCULATIONS
  // ============================================

  const pendingAssignments = assignments.filter(
    (assignment) => !assignment.completed
  )

  const completedAssignments = assignments.filter(
    (assignment) => assignment.completed
  )

  const totalAssignments = assignments.length

  const completionPercentage =
    totalAssignments === 0
      ? 0
      : Math.round(
          (completedAssignments.length / totalAssignments) * 100
        )

  // ============================================
  // LOGOUT
  // ============================================

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    navigate('/login')
  }

  // ============================================
  // UI
  // ============================================

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">

      {/* SIDEBAR */}

      <aside className="w-64 min-h-screen border-r border-slate-800 bg-slate-900 p-6">

        <h1 className="text-2xl font-bold text-blue-500">
          CampusOne
        </h1>

        <nav className="mt-10 space-y-2">

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate('/attendance')}
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Attendance
          </button>

          <button
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-left font-medium"
          >
            Assignments
          </button>

          <button
          onClick={() => navigate('/cgpa')}
          className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
  CGPA Tracker
</button>

          <button
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Placement
          </button>

          <button
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Resume Builder
          </button>

        </nav>

        <div className="mt-10">

          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-red-500/30 px-4 py-3 text-left text-red-400 hover:bg-red-500/10"
          >
            Logout
          </button>

        </div>

      </aside>

      {/* MAIN */}

      <main className="flex-1 p-8">

        {/* HEADER */}

        <div>

          <h2 className="text-3xl font-bold">
            Assignments
          </h2>

          <p className="mt-2 text-slate-400">
            Manage your college assignments and deadlines.
          </p>

        </div>

        {/* OVERVIEW */}

        <div className="mt-8 grid gap-6 md:grid-cols-3">

          <StatCard
            title="Total Assignments"
            value={totalAssignments}
          />

          <StatCard
            title="Pending"
            value={pendingAssignments.length}
          />

          <StatCard
            title="Completed"
            value={completedAssignments.length}
          />

        </div>

        {/* COMPLETION PROGRESS */}

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex justify-between">

            <div>

              <h3 className="text-lg font-semibold">
                Assignment Completion
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Your overall assignment progress
              </p>

            </div>

            <span className="font-semibold text-blue-400">
              {completionPercentage}%
            </span>

          </div>

          <div className="mt-5 h-2 rounded-full bg-slate-800">

            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${completionPercentage}%`
              }}
            />

          </div>

        </section>

        {/* ADD ASSIGNMENT */}

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <h3 className="text-xl font-semibold">
            Add Assignment
          </h3>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >

            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Subject"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Assignment title"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description (optional)"
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700 md:col-span-2"
            >
              Add Assignment
            </button>

          </form>

          {error && (
            <p className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}

        </section>

        {/* ASSIGNMENT LIST */}

        <section className="mt-8">

          <h3 className="text-xl font-semibold">
            Your Assignments
          </h3>

          {loading ? (

            <p className="mt-6 text-slate-400">
              Loading assignments...
            </p>

          ) : assignments.length === 0 ? (

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">

              <p className="text-slate-400">
                No assignments added yet.
              </p>

            </div>

          ) : (

            <div className="mt-6 space-y-4">

              {assignments.map((assignment) => (

                <AssignmentCard
                  key={assignment._id}
                  assignment={assignment}
                  onToggle={toggleAssignment}
                  onDelete={deleteAssignment}
                />

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  )
}


// ============================================
// STAT CARD
// ============================================

function StatCard({ title, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <h3 className="mt-3 text-3xl font-bold">
        {value}
      </h3>

    </div>
  )
}


// ============================================
// ASSIGNMENT CARD
// ============================================

function AssignmentCard({
  assignment,
  onToggle,
  onDelete
}) {

  const dueDate = new Date(
    assignment.dueDate
  ).toLocaleDateString()

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

      <div className="flex items-start justify-between gap-6">

        <div>

          <p className="text-sm font-medium text-blue-400">
            {assignment.subject}
          </p>

          <h4
            className={`mt-1 text-lg font-semibold ${
              assignment.completed
                ? 'line-through text-slate-500'
                : ''
            }`}
          >
            {assignment.title}
          </h4>

          {assignment.description && (
            <p className="mt-2 text-sm text-slate-400">
              {assignment.description}
            </p>
          )}

          <p className="mt-3 text-sm text-slate-500">
            Due: {dueDate}
          </p>

        </div>

        <div>

          {assignment.completed ? (

            <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-400">
              Completed
            </span>

          ) : (

            <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-400">
              Pending
            </span>

          )}

        </div>

      </div>

      <div className="mt-5 flex gap-3">

        <button
          onClick={() => onToggle(assignment._id)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700"
        >
          {assignment.completed
            ? 'Mark Pending'
            : 'Mark Complete'}
        </button>

        <button
          onClick={() => onDelete(assignment._id)}
          className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20"
        >
          Delete
        </button>

      </div>

    </div>
  )
}

export default Assignments