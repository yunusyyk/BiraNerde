import './App.css'
import GoogleMapsBeerMap from './components/GoogleMapsBeerMap'

function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      <header className="px-4 py-6 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-screen-2xl mx-auto text-center md:-translate-x-16">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent">biranerde</h1>
          <p className="mt-1 text-sm text-gray-600">Harita üzerinde mekanları keşfedin</p>
        </div>
      </header>
      <main className="flex-1 h-screen">
        <GoogleMapsBeerMap />
      </main>
    </div>
  )
}

export default App
