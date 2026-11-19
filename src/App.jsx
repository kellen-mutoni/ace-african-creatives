import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Discovery from './pages/Discovery'
import ContentDetail from './pages/ContentDetail'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Discovery />} />
        <Route path="/content/:id" element={<ContentDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App