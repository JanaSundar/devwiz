'use client'

import React, { useEffect, useState } from 'react'
import Editor from '~/components/Editor'
import { faker } from '@faker-js/faker'
import clsx from 'clsx'
import { Slider } from '~/components/ui/slider'

const options = ['paragraphs', 'lines', 'words', 'sentences'] as const

const LoremIpsum = () => {
    const [selectedOption, setSelectionOption] = useState<typeof options[number]>('paragraphs');
    const [result, setResult] = useState('');
    const [range, setRange] = useState({
        max: 25,
        min: 1
    });

    useEffect(() => {
        const getLoremData = (type: typeof options[number]) => {
            switch (type) {
                case 'lines':
                    return faker.lorem.lines({ min: range.min, max: range.max });
                case 'paragraphs':
                    return faker.lorem.paragraphs({ min: range.min, max: range.max });
                case 'words':
                    return faker.lorem.words({ min: range.min, max: range.max });
                case 'sentences':
                    return faker.lorem.sentences({ min: range.min, max: range.max });
                default:
                    return faker.lorem.paragraphs({ min: range.min, max: range.max });
            }
        }

        const result = getLoremData(selectedOption);
        setResult(result);
    }, [selectedOption, range.min, range.max])


    return (
        <div className='flex flex-col flex-1 divide-y-2 divide-gray-50/5'>
            <div className='h-12 text-sm flex items-center px-2 text-indigo-300 uppercase font-bold tracking-wide'>
                <h2>Lorem Ipsum</h2>
            </div>
            <div className='h-[calc(100vh_-_3rem)] flex divide-x-2 divide-gray-50/5'>
                <div className='min-w-[250px] flex flex-col gap-3 flex-wrap p-4 justify-start items-stretch'>
                    {
                        options.map((option) => {
                            return (
                                <button key={option} className={clsx('border-2 border-zinc-200/20 px-4 py-1 rounded text-white capitalize font-bold text-sm tracking-wide', {
                                    'bg-white text-zinc-950': selectedOption === option,
                                })} onClick={() => setSelectionOption(option)}>
                                    {option}
                                </button>
                            )
                        })
                    }
                    <div className='py-4'>
                        <h2 className='text-sm uppercase font-bold text-zinc-500/90 tracking-wider'>Content Range</h2>
                        <Slider
                            defaultValue={[range.min, range.max]}
                            max={100}
                            step={1}
                            min={1}
                            onValueChange={([min, max]) => {
                                setRange({
                                    min,
                                    max
                                })
                            }}
                            className='pt-6'
                        />
                        <div className='flex justify-between py-6'>
                            <h3 className='text-sm uppercase font-bold text-zinc-500/90 tracking-wider'>Min: <span className='text-white/80'>{range.min}</span></h3>
                            <h3 className='text-sm uppercase font-bold text-zinc-500/90 tracking-wider'>Max: <span className='text-white/80'>{range.max}</span></h3>
                        </div>
                        <h3></h3>
                    </div>
                </div>
                <div className='flex-1'>
                    <Editor
                        value={result}
                        defaultLanguage='plaintext'
                        isWordWrapEnabled
                    />
                </div>
            </div>
        </div>
    )
}

export default LoremIpsum