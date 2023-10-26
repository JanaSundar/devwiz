'use client'

import React from 'react'
import TransformPanel from '~/components/TransformPanel'
import { DEFAULT_VALUES } from '~/constants/defaultValues'
import { JSONTree } from 'react-json-tree';
import { isJSONSafe } from '~/helper/jsonUtils';

const JSONToTreeView = () => {

  const parseData = (data: any) => {
    try {
      return JSON.parse(data)
    } catch (error) {
      return {}
    }
  }
  return (
    <TransformPanel
      editorTitle='json'
      resultTitle='Tree View'
      editorLanguage='json'
      resultLanguage='json'
      transformer={async (value) => {
        return new Promise((resolve, reject) => {
          if (!isJSONSafe(value)) return reject('Error occured');
          const result = JSON.stringify(value)
          resolve({ result });
        })
      }}
      defaultEditorValue={DEFAULT_VALUES.json}
      render={({ result }) => {
        const data = parseData(result);
        return <JSONTree
          data={data}
          shouldExpandNodeInitially={() => true}
          theme={{
            scheme: 'Custom',
            base00: '#09090b',
            base01: '#ffffff',
            base02: '#5a6986aa',
            base03: '#6e7d9abb',
            base04: '#aaed36',
            base05: '#fdba74',
            base06: '#f87171',
            base07: '#4f46e5',
            base08: '#f9a8d4',
            base09: '#0ea5e9',
            base0A: '#5eead4',
            base0B: '#ec4899',
            base0C: '#16a34a',
            base0D: '#94a3b8',
            base0E: '#EEFFFF',
            base0F: '#db2777'
          }} />
      }}
    />
  )
}

export default JSONToTreeView