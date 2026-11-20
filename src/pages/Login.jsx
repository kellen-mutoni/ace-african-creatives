import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return setError(error.message)

    // only approved accounts can enter the Networking side
    const { data: profile } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', data.user.id)
      .single()

    if (profile?.status === 'approved') {
      navigate('/members')
    } else if (profile?.status === 'rejected') {
      await supabase.auth.signOut()
      setError('Your application was not approved.')
    } else {
      await supabase.auth.signOut()
      navigate('/pending')
    }
  }

  const input = 'w-full p-3 mb-4 rounded bg-ace-cream text-ace-black'

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="font-display text-4xl mb-6">Welcome <em>back</em></h1>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" required className={input} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" required className={input} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="mb-4">{error}</p>}
        <button className="w-full p-3 rounded-full bg-ace-cream text-ace-black font-semibold">Log in</button>
      </form>
      <p className="mt-4">New here? <Link to="/register" className="underline">Create an account</Link></p>
    </div>
  )
}

export default Login