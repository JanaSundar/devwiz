'use client'

import React from 'react'
import TransformPanel from '~/components/TransformPanel'
import { DEFAULT_VALUES } from '~/constants/defaultValues'
import { isJSONSafe } from '~/helper/jsonUtils';
import dynamic from 'next/dynamic';
import 'vanilla-jsoneditor/themes/jse-theme-dark.css'
import styles from "./style.module.css"

const JSONEditorReact = dynamic(() => import('~/components/JsonEditor'), { ssr: false });

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
        return <JSONEditorReact content={{ json: data }} readOnly className={styles.sorcererTheme} />
      }}
    />
  )
}

export default JSONToTreeView