import chroma from "chroma-js"

export default (colors: Array<string>) => {
    return chroma.scale(colors)
}