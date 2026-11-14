import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Discovery() {
  const [items, setItems] = useState([])

  // load the content once when the page first opens
  useEffect(() => {
    async function loadContent() {
      // the database rule only returns approved rows
      const { data } = await supabase.from('content').select('*')
      setItems(data || [])
    }
    loadContent()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Discover Rwandan Films and Music Videos
      </h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.id} className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="text-sm text-gray-500">
              {item.type === 'film' ? 'Film' : 'Music video'} | {item.year} | {item.genre}
            </p>
            <p className="mt-2">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Discovery