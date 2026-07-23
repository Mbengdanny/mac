import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Eleves from './pages/Eleves'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/eleves" replace />} />
            <Route path="/eleves" element={<Eleves />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
