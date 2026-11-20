import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useMember } from '../lib/useMember'

function Row({ title, sub, status, actions }) {
  return (
    <div className="border border-ace-cream rounded-lg p-4 mb-3 flex justify-between gap-4">
      <div>
        <p className="font-display text-xl">{title}</p>
        <p className="text-sm opacity-70">{sub} | {status}</p>
      </div>
      <div className="flex gap-3 items-start">{actions}</div>
    </div>
  )
}

function Admin() {
  const member = useMember()
  const navigate = useNavigate()
  const [data, setData] = useState({ profiles: [], content: [], calls: [], log: [] })

  async function load() {
    const [profiles, content, calls, log] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('content').select('*').order('created_at', { ascending: false }),
      supabase.from('casting_calls').select('*').order('created_at', { ascending: false }),
      supabase.from('admin_log').select('*').order('created_at', { ascending: false }).limit(10),
    ])
    setData({
      profiles: profiles.data || [],
      content: content.data || [],
      calls: calls.data || [],
      log: log.data || [],
    })
  }

  // only admins stay on this page
  useEffect(() => {
    if (member && !member.is_admin) navigate('/members')
    if (member?.is_admin) load()
  }, [member, navigate])

  // every approval goes through one protected database function that also writes the audit log
  async function review(type, id, status) {
    await supabase.rpc('admin_review', { p_type: type, p_id: id, p_status: status })
    load()
  }

  function actionsFor(type, id, status) {
    const options = {
      pending: [['Approve', 'approved'], ['Reject', 'rejected']],
      approved: type === 'profile'
        ? [['Suspend', 'suspended'], ['Remove', 'removed']]
        : [['Remove', 'removed']],
      suspended: [['Reinstate', 'approved']],
    }[status] || []
    return options.map(([label, next]) => (
      <button key={label} onClick={() => review(type, id, next)} className="underline">{label}</button>
    ))
  }

  if (!member?.is_admin) return <p className="p-6">Loading...</p>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="font-display text-4xl mb-6">Admin <em>dashboard</em></h1>

      <h2 className="font-display text-2xl mb-3">Accounts</h2>
      {data.profiles.filter((p) => p.id !== member.id).map((p) => (
        <Row key={p.id} title={p.full_name} sub={`${p.role} | ${p.email}`} status={p.status}
          actions={actionsFor('profile', p.id, p.status)} />
      ))}

      <h2 className="font-display text-2xl mt-8 mb-3">Submitted content</h2>
      {data.content.map((c) => (
        <Row key={c.id} title={c.title} sub={c.type === 'film' ? 'Film' : 'Music video'} status={c.status}
          actions={actionsFor('content', c.id, c.status)} />
      ))}

      <h2 className="font-display text-2xl mt-8 mb-3">Casting calls</h2>
      {data.calls.map((c) => (
        <Row key={c.id} title={c.project_name} sub={c.roles_available} status={c.status}
          actions={actionsFor('casting_call', c.id, c.status)} />
      ))}

      <h2 className="font-display text-2xl mt-8 mb-3">Recent admin activity</h2>
      {data.log.map((l) => (
        <p key={l.id} className="text-sm opacity-70 mb-1">
          {l.admin_name} set a {l.target_type} to {l.action} on {new Date(l.created_at).toLocaleString()}
        </p>
      ))}

      <Link to="/members" className="underline mt-8 inline-block">Back to members area</Link>
    </div>
  )
}

export default Admin