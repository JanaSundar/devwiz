'use client'

import React, { useState } from 'react'
import Editor from '~/components/Editor'
import { QRCodeSVG } from 'qrcode.react';
import { useDebounce } from '~/hooks/useDebounce';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Switch } from '~/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { HexColorPicker } from 'react-colorful';
import Tilt from 'react-parallax-tilt';
import { Button } from '~/components/ui/button';

const QRCode = () => {
    const [value, setValue] = useState('');
    const debouncedValue = useDebounce(value, 500);
    const [qrIncludesImage, setQrIncludesImage] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState("#ffffff");
    const [foregroundColor, setForegroundColor] = useState("#000000");
    const [qrImage, setQrImage] = useState<string | null>(null)

    const onDownload = async () => {
        const svg = document.getElementById('qr-code');

        if (svg instanceof SVGSVGElement && svg !== null) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (!context) {
                console.error('Canvas context is not available.');
                return;
            }

            // Set the canvas size to match the SVG size.
            canvas.width = svg.width.baseVal.value;
            canvas.height = svg.height.baseVal.value;

            // Create a new Image element and draw the SVG on the canvas.
            const image = new Image();

            const svgBlob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
            const svgURL = URL.createObjectURL(svgBlob);
            image.src = svgURL;

            await new Promise<void>(resolve => { image.onload = () => resolve(); });

            context.drawImage(image, 0, 0);

            // Convert the canvas to a data URL in PNG format.
            const dataURL = canvas.toDataURL('image/png');

            // Create a download link for the PNG image.
            const link = document.createElement('a');
            link.download = `qrcode-${Date.now().toString().substring(-5)}.png`;
            link.href = dataURL;

            // Trigger the download.
            link.click();

            // Clean up by revoking the SVG URL.
            URL.revokeObjectURL(svgURL);
        }
    }

    return (
        <div className='flex flex-col flex-1 divide-y-2 divide-gray-50/10'>
            <div className='h-12 text-sm flex items-center px-2 text-indigo-300 uppercase font-bold tracking-wide'>
                <h2>QR Code generator</h2>
            </div>
            <div className='h-[calc(100vh_-_3rem)] flex divide-x-2 divide-gray-50/10'>
                <div className='flex-[2] min-w-[300px] h-full'>
                    <Editor value={value} onChange={v => setValue(v!)} language='plaintext' />
                </div>
                <div className='flex-1 flex flex-col items-center justify-start min-w-[200px] gap-10 py-2'>
                    <div className='flex flex-col gap-6'>
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="include-image" className='tracking-wider text-gray-400/90'>Include Logo</Label>
                            <Switch id="include-image" onCheckedChange={v => setQrIncludesImage(v)} />
                        </div>
                        <div className='flex flex-col justify-center items-start gap-4 font-bold'>
                            <Label htmlFor="picture" className='tracking-wider text-gray-400/90'>Choose a Logo</Label>
                            <Input id="picture" type="file" accept='image/*' className='bg-zinc-950 text-gray-400/90 placeholder:text-white w-[18rem] file:text-white file:tracking-wide' disabled={!qrIncludesImage} onChange={async e => {
                                if (e.target.files?.[0] === undefined) return setQrImage(null);
                                const buffer = await e.target.files[0].arrayBuffer();
                                const bufferToBase64 = btoa(new Uint8Array(buffer).reduce(
                                    function (data, byte) {
                                        return data + String.fromCharCode(byte);
                                    }, '')
                                )
                                const image = `data:${e.target.files[0].type};base64, ${bufferToBase64}`
                                setQrImage(image)
                            }} />
                        </div>
                        <div className='flex flex-col justify-center items-start gap-2  font-bold'>
                            <Label htmlFor="background-color" className='tracking-wider text-gray-400/90'>Background color</Label>
                            <div className='flex h-16 items-center'>
                                <input type="text" className='px-4 py-2 h-fit rounded-l w-60 text-gray-800/90 focus:outline-none' placeholder='Enter you hex code...' value={backgroundColor} onChange={e => {
                                    let value = e.target.value;
                                    if (!value.includes('#')) value = '#' + value;
                                    setBackgroundColor(value);
                                }} />
                                <Popover>
                                    <PopoverTrigger asChild >
                                        <div className='w-10 h-10 bg-white cursor-pointer flex justify-center items-center rounded-r' >
                                            <span className='w-8 h-8 inline-block rounded-lg shadow-inner shadow-black/30' style={{ backgroundColor: backgroundColor }}></span>
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-fit bg-current border-none shadow-md">
                                        <HexColorPicker color={backgroundColor} onChange={setBackgroundColor} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div className='flex flex-col justify-center items-start gap-2  font-bold'>
                            <Label htmlFor="foreground-color" className='tracking-wider text-gray-400/90'>Foreground color</Label>
                            <div className='flex h-16 items-center'>
                                <input id="foreground-color" type="text" className='px-4 py-2 h-fit rounded-l w-60 text-gray-800/90 focus:outline-none' placeholder='Enter you hex code...' value={foregroundColor} onChange={e => {
                                    let value = e.target.value;
                                    if (!value.includes('#')) value = '#' + value;
                                    setForegroundColor(value);
                                }} />
                                <Popover>
                                    <PopoverTrigger asChild >
                                        <div className='w-10 h-10 bg-white cursor-pointer flex justify-center items-center rounded-r' >
                                            <span className='w-8 h-8 inline-block rounded-lg shadow-inner shadow-black/30' style={{ backgroundColor: foregroundColor }}></span>
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-fit bg-current border-none shadow-md">
                                        <HexColorPicker color={foregroundColor} onChange={setForegroundColor} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                    <Tilt className='rounded-lg overflow-clip'>
                        <QRCodeSVG
                            value={debouncedValue}
                            size={200}
                            level='L'
                            includeMargin
                            className='rounded-lg shadow flex-1'
                            bgColor={backgroundColor}
                            fgColor={foregroundColor}
                            imageSettings={qrIncludesImage ? {
                                src: qrImage ?? "/assets/ghost.png",
                                x: undefined,
                                y: undefined,
                                height: 24,
                                width: 24,
                                excavate: true,
                            } : undefined}
                            id='qr-code'
                        />
                    </Tilt>

                    <Button className='bg-white rounded-lg shadow tracking-wide text-zinc-950 font-bold hover:bg-white' onClick={onDownload}>
                        Download
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default QRCode