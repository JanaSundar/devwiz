export const routes = [
    {
        category: 'Converters',
        content: [
            {
                path: '/',
                label: 'String Case Converter',
            },
            {
                path: '/color-converter',
                label: 'Color Converter',
            }
        ]
    },
    {
        category: 'Transform',
        content: [
            {
                path: '/svg-to-jsx',
                label: 'SVG to JSX',
            },
            {
                path: '/js-to-json',
                label: 'JS to JSON',
            },
            {
                path: '/json-to-yaml',
                label: 'JSON to YAML',
            },
            {
                path: '/yaml-to-json',
                label: 'YAML to JSON',
            },
            {
                path: '/markdown-to-html',
                label: 'Markdown to HTML',
            },
            {
                path: '/html-to-markdown',
                label: 'HTML to Markdown',
            }
        ]
    },
    {
        category: 'Generate',
        content: [
            {
                path: '/fake-data',
                label: 'Fake data',
            },
            {
                path: '/unique-id',
                label: 'UUID / ULID',
            },
            {
                path: '/lorem-ipsum',
                label: 'Lorem Ipsum',
            },
            {
                path: '/qr-code',
                label: 'QR Code',
            }
        ]
    },
    {
        category: 'Url',
        content: [
            {
                path: '/url-encode-decode',
                label: 'Encode / Decode',
            },
            {
                path: '/parse-url',
                label: 'Parse',
            }
        ]
    },
    {
        category: 'Checker',
        content: [
            {
                path: '/diff-checker',
                label: 'Diff checker',
            },
        ] 
    }
]