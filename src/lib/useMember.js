import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

// returns the logged in approved member, or sends the visitor to the login page
export function useMember() {
  const navigate = useNavigate()
  const [member, setMember] = useState(null)

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return navigate('/login')
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data?.status !== 'approved') return navigate('/login')
      setMember(data)
    }
    check()
  }, [navigate])

  return member
}