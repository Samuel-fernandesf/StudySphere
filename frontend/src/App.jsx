import { useState } from 'react'
import AuthScreen from './components/auth/auth'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <AuthScreen/>
    </>
  )
}

export default App
