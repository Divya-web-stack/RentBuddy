import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import HowItWorks from './pages/HowItWorks'
import Listings from './pages/Listings'
import PostProperty from './pages/PostProperty'
import About from './pages/About'
import Contact from './pages/Contact'
import Chat from './pages/Chat'


function App() {
  return (
    <div>
      <NavBar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/listings/new" element={<PostProperty />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/chat/:roomId" element={<Chat />} />
      </Routes>
    </div>
  )
}


export default App
