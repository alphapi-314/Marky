import React from 'react'
import Navbar from '../components/Navbar'

const TextEditor = () => {
  return (
    <div>
        <Navbar/>
        <div className='bg-yellow-100 flex justify-center min-h-screen w-full gap-3 py-25'>
            <textarea className='rounded-xs border-1 ml-5 w-1/2 h-[500px] bg-gray-50 p-4 outline'></textarea>

            <textarea className='rounded-xs border-1 border-amber-900 mr-5 w-1/2 h-[500px] bg-gray-50 p-4 outline'></textarea>
        </div>
    </div>
  )
}

export default TextEditor