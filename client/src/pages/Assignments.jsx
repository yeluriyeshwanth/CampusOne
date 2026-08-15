import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import API_URL from '../api'

function Assignments() {
  const navigate = useNavigate()

  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('All')

  // ============================================
  // EDIT STATE
  // ============================================

  const [editingId, setEditingId] = useState(null)

  const [editData, setEditData] = useState({
    subject: '',
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium'
  })

  // ============================================
  // ADD FORM STATE
  // ============================================

  const [formData, setFormData] = useState({
    subject: '',
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium'
  })

  const token = localStorage.getItem('token')

  // ============================================
  // FETCH ASSIGNMENTS
  // ============================================

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/assignments`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

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
  // HANDLE ADD FORM INPUT
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
      const response = await fetch(
        `${API_URL}/api/assignments`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            subject: formData.subject,
            title: formData.title,
            description: formData.description,
            dueDate: formData.dueDate,
            priority: formData.priority
          })
        }
      )

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
        dueDate: '',
        priority: 'Medium'
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
  // START EDITING
  // ============================================

  const startEditing = (assignment) => {
    setEditingId(assignment._id)

    setEditData({
      subject: assignment.subject,
      title: assignment.title,
      description: assignment.description || '',
      dueDate: assignment.dueDate
        ? assignment.dueDate.split('T')[0]
        : '',
      priority: assignment.priority || 'Medium'
    })

    setError('')
  }

  // ============================================
  // HANDLE EDIT INPUT
  // ============================================

  const handleEditChange = (e) => {
    setEditData((previousData) => ({
      ...previousData,
      [e.target.name]: e.target.value
    }))
  }

  // ============================================
  // CANCEL EDITING
  // ============================================

  const cancelEditing = () => {
    setEditingId(null)

    setEditData({
      subject: '',
      title: '',
      description: '',
      dueDate: '',
      priority: 'Medium'
    })

    setError('')
  }

  // ============================================
  // SAVE EDIT
  // ============================================

  const saveEdit = async (id) => {
    setError('')

    if (!editData.subject.trim()) {
      setError('Subject is required')
      return
    }

    if (!editData.title.trim()) {
      setError('Assignment title is required')
      return
    }

    if (!editData.dueDate) {
      setError('Due date is required')
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/assignments/${id}`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            subject: editData.subject.trim(),
            title: editData.title.trim(),
            description: editData.description.trim(),
            dueDate: editData.dueDate,
            priority: editData.priority
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to update assignment'
        )
      }

      setAssignments((previousAssignments) =>
        previousAssignments.map((assignment) =>
          assignment._id === id
            ? data.assignment
            : assignment
        )
      )

      setEditingId(null)

      setEditData({
        subject: '',
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium'
      })
    } catch (error) {
      console.error(
        'Edit assignment error:',
        error
      )

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

      if (editingId === id) {
        cancelEditing()
      }
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
          (completedAssignments.length /
            totalAssignments) *
            100
        )

  // ============================================
  // SEARCH AND FILTER ASSIGNMENTS
  // ============================================

  const filteredAssignments = assignments.filter(
    (assignment) => {

      // SEARCH

      const search = searchTerm
        .trim()
        .toLowerCase()

      const matchesSearch =
        assignment.subject
          .toLowerCase()
          .includes(search) ||
        assignment.title
          .toLowerCase()
          .includes(search)

      if (!matchesSearch) {
        return false
      }

      // ALL

      if (filter === 'All') {
        return true
      }

      // PENDING

      if (filter === 'Pending') {
        return !assignment.completed
      }

      // COMPLETED

      if (filter === 'Completed') {
        return assignment.completed
      }

      // HIGH PRIORITY

      if (filter === 'High') {
        return assignment.priority === 'High'
      }

      // OVERDUE

      if (filter === 'Overdue') {

        const deadline = getDeadlineStatus(
          assignment.dueDate,
          assignment.completed
        )

        return deadline.type === 'overdue'
      }

      return true
    }
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
            onClick={() => navigate('/attendance')}
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Attendance
          </button>

          {/* ASSIGNMENTS */}

          <button
            type="button"
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-left font-medium"
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

          {/* AI ASSISTANT */}

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

            {/* PRIORITY */}

            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="Low">
                Low Priority
              </option>

              <option value="Medium">
                Medium Priority
              </option>

              <option value="High">
                High Priority
              </option>
            </select>

            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description (optional)"
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500 md:col-span-2"
            />

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700 md:col-span-2"
            >
              Add Assignment
            </button>

          </form>

          {!editingId && error && (
            <p className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}

        </section>

        {/* EDIT ASSIGNMENT */}

        {editingId && (

          <section className="mt-8 rounded-xl border border-blue-500/30 bg-slate-900 p-6">

            <h3 className="text-xl font-semibold">
              Edit Assignment
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Update your assignment details.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">

              {/* SUBJECT */}

              <input
                type="text"
                name="subject"
                value={editData.subject}
                onChange={handleEditChange}
                placeholder="Subject"
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* TITLE */}

              <input
                type="text"
                name="title"
                value={editData.title}
                onChange={handleEditChange}
                placeholder="Assignment title"
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* DUE DATE */}

              <input
                type="date"
                name="dueDate"
                value={editData.dueDate}
                onChange={handleEditChange}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* PRIORITY */}

              <select
                name="priority"
                value={editData.priority}
                onChange={handleEditChange}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
              >

                <option value="Low">
                  Low Priority
                </option>

                <option value="Medium">
                  Medium Priority
                </option>

                <option value="High">
                  High Priority
                </option>

              </select>

              {/* DESCRIPTION */}

              <input
                type="text"
                name="description"
                value={editData.description}
                onChange={handleEditChange}
                placeholder="Description (optional)"
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500 md:col-span-2"
              />

            </div>

            {/* EDIT ERROR */}

            {error && (
              <p className="mt-4 text-sm text-red-400">
                {error}
              </p>
            )}

            {/* BUTTONS */}

            <div className="mt-5 flex gap-3">

              <button
                type="button"
                onClick={() => saveEdit(editingId)}
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-lg bg-slate-700 px-5 py-3 font-semibold hover:bg-slate-600"
              >
                Cancel
              </button>

            </div>

          </section>

        )}

        {/* ASSIGNMENT LIST */}

        <section className="mt-8">

          <h3 className="text-xl font-semibold">
            Your Assignments
          </h3>

          {/* SEARCH AND FILTERS */}

          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900 p-5">

            {/* SEARCH */}

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search by subject or assignment title..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />

            {/* FILTER BUTTONS */}

            <div className="mt-4 flex flex-wrap gap-3">

              {[
                'All',
                'Pending',
                'Completed',
                'High',
                'Overdue'
              ].map((filterOption) => (

                <button
                  key={filterOption}
                  type="button"
                  onClick={() =>
                    setFilter(filterOption)
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    filter === filterOption
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {filterOption === 'High'
                    ? 'High Priority'
                    : filterOption}
                </button>

              ))}

            </div>

            {/* RESULT COUNT */}

            <p className="mt-4 text-sm text-slate-500">
              Showing {filteredAssignments.length} of{' '}
              {assignments.length} assignments
            </p>

          </div>

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

          ) : filteredAssignments.length === 0 ? (

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">

              <p className="text-slate-400">
                No assignments match your search or filter.
              </p>

            </div>

          ) : (

            <div className="mt-6 space-y-4">

              {filteredAssignments.map((assignment) => (

                <AssignmentCard
                  key={assignment._id}
                  assignment={assignment}
                  onToggle={toggleAssignment}
                  onDelete={deleteAssignment}
                  onEdit={startEditing}
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
// SMART DEADLINE TRACKER
// ============================================

function getDeadlineStatus(dueDate, completed) {

  // Completed assignments do not need deadline warnings

  if (completed) {
    return {
      text: 'Completed',
      type: 'completed'
    }
  }

  // Today's date

  const today = new Date()

  today.setHours(0, 0, 0, 0)

  // Extract only YYYY-MM-DD from MongoDB date

  const dateOnly = String(dueDate).split('T')[0]

  const [year, month, day] = dateOnly
    .split('-')
    .map(Number)

  // Create due date using local time

  const due = new Date(
    year,
    month - 1,
    day
  )

  due.setHours(0, 0, 0, 0)

  const millisecondsPerDay =
    1000 * 60 * 60 * 24

  const differenceInDays = Math.round(
    (due - today) / millisecondsPerDay
  )

  // OVERDUE

  if (differenceInDays < 0) {

    const overdueDays = Math.abs(
      differenceInDays
    )

    return {
      text: `Overdue by ${overdueDays} ${
        overdueDays === 1 ? 'day' : 'days'
      }`,
      type: 'overdue'
    }
  }

  // DUE TODAY

  if (differenceInDays === 0) {
    return {
      text: 'Due Today',
      type: 'today'
    }
  }

  // DUE TOMORROW

  if (differenceInDays === 1) {
    return {
      text: 'Due Tomorrow',
      type: 'tomorrow'
    }
  }

  // UPCOMING ASSIGNMENT

  return {
    text: `${differenceInDays} days remaining`,
    type: 'upcoming'
  }
}

// ============================================
// ASSIGNMENT CARD
// ============================================

function AssignmentCard({
  assignment,
  onToggle,
  onDelete,
  onEdit
}) {

  const dueDate = new Date(
    assignment.dueDate
  ).toLocaleDateString()

  // Existing assignments may not have priority.
  // Treat them as Medium priority.

  const priority =
    assignment.priority || 'Medium'

  const priorityStyles = {
    High: 'bg-red-500/10 text-red-400',
    Medium: 'bg-yellow-500/10 text-yellow-400',
    Low: 'bg-green-500/10 text-green-400'
  }

  // ============================================
  // DEADLINE STATUS
  // ============================================

  const deadline = getDeadlineStatus(
    assignment.dueDate,
    assignment.completed
  )

  const deadlineStyles = {
    overdue: 'bg-red-500/10 text-red-400',
    today: 'bg-orange-500/10 text-orange-400',
    tomorrow: 'bg-yellow-500/10 text-yellow-400',
    upcoming: 'bg-blue-500/10 text-blue-400',
    completed: 'bg-green-500/10 text-green-400'
  }

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

          {/* SMART DEADLINE TRACKER */}

          <span
            className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${
              deadlineStyles[deadline.type]
            }`}
          >
            {deadline.text}
          </span>

          {/* PRIORITY BADGE */}

          <span
            className={`ml-2 mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${
              priorityStyles[priority]
            }`}
          >
            {priority} Priority
          </span>

        </div>

        {/* STATUS */}

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

      {/* ACTIONS */}

      <div className="mt-5 flex flex-wrap gap-3">

        <button
          type="button"
          onClick={() =>
            onToggle(assignment._id)
          }
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700"
        >
          {assignment.completed
            ? 'Mark Pending'
            : 'Mark Complete'}
        </button>

        <button
          type="button"
          onClick={() =>
            onEdit(assignment)
          }
          className="rounded-lg bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-500/20"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() =>
            onDelete(assignment._id)
          }
          className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20"
        >
          Delete
        </button>

      </div>

    </div>
  )
}

export default Assignments