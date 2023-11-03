import { io } from "socket.io-client"
import { emote, tracer } from "../utils";


export default () => {
	const socket = io("http://localhost:3000/bot")

	socket.on("connect", () => {
		tracer.build(`Connected to socket ${emote("elated")}`)
	})

	socket.on("connect_error", (error: Error) => {
		tracer.error(error)
	})

	socket.onAnyOutgoing((event: string) => tracer.event(`Sent socket event ${event.inverse}`))
	socket.onAny(((event: string) => tracer.event(`Received socket event ${event.inverse}`)))
	return socket
}