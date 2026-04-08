import React from 'react'

const Footer = () => {
  return (
    <>
        <footer className='w-full h-[84px] flex flex-row justify-center items-center font-inter text-base text-yellow-100 bg-amber-950'>
            <nav className='flex gap-7'>
              <p>© 2026 Marky Corporation. All rights reserved.</p>
              <span>|</span>
              <a target="_blank" rel="noopener noreferrer" className='noreferrer" hover:underline cursor-pointer' href="https://github.com/alphapi-314/Marky">Github</a>
              {/* <a className='hover:underline cursor-pointer'>Github</a> */}
            </nav>
        </footer>
    </>
  )
}

export default Footer