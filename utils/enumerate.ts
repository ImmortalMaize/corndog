export const enumerate = (strings: string[], and: boolean = false) => {
    return and && strings.length > 1 ? strings.map((string, index) => index === strings.length - 1 ? `and ${string}` : index === strings.length - 2 ? string:  string + ",").join(" ") : strings.join(", ")
}