'use client'

import React, { useState } from 'react'
import Editor from '~/components/Editor'
import { QRCodeSVG } from 'qrcode.react';
import { useDebounce } from '~/hooks/useDebounce';

const QRCode = () => {
    const [value, setValue] = useState('');
    const debouncedValue = useDebounce(value, 500);

    return (
        <div className='flex flex-col flex-1 divide-y-2 divide-gray-50/10'>
            <div className='h-12 text-sm flex items-center px-2 text-indigo-300 uppercase font-bold tracking-wide'>
                <h2>QR Code generator</h2>
            </div>
            <div className='h-[calc(100vh_-_3rem)] flex divide-x-2 divide-gray-50/10'>
                <div className='flex-[2] min-w-[300px] h-full'>
                    <Editor value={value} onChange={v => setValue(v!)} language='plaintext' />
                </div>
                <div className='flex-1 flex items-center justify-center min-w-[200px]'>
                    <QRCodeSVG value={debouncedValue} size={200} level='L' includeMargin className='rounded-lg shadow' />
                </div>
            </div>
        </div>
    )
}

export default QRCode