'use client'

import React, { FC } from 'react'
import { DiffEditorProps, Monaco, DiffEditor as MonacoDiffEditor } from '@monaco-editor/react';
import themeData from 'monaco-themes/themes/Brilliance Dull.json'

type Props = DiffEditorProps & {
    isWordWrapEnabled?: boolean;
}

const DiffEditor: FC<Props> = ({ original, modified, isWordWrapEnabled, ...rest }) => {
    function handleEditorWillMount(monaco: Monaco) {
        monaco.editor.defineTheme('brilliance-dull', themeData);
    }

    return (
        <MonacoDiffEditor
            original={original}
            modified={modified}
            theme='brilliance-dull'
            beforeMount={handleEditorWillMount}
            language='plaintext'
            options={{
                minimap: {
                    enabled: false
                },
                readOnly: true,
                lineHeight: 2,
                scrollBeyondLastLine: 0,
                scrollbar: {
                    horizontal: 'hidden',
                },
                renderValidationDecorations: "off",
                quickSuggestions: false,
                codeLens: false,
                wordWrap: isWordWrapEnabled ? 'on' : 'off',
                fontSize: 15
            }}
            {...rest}
        />
    )
}

export default DiffEditor