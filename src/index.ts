import configs from './configs'
import { Client } from 'eris'
import { Registry, Handler, Command, RequireAll } from 'patron'
import path from 'path'

const registry = new Registry({})

const prepareRegistry = async () => {
	console.log(path.join(__dirname, 'commands/'))
  const commands = (await RequireAll(path.join(__dirname, 'commands'))) as Command[]
  registry.registerCommands(commands)
}

const handler = new Handler({ registry })
prepareRegistry()
const BotClient = new Client(configs.token)

BotClient.connect()

BotClient
	.on('ready', () => '[READY] Bot is ready!')
	.on('messageCreate', message => {
		handler.run(message, 1)
	})

export default BotClient
