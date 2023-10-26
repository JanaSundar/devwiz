import prettier from "prettier/standalone";

const plugins = [
    require("prettier/plugins/graphql"),
    require("prettier/plugins/typescript"),
    require("prettier/plugins/html"),
    require("prettier/plugins/babel"),
    require("prettier/plugins/markdown"),
    require("prettier/plugins/yaml"),
    require("prettier/plugins/estree"),
    require("prettier/plugins/postcss"),
]


export default async function prettify(code: string, language: string) {
    const result = await prettier.format(code, {
        semi: false,
        plugins,
        parser: ['js', 'javascript'].includes(language) ? 'babel' : language,
        jsxSingleQuote: true,
        trailingComma: 'all'
    })

    return result
}