import React, { FC } from 'react'
import { Toaster } from 'sonner'
import Sidebar from '~/components/Sidebar'

interface Props {
    children: React.ReactNode
}

const BaseLayout: FC<Props> = ({ children }) => {
    return (
        <>
            <main className='flex-1 flex h-full divide-x-2 divide-gray-50/10'>
                <Sidebar />
                {children}
            </main>
            <Toaster position="bottom-right" richColors />
        </>
    )
}

export default BaseLayout