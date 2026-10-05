import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import Sidebar from './Pages/Sidebar'
import { Route, Routes } from 'react-router-dom'
import Services from './Pages/Services'
import Users from './Pages/Users'
import Dashboard from './Pages/Dashboard'
import Providers from './Pages/Provider'
import Verification from './Pages/Verification'
import Requests from './Pages/Requests'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <Sidebar />
      <Routes>

        <Route
          path="/admin/services"
          element={<Services />}
        />
 <Route path="/admin/users" element={<Users />} />
  <Route path="/" element={<Dashboard />} />
    <Route path="/admin/provider" element={<Providers />} />
        <Route path="/admin/verification" element={<Verification />} />

        <Route path="/admin/requests" element={<Requests />} />


      </Routes>
    </>
  )
}

export default App
