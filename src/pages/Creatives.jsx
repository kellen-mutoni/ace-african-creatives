import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useMember } from '../lib/useMember'

function Creatives() {
  useMember()
  const [people, setPeople] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('profiles').select('id, full_name, role, bio')
      setPeople(data || [])
    }
    load()
  }, [])

  const filtered = people.filter((p) =>
    [p.full_name, p.role, p.bio].join(' ').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="font-display text-4xl mb-6">Find <em>creatives</em></h1>
      <input
        placeholder="Search by name, role, or skill"
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 mb-6 rounded-full bg-ace-cream text-ace-black"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((p) => (
          <Link key={p.id} to={`/members/creatives/${p.id}`} className="border border-ace-cream rounded-lg p-4 hover:bg-ace-cream hover:text-ace-black">
            <h2 className="font-display text-2xl">{p.full_name}</h2>
            <p className="text-sm opacity-70">{p.role}</p>
            <p className="mt-2">{p.bio}</p>
          </Link>
        ))}
      </div>
      <Link to="/members" className="underline mt-6 inline-block">Back to members area</Link>
    </div>
  )
}

export default Creatives