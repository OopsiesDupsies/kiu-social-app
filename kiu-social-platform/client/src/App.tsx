import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import Search from './pages/Search'
import Friends from './pages/Friends'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/" replace /> : <Register />} 
      />
      <Route 
        path="/" 
        element={user ? <Layout /> : <Navigate to="/login" replace />} 
      >
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="messages" element={<Messages />} />
        <Route path="search" element={<Search />} />
        <Route path="friends" element={<Friends />} />
      </Route>
    </Routes>
  )
}

export default App
