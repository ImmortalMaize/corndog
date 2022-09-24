import Day from "dayjs"
import duration from "dayjs/plugin/duration"
Day.extend(duration)

export default (time: {
    //@ts-ignore
    [units: Day.UnitTypeLongPlural]: number
}) => {
    return Day.duration(time).asMilliseconds()
}