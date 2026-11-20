import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function Members() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  // send anyone who is not logged in and approved back to the login page
  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return navigate('/login')
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data?.status !== 'approved') return navigate('/login')
      setProfile(data)
    }
    checkAccess()
  }, [navigate])

  async function logout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (!profile) return <p className="p-6">Loading...</p>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="font-display text-4xl mb-2">Welcome, <em>{profile.full_name}</em></h1>
      <p className="opacity-70 mb-6">{profile.role}</p>
      <p className="mb-6">This is the Networking side of ACE. Only approved creatives can see it.</p>
      <Link to="/members/profile" className="underline mr-6">My profile</Link>
<Link to="/members/creatives" className="underline mr-6">Find creatives</Link>
<Link to="/members/casting" className="underline mr-6">Casting calls</Link>
<Link to="/" className="underline mr-6">Discovery</Link>
      <button onClick={logout} className="underline">Log out</button>
    </div>
  )
}

export default Members