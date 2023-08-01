'use client'

import React from 'react'
import TransformPanel from '~/components/TransformPanel';
import svgToDataUri from 'mini-svg-data-uri';

const SvgToJsx = () => {
    return (
        <TransformPanel
            editorTitle='svg'
            resultTitle='Data URI'
            editorLanguage='html'
            resultLanguage='plaintext'
            isWordWrapEnabled
            transformer={async (value) => {
                const result = svgToDataUri(value)
                return { result }
            }}
        />
    )
}

export default SvgToJsx