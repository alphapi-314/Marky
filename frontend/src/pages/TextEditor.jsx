import React from 'react'
import Navbar from '../components/Navbar'

const TextEditor = () => {
  return (
    <div className='bg-yellow-100 flex flex-col min-h-screen pt-[84px]'>
        <Navbar/>
        <div className="pt-15 flex justify-center w-full gap-5 px-10">
          <div className="w-1/2 flex flex-col items-center gap-6">
            <button className="bg-amber-950 font-inter text-yellow-100 h-11 px-5 w-fit rounded-2xl">PREVIEW</button>
            <textarea className="rounded-lg outline-3 w-full outline-amber-950 h-[700px] text-amber-950 font-nunito bg-gray-100 p-7 overflow-auto"></textarea>
          </div>

          <div className="w-1/2 flex flex-col items-center gap-6">
            <button className="bg-amber-950 font-inter text-yellow-100 h-11 px-5 w-fit rounded-2xl">SUBMIT</button>
            <div className="rounded-lg outline-3 w-full outline-amber-950 h-[700px] text-amber-950 font-nunito bg-gray-100 p-7 overflow-auto"></div>
          </div>
        </div>
    </div>
  )
}

export default TextEditor