import './App.css'

import Navbar from './pages/Navbar'
import Hero from './pages/Hero'
import Services from './pages/Services'
import Howitworks from './pages/Howitworks'
import Reliability from './pages/Reliability'
import Register from './pages/Register'
import Login from './pages/Login'
import Profile from './pages/Profile'
import ServiceDetails from './pages/ServiceDetails'
import ProviderProfile from "./pages/Provider";
import ServiceProvider from "./pages/ServiceProvider";
import ProviderDetails from "./pages/ProviderDetails";
import RequestService from "./pages/RequestService";
import { Routes, Route } from 'react-router-dom'
import ProviderDashboard from './pages/ProviderDashboard'
import CustomerDashboard from './pages/CustomerDashboard'
import TotalProviders from './pages/TotalProviders'
import ProviderSidebar from './pages/ProviderSidebar'
import ProviderRequests from './pages/ProviderRequest'
import ProviderServices from './pages/ProvideServices'

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        

        {/* HOME PAGE */}
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Services />
              <Howitworks />
              <Reliability />
            </>
          }
        />
        <Route path="/services" element={<Services />} />
                <Route path="/providers" element={<TotalProviders />} />

        <Route path="/how-it-works" element={<Howitworks />} />


        {/* OTHER PAGES */}
        <Route path="/register" element={<Register />} />

        <Route path="/login" element={<Login />} />

        <Route path="/profile" element={<Profile />} />

        {/* SERVICE DETAILS */}
        <Route
          path="/service/:id"
          element={<ServiceDetails />}
        />

        {/* <Route
  path="/provider/profile"
  element={<ProviderProfile />}
/> */}
<Route
  path="/service/:id/providers"
  element={<ServiceProvider />}
/>

<Route
          path="/provider/:id"
  element={<ProviderDetails />}
/>

<Route
  path="/service-request/:providerId"
  element={<RequestService />}
/>

 <Route
  path="/provider/dashboard"
  element={
    <div className="provider-layout">
      <ProviderSidebar />
      <ProviderDashboard />
    </div>
  }
/>



 <Route
  path="/customer/dashboard"
  element={<CustomerDashboard />}
/>



<Route
  path="/provider/requests"
  element={
    <div className="provider-layout">
      <ProviderSidebar />
      <ProviderRequests />
    </div>
  }
/>


<Route
  path="/provider/services"
  element={
    <div className="provider-layout">
      <ProviderSidebar />

      <main className="provider-layout-content">
        <ProviderServices />
      </main>
    </div>
  }
/>


<Route
  path="/provider/profile"
  element={
    <div className="provider-layout">

      <ProviderSidebar />

      <main className="provider-layout-content">
        <ProviderProfile />
      </main>

    </div>
  }
/>

      </Routes>
      
    </>


  )
}

export default App