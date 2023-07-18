'use client'

import React from 'react'
import TransformPanel from '~/components/TransformPanel'
import TurnDown from 'turndown'

const MarkdownToHtml = () => {
    return (
        <TransformPanel
            editorLanguage='html'
            resultLanguage='markdown'
            transformer={async (value) => {
                const result = new TurnDown().turndown(value)
                return { result }
            }}
            editorTitle='HTML'
            resultTitle='MARKDOWN'


        />
    )
}

export default MarkdownToHtml