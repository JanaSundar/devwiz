'use client'

import React from 'react'
import TransformPanel from '~/components/TransformPanel';
import axios from 'axios';
import { DEFAULT_VALUES } from '~/constants/defaultValues';

const JsonToTS = () => {
    return (
        <TransformPanel
            editorTitle='json'
            resultTitle='typescript'
            editorLanguage='json'
            resultLanguage='typescript'
            transformer={async (value) => {
                const { data } = await axios.post('/api/json2ts', { json: value })
                return { result: data.result }
            }}
            defaultEditorValue={DEFAULT_VALUES.json}
        />
    )
}

export default JsonToTS