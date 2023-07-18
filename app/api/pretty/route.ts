import { NextRequest, NextResponse } from "next/server";
import prettier from 'prettier';

const plugins = [
    require("prettier/plugins/graphql"),
    require("prettier/plugins/typescript"),
    require("prettier/plugins/html"),
    require("prettier/plugins/babel"),
    require("prettier/plugins/markdown"),
    require("prettier/plugins/yaml"),
    require("prettier/plugins/postcss"),
]


export async function POST(req: NextRequest) {
    const { code, language } = await req.json();


    try {
        const result = await prettier.format(code, {
            semi: false,
            plugins,
            parser: ['js', 'javascript'].includes(language) ? 'babel' : language,
            jsxSingleQuote: true,
        })
        return NextResponse.json({ result }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: err }, { status: 400 });
    }
}