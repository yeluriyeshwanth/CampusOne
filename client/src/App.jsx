import { Routes, Route, Navigate } from 'react-router'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './utils/ProtectedRoute'
import Attendance from './pages/Attendance'
import Assignments from './pages/Assignments'

function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
      <Route
  path="/attendance"
  element={
    <ProtectedRoute>
      <Attendance />
    </ProtectedRoute>
  }
/>
<Route
  path="/assignments"
  element={
    <ProtectedRoute>
      <Assignments />
    </ProtectedRoute>
  }
/>

    </Routes>
  )
}

export default App