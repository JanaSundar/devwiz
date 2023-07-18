'use client'

import React, { useEffect, useState } from 'react'
import Editor from '~/components/Editor'
import { Label } from '~/components/ui/label'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import { useDebounce } from '~/hooks/useDebounce'

const UrlEncodeDecode = () => {
    const [selectedType, setSelectedType] = useState('encode');
    const [value, setValue] = useState('');
    const [result, setResult] = useState('');
    const debouncedValue = useDebounce(value, 500);


    useEffect(() => {
        if (selectedType === 'encode') {
            setResult(encodeURIComponent(debouncedValue));
        } else {
            setResult(decodeURIComponent(debouncedValue));
        }
    }, [debouncedValue, selectedType])

    return (
        <div className='flex flex-col flex-1 divide-y-2 divide-gray-50/5'>
            <div className='h-12 text-sm flex items-center px-2 text-indigo-300 uppercase font-bold tracking-wide'>
                <h2>Encode / Decode</h2>
            </div>
            <div className='h-12 flex items-center'>
                <RadioGroup defaultValue={selectedType} value={selectedType} className='flex gap-4 px-4' onValueChange={type => setSelectedType(type)}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="encode" id="encode" />
                        <Label htmlFor="encode">Encode</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="decode" id="decode" />
                        <Label htmlFor="decode">Decode</Label>
                    </div>
                </RadioGroup>
            </div>
            <div className='flex-1'>
                <Editor language="plaintext" isWordWrapEnabled value={value} onChange={v => setValue(v!)} />
            </div>
            <div className='flex-1'>
                <Editor language="plaintext" isReadOnly isWordWrapEnabled value={result} />
            </div>
        </div>
    )
}

export default UrlEncodeDecode