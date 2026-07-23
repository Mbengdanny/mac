import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Catalogue from './pages/Catalogue'
import Devis from './pages/Devis'
import Panier from './pages/Panier'
import Estuaire from './pages/Estuaire'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import { useInstallPrompt } from './lib/useInstallPrompt'

export default function App() {
  const { canInstall, prompt } = useInstallPrompt()

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header onInstall={canInstall ? prompt : undefined} />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/devis" element={<Devis />} />
            <Route path="/panier" element={<Panier />} />
            <Route path="/estuaire" element={<Estuaire />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
