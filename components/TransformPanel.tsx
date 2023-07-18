'use client'

import React, { FC, useEffect, useState } from 'react'
import Editor from './Editor'
import { EditorProps } from '@monaco-editor/react'
import { useDebounce } from '~/hooks/useDebounce';
import { toast } from 'sonner'
import { useClipboard } from '~/hooks/useClipboard';
import axios from 'axios';

interface Props {
    editorValue?: string,
    editorTitle?: string,
    resultTitle?: string,
    editorLanguage: string,
    resultLanguage: string,
    editorProps?: EditorProps,
    resultProps?: EditorProps,
    transformer: (x: string, options?: Record<string, unknown>) => Promise<{ result: string }>
    settingsElement?: React.ReactNode
}


const TransformPanel: FC<Props> = ({ editorValue, editorTitle, resultTitle, transformer, editorLanguage, resultLanguage, resultProps = {}, editorProps = {}, settingsElement }) => {

    const [value, setValue] = useState(editorValue ?? '')
    const [result, setResult] = useState<string>('');
    const debouncedValue = useDebounce(value, 250)
    const { hasCopied, onCopy } = useClipboard(result)

    useEffect(() => {
        if (debouncedValue === '') return setResult('');
        transformer(debouncedValue).then(async ({ result }) => {
            if (resultLanguage !== 'json') {
                const { data } = await axios.post("/api/pretty", { code: result, language: resultLanguage })
                result = data.result
            }
            setResult(result)
        }).catch(() => {
            toast('unable to tranform the code')
        })

    }, [debouncedValue, transformer, resultLanguage])

    return (
        <>
            <div className='flex-1 min-w-[300px] divide-y-2 divide-gray-50/10'>
                <div className='flex justify-between items-center h-10'>
                    {editorTitle && <h2 className='text-sm tracking-wide font-bold p-2 uppercase text-indigo-300'>{editorTitle}</h2>}
                    {settingsElement}
                </div>
                <div className='h-[calc(100vh_-_2.5rem)]'>
                    <Editor
                        value={value}
                        onChange={v => setValue(v!)}
                        defaultLanguage={editorLanguage}
                        {...editorProps}
                    />
                </div>
            </div>
            <div className='flex-1 min-w-[300px] divide-y-2 divide-gray-50/10'>
                <div className='flex justify-between items-center h-10 p-2'>
                    <div>
                        {resultTitle && <h2 className='text-sm tracking-wide font-bold p-2 uppercase text-indigo-300'>{resultTitle}</h2>}
                    </div>
                    <div className='flex gap-2'>
                        <button onClick={onCopy} className='bg-slate-50/20 text-sm px-2 py-1 text-slate-200 rounded shadow-md font-bold'>
                            {hasCopied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>
                <div className='h-[calc(100vh_-_2.5rem)]'>
                    <Editor
                        value={result}
                        defaultLanguage={resultLanguage}
                        isReadOnly
                        {...resultProps}
                    />
                </div>
            </div>
        </>
    )
}

export default TransformPanel