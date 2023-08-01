'use client'

import React from 'react'
import TransformPanel from '~/components/TransformPanel'
import YAML from 'js-yaml';
import { DEFAULT_VALUES } from '~/constants/defaultValues';

const YamlToJson = () => {
    return (
        <TransformPanel
            editorLanguage='yaml'
            resultLanguage='json'
            transformer={async (value) => {
                const result = YAML.load(value, { json: true })
                return { result: JSON.stringify(result, null, 4) }
            }}
            editorTitle='YAML'
            resultTitle='JSON'
            defaultEditorValue={DEFAULT_VALUES.yaml}
        />
    )
}

export default YamlToJson