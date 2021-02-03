import { Loader, ConfigurationBase } from "./types"
import { parse } from 'dotenv'
import { existsSync, readdirSync, readFileSync, lstatSync } from 'fs'
import { resolve, join } from 'path'

interface DotenvConfiguration {
    path?: string
    debug?: boolean
    encoding?: BufferEncoding
    depth?: number
}

function findPath(root: string, depth: number): string | undefined {

    let cwd = resolve(root)
    let path = undefined
    let i = 0

    while (i < depth && !path) {

        let match = readdirSync(cwd)
            .filter(fileOrFolder => lstatSync(join(cwd, fileOrFolder)).isFile())
            .find(file => /^\.env$/i.test(file))


        if (match) path = join(cwd, match)

        else {
            cwd = join(cwd, '../')
            i++
        }

    }

    return path
}

function readDotenv(path?: string, encoding: BufferEncoding = 'utf8', depth: number = 5): string | undefined {

    path = path
        ? resolve(path)
        : findPath(process.cwd(), depth)


    if (path && existsSync(path)) {
        try { return readFileSync(path, encoding) }
        catch (error) { }
    }

    return

}

export default function dotenv<Options extends ConfigurationBase>(config?: DotenvConfiguration): Loader<Options> {

    const { path, debug, encoding, depth } = config || {}
    const dotenv = readDotenv(path, encoding, depth)
    const args = parse(dotenv, { debug })

    // loader
    return (options: Partial<Options>) => {

        const updatedOptions: Partial<Options> = { ...options }

        for (let key in args) {

            const arg = args[key]

            // @ts-ignore
            if (/^true|false$/i.test(arg)) updatedOptions[key] = Boolean(args[key])
            // @ts-ignore
            else if (/^\d*$/.test(arg)) updatedOptions[key] = Number(args[key])
            // @ts-ignore
            else updatedOptions[key] = args[key]

        }

        return updatedOptions

    }

}