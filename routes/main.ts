import ReadableRoute from "../classes/ReadableRoute";

export default new ReadableRoute(
    '/', {
        get(_request, response) {
            response.send('Hello World!')
        }
    })