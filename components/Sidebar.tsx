'use client'

import React from 'react'
import Logo from './Svg/Logo'
import Link from 'next/link'
import Github from './Svg/Github'
import { ScrollArea } from './ui/scroll-area'
import { routes } from '~/constants'
import clsx from 'clsx'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const Sidebar = () => {
    const pathname = usePathname();

    return (
        <div className='flex flex-col pl-4 bg-zinc-950 min-w-[300px]'>
            <div className='flex  justify-between items-center p-4 '>
                <Logo />
                <Link href={"https://github.com/janasundar/devwiz"} className='text-gray-500/90 hover:text-gray-200/90' target='_blank' rel='noopener noreferrer'>
                    <Github />
                </Link>
            </div>


            <ScrollArea className='h-[calc(100vh-_7rem)] flex flex-col justify-center py-4 pl-4'>
                <AnimatePresence initial={false}>
                    {routes.map((route) => {
                        return (
                            <div key={route.category}>
                                <h3 className='text-sm uppercase text-indigo-300 font-bold tracking-wider py-2 '>{route.category}</h3>
                                {
                                    route.content.map((page) => {
                                        const isActive = pathname === page.path
                                        return (
                                            <Link href={page.path} key={page.path} className='flex flex-col justify-center'>
                                                <div className={clsx('py-2 px-4 font-medium capitalize cursor-pointer relative hover:text-gray-200/90', {
                                                    'text-gray-200/90': isActive,
                                                    'text-gray-400/90': !isActive
                                                })}>
                                                    {isActive && <motion.span layoutId="active" className='absolute inset-0 bg-zinc-50/5 hover:bg-zinc-50/5 font-extrabold shadow-lg rounded-l-full' />}
                                                    {page.label}
                                                </div>
                                            </Link>
                                        )
                                    })
                                }
                            </div>
                        )
                    })}
                </AnimatePresence>
            </ScrollArea>

            <div className='sticky bottom-0 text-center p-4'>
                <p className='font-bold text-sm tracking-wide text-gray-500/90 space-x-2'>
                    Created by {' '}
                    <Link href="https://janasundar.dev" target='_blank' rel='noopener noreferrer' className='underline text-white'>
                    Jana
                    </Link>
                    </p>
            </div>
        </div>
    )
}

export default Sidebar