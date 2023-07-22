import clsx from 'clsx'
import React, { FC } from 'react'

interface Props {
    title: string,
    children: React.ReactNode
    className?: string
}

const BaseLayout: FC<Props> = ({ title, children, className }) => {
    return (
        <div className='flex flex-col flex-1 divide-y-2 divide-gray-50/10'>
            <div className='h-12 text-sm flex items-center px-2 text-indigo-300 uppercase font-bold tracking-wide'>
                <h2>{title}</h2>
            </div>
            <div className={clsx('h-[calc(100vh_-_3rem)] flex', className)}>
                {children}
            </div>
        </div>
    )
}

export default BaseLayout