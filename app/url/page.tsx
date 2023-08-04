'use client'

import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import Editor from '~/components/Editor'
import { getDataFromLocalstorage, setDataToLocalstorage } from '~/helper/persist';

const UrlEncodeDecode = () => {
    const pathname = usePathname();
    const [value, setValue] = useState(() => {
        const preloadedValue = getDataFromLocalstorage<string>(pathname)
        return preloadedValue || ''
    });

    const decodeUrl = () => {
        const newValue = decodeURIComponent(value)
        setDataToLocalstorage(pathname, newValue);
        setValue(newValue)
    };
    const encodeUrl = () => {
        const newValue = encodeURIComponent(value)
        setDataToLocalstorage(pathname, newValue);
        setValue(newValue)
    };

    return (
        <div className='flex flex-col flex-1 divide-y-2 divide-gray-50/10'>
            <div className='h-12 text-sm flex items-center px-2 text-indigo-300 uppercase font-bold tracking-wide'>
                <h2>Encode / Decode URL</h2>
            </div>
            <div className='flex-1 max-h-[calc(100vh_-_20rem)] min-w-[300px]'>
                <Editor className='h-full w-full' language="plaintext" isWordWrapEnabled value={value} onChange={v => setValue(v!)} />
            </div>
            <div className='flex items-start p-4 gap-4 min-w-[300px]'>
                <button className='px-4 py-2 bg-white text-zinc-950 font-bold rounded' onClick={encodeUrl}>
                    Encode
                </button>
                <button className='px-4 py-2 bg-white text-zinc-950 font-bold rounded' onClick={decodeUrl}>
                    Decode
                </button>
            </div>
        </div>
    )
}

export default UrlEncodeDecode