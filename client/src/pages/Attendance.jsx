import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import API_URL from '../api'

function Attendance() {
  const navigate = useNavigate()

  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editingId, setEditingId] = useState(null)

  const [editData, setEditData] = useState({
    subject: '',
    attendedClasses: '',
    totalClasses: ''
  })

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
        const response = await fetch(
          `${API_URL}/api/attendance`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to load attendance'
          )
        }

        setSubjects(data.subjects || [])
      } catch (error) {
        console.error('Fetch attendance error:', error)
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

    const attendedClasses = Number(
      formData.attendedClasses
    )

    const totalClasses = Number(
      formData.totalClasses
    )

    if (attendedClasses > totalClasses) {
      setError(
        'Attended classes cannot be greater than total classes'
      )
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/attendance`,
        {
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
        }
      )

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
      console.error('Add attendance error:', error)
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
        `${API_URL}/api/attendance/${id}/${type}`,
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
      console.error('Update attendance error:', error)
      setError(error.message)
    }
  }

  // ============================================
  // EDIT ATTENDANCE
  // ============================================

  const startEditing = (subject) => {
    setEditingId(subject._id)

    setEditData({
      subject: subject.subject,
      attendedClasses: subject.attendedClasses,
      totalClasses: subject.totalClasses
    })

    setError('')
  }

  const cancelEditing = () => {
    setEditingId(null)

    setEditData({
      subject: '',
      attendedClasses: '',
      totalClasses: ''
    })
  }

  const handleEditChange = (e) => {
    setEditData((previousData) => ({
      ...previousData,
      [e.target.name]: e.target.value
    }))
  }

  const saveEdit = async (id) => {
    setError('')

    const attendedClasses = Number(
      editData.attendedClasses
    )

    const totalClasses = Number(
      editData.totalClasses
    )

    if (!editData.subject.trim()) {
      setError('Subject name is required')
      return
    }

    if (attendedClasses > totalClasses) {
      setError(
        'Attended classes cannot be greater than total classes'
      )
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/attendance/${id}`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            subject: editData.subject.trim(),
            attendedClasses,
            totalClasses
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to edit attendance'
        )
      }

      setSubjects((previousSubjects) =>
        previousSubjects.map((subject) =>
          subject._id === id
            ? data.attendance
            : subject
        )
      )

      setEditingId(null)

      setEditData({
        subject: '',
        attendedClasses: '',
        totalClasses: ''
      })
    } catch (error) {
      console.error('Edit attendance error:', error)
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
        `${API_URL}/api/attendance/${id}`,
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
      console.error('Delete attendance error:', error)
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
      : (
          (totalAttended / totalClasses) *
          100
        ).toFixed(1)

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

      {/* ========================================
          SIDEBAR
      ======================================== */}

      <aside className="w-64 min-h-screen border-r border-slate-800 bg-slate-900 p-6">

        {/* CAMPUSONE LOGO */}

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
            onClick={() => navigate('/dashboard')}
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Dashboard
          </button>

          {/* ATTENDANCE */}

          <button
            type="button"
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-left font-medium"
          >
            Attendance
          </button>

          {/* ASSIGNMENTS */}

          <button
            type="button"
            onClick={() => navigate('/assignments')}
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Assignments
          </button>

          {/* CGPA */}

          <button
            type="button"
            onClick={() => navigate('/cgpa')}
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            CGPA Tracker
          </button>

          {/* PLACEMENT */}

          <button
            type="button"
            onClick={() => navigate('/placement')}
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Placement
          </button>

          {/* RESUME BUILDER */}

          <button
            type="button"
            onClick={() => navigate('/resume')}
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Resume Builder
          </button>

          {/* ====================================
              AI ASSISTANT
          ==================================== */}

          <button
            type="button"
            onClick={() => navigate('/assistant')}
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 transition hover:bg-slate-800 hover:text-white"
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

      <main className="flex-1 p-8">

        <h2 className="text-3xl font-bold">
          Attendance
        </h2>

        <p className="mt-2 text-slate-400">
          Track and manage your subject attendance.
        </p>

        {/* ========================================
            OVERALL ATTENDANCE
        ======================================== */}

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <p className="text-sm text-slate-400">
            Overall Attendance
          </p>

          <h3 className="mt-2 text-4xl font-bold">
            {overallAttendance}%
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            {totalAttended} attended out of{' '}
            {totalClasses} classes
          </p>

        </div>

        {/* ========================================
            ADD SUBJECT
        ======================================== */}

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

        {/* ========================================
            SUBJECTS
        ======================================== */}

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
                  Number(subject.totalClasses) === 0
                    ? 0
                    : (
                        (
                          Number(subject.attendedClasses) /
                          Number(subject.totalClasses)
                        ) *
                        100
                      ).toFixed(1)

                const prediction =
                  getAttendancePrediction(
                    subject.attendedClasses,
                    subject.totalClasses
                  )

                return (

                  <div
                    key={subject._id}
                    className="rounded-xl border border-slate-800 bg-slate-900 p-6"
                  >

                    {/* EDIT FORM */}

                    {editingId === subject._id && (

                      <div className="mb-6 rounded-lg border border-blue-500/30 bg-slate-800 p-4">

                        <h5 className="text-lg font-semibold">
                          Edit Attendance
                        </h5>

                        <p className="mt-1 text-sm text-slate-400">
                          Update the subject and attendance details.
                        </p>

                        <div className="mt-4 grid gap-3">

                          <input
                            type="text"
                            name="subject"
                            value={editData.subject}
                            onChange={handleEditChange}
                            placeholder="Subject name"
                            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500"
                          />

                          <input
                            type="number"
                            name="attendedClasses"
                            value={editData.attendedClasses}
                            onChange={handleEditChange}
                            min="0"
                            placeholder="Classes attended"
                            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500"
                          />

                          <input
                            type="number"
                            name="totalClasses"
                            value={editData.totalClasses}
                            onChange={handleEditChange}
                            min="0"
                            placeholder="Total classes"
                            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-blue-500"
                          />

                          <div className="mt-2 flex flex-wrap gap-2">

                            <button
                              type="button"
                              onClick={() => saveEdit(subject._id)}
                              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700"
                            >
                              Save Changes
                            </button>

                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-600"
                            >
                              Cancel
                            </button>

                          </div>

                        </div>

                      </div>

                    )}

                    {/* SUBJECT INFORMATION */}

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

                    {/* ATTENDANCE PREDICTION */}

                    <div className="mt-5 rounded-lg border border-slate-700 bg-slate-800/50 p-4">

                      <div className="flex items-center justify-between gap-3">

                        <p className="text-sm font-medium text-slate-400">
                          Attendance Insight
                        </p>

                        <span
                          className={`text-sm font-semibold ${
                            prediction.type === 'safe'
                              ? 'text-green-400'
                              : prediction.type === 'warning'
                              ? 'text-yellow-400'
                              : prediction.type === 'danger'
                              ? 'text-red-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {prediction.status}
                        </span>

                      </div>

                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        {prediction.message}
                      </p>

                    </div>

                    {/* ACTION BUTTONS */}

                    <div className="mt-6 flex flex-wrap gap-2">

                      {/* ATTENDED */}

                      <button
                        type="button"
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

                      {/* MISSED */}

                      <button
                        type="button"
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

                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() => startEditing(subject)}
                        className="rounded-lg bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-400 hover:bg-blue-500/20"
                      >
                        Edit
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
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

// ============================================
// ATTENDANCE PREDICTOR
// ============================================

function getAttendancePrediction(attended, total) {
  const attendedClasses = Number(attended) || 0
  const totalClasses = Number(total) || 0

  if (totalClasses === 0) {
    return {
      status: 'No Data',
      message:
        'Start marking classes to get attendance insights.',
      type: 'neutral'
    }
  }

  const percentage =
    (attendedClasses / totalClasses) * 100

  // BELOW 75%

  if (percentage < 75) {

    const classesNeeded = Math.ceil(
      (0.75 * totalClasses - attendedClasses) / 0.25
    )

    return {
      status: 'Below 75%',
      message: `Attend the next ${classesNeeded} ${
        classesNeeded === 1
          ? 'class'
          : 'classes'
      } to reach 75%.`,
      type: 'danger'
    }
  }

  // 75% OR ABOVE

  const classesCanMiss = Math.floor(
    attendedClasses / 0.75 - totalClasses
  )

  if (classesCanMiss === 0) {
    return {
      status: 'At Risk',
      message:
        'You cannot miss the next class if you want to maintain at least 75%.',
      type: 'warning'
    }
  }

  return {
    status: 'Safe',
    message: `You can miss ${classesCanMiss} ${
      classesCanMiss === 1
        ? 'class'
        : 'classes'
    } and still maintain at least 75%.`,
    type: 'safe'
  }
}

export default Attendance