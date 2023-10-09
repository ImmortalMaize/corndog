export const trunk = (str: string, num: number) => {
  const pattern = /<a?:\w+:\d+>/gm
  const matches = Array.from(str.match(pattern) ?? [])
  console.log(matches)
  let mutatedString = str
  for (const match of matches) {
    mutatedString = mutatedString.replace(match, "⸗")
  }
  console.log(mutatedString)
  if (mutatedString.length <= num) {
    let untrunkedString = str
    for (const match of matches) {
      untrunkedString = untrunkedString.replace(/⸗/, match)
    }
    return untrunkedString
  }
  let trunkedString = mutatedString.slice(0, num) + '...'
  for (const match of matches) {
    trunkedString = trunkedString.replace(/⸗/, match)
  }
  console.log(trunkedString)
  return trunkedString
}