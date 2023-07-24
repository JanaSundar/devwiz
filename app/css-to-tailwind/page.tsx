'use client'

import React from 'react'
import TransformPanel from '~/components/TransformPanel'
import { TailwindConverter } from 'css-to-tailwindcss'

const CSSToTailwind = () => {
    return (
        <TransformPanel
            editorLanguage='css'
            resultLanguage='css'
            resultTitle='Tailwind CSS'
            editorTitle='CSS'
            transformer={async (value) => {
                const converter = new TailwindConverter()
                const { convertedRoot } = await converter.convertCSS(value)
                return { result: convertedRoot.toString() }
            }}
        />
    )
}

export default CSSToTailwind