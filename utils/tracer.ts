import instance from 'tracer'
import colors from 'colors'
import fs from 'fs'
import Day from 'dayjs'

const { LOGS } = process.env
const transport = (data) => {
  console.log(data.output)

  const file = LOGS + `/${Day().format('DDMMYY')}.txt`
  fs.existsSync(file) || fs.open(file, 'w', err => console.error(err))
  fs.createWriteStream(file, {
    flags: 'a',
    encoding: 'utf8',
    mode: 0o666
  })
    .write(data.output + '\n')
}


export const tracer = instance.colorConsole({
  transport,
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

