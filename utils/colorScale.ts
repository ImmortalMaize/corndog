import chroma from "chroma-js"

export const colorScale = (colors: Array<string>) => {
    return chroma.scale(colors)
}