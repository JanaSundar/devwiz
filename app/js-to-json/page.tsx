'use client'

import axios from 'axios';
import React from 'react'
import TransformPanel from '~/components/TransformPanel';
import { DEFAULT_VALUES } from '~/constants/defaultValues';
import { isJSONSafe } from '~/helper/jsonUtils';

const JsToJson = () => {
    return (
        <TransformPanel
            editorTitle='js'
            resultTitle='json'
            editorLanguage='javascript'
            resultLanguage='json'
            transformer={(value) => {
                return new Promise((resolve, reject) => {
                    if (!isJSONSafe(value)) return reject('Error occured');
                    const result = JSON.stringify(value , null, 4)
                    resolve({ result });
                })
            }}
            defaultEditorValue={DEFAULT_VALUES.js}
            prettifyLanguage='json'
        />
    )
}

export default JsToJson