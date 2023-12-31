'use client'

import React, { FC, useEffect, useRef, useState } from 'react'
import Editor from './Editor'
import { EditorProps } from '@monaco-editor/react'
import { useDebounce } from '~/hooks/useDebounce';
import toast from 'react-hot-toast'
import { useClipboard } from '~/hooks/useClipboard';
import prettify from '~/helper/prettify';
import { getDataFromLocalstorage, setDataToLocalstorage } from '~/helper/persist';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';

interface Props {
    editorValue?: string,
    editorTitle?: string,
    resultTitle?: string,
    editorLanguage: string,
    resultLanguage: string,
    editorProps?: EditorProps,
    resultProps?: EditorProps,
    transformer: (x: string, options?: Record<string, unknown>) => Promise<{ result: string }>
    editorHeaderElements?: React.ReactNode,
    resultHeaderElements?: React.ReactNode,
    isWordWrapEnabled?: boolean;
    defaultEditorValue?: string;
    render?: ({ result }: { result: string }) => React.ReactNode;
    prettifyResult?: boolean;
    showPrettifyButton?: boolean;
    prettifyLanguage?: string;
}


const TransformPanel: FC<Props> = ({ editorValue, editorTitle, resultTitle, transformer, editorLanguage, resultLanguage, resultProps = {}, editorProps = {}, editorHeaderElements, resultHeaderElements, isWordWrapEnabled = false, defaultEditorValue, render, prettifyResult = true, showPrettifyButton = true, prettifyLanguage }) => {
    const pathname = usePathname();
    const [value, setValue] = useState(() => {
        const preloadedValue = getDataFromLocalstorage<string>(pathname)
        return (preloadedValue || defaultEditorValue || editorValue) ?? ''
    })
    const [result, setResult] = useState<string>('');
    const debouncedValue = useDebounce(value, 500)
    const { hasCopied, onCopy } = useClipboard(result)
    const toastId = useRef<string | undefined>()
    useEffect(() => {
        function transform() {
            if (toastId.current) toast.dismiss(toastId.current);
            if (debouncedValue === '') return setResult('');
            toastId.current = toast.loading('Transforming the code', { duration: 2000 })
            transformer(debouncedValue).then(async ({ result }) => {
                if ((!['plaintext'].includes(resultLanguage)) && prettifyResult) {
                    if (resultLanguage.toLowerCase() === 'json') result = JSON.parse(result)
                    const response = await prettify(result, resultLanguage);
                    result = response
                }
                setResult(result)
                setDataToLocalstorage(pathname, debouncedValue);
                if (toastId)
                    toast.success('Code transformed', { id: toastId.current, duration: 2000 })
            }).catch((err) => {
                console.log('error', err)
                toast.error('unable to transform the code', { id: toastId.current, duration: 2000 })
            })
        }
        transform()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedValue, resultLanguage, pathname, prettifyResult])

    return (
        <>
            <div className='flex-1 min-w-[300px] divide-y-2 divide-gray-50/10'>
                <div className='flex justify-between items-center h-10'>
                    {editorTitle && <h2 className='text-sm tracking-wide font-bold p-2 uppercase text-indigo-300'>{editorTitle}</h2>}
                    <div className='flex gap-2'>
                        {showPrettifyButton && <Button className='bg-transparent py-1 px-4 hover:bg-transparent ring-1 ring-gray-500' onClick={async () => {
                            if(editorLanguage.toLowerCase() === 'plaintext') return;
                            let input = value;
                            setValue(await prettify(input, prettifyLanguage ?? editorLanguage))
                        }}>Prettify</Button>}
                        {editorHeaderElements}
                    </div>
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
                        {resultHeaderElements}
                        <button onClick={onCopy} className='bg-slate-50/20 text-sm px-2 py-1 text-slate-200 rounded shadow-md font-bold'>
                            {hasCopied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>
                <div className='h-[calc(100vh_-_2.5rem)] overflow-y-auto'>
                    {
                        render ? render({ result }) : <Editor
                            value={result}
                            defaultLanguage={resultLanguage}
                            isReadOnly
                            isWordWrapEnabled={isWordWrapEnabled}
                            {...resultProps}
                        />
                    }
                </div>
            </div>
        </>
    )
}

export default TransformPanel