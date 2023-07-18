'use client'

import React, { FC } from 'react'
import { EditorProps, Monaco, Editor as MonacoEditor } from '@monaco-editor/react';
import themeData from 'monaco-themes/themes/Brilliance Dull.json'

type Props = EditorProps & {
    isReadOnly?: boolean;
    isWordWrapEnabled?: boolean;

}

const Editor: FC<Props> = ({ value, onChange, isReadOnly, isWordWrapEnabled, ...rest }) => {
    function handleEditorWillMount(monaco: Monaco) {
        monaco.editor.defineTheme('brilliance-dull', themeData);
    }

    return (
        <MonacoEditor
            value={value}
            defaultLanguage="javascript"
            theme='brilliance-dull'
            onChange={onChange}
            beforeMount={handleEditorWillMount}
            options={{
                minimap: {
                    enabled: false
                },
                readOnly: isReadOnly,
                lineHeight: 2,
                scrollBeyondLastLine: 0,
                scrollbar: {
                    horizontal: 'hidden',
                },
                renderValidationDecorations: "off",
                quickSuggestions: false,
                codeLens: false,
                wordWrap: isWordWrapEnabled ? 'on' : 'off',
            }}
            {...rest}
        />
    )
}

export default Editor