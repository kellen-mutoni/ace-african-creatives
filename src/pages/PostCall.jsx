import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useMember } from '../lib/useMember'

function PostCall() {
  const member = useMember()
  const [form, setForm] = useState({ project_name: '', roles_available: '', requirements: '', how_to_apply: '' })
  const [message, setMessage] = useState('')

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const { error } = await supabase.from('casting_calls').insert({ ...form, posted_by: member.id })
    setMessage(error ? 'Only filmmakers, directors, and producers can post calls.' : 'Submitted. An admin will review it before it goes live.')
  }

  const input = 'w-full p-3 mb-4 rounded bg-ace-cream text-ace-black'

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="font-display text-4xl mb-6">Post a <em>casting call</em></h1>
      <form onSubmit={handleSubmit}>
        <input name="project_name" placeholder="Project name" required className={input} onChange={update} />
        <textarea name="roles_available" placeholder="Roles available" required className={input} onChange={update} />
        <textarea name="requirements" placeholder="Requirements" className={input} onChange={update} />
        <textarea name="how_to_apply" placeholder="How to apply" className={input} onChange={update} />
        <button className="w-full p-3 rounded-full bg-ace-cream text-ace-black font-semibold">Submit for review</button>
      </form>
      {message && <p className="mt-4">{message}</p>}
      <Link to="/members/casting" className="underline mt-4 inline-block">Back to casting calls</Link>
    </div>
  )
}

export default PostCall