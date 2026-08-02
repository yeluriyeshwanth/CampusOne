import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

function Login() {

  const navigate = useNavigate()

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // Messages
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Handle login
  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {

      const response = await fetch('/api/auth/login', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      // Login failed
      if (!response.ok) {
        setError(data.message || 'Login failed')
        setLoading(false)
        return
      }

      // Save JWT token
      localStorage.setItem('token', data.token)

      // Save user information
      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      )

      // Go to dashboard
      navigate('/dashboard')

    } catch (error) {

      console.error(error)

      setError(
        'Unable to connect to the server. Please try again.'
      )

    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-slate-950 flex">

      {/* LEFT SIDE */}

      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-blue-600 text-white">

        <div>
          <h1 className="text-3xl font-bold">
            CampusOne
          </h1>
        </div>

        <div>

          <h2 className="text-5xl font-bold leading-tight">
            Everything you need
            <br />
            for college.
            <br />
            In one place.
          </h2>

          <p className="mt-6 text-lg text-blue-100 max-w-md">
            Manage your academics, track your progress,
            prepare for placements and stay organized
            throughout your college journey.
          </p>

          <div className="mt-8 space-y-3 text-blue-100">
            <p>✓ Track attendance</p>
            <p>✓ Manage assignments</p>
            <p>✓ Monitor your CGPA</p>
            <p>✓ Prepare for placements</p>
          </div>

        </div>

        <p className="text-sm text-blue-200">
          Your Complete Student Companion
        </p>

      </div>


      {/* RIGHT SIDE */}

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">

        <div className="w-full max-w-md">

          <div className="lg:hidden mb-10">
            <h1 className="text-3xl font-bold text-white">
              CampusOne
            </h1>
          </div>


          <h2 className="text-3xl font-bold text-white">
            Welcome back
          </h2>

          <p className="mt-2 text-slate-400">
            Sign in to continue to CampusOne
          </p>


          <form
            className="mt-8"
            onSubmit={handleSubmit}
          >

            {/* ERROR MESSAGE */}

            {error && (
              <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}


            {/* EMAIL */}

            <div>

              <label className="block text-sm font-medium text-slate-300">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@example.com"
                required
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />

            </div>


            {/* PASSWORD */}

            <div className="mt-5">

              <label className="block text-sm font-medium text-slate-300">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />

            </div>


            {/* OPTIONS */}

            <div className="mt-5 flex items-center justify-between">

              <label className="flex items-center gap-2 text-sm text-slate-400">
                <input type="checkbox" />
                Remember me
              </label>

              <button
                type="button"
                className="text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                Forgot password?
              </button>

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? 'Signing in...' : 'Sign In'}

            </button>

          </form>


          {/* REGISTER */}

          <p className="mt-8 text-center text-sm text-slate-400">

            Don't have an account?{' '}

            <Link
              to="/register"
              className="font-semibold text-blue-400 hover:text-blue-300"
            >
              Create account
            </Link>

          </p>

        </div>
      </div>

    </div>
  )
}

export default Login