import * as changeCase from "change-case";

export const stringCases = [
    {
        value: "camelcase",
        label: "Camel Case",
    },
    {
        value: "snakecase",
        label: "Snake Case",
    },
    {
        value: "pascalcase",
        label: "Pascal Case",
    },
    {
        value: "capitalcase",
        label: "Capital Case",
    },
    {
        value: "dotcase",
        label: "DotCase",
    },
    {
        value: "constantcase",
        label: "Constant Case",
    },
    {
        value: "pathcase",
        label: "Path Case",
    },
]


export const convertCase = (x: string, type: string) => {
    switch (type) {
        case "camelcase":
            return changeCase.camelCase(x);
        case "snakecase":
            return changeCase.snakeCase(x);
        case "pascalcase":
            return changeCase.pascalCase(x);
        case "capitalcase":
            return changeCase.capitalCase(x);
        case "dotcase":
            return changeCase.dotCase(x);
        case "constantcase":
            return changeCase.constantCase(x);
        case "pathcase":
            return changeCase.pathCase(x);
        default:
            return x;
    }
}