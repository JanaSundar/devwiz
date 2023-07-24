'use client'

import { hex } from 'color-convert'
import React, { useEffect, useState } from 'react'
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import Tilt from 'react-parallax-tilt';
import { useClipboard } from '~/hooks/useClipboard';
import { Copy, Check } from 'lucide-react'

function ColorResult({ color, type }: { color: string, type: string }) {
    const { hasCopied, onCopy } = useClipboard(color)
    return (
        <div className='py-4 space-y-2'>
            <h3 className='text-sm font-bold tracking-wider text-zinc-400/90 uppercase'>{type}</h3>
            <div className='flex items-center gap-4'>
                <input type="text" value={color} className='text-sm font-bold tracking-wider text-zinc-950 border border-zinc-50/20  p-2 rounded disabled:bg-white disabled:opacity-100 w-60' disabled />
                <span className='shadow bg-zinc-50/20 p-2 rounded'>
                    {hasCopied ? <Check size={20} /> : <Copy onClick={onCopy} className='cursor-pointer' size={20} />}
                </span>
            </div>
        </div>
    )
}

const ColorConverter = () => {
    const [color, setColor] = useState("#ff5c5c");
    const [convertedColor, setConvertedColor] = useState({
        hsl: '',
        hsv: '',
        rgb: '',
        cmyk: '',
        hwb: ''
    })


    useEffect(() => {
        const hsv = hex.hsv(color);
        const cmyk = hex.cmyk(color);
        const hsl = hex.hsl(color);
        const hwb = hex.hwb(color);

        setConvertedColor({
            rgb: `rgb(${hex.rgb(color).join(", ")})`,
            hsl: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`,
            hsv: `hsv(${hsv[0]}, ${hsv[1]}%, ${hsv[2]}%)`,
            cmyk: `cmyk(${cmyk[0]}%, ${cmyk[1]}%, ${cmyk[2]}%, ${cmyk[3]}%)`,
            hwb: `hwb(${hwb[0]}, ${hwb[1]}%, ${hwb[2]}%)`,
        })

    }, [color])

    return (
        <div className='flex flex-col flex-1 divide-y-2 divide-gray-50/10'>
            <div className='h-12 text-sm flex items-center px-2 text-indigo-300 uppercase font-bold tracking-wide'>
                <h2>Color Converter</h2>
            </div>
            <div className='h-[calc(100vh_-_3rem)] flex divide-x-2 divide-gray-50/10'>
                <div className='flex-1 flex flex-col w-full items-center p-4'>
                    <div className='flex h-16 items-center'>
                        <input type="text" className='px-4 py-2 h-fit rounded-l w-60 text-zinc-950 focus:outline-none ' placeholder='Enter you hex code...' value={color} onChange={e => {
                            let value = e.target.value;
                            if (!value.includes('#')) value = '#' + value;
                            setColor(value);
                        }} />
                        <Popover>
                            <PopoverTrigger asChild >
                                <div className='w-10 h-10 bg-white cursor-pointer flex justify-center items-center rounded-r' >
                                    <span className='w-8 h-8 inline-block rounded-lg' style={{ backgroundColor: color }}></span>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-fit bg-current border-none shadow-md">
                                <HexColorPicker color={color} onChange={setColor} />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className='flex-1 flex flex-col gap-4'>
                        <ColorResult color={convertedColor.hsl} type='hsl' />
                        <ColorResult color={convertedColor.rgb} type='rgb' />
                        <ColorResult color={convertedColor.hsv} type='hsv' />
                        <ColorResult color={convertedColor.cmyk} type='cmyk' />
                        <ColorResult color={convertedColor.hwb} type='hwb' />
                    </div>
                </div>
                <div className='flex-[2] flex justify-center items-center'>
                    <Tilt className='bg-white p-2 rounded-lg'>
                        <div className='w-[300px] h-[400px] rounded-lg shadow-lg' style={{ backgroundColor: color }}></div>
                    </Tilt>
                </div>
            </div>
        </div>
    )
}

export default ColorConverter