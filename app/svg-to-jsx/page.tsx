'use client'

import axios from 'axios';
import React from 'react'
import TransformPanel from '~/components/TransformPanel';

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
        />
    )
}

export default SvgToJsx