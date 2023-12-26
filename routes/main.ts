import ReadableRoute from "../classes/ReadableRoute";
import { main } from "./html";

export default new ReadableRoute(
    '/', {
        get(_request, response) {
            console.log(main)
            response.setHeader('Content-Type', 'text/html');
            response.send(main)
        }
    })