'use client'

import axios from 'axios';
import React from 'react'
import TransformPanel from '~/components/TransformPanel';
import { DEFAULT_VALUES } from '~/constants/defaultValues';

const SvgToJsx = () => {
    return (
        <TransformPanel
            editorTitle='svg'
            resultTitle='jsx'
            editorLanguage='html'
            resultLanguage='javascript'
            transformer={async (value) => {
                const { data } = await axios.post<{ result: string }>("https://api-devwiz-xyz.vercel.app/api/svgr", {
                    code: value,
                    // options
                })
                return data
            }}
            defaultEditorValue={DEFAULT_VALUES.svg}
        />
    )
}

export default SvgToJsx