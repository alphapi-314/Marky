import React from 'react'

const Footer = () => {
  return (
    <>
        <div className='w-full h-[84px] flex flex-row px-95 justify-between items-center font-inter text-base text-yellow-100 bg-amber-950'>
            <div className='flex gap-9'>
                <p>© 2026 Marky Corporation. All rights reserved.</p><p>|</p>
            </div>
            <a className='hover:underline cursor-pointer' href="https://github.com/alphapi-314/Marky">Github</a>
            <a className='hover:underline cursor-pointer'>Github</a>
            <a className='hover:underline cursor-pointer'>About Us</a>
            <a className='hover:underline cursor-pointer'>Github</a>
            <a className='hover:underline cursor-pointer'>About Us</a>
        </div>
    </>
  )
}

export default Footer