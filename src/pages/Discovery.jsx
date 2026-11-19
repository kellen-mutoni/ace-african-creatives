import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function Discovery() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadContent() {
      const { data } = await supabase.from('content').select('*')
      setItems(data || [])
    }
    loadContent()
  }, [])

  // keep only items where the search text appears in title, genre, year or cast/crew
  const filtered = items.filter((item) =>
    [item.title, item.genre, item.year, item.cast_crew]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="font-display text-4xl mb-6">
        Discover Rwandan <em>Films</em> and Music Videos
      </h1>
      <input
        type="text"
        placeholder="Search by title, genre, year, or cast and crew"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 mb-6 rounded-full bg-ace-cream text-ace-black"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((item) => (
          <Link
            key={item.id}
            to={`/content/${item.id}`}
            className="border border-ace-cream rounded-lg p-4 hover:bg-ace-cream hover:text-ace-black"
          >
            <h2 className="font-display text-2xl">{item.title}</h2>
            <p className="text-sm opacity-70">
              {item.type === 'film' ? 'Film' : 'Music video'} | {item.year} | {item.genre}
            </p>
            <p className="mt-2">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Discovery