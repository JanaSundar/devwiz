'use client'
import { useEffect, useState } from 'react';
import Editor from '~/components/Editor';
import TransformPanel from '~/components/TransformPanel';
import { useDebounce } from '~/hooks/useDebounce';
import axios from 'axios';

export default function Home() {
  return (
    <TransformPanel
      editorLanguage='html'
      resultLanguage='javascript'
      transformer={async (value) => {
        const { data } = await axios.post<{ result: string }>("/api/svg2jsx", { svg: value });
        return data
      }}
    />
  )
}
