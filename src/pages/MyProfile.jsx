import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useMember } from '../lib/useMember'

function MyProfile() {
  const member = useMember()
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (member) setForm(member)
  }, [member])

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        role: form.role,
        bio: form.bio,
        portfolio_links: form.portfolio_links,
        phone: form.phone,
      })
      .eq('id', member.id)
    setSaved(!error)
  }

  if (!form) return <p className="p-6">Loading...</p>

  const input = 'w-full p-3 mb-4 rounded bg-ace-cream text-ace-black'

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="font-display text-4xl mb-6">My <em>profile</em></h1>
      <p className="mb-4 opacity-70">Contact email: {form.email}</p>
      <form onSubmit={handleSubmit}>
        <input name="full_name" placeholder="Full name" value={form.full_name || ''} className={input} onChange={update} />
        <input name="role" placeholder="Role" value={form.role || ''} className={input} onChange={update} />
        <textarea name="bio" placeholder="Short bio" value={form.bio || ''} className={input} onChange={update} />
        <textarea name="portfolio_links" placeholder="Portfolio, YouTube, or social links" value={form.portfolio_links || ''} className={input} onChange={update} />
        <input name="phone" placeholder="Phone number (optional)" value={form.phone || ''} className={input} onChange={update} />
        <button className="w-full p-3 rounded-full bg-ace-cream text-ace-black font-semibold">Save profile</button>
      </form>
      {saved && <p className="mt-4">Profile saved.</p>}
      <Link to="/members" className="underline mt-4 inline-block">Back to members area</Link>
    </div>
  )
}

export default MyProfile