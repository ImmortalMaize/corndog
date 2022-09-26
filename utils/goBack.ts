import Day from "dayjs"

export default (amount: number, unit: Day.ManipulateType) => {
    return Day().subtract(amount, unit).unix()
}