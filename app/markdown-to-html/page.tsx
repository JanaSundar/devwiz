'use client'

import React from 'react'
import TransformPanel from '~/components/TransformPanel'
import { marked } from 'marked';
import Purify from 'dompurify'

const MarkdownToHtml = () => {
    return (
        <TransformPanel
            editorLanguage='markdown'
            resultLanguage='html'
            transformer={async (value) => {
                const result = Purify.sanitize(await marked.parse(value, { async: true }))
                return { result }
            }}
            editorTitle='MARKDOWN'
            resultTitle='HTML'


        />
    )
}

export default MarkdownToHtml