'use client'

import React from 'react'
import TransformPanel from '~/components/TransformPanel';
import svgToDataUri from 'mini-svg-data-uri';
import { DEFAULT_VALUES } from '~/constants/defaultValues';

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
            defaultEditorValue={DEFAULT_VALUES.svg}
        />
    )
}

export default SvgToJsx