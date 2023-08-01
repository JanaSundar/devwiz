export const DEFAULT_VALUES = {
    stringCaseConverter: `This is an example sentence.
under_score_case
dash-case
`,
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot="">
    <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" stroke="#221b38" fill="none" d="M20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20Z"></path>
    <path stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" stroke="#221b38" fill="none" d="M20 4H4C2.9 4 2 4.9 2 6L12 13L22 6C22 4.9 21.1 4 20 4Z"></path>
</svg>
    `,
    js: `{
    'building no': 3960,
    street: 'North 1st street',
    state: 'CA',
    country: 'USA'
}`,
    json: JSON.stringify({
        "glossary": {
            "title": "example glossary",
            "GlossDiv": {
                "title": "S",
                "GlossList": {
                    "GlossEntry": {
                        "ID": "SGML",
                        "SortAs": "SGML",
                        "GlossTerm": "Standard Generalized Markup Language",
                        "Acronym": "SGML",
                        "Abbrev": "ISO 8879:1986",
                        "GlossDef": {
                            "para": "A meta-markup language, used to create markup languages such as DocBook.",
                            "GlossSeeAlso": ["GML", "XML"]
                        },
                        "GlossSee": "markup"
                    }
                }
            }
        }
    }, null, 2),
    yaml: `---
# A sample yaml file
company: spacelift
domain:
- devops
- devsecops
tutorial:
- yaml:
    name: "YAML Ain't Markup Language"
    type: awesome
    born: 2001
- json:
    name: JavaScript Object Notation
    type: great
    born: 2001
- xml:
    name: Extensible Markup Language
    type: good
    born: 1996
author: omkarbirade
published: true
`,
    markdown: `---
__Advertisement :)__

- __[pica](https://nodeca.github.io/pica/demo/)__ - high quality and fast image
resize in browser.
- __[babelfish](https://github.com/nodeca/babelfish/)__ - developer friendly
i18n with plurals support and easy syntax.

You will like those projects!

---

# h1 Heading 8-)
## h2 Heading
### h3 Heading
#### h4 Heading
##### h5 Heading
###### h6 Heading
`,
    html: `<html>
    <head>
        <title>Href Attribute Example</title>
    </head>
    <body>
        <h1>Href Attribute Example</h1>
        <p>
        <a href="https://www.freecodecamp.org/contribute/">The freeCodeCamp Contribution Page</a> shows you how and where you can contribute to freeCodeCamp's community and growth.
        </p>
    </body>
</html>
`,
    css: `:root {
    --card-height: 65vh;
    --card-width: calc(var(--card-height) / 1.5);
}


body {
    min-height: 100vh;
    background: #212534;
    display: flex;
    align-items: center;
    flex-direction: column;
    padding-top: 2rem;
    padding-bottom: 2rem;
    box-sizing: border-box;
}

a {
    color: #212534;
    text-decoration: none;
    font-family: sans-serif;
    font-weight: bold;
    margin-top: 2rem;
}
` ,
    diffCheckerOriginal: `This is an example sentence.`,
    diffCheckerModified: `example sentence.`
}