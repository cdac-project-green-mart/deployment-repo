import React from 'react'
import Navbar from '../navbar/Navbar'
import { Outlet } from 'react-router-dom'
import Footer from '../footer/Footer'


const Layout = () => {
  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar/>
      <main className="flex-grow w-full">
  <Outlet />
</main>

      <Footer/>
    </div>
  )
}

export default Layout
