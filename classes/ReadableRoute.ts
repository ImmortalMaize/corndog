import { Request, Response } from "express";

export default class ReadableRoute {
    constructor(public path: string, public handlers: {
        [method: string]:(request: Request, response: Response) => any
    }) {}
}