import { BrowserRouter, Routes, Route } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white font-['Inter']">
      <div className="text-center">
        <h1 className="text-5xl font-bold font-['Space_Grotesk'] mb-4">ClarityPath</h1>
        <p className="text-gray-400 text-lg">Welcome to ClarityPath</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
