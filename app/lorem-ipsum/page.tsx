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
    const [range, setRange] = useState(25);

    useEffect(() => {
        const getLoremData = (type: typeof options[number]) => {
            switch (type) {
                case 'lines':
                    return faker.lorem.lines({ min: range, max: range });
                case 'paragraphs':
                    return faker.lorem.paragraphs({ min: range, max: range });
                case 'words':
                    return faker.lorem.words({ min: range, max: range });
                case 'sentences':
                    return faker.lorem.sentences({ min: range, max: range });
                default:
                    return faker.lorem.paragraphs({ min: range, max: range });
            }
        }

        const result = getLoremData(selectedOption);
        setResult(result);
    }, [selectedOption, range])


    return (
        <div className='flex flex-col flex-1 divide-y-2 divide-gray-50/10'>
            <div className='h-12 text-sm flex items-center px-2 text-indigo-300 uppercase font-bold tracking-wide'>
                <h2>Lorem Ipsum</h2>
            </div>
            <div className='h-[calc(100vh_-_3rem)] flex divide-x-2 divide-gray-50/10'>
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
                        <div className='flex justify-between py-2 text-sm uppercase font-bold tracking-wider'>
                            <h2 className='text-gray-400/90'>Content Range : </h2>
                            <h3 className='text-white/90'>{range}</h3>
                        </div>
                        <Slider
                            defaultValue={[range]}
                            max={100}
                            step={1}
                            min={1}
                            onValueChange={([range]) => {
                                setRange(range)
                            }}
                            className='pt-6'
                        />
                    </div>
                </div>
                <div className='flex-1 min-w-[300px] h-full'>
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