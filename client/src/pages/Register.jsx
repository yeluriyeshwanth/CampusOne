import { useState } from 'react'
import { Link } from 'react-router'
import API_URL from '../api'

function Register() {
  // Stores everything the user types
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Stores validation error message
  const [error, setError] = useState('')

  // Stores success message
  const [success, setSuccess] = useState('')

  // Runs whenever the user types inside an input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })

    // Remove old messages when user starts correcting the form
    setError('')
    setSuccess('')
  }

  // Runs when Create Account is clicked
  const handleSubmit = async (e) => {
  e.preventDefault()

  setError('')
  setSuccess('')

  const name = formData.name.trim()
  const email = formData.email.trim()

  // Check empty fields
  if (
    !name ||
    !email ||
    !formData.password ||
    !formData.confirmPassword
  ) {
    setError('Please fill in all fields')
    return
  }

  // Check password length
  if (formData.password.length < 6) {
    setError('Password must be at least 6 characters')
    return
  }

  // Check passwords match
  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match')
    return
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          name: name,
          email: email,
          password: formData.password
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      setError(data.message || 'Registration failed')
      return
    }

    setSuccess('Account created successfully!')

    // Clear form after successful registration
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })

  } catch (error) {
    console.error(error)

    setError(
      'Unable to connect to the server. Please try again.'
    )
  }
}

  return (
    <div className="min-h-screen bg-slate-950 flex">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-blue-600 text-white">

        <h1 className="text-3xl font-bold">
          CampusOne
        </h1>

        <div>
          <h2 className="text-5xl font-bold leading-tight">
            Your college journey,
            <br />
            organized.
          </h2>

          <p className="mt-6 max-w-md text-lg text-blue-100">
            Create your CampusOne account and manage academics,
            assignments, attendance, placements and more from one
            platform.
          </p>

          <div className="mt-8 space-y-3 text-blue-100">
            <p>✓ Track your attendance</p>
            <p>✓ Manage assignments and deadlines</p>
            <p>✓ Monitor semester CGPA</p>
            <p>✓ Prepare for placements</p>
            <p>✓ Organize your college schedule</p>
          </div>
        </div>

        <p className="text-sm text-blue-200">
          Your Complete Student Companion
        </p>

      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">

        <div className="w-full max-w-md">

          {/* Logo shown on smaller screens */}
          <div className="lg:hidden mb-8">
            <h1 className="text-3xl font-bold text-white">
              CampusOne
            </h1>
          </div>

          <h2 className="text-3xl font-bold text-white">
            Create your account
          </h2>

          <p className="mt-2 text-slate-400">
            Start organizing your college life with CampusOne
          </p>

          {/* REGISTER FORM */}
          <form onSubmit={handleSubmit} className="mt-7">

            {/* FULL NAME */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-300"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                required
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

            {/* EMAIL */}
            <div className="mt-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@example.com"
                autoComplete="email"
                required
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

            {/* PASSWORD */}
            <div className="mt-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                autoComplete="new-password"
                minLength={6}
                required
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />

              <p className="mt-1 text-xs text-slate-500">
                Password must contain at least 6 characters.
              </p>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="mt-4">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-300"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Enter password again"
                autoComplete="new-password"
                minLength={6}
                required
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
              >
                {error}
              </div>
            )}

            {/* SUCCESS MESSAGE */}
            {success && (
              <div
                role="status"
                className="mt-4 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400"
              >
                {success}
              </div>
            )}

            {/* REGISTER BUTTON */}
            <button
              type="submit"
              className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Create Account
            </button>

          </form>

          {/* LOGIN LINK */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}

            <Link
              to="/login"
              className="font-semibold text-blue-400 hover:text-blue-300"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>

    </div>
  )
}

export default Register