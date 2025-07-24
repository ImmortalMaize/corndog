import { CronJob,CronCommand, CronTime } from 'cron'
import { Client } from 'discord.js';

export class ReadableCron {
    readonly cron: CronJob
    constructor (private name: string, private date: Date, private job: (client: Client) => void) {
        this.cron = new CronJob(date, job)
        this.cron.cronTime.timeZone = "America/New_York"
        this.cron.name = name
    }
    public start = () => this.cron.start()
}