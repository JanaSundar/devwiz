import clsx from 'clsx'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Content, JSONContent, JSONEditor, JSONEditorPropsOptional, Mode, OnChangeStatus } from 'vanilla-jsoneditor'

const JSONEditorReact: React.FC<JSONEditorPropsOptional & {className?: string}> = (props) => {
    const [content, setContent] = useState(props.content)
    const refContainer = useRef<HTMLDivElement>(null)
    const refEditor = useRef<JSONEditor | null>(null)

    const handler = useCallback(
        (content: Content, previousContent: Content, status: OnChangeStatus) => {
            setContent(content)
        },
        []
    )

    useEffect(() => {
        // create editor
        refEditor.current = new JSONEditor({
            target: refContainer.current!,
            props: {}
        })

        return () => {
            // destroy editor
            if (refEditor.current) {
                refEditor.current.destroy()
                refEditor.current = null
            }
        }
    }, [])

    useEffect(() => {
        // update props
        if (refEditor.current) {
            refEditor.current.updateProps({
                ...props,
                mode: Mode.tree,
                // mainMenuBar: false,
                onChange: handler,
            })
        }
    }, [props, handler])

    return <div ref={refContainer} className={clsx('jse-theme-dark', props.className)} />
}

export default JSONEditorReact