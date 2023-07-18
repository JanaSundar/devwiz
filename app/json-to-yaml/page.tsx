'use client'

import React from 'react'
import TransformPanel from '~/components/TransformPanel'
import YAML from 'json-to-pretty-yaml'

const JsonToYaml = () => {
    return (
        <TransformPanel
            editorLanguage='json'
            resultLanguage='yaml'
            transformer={async (value) => {
                const result = YAML.stringify(JSON.parse(value))
                return { result }
            }}
            editorTitle='JSON'
            resultTitle='YAML'


        />
    )
}

export default JsonToYaml