import instance from 'tracer'
import colors from 'colors'
import fs from 'fs'
import Day from 'dayjs'

export const tracer = instance.colorConsole({
  methods: ['log', 'trace', 'debug', 'info', 'warn', 'error', 'build', 'command', 'event', "woof", "control"],
  format: [
    "🌽🐶🌭 {{timestamp}} » [{{title}}] {{message}} " + colors.dim("(/{{file}}:{{line}})"),
    {
      error: "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})\nCall Stack:\n{{stack}}"
    }
    ],
  preprocess(data: any) {
    const date = Day(data.timestamp)
    const title = data.title.toUpperCase()
    let titleColor: keyof colors.Color

    switch (title) {
      case "TRACE":
        titleColor = "green"
        break
      case "DEBUG":
        titleColor = "green"
        break
      case "INFO":
        titleColor = "cyan"
        break
      case "WARN":
        titleColor = "yellow"
        break
      case "ERROR":
        titleColor = "red"
        break
      case "FATAL":
        titleColor = "red"
        break
      case "BUILD":
        titleColor = "magenta"
        break
      case "COMMAND":
        titleColor = "magenta"
        break
      case "EVENT":
        titleColor = "magenta"
        break
      case "CONTROL":
        titleColor = "cyan"
        break
      case "WOOF":
        titleColor = "rainbow"
        break
      default:
        titleColor = "white"
        break
      }


    data.timestamp = date.format('MM/DD/YYYY') + " at " + date.format('HH:mm:ss')
    data.title = colors[titleColor](title)
  }
})

