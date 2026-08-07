import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import API_URL from '../api'

function CGPATracker() {
  const navigate = useNavigate()

  const [semesters, setSemesters] = useState([])
  const [cgpa, setCgpa] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    semester: '',
    sgpa: '',
    credits: ''
  })

  const [editingId, setEditingId] = useState(null)

  // ============================================
// CGPA GOAL TRACKER
// ============================================

const [goalData, setGoalData] = useState({
  targetCGPA: '',
  remainingSemesters: '',
  creditsPerSemester: ''
})

const [goalResult, setGoalResult] = useState(null)


  const token = localStorage.getItem('token')

  // ============================================
  // CALCULATE CGPA LOCALLY
  // ============================================

  const calculateCGPA = (semesterData) => {
    const totalCredits = semesterData.reduce(
      (sum, item) => sum + Number(item.credits),
      0
    )

    const totalWeightedPoints = semesterData.reduce(
      (sum, item) =>
        sum + Number(item.sgpa) * Number(item.credits),
      0
    )

    if (totalCredits === 0) {
      return 0
    }

    return Number(
      (totalWeightedPoints / totalCredits).toFixed(2)
    )
  }

  // ============================================
// HANDLE CGPA GOAL INPUT
// ============================================

const handleGoalChange = (e) => {
  setGoalData((previousData) => ({
    ...previousData,
    [e.target.name]: e.target.value
  }))

  // Remove old result when user changes input
  setGoalResult(null)
}

// ============================================
// CALCULATE CGPA GOAL
// ============================================

const calculateGoal = (e) => {
  e.preventDefault()

  const targetCGPA = Number(goalData.targetCGPA)
  const remainingSemesters = Number(goalData.remainingSemesters)
  const creditsPerSemester = Number(goalData.creditsPerSemester)

  if (
    targetCGPA <= 0 ||
    targetCGPA > 10 ||
    remainingSemesters <= 0 ||
    creditsPerSemester <= 0
  ) {
    setGoalResult({
      type: 'error',
      message: 'Please enter valid goal details.'
    })
    return
  }

  const completedCredits = semesters.reduce(
    (sum, semester) => sum + Number(semester.credits),
    0
  )

  const completedPoints = semesters.reduce(
    (sum, semester) =>
      sum +
      Number(semester.sgpa) *
        Number(semester.credits),
    0
  )

  const remainingCredits =
    remainingSemesters * creditsPerSemester

  const totalCredits =
    completedCredits + remainingCredits

  const requiredPoints =
    targetCGPA * totalCredits - completedPoints

  const requiredAverageSGPA =
    requiredPoints / remainingCredits

  if (requiredAverageSGPA > 10) {
    setGoalResult({
      type: 'impossible',
      message: `Reaching ${targetCGPA.toFixed(
        2
      )} CGPA is not possible with the remaining semesters.`,
      requiredSGPA: requiredAverageSGPA
    })

    return
  }

  if (Number(cgpa) >= targetCGPA) {
    setGoalResult({
      type: 'achieved',
      message: `You have already achieved your target CGPA of ${targetCGPA.toFixed(
        2
      )}.`,
      requiredSGPA: 0
    })

    return
  }

  setGoalResult({
    type: 'possible',
    message: `You need an average SGPA of ${requiredAverageSGPA.toFixed(
      2
    )} in the remaining ${remainingSemesters} ${
      remainingSemesters === 1 ? 'semester' : 'semesters'
    } to reach a CGPA of ${targetCGPA.toFixed(2)}.`,
    requiredSGPA: requiredAverageSGPA
  })
}

  // ============================================
  // FETCH CGPA DATA
  // ============================================

  useEffect(() => {
    const fetchCGPA = async () => {
      try {
        const response = await fetch(`${API_URL}/api/cgpa`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to load CGPA data'
          )
        }

        setSemesters(data.semesters || [])
        setCgpa(data.cgpa || 0)
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

    fetchCGPA()
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
  // ADD SEMESTER
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')

    try {
      const response = await fetch(`${API_URL}/api/cgpa`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
          semester: Number(formData.semester),
          sgpa: Number(formData.sgpa),
          credits: Number(formData.credits)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to add semester'
        )
      }

      const updatedSemesters = [
        ...semesters,
        data.semester
      ].sort((a, b) => a.semester - b.semester)

      setSemesters(updatedSemesters)

      setCgpa(calculateCGPA(updatedSemesters))

      setFormData({
        semester: '',
        sgpa: '',
        credits: ''
      })
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

  // ============================================
  // START EDITING
  // ============================================

  const startEditing = (semester) => {
    setEditingId(semester._id)

    setFormData({
      semester: semester.semester,
      sgpa: semester.sgpa,
      credits: semester.credits
    })

    setError('')
  }

  // ============================================
  // CANCEL EDITING
  // ============================================

  const cancelEditing = () => {
    setEditingId(null)

    setFormData({
      semester: '',
      sgpa: '',
      credits: ''
    })

    setError('')
  }

  // ============================================
  // UPDATE SEMESTER
  // ============================================

  const updateSemester = async (e) => {
    e.preventDefault()

    setError('')

    try {
      const response = await fetch(
    `${API_URL}/api/cgpa/${editingId}`,
  {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            sgpa: Number(formData.sgpa),
            credits: Number(formData.credits)
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to update semester'
        )
      }

      const updatedSemesters = semesters.map(
        (semester) =>
          semester._id === editingId
            ? data.semester
            : semester
      )

      setSemesters(updatedSemesters)

      setCgpa(calculateCGPA(updatedSemesters))

      setEditingId(null)

      setFormData({
        semester: '',
        sgpa: '',
        credits: ''
      })
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

  // ============================================
  // DELETE SEMESTER
  // ============================================

  const deleteSemester = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this semester?'
    )

    if (!confirmed) {
      return
    }

    setError('')

    try {
      const response = await fetch(
    `${API_URL}/api/cgpa/${id}`,
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
          data.message || 'Failed to delete semester'
        )
      }

      const updatedSemesters = semesters.filter(
        (semester) => semester._id !== id
      )

      setSemesters(updatedSemesters)

      setCgpa(calculateCGPA(updatedSemesters))

      if (editingId === id) {
        cancelEditing()
      }
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

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
            onClick={() => navigate('/assignments')}
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Assignments
          </button>

          <button
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-left font-medium"
          >
            CGPA Tracker
          </button>

          <button
            onClick={() => navigate('/placement')}
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

        {/* HEADER */}

        <div>
          <h2 className="text-3xl font-bold">
            CGPA Tracker
          </h2>

          <p className="mt-2 text-slate-400">
            Track your semester-wise academic performance.
          </p>
        </div>

        {/* OVERVIEW CARDS */}

        <div className="mt-8 grid gap-6 md:grid-cols-3">

          <StatCard
            title="Current CGPA"
            value={Number(cgpa).toFixed(2)}
          />

          <StatCard
            title="Semesters Completed"
            value={semesters.length}
          />

          <StatCard
            title="Total Credits"
            value={semesters.reduce(
              (sum, semester) =>
                sum + Number(semester.credits),
              0
            )}
          />

        </div>

        {/* ============================================ */}
{/* CGPA GOAL TRACKER */}
{/* ============================================ */}

<section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">

  <div>
    <h3 className="text-xl font-semibold">
      CGPA Goal Tracker
    </h3>

    <p className="mt-2 text-sm text-slate-400">
      Find the average SGPA you need in your remaining semesters
      to reach your target CGPA.
    </p>
  </div>

  <form
    onSubmit={calculateGoal}
    className="mt-6 grid gap-4 md:grid-cols-4"
  >

    <input
      type="number"
      name="targetCGPA"
      value={goalData.targetCGPA}
      onChange={handleGoalChange}
      placeholder="Target CGPA"
      min="0.01"
      max="10"
      step="0.01"
      required
      className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
    />

    <input
      type="number"
      name="remainingSemesters"
      value={goalData.remainingSemesters}
      onChange={handleGoalChange}
      placeholder="Remaining semesters"
      min="1"
      max="8"
      step="1"
      required
      className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
    />

    <input
      type="number"
      name="creditsPerSemester"
      value={goalData.creditsPerSemester}
      onChange={handleGoalChange}
      placeholder="Credits per semester"
      min="0.5"
      step="0.5"
      required
      className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
    />

    <button
      type="submit"
      className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
    >
      Calculate Goal
    </button>

  </form>

  {/* GOAL RESULT */}

  {goalResult && (
    <div
      className={`mt-6 rounded-lg border p-5 ${
        goalResult.type === 'possible'
          ? 'border-green-500/30 bg-green-500/10'
          : goalResult.type === 'achieved'
          ? 'border-blue-500/30 bg-blue-500/10'
          : goalResult.type === 'impossible'
          ? 'border-red-500/30 bg-red-500/10'
          : 'border-yellow-500/30 bg-yellow-500/10'
      }`}
    >

      <p
        className={`font-semibold ${
          goalResult.type === 'possible'
            ? 'text-green-400'
            : goalResult.type === 'achieved'
            ? 'text-blue-400'
            : goalResult.type === 'impossible'
            ? 'text-red-400'
            : 'text-yellow-400'
        }`}
      >
        {goalResult.type === 'possible'
          ? 'Goal is achievable'
          : goalResult.type === 'achieved'
          ? 'Goal already achieved'
          : goalResult.type === 'impossible'
          ? 'Goal is currently not achievable'
          : 'Check your goal details'}
      </p>

      <p className="mt-2 text-sm leading-relaxed text-slate-300">
        {goalResult.message}
      </p>

      {goalResult.type === 'possible' && (
        <div className="mt-4">

          <p className="text-sm text-slate-400">
            Required Average SGPA
          </p>

          <p className="mt-1 text-3xl font-bold text-green-400">
            {Number(goalResult.requiredSGPA).toFixed(2)}
          </p>

        </div>
      )}

    </div>
  )}

</section>

        {/* ADD / EDIT SEMESTER */}

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <h3 className="text-xl font-semibold">
            {editingId
              ? 'Edit Semester'
              : 'Add Semester'}
          </h3>

          <form
            onSubmit={
              editingId
                ? updateSemester
                : handleSubmit
            }
            className="mt-6 grid gap-4 md:grid-cols-4"
          >

            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              required
              disabled={Boolean(editingId)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-50"
            >

              <option value="">
                Select semester
              </option>

              {[1, 2, 3, 4, 5, 6, 7, 8].map(
                (semester) => (
                  <option
                    key={semester}
                    value={semester}
                  >
                    Semester {semester}
                  </option>
                )
              )}

            </select>

            <input
              type="number"
              name="sgpa"
              value={formData.sgpa}
              onChange={handleChange}
              placeholder="SGPA"
              min="0"
              max="10"
              step="0.01"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              type="number"
              name="credits"
              value={formData.credits}
              onChange={handleChange}
              placeholder="Credits"
              min="1"
              step="0.5"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
            >
              {editingId
                ? 'Update Semester'
                : 'Add Semester'}
            </button>

          </form>

          {editingId && (
            <button
              type="button"
              onClick={cancelEditing}
              className="mt-4 text-sm font-medium text-slate-400 hover:text-white"
            >
              Cancel editing
            </button>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}

        </section>

        {/* SEMESTER PERFORMANCE */}

        <section className="mt-8">

          <h3 className="text-xl font-semibold">
            Semester Performance
          </h3>

          {loading ? (

            <p className="mt-6 text-slate-400">
              Loading CGPA data...
            </p>

          ) : semesters.length === 0 ? (

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">

              <p className="text-slate-400">
                No semesters added yet.
              </p>

            </div>

          ) : (

            <div className="mt-6 space-y-4">

              {semesters.map((semester) => (

                <SemesterCard
                  key={semester._id}
                  semester={semester}
                  onEdit={startEditing}
                  onDelete={deleteSemester}
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
// SEMESTER CARD
// ============================================

function SemesterCard({
  semester,
  onEdit,
  onDelete
}) {
  const percentage = Math.min(
    Number(semester.sgpa) * 10,
    100
  )

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

      <div className="flex items-start justify-between gap-6">

        <div>

          <h4 className="text-lg font-semibold">
            Semester {semester.semester}
          </h4>

          <p className="mt-2 text-sm text-slate-400">
            Credits: {semester.credits}
          </p>

        </div>

        <div className="text-right">

          <p className="text-sm text-slate-400">
            SGPA
          </p>

          <p className="text-2xl font-bold text-blue-400">
            {Number(semester.sgpa).toFixed(2)}
          </p>

        </div>

      </div>

      {/* SGPA PROGRESS */}

      <div className="mt-5 h-2 rounded-full bg-slate-800">

        <div
          className="h-2 rounded-full bg-blue-600 transition-all"
          style={{
            width: `${percentage}%`
          }}
        />

      </div>

      {/* ACTIONS */}

      <div className="mt-5 flex gap-3">

        <button
          onClick={() => onEdit(semester)}
          className="rounded-lg bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-500/20"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(semester._id)}
          className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20"
        >
          Delete
        </button>

      </div>

    </div>
  )
}

export default CGPATracker