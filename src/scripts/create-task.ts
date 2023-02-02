import fs from 'fs'
import path from 'path'
import yargs from 'yargs'

const TASKS_DIRECTORY = path.resolve(__dirname, '../../tasks')
const TASKS_IDS = fs.readdirSync(TASKS_DIRECTORY)

async function createTask(): Promise<void> {
  const yargsParser = yargs
    .scriptName('create')
    .option('task', { type: 'string', description: 'Task name', required: true })

  const { task: taskName } = await yargsParser.argv
  const taskId = getTaskId(taskName)
  const taskDir = path.join(TASKS_DIRECTORY, taskId)
  if (fs.existsSync(taskDir)) throw Error(`Task dir ${taskId} already exist`)

  fs.mkdirSync(taskDir)
  fs.mkdirSync(path.join(taskDir, 'build-info'))
  fs.mkdirSync(path.join(taskDir, 'output'))
  fs.mkdirSync(path.join(taskDir, 'test'))
  fs.writeFileSync(path.join(taskDir, 'test', '.config.json'), JSON.stringify({ fork: {}, deployed: {} }, null, 2))

  createIndex(taskDir)
  createBehavior(taskDir, taskName)
  createReadme(taskDir, taskName)
}

function createIndex(taskDir: string): void {
  const content = `import Task from '../../src/task'
import { TaskRunOptions } from '../../src/types'

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input()
}
`
  fs.writeFileSync(path.join(taskDir, 'index.ts'), content)
}

function createBehavior(taskDir: string, taskName: string): void {
  const fnName = taskName
    .split('-')
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join('')

  const content = `export default function itDeploys${fnName}Properly(): void {}`
  fs.writeFileSync(path.join(taskDir, 'test', 'behavior.ts'), content)
}

function createReadme(taskDir: string, taskName: string): void {
  const title = taskName
    .split('-')
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join(' ')

  const content = `# ${title}
  
## Content

## Transactions
`
  fs.writeFileSync(path.join(taskDir, 'README.md'), content)
}

function getTaskId(name: string): string {
  const date = new Date()
  const year = date.toLocaleString('default', { year: 'numeric' })
  const month = date.toLocaleString('default', { month: '2-digit' })
  const day = date.toLocaleString('default', { day: '2-digit' })
  const today = year + month + day

  const todayTasks = TASKS_IDS.filter((taskId) => taskId.startsWith(today))
  return `${today}${todayTasks.length.toLocaleString('default', { minimumIntegerDigits: 2 })}-${name}`
}

createTask().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
