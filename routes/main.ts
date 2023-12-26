import ReadableRoute from "../classes/ReadableRoute";

export default new ReadableRoute(
    '/', {
        get(_request, response) {
            response.setHeader('Content-Type', 'text/html');
            response.sendFile('./html/main.html')
        }
    })