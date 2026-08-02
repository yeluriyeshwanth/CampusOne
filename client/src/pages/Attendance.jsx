import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

function Attendance() {
  const navigate = useNavigate()

  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    subject: '',
    attendedClasses: '',
    totalClasses: ''
  })

  const token = localStorage.getItem('token')

  // ============================================
  // GET ATTENDANCE
  // ============================================

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch('/api/attendance', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to load attendance'
          )
        }

        setSubjects(data.subjects || [])
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

    fetchAttendance()
  }, [navigate, token])

  // ============================================
  // INPUT CHANGE
  // ============================================

  const handleChange = (e) => {
    setFormData((previousData) => ({
      ...previousData,
      [e.target.name]: e.target.value
    }))
  }

  // ============================================
  // ADD SUBJECT
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')

    const attendedClasses = Number(formData.attendedClasses)
    const totalClasses = Number(formData.totalClasses)

    // Basic validation
    if (attendedClasses > totalClasses) {
      setError(
        'Attended classes cannot be greater than total classes'
      )
      return
    }

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
          subject: formData.subject.trim(),
          attendedClasses,
          totalClasses
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to add subject'
        )
      }

      setSubjects((previousSubjects) => [
        data.attendance,
        ...previousSubjects
      ])

      setFormData({
        subject: '',
        attendedClasses: '',
        totalClasses: ''
      })
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

  // ============================================
  // MARK ATTENDED / MISSED
  // ============================================

  const updateAttendance = async (id, type) => {
    setError('')

    try {
      const response = await fetch(
        `/api/attendance/${id}/${type}`,
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
          data.message || 'Failed to update attendance'
        )
      }

      setSubjects((previousSubjects) =>
        previousSubjects.map((subject) =>
          subject._id === id
            ? data.attendance
            : subject
        )
      )
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

  // ============================================
  // DELETE SUBJECT
  // ============================================

  const deleteSubject = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this subject?'
    )

    if (!confirmed) {
      return
    }

    setError('')

    try {
      const response = await fetch(
        `/api/attendance/${id}`,
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
          data.message || 'Failed to delete subject'
        )
      }

      setSubjects((previousSubjects) =>
        previousSubjects.filter(
          (subject) => subject._id !== id
        )
      )
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

  // ============================================
  // OVERALL ATTENDANCE
  // ============================================

  const totalAttended = subjects.reduce(
    (sum, subject) =>
      sum + Number(subject.attendedClasses || 0),
    0
  )

  const totalClasses = subjects.reduce(
    (sum, subject) =>
      sum + Number(subject.totalClasses || 0),
    0
  )

  const overallAttendance =
    totalClasses === 0
      ? 0
      : ((totalAttended / totalClasses) * 100).toFixed(1)

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
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-left font-medium"
          >
            Attendance
          </button>

          <button
            onClick={() => navigate('/assignments')}
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
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

      {/* MAIN CONTENT */}

      <main className="flex-1 p-8">

        <h2 className="text-3xl font-bold">
          Attendance
        </h2>

        <p className="mt-2 text-slate-400">
          Track and manage your subject attendance.
        </p>

        {/* OVERALL ATTENDANCE */}

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <p className="text-sm text-slate-400">
            Overall Attendance
          </p>

          <h3 className="mt-2 text-4xl font-bold">
            {overallAttendance}%
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            {totalAttended} attended out of {totalClasses} classes
          </p>

        </div>

        {/* ADD SUBJECT */}

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <h3 className="text-xl font-semibold">
            Add Subject
          </h3>

          <form
            onSubmit={handleSubmit}
            className="mt-5 grid gap-4 md:grid-cols-4"
          >

            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Subject name"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              type="number"
              name="attendedClasses"
              value={formData.attendedClasses}
              onChange={handleChange}
              placeholder="Classes attended"
              min="0"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              type="number"
              name="totalClasses"
              value={formData.totalClasses}
              onChange={handleChange}
              placeholder="Total classes"
              min="0"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
            >
              Add Subject
            </button>

          </form>

          {error && (
            <p className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}

        </section>

        {/* SUBJECTS */}

        <section className="mt-8">

          <h3 className="text-xl font-semibold">
            Your Subjects
          </h3>

          {loading ? (

            <p className="mt-6 text-slate-400">
              Loading attendance...
            </p>

          ) : subjects.length === 0 ? (

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">

              <p className="text-slate-400">
                No subjects added yet.
              </p>

            </div>

          ) : (

            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

              {subjects.map((subject) => {

                const percentage =
                  subject.totalClasses === 0
                    ? 0
                    : (
                        (subject.attendedClasses /
                          subject.totalClasses) *
                        100
                      ).toFixed(1)

                return (
                  <div
                    key={subject._id}
                    className="rounded-xl border border-slate-800 bg-slate-900 p-6"
                  >

                    <div className="flex items-start justify-between">

                      <div>

                        <h4 className="text-lg font-semibold">
                          {subject.subject}
                        </h4>

                        <p className="mt-1 text-sm text-slate-400">
                          {subject.attendedClasses} /{' '}
                          {subject.totalClasses} classes
                        </p>

                      </div>

                      <span className="text-xl font-bold text-blue-400">
                        {percentage}%
                      </span>

                    </div>

                    {/* PROGRESS BAR */}

                    <div className="mt-5 h-2 rounded-full bg-slate-800">

                      <div
                        className="h-2 rounded-full bg-blue-600 transition-all"
                        style={{
                          width: `${Math.min(
                            Number(percentage),
                            100
                          )}%`
                        }}
                      />

                    </div>

                    {/* BUTTONS */}

                    <div className="mt-6 flex flex-wrap gap-2">

                      <button
                        onClick={() =>
                          updateAttendance(
                            subject._id,
                            'attended'
                          )
                        }
                        className="rounded-lg bg-green-500/10 px-3 py-2 text-sm font-medium text-green-400 hover:bg-green-500/20"
                      >
                        + Attended
                      </button>

                      <button
                        onClick={() =>
                          updateAttendance(
                            subject._id,
                            'missed'
                          )
                        }
                        className="rounded-lg bg-yellow-500/10 px-3 py-2 text-sm font-medium text-yellow-400 hover:bg-yellow-500/20"
                      >
                        + Missed
                      </button>

                      <button
                        onClick={() =>
                          deleteSubject(subject._id)
                        }
                        className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20"
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                )
              })}

            </div>

          )}

        </section>

      </main>

    </div>
  )
}

export default Attendance