import Day from "dayjs"
import RelativeTime from "dayjs/plugin/relativeTime"
Day.extend(RelativeTime)

export default (time: number) => {
    return  Day(time).fromNow()
}