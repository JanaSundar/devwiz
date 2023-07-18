import React from 'react'
import Logo from './Svg/Logo'
import Link from 'next/link'


const Navbar = () => {
    return (
        <nav className='px-8 !backdrop-filter h-16 py-4 !backdrop-blur-lg !sticky !top-0 text-white bg-zinc-900/10 bg-opacity-30 border-b border-gray-50/10'>
            <div className='max-w-6xl mx-auto w-full flex justify-between items-center'>
                <Logo />
                <Link href={"https://github.com/janasundar/devwiz"}>
                    Github
                </Link>
            </div>
        </nav>
    )
}

export default Navbar