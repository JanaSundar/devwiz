'use client'

import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import TransformPanel from '~/components/TransformPanel';
import { Combobox } from '~/components/ui/Combobox';
import { DEFAULT_VALUES } from '~/constants/defaultValues';
import { convertCase, stringCases } from '~/helper/string';

interface Props {
  setValue: React.Dispatch<React.SetStateAction<string>>,
  value: string
}

const splitLines = (str: string) => str.split(/\r?\n/);

const Options = (props: Props) => {
  return (
    <Combobox data={stringCases}
      placeholder='Select a String Case'
      {...props}
    />
  )
}


export default function Home() {
  const [value, setValue] = React.useState('camelcase');

  return (
    <TransformPanel resultLanguage='plaintext' editorLanguage='plaintext' editorTitle='string input' resultTitle='result' editorHeaderElements={<Options {...{ value, setValue }} />} transformer={async (x) => {
      if (value === '') {
        toast('Select a String Case type to transform')
        return { result: '' }
      };

      const values = splitLines(x);

      const result = values.map((x) => {
        return convertCase(x, value)
      }).join('\n')

      return { result }
    }} defaultEditorValue={DEFAULT_VALUES.stringCaseConverter} showPrettifyButton={false} />
  )
}
