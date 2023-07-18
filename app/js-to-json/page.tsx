'use client'

import axios from 'axios';
import React from 'react'
import TransformPanel from '~/components/TransformPanel';

const JsToJson = () => {
    return (
        <TransformPanel
            editorTitle='js'
            resultTitle='json'
            editorLanguage='javascript'
            resultLanguage='json'
            transformer={(value) => {
                return new Promise(res => {
                    const result = JSON.stringify(
                        JSON.parse(JSON.stringify(eval("(" + value + ")"), null, 2)),
                        null, 4)
                    res({ result });
                })
            }}
        />
    )
}

export default JsToJson