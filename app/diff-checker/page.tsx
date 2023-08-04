'use client'

import React from 'react'
import DiffEditor from '~/components/DiffEditor';
import Editor from '~/components/Editor';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { DEFAULT_VALUES } from '~/constants/defaultValues';
import { getDataFromLocalstorage, setDataToLocalstorage } from '~/helper/persist';
import { usePathname } from 'next/navigation';

const DiffChecker = () => {
    const pathname = usePathname();
    const [oldValue, setOldValue] = React.useState(() => {
        const preloadedValue = getDataFromLocalstorage<string>(`${pathname}-old`)
        return preloadedValue || DEFAULT_VALUES.diffCheckerOriginal
    })
    const [newValue, setNewValue] = React.useState(() => {
        const preloadedValue = getDataFromLocalstorage<string>(`${pathname}-new`)
        return preloadedValue || DEFAULT_VALUES.diffCheckerModified
    })

    return (
        <div className='flex flex-col flex-1 divide-y-2 divide-gray-50/10'>
            <div className='h-12 text-sm flex items-center px-2 text-indigo-300 uppercase font-bold tracking-wide'>
                <h2>Diff Checker</h2>
            </div>
            <PanelGroup direction="vertical" className='divide-y-2 divide-gray-50/10'>
                <Panel maxSize={75}>
                    <div className='h-full flex divide-x-2 divide-gray-50/10'>
                        <div className='flex flex-1 flex-col divide-y-2 divide-gray-50/10'>
                            <div className='h-12 flex items-center p-4 text-sm font-bold uppercase tracking-wider'>
                                <h2 className='text-gray-400/90'>Original value</h2>
                            </div>
                            <Editor className='flex-1' value={oldValue} onChange={v => {
                                setOldValue(v!)
                                setDataToLocalstorage(`${pathname}-old`, v!)
                            }} />
                        </div>
                        <div className='flex flex-1 flex-col divide-y-2 divide-gray-50/10'>
                            <div className='h-12 flex items-center p-4 text-sm font-bold uppercase tracking-wider'>
                                <h2 className='text-gray-400/90'>Modified Value</h2>
                            </div>
                            <Editor className='flex-1' value={newValue} onChange={v => {
                                setNewValue(v!)
                                setDataToLocalstorage(`${pathname}-new`, v!)
                            }} />
                        </div>
                    </div>
                </Panel>
                <PanelResizeHandle className='flex-[0_0_1.5em] relative outline-none bg-transparent'>
                    <div className={'absolute hover:bg-zinc-50/5 active:bg-zinc-50/5 text-zinc-50/50 transition-transform duration-[0.2s] ease-linear rounded-[0.25em] inset-[0.25em]'}>
                        <svg className={'w-[1em] h-[1em] absolute left-[calc(50%_-_0.5rem)] top-[calc(50%_-_0.5rem)]'} viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M8,18H11V15H2V13H22V15H13V18H16L12,22L8,18M12,2L8,6H11V9H2V11H22V9H13V6H16L12,2Z"
                            />
                        </svg>
                    </div>
                </PanelResizeHandle>
                <Panel maxSize={80} minSize={30}>
                    <div className='divide-x-2 divide-gray-50/10 divide-y-2  h-full'>
                        <div className='h-12 flex items-center p-4 text-sm font-bold uppercase tracking-wider'>
                            <h2 className='text-gray-400/90'>Diff Viewer</h2>
                        </div>
                        <DiffEditor original={oldValue} modified={newValue} isWordWrapEnabled />
                    </div>
                </Panel>
            </PanelGroup>
        </div>
    )
}

export default DiffChecker