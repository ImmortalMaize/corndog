import { Corndog } from "..";

export default class ReadableCommand {
    constructor(
    public data: any,
    public execute: (interaction: any, corndog?: Corndog) => Promise<void>) {}
}