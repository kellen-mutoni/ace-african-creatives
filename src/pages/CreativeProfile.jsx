import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useMember } from '../lib/useMember'

function CreativeProfile() {
  const member = useMember()
  const { id } = useParams()
  const [person, setPerson] = useState(null)
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
      setPerson(data)
    }
    load()
  }, [id])

  async function send(e) {
    e.preventDefault()
    const { error } = await supabase
      .from('contact_messages')
      .insert({ from_id: member.id, to_id: id, message })
    if (!error) {
      setSent(true)
      setMessage('')
    }
  }

  if (!person) return <p className="p-6">Loading...</p>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link to="/members/creatives" className="underline">Back to search</Link>
      <h1 className="font-display text-4xl mt-4">{person.full_name}</h1>
      <p className="opacity-70">{person.role}</p>
      <p className="mt-4">{person.bio}</p>
      <h2 className="font-display text-2xl mt-6">Portfolio</h2>
      <p className="mt-2">{person.portfolio_links}</p>
      <h2 className="font-display text-2xl mt-6">Contact</h2>
      <p className="mt-2">{person.email}</p>
      {person.phone && <p>{person.phone}</p>}
      <form onSubmit={send} className="mt-6">
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a message"
          className="w-full p-3 mb-4 rounded bg-ace-cream text-ace-black"
        />
        <button className="p-3 px-6 rounded-full bg-ace-cream text-ace-black font-semibold">Send message</button>
      </form>
      {sent && <p className="mt-4">Message sent.</p>}
    </div>
  )
}

export default CreativeProfile