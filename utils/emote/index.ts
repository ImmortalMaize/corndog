import emotions from "./emotions.json"
type Emotion = Array<string>
interface Emotions {
    elated: Emotion,
    content: Emotion,
    furry: Emotion,
    malcontent: Emotion,
    neutral: Emotion,
    cat: Emotion,
    glomp: Emotion,
}
export const emote = (emotion: keyof Emotions) => {
    return emotions[emotion][Math.floor(Math.random() * emotions[emotion].length)]
}