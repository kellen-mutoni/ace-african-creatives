import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useMember } from '../lib/useMember'

function CastingDetail() {
  const member = useMember()
  const { id } = useParams()
  const [call, setCall] = useState(null)
  const [applications, setApplications] = useState([])
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('casting_calls').select('*').eq('id', id).single()
      setCall(data)
    }
    load()
  }, [id])

  // only the person who posted the call loads its applications
  useEffect(() => {
    async function loadApplications() {
      const { data } = await supabase
        .from('casting_applications')
        .select('*, profiles(full_name, email, bio)')
        .eq('call_id', id)
      setApplications(data || [])
    }
    if (member && call && member.id === call.posted_by) loadApplications()
  }, [member, call, id])

  async function apply(e) {
    e.preventDefault()
    const { error } = await supabase
      .from('casting_applications')
      .insert({ call_id: id, applicant_id: member.id, note })
    if (!error) setMessage('Application sent.')
    else setMessage(error.code === '23505' ? 'You have already applied to this call.' : error.message)
  }

  if (!call) return <p className="p-6">Loading...</p>

  const isPoster = member && member.id === call.posted_by

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link to="/members/casting" className="underline">Back to casting calls</Link>
      <h1 className="font-display text-4xl mt-4">{call.project_name}</h1>
      <h2 className="font-display text-2xl mt-6">Roles available</h2>
      <p className="mt-2">{call.roles_available}</p>
      <h2 className="font-display text-2xl mt-6">Requirements</h2>
      <p className="mt-2">{call.requirements}</p>
      <h2 className="font-display text-2xl mt-6">How to apply</h2>
      <p className="mt-2">{call.how_to_apply}</p>

      {member?.role === 'Actor' && (
        <form onSubmit={apply} className="mt-6">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note to your application (optional)"
            className="w-full p-3 mb-4 rounded bg-ace-cream text-ace-black"
          />
          <button className="p-3 px-6 rounded-full bg-ace-cream text-ace-black font-semibold">Apply for this role</button>
        </form>
      )}
      {message && <p className="mt-4">{message}</p>}

      {isPoster && (
        <div className="mt-8">
          <h2 className="font-display text-3xl mb-4">Applications</h2>
          {applications.length === 0 && <p>No applications yet.</p>}
          {applications.map((a) => (
            <div key={a.id} className="border border-ace-cream rounded-lg p-4 mb-4">
              <p className="font-display text-xl">{a.profiles?.full_name}</p>
              <p className="opacity-70">{a.profiles?.email}</p>
              <p className="mt-2">{a.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CastingDetail