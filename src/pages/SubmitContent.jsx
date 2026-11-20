import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useMember } from '../lib/useMember'

function SubmitContent() {
  const member = useMember()
  const [form, setForm] = useState({
    title: '', type: 'film', description: '', year: '', genre: '', cast_crew: '',
  })
  const [message, setMessage] = useState('')

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const { error } = await supabase.from('content').insert({
      ...form,
      year: form.year ? Number(form.year) : null,
      submitted_by: member.id,
      status: 'pending',
    })
    setMessage(error ? error.message : 'Submitted. An admin will review it before it appears in Discovery.')
  }

  const input = 'w-full p-3 mb-4 rounded bg-ace-cream text-ace-black'

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="font-display text-4xl mb-6">Submit your <em>work</em></h1>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" required className={input} onChange={update} />
        <select name="type" className={input} onChange={update} value={form.type}>
          <option value="film">Film</option>
          <option value="music_video">Music video</option>
        </select>
        <textarea name="description" placeholder="Description" className={input} onChange={update} />
        <input name="year" type="number" placeholder="Year" className={input} onChange={update} />
        <input name="genre" placeholder="Genre" className={input} onChange={update} />
        <textarea name="cast_crew" placeholder="Cast and crew" className={input} onChange={update} />
        <button className="w-full p-3 rounded-full bg-ace-cream text-ace-black font-semibold">Submit for review</button>
      </form>
      {message && <p className="mt-4">{message}</p>}
      <Link to="/members" className="underline mt-4 inline-block">Back to members area</Link>
    </div>
  )
}

export default SubmitContent