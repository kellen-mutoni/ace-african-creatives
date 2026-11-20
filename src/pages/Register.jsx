import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const roles = ['Filmmaker', 'Actor', 'Director', 'Producer', 'Editor', 'Set designer', 'Cameraman', 'Music artist']

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', role: 'Actor', verification_details: '',
  })
  const [error, setError] = useState('')

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    // these extra details are copied into the profiles table by the database trigger
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          role: form.role,
          verification_details: form.verification_details,
        },
      },
    })
    if (error) setError(error.message)
    else navigate('/pending')
  }

  const input = 'w-full p-3 mb-4 rounded bg-ace-cream text-ace-black'

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="font-display text-4xl mb-6">Join <em>ACE</em></h1>
      <form onSubmit={handleSubmit}>
        <input name="full_name" placeholder="Full name" required className={input} onChange={update} />
        <input name="email" type="email" placeholder="Email" required className={input} onChange={update} />
        <input name="password" type="password" placeholder="Password (6+ characters)" minLength={6} required className={input} onChange={update} />
        <select name="role" className={input} onChange={update} value={form.role}>
          {roles.map((r) => <option key={r}>{r}</option>)}
        </select>
        <textarea name="verification_details" placeholder="Links to previous work or a professional reference" required className={input} onChange={update} />
        {error && <p className="mb-4">{error}</p>}
        <button className="w-full p-3 rounded-full bg-ace-cream text-ace-black font-semibold">Create account</button>
      </form>
      <p className="mt-4">Already have an account? <Link to="/login" className="underline">Log in</Link></p>
    </div>
  )
}

export default Register