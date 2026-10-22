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
import Categories from './Pages/Categories'
import Complaints from './Pages/Complaint'
import NotificationBell from './Pages/NotificationBell'
import Notifications from './Pages/Notification'
import Reviews from './Pages/Reviews'


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

<Route path="/categories" element={<Categories />} />
<Route path="/admin/complaints" element={<Complaints />} />
<Route path="/admin/reviews" element={<Reviews />} />

<Route
  path="/notifications"
  element={<NotificationBell />}
  
/>
<Route path="/notifications" element={<Notifications />} />

      </Routes>
    </>
  )
}

export default App
