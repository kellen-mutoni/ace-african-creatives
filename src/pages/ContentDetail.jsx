import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function ContentDetail() {
  const { id } = useParams()
  // undefined means still loading, null means not found
  const [item, setItem] = useState(undefined)

  useEffect(() => {
    async function loadItem() {
      const { data } = await supabase
        .from('content')
        .select('*')
        .eq('id', id)
        .single()
      setItem(data || null)
    }
    loadItem()
  }, [id])

  if (item === undefined) return <p className="p-6">Loading...</p>
  if (item === null) return <p className="p-6">Content not found.</p>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link to="/" className="underline">Back to Discovery</Link>
      <h1 className="font-display text-4xl mt-4">{item.title}</h1>
      <p className="mt-2 opacity-70">
        {item.type === 'film' ? 'Film' : 'Music video'} | {item.year} | {item.genre}
      </p>
      <p className="mt-4">{item.description}</p>
      <h2 className="font-display text-2xl mt-6">Cast and crew</h2>
      <p className="mt-2">{item.cast_crew}</p>
    </div>
  )
}

export default ContentDetail