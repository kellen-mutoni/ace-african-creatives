import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useMember } from '../lib/useMember'

const posters = ['Filmmaker', 'Director', 'Producer']

function CastingCalls() {
  const member = useMember()
  const [calls, setCalls] = useState([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('casting_calls')
        .select('*')
        .order('created_at', { ascending: false })
      setCalls(data || [])
    }
    load()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="font-display text-4xl mb-6">Casting <em>calls</em></h1>
      {member && posters.includes(member.role) && (
        <Link to="/members/casting/new" className="inline-block mb-6 p-3 px-6 rounded-full bg-ace-cream text-ace-black font-semibold">
          Post a casting call
        </Link>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {calls.map((c) => (
          <Link key={c.id} to={`/members/casting/${c.id}`} className="border border-ace-cream rounded-lg p-4 hover:bg-ace-cream hover:text-ace-black">
            <h2 className="font-display text-2xl">{c.project_name}</h2>
            <p className="text-sm opacity-70">{c.status === 'approved' ? 'Open' : 'Waiting for admin review'}</p>
            <p className="mt-2">{c.roles_available}</p>
          </Link>
        ))}
      </div>
      <Link to="/members" className="underline mt-6 inline-block">Back to members area</Link>
    </div>
  )
}

export default CastingCalls