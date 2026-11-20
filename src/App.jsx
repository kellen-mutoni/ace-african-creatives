import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Discovery from './pages/Discovery'
import ContentDetail from './pages/ContentDetail'
import Register from './pages/Register'
import Pending from './pages/Pending'
import Login from './pages/Login'
import Members from './pages/Members'
import MyProfile from './pages/MyProfile'
import Creatives from './pages/Creatives'
import CreativeProfile from './pages/CreativeProfile'

function App() {
  return (
    <BrowserRouter>
      <nav className="flex justify-between p-6">
        <Link to="/" className="font-display text-2xl">ACE</Link>
        <div className="flex gap-6">
          <Link to="/login" className="underline">Log in</Link>
          <Link to="/register" className="underline">Join</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Discovery />} />
        <Route path="/content/:id" element={<ContentDetail />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pending" element={<Pending />} />
        <Route path="/login" element={<Login />} />
        <Route path="/members" element={<Members />} />
        <Route path="/members/profile" element={<MyProfile />} />
        <Route path="/members/creatives" element={<Creatives />} />
        <Route path="/members/creatives/:id" element={<CreativeProfile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App