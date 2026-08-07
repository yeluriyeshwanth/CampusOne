import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import API_URL from '../api'

function Placement() {
  const navigate = useNavigate()

  const [placements, setPlacements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    package: '',
    location: '',
    appliedDate: '',
    deadline: '',
    minimumCGPA: '',
    status: 'Applied',
    notes: ''
  })

  const token = localStorage.getItem('token')

  // ============================================
  // FETCH PLACEMENTS
  // ============================================

  useEffect(() => {
    const fetchPlacements = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/placements`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message ||
              'Failed to load placement applications'
          )
        }

        setPlacements(data.placements || [])
      } catch (error) {
        console.error(
          'Fetch placements error:',
          error
        )

        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (!token) {
      navigate('/login')
      return
    }

    fetchPlacements()
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
  // ADD PLACEMENT
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')

    try {
      const response = await fetch(
        `${API_URL}/api/placements`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            company: formData.company,
            role: formData.role,

            package:
              formData.package === ''
                ? 0
                : Number(formData.package),

            location: formData.location,

            appliedDate:
              formData.appliedDate || undefined,

            deadline:
              formData.deadline || undefined,

            minimumCGPA:
              formData.minimumCGPA === ''
                ? 0
                : Number(formData.minimumCGPA),

            status: formData.status,

            notes: formData.notes
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to add placement application'
        )
      }

      setPlacements((previousPlacements) => [
        data.placement,
        ...previousPlacements
      ])

      setFormData({
        company: '',
        role: '',
        package: '',
        location: '',
        appliedDate: '',
        deadline: '',
        minimumCGPA: '',
        status: 'Applied',
        notes: ''
      })
    } catch (error) {
      console.error(
        'Add placement error:',
        error
      )

      setError(error.message)
    }
  }

  // ============================================
  // DELETE PLACEMENT
  // ============================================

  const deletePlacement = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this placement application?'
    )

    if (!confirmed) {
      return
    }

    setError('')

    try {
      const response = await fetch(
        `${API_URL}/api/placements/${id}`,
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
          data.message ||
            'Failed to delete placement application'
        )
      }

      setPlacements((previousPlacements) =>
        previousPlacements.filter(
          (placement) => placement._id !== id
        )
      )
    } catch (error) {
      console.error(
        'Delete placement error:',
        error
      )

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
            onClick={() => navigate('/cgpa')}
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            CGPA Tracker
          </button>

          <button
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-left font-medium"
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
            Placement Tracker
          </h2>

          <p className="mt-2 text-slate-400">
            Track your placement applications and recruitment progress.
          </p>
        </div>

        {/* ADD APPLICATION */}

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <h3 className="text-xl font-semibold">
            Add Placement Application
          </h3>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >

            {/* COMPANY */}

            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Company name"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            />

            {/* ROLE */}

            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Role"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            />

            {/* PACKAGE */}

            <input
              type="number"
              name="package"
              value={formData.package}
              onChange={handleChange}
              placeholder="Package (LPA)"
              min="0"
              step="0.1"
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            />

            {/* LOCATION */}

            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Location"
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            />

            {/* APPLIED DATE */}

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Applied Date
              </label>

              <input
                type="date"
                name="appliedDate"
                value={formData.appliedDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* DEADLINE */}

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Application Deadline
              </label>

              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* MINIMUM CGPA */}

            <input
              type="number"
              name="minimumCGPA"
              value={formData.minimumCGPA}
              onChange={handleChange}
              placeholder="Minimum CGPA"
              min="0"
              max="10"
              step="0.01"
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            />

            {/* STATUS */}

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="Applied">
                Applied
              </option>

              <option value="Online Assessment">
                Online Assessment
              </option>

              <option value="Technical Interview">
                Technical Interview
              </option>

              <option value="HR Interview">
                HR Interview
              </option>

              <option value="Selected">
                Selected
              </option>

              <option value="Rejected">
                Rejected
              </option>
            </select>

            {/* NOTES */}

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Notes (optional)"
              rows="3"
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500 md:col-span-2"
            />

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700 md:col-span-2"
            >
              Add Application
            </button>

          </form>

          {error && (
            <p className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}

        </section>

        {/* APPLICATIONS */}

        <section className="mt-8">

          <h3 className="text-xl font-semibold">
            Your Applications
          </h3>

          {loading ? (

            <p className="mt-6 text-slate-400">
              Loading placement applications...
            </p>

          ) : placements.length === 0 ? (

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">

              <p className="text-slate-400">
                No placement applications added yet.
              </p>

            </div>

          ) : (

            <div className="mt-6 space-y-4">

              {placements.map((placement) => (

                <PlacementCard
                  key={placement._id}
                  placement={placement}
                  onDelete={deletePlacement}
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
// PLACEMENT CARD
// ============================================

function PlacementCard({
  placement,
  onDelete
}) {

  const statusStyles = {
    Applied:
      'bg-blue-500/10 text-blue-400',

    'Online Assessment':
      'bg-purple-500/10 text-purple-400',

    'Technical Interview':
      'bg-orange-500/10 text-orange-400',

    'HR Interview':
      'bg-yellow-500/10 text-yellow-400',

    Selected:
      'bg-green-500/10 text-green-400',

    Rejected:
      'bg-red-500/10 text-red-400'
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

      <div className="flex items-start justify-between gap-6">

        <div>

          <h4 className="text-xl font-semibold">
            {placement.company}
          </h4>

          <p className="mt-1 text-blue-400">
            {placement.role}
          </p>

          <div className="mt-4 space-y-1 text-sm text-slate-400">

            <p>
              Package:{' '}
              {Number(placement.package || 0)} LPA
            </p>

            {placement.location && (
              <p>
                Location: {placement.location}
              </p>
            )}

            <p>
              Minimum CGPA:{' '}
              {Number(
                placement.minimumCGPA || 0
              ).toFixed(2)}
            </p>

            {placement.deadline && (
              <p>
                Deadline:{' '}
                {new Date(
                  placement.deadline
                ).toLocaleDateString()}
              </p>
            )}

          </div>

          {placement.notes && (
            <p className="mt-4 text-sm text-slate-500">
              {placement.notes}
            </p>
          )}

        </div>

        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            statusStyles[placement.status] ||
            'bg-slate-700 text-slate-300'
          }`}
        >
          {placement.status}
        </span>

      </div>

      <div className="mt-5">

        <button
          type="button"
          onClick={() =>
            onDelete(placement._id)
          }
          className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20"
        >
          Delete
        </button>

      </div>

    </div>
  )
}

export default Placement