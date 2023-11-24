import chroma from "chroma-js"
import { config } from "../config"

export const getPurple = () => {
    const scale = chroma.scale(config.colors)
    return scale(Math.random()).hex()
}