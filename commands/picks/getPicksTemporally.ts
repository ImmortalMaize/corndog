import net from "../../net"
import { time } from "../../utils"
import { ManipulateType } from 'dayjs';

export default async (unit: ManipulateType) => {
    const period = time.startOf(unit).toDate()
    console.log(period)
    const picks = await net.getPicksTemporally(period)
    const rankedPicks = picks.map((pick, index) => {
        pick.rank = index + 1
        return pick
    })
    return rankedPicks
}