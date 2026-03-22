import React from 'react'
import Navbar from '../components/Navbar'

const Home = () => {
  return (
    <div className='bg-yellow-100 flex items-center justify-center min-h-screen w-full'>
      <Navbar/>
        <div className="max-w-6xl flex flex-col text-orange-900 text-center">
          <h2 className="font-display font-extrabold text-4xl mb-4">About Marky!</h2>
          <p className='[word-spacing:1px] font-inter font-normal text-xl'>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nostrum exercitationem, eligendi officiis dignissimos molestiae officia voluptatem corporis iusto illum doloribus sed nihil vero! Accusantium error cupiditate libero repudiandae quas? Quibusdam qui perspiciatis reprehenderit dolor non sint, nostrum maiores earum distinctio fuga dicta ex a placeat magni eveniet atque, doloribus pariatur commodi sapiente? Ea dignissimos iste qui, accusantium aperiam temporibus veritatis sed quasi, officia, sit vel expedita quas sequi blanditiis odio. Consectetur unde optio id, quidem necessitatibus officiis officia obcaecati sint incidunt nesciunt quasi, ducimus rerum velit. Ad doloribus, libero, corporis numquam harum, aliquam perferendis earum iusto eius illum incidunt ratione!
          </p>
        </div>
    </div>
  )
}

export default Home