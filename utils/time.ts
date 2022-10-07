import Day from "dayjs"
import duration from "dayjs/plugin/duration"
Day.extend(duration)

import RelativeTime from "dayjs/plugin/relativeTime"
Day.extend(RelativeTime)

export default {
    now: () => {
        return Day()
    },
    duration: (time: {
        //@ts-ignore
        [units: Day.UnitTypeLongPlural]: number
    }) => {
        return Day.duration(time).asMilliseconds()
    },
    relative: (time: number) => {
        return  Day(time).fromNow()
    },
    goBack: (amount: number, unit: Day.ManipulateType) => {
        return Day().subtract(amount, unit)
    },
    past: (date: Date) => {
        return Day().unix() >= Day(date).unix()
    },
    goForth: (amount: number, unit: Day.ManipulateType) => {
        return Day().add(amount, unit)
    }
}