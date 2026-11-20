import { Link } from 'react-router-dom'

function Pending() {
  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <h1 className="font-display text-4xl mb-4">Your account is <em>under review</em></h1>
      <p className="mb-6">Thanks for applying. An admin will check your details and you will be notified once you are approved.</p>
      <Link to="/" className="underline">Back to Discovery</Link>
    </div>
  )
}

export default Pending