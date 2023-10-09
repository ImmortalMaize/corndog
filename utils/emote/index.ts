import emotions from "./emotions.json"
interface Emotions {
    elated: Array<string>,
    content: Array<string>,
    furry: Array<string>,
    malcontent: Array<string>,
    neutral: Array<string>,
    cat: Array<string>,
}
export const emote = (emotion: keyof Emotions) => {
    return emotions[emotion][Math.floor(Math.random() * emotions[emotion].length)]
}