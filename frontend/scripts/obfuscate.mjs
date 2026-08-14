import fs from 'node:fs'
import path from 'node:path'
import JavaScriptObfuscator from 'javascript-obfuscator'

const assetsDir = path.resolve('dist/assets')

for (const filename of fs.readdirSync(assetsDir)) {
    if (!filename.endsWith('.js')) continue

    const filepath = path.join(assetsDir, filename)
    const source = fs.readFileSync(filepath, 'utf8')

    // i like code but it doesnt mean i want everyone to see it tehe
    // ..i have many skeletons in the closet and they should stay there
    const result = JavaScriptObfuscator.obfuscate(source, {
        compact: true,
        identifierNamesGenerator: 'hexadecimal',
        renameGlobals: false,
        stringArray: true,
        stringArrayThreshold: 0.8,
        rotateStringArray: true,
        shuffleStringArray: true,
        stringArrayEncoding: ['base64'],
        splitStrings: true,
        splitStringsChunkLength: 8,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.35,
        deadCodeInjection: false,
        numbersToExpressions: true,
        simplify: true,
        transformObjectKeys: true,
        unicodeEscapeSequence: false,
        selfDefending: false,
    })
    fs.writeFileSync(filepath, result.getObfuscatedCode())
    console.log(`Obfuscated ${filename}`)
}