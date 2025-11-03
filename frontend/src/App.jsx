import { useState } from 'react'
import AuthScreen from './components/auth/auth'
import './App.css'
import Rotas from './routes'
import { BrowserRouter } from 'react-router-dom'
import Sidebar from './components/ui/SideBar'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <BrowserRouter>
        <Rotas/>
        <SideBard/>
    </BrowserRouter>
    </>
  )
}

export default App
