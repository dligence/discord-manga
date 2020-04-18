import configs from './configs'
import { Client } from 'eris'
import { Registry, Handler } from 'patron'
import path from 'path'
import { Message } from 'eris'

const registry = new Registry({ defaultReaders: true })
  .registerCommands(path.join(__dirname, 'commands/'))
  .registerPrefixes([','])

const handler = new Handler({ registry })
const BotClient = new Client(configs.token)

BotClient.connect()

BotClient.on('ready', async () => {
  console.log('[READY] Bot is ready!')
})
  .on('messageCreate', async message => {
    handler.run(message)
  })
  .on('messageReactionAdd', async (message, emoji, userID) => {
    if (userID === BotClient.user.id) return

    const messageToUse =
      message instanceof Message ? message : await message.channel.getMessage(message.id).catch(() => undefined)
    if (!messageToUse) return
    if (messageToUse.author.id !== BotClient.user.id) return

    const [embed] = messageToUse.embeds
    if (!embed || !embed.title) return

    if (!['⬅', '➡'].includes(emoji.name)) return

    const slashIndex = embed.title.indexOf('/')
    const chapter = Number(embed.title.substring(0, slashIndex))
    const spaceIndex = embed.title.indexOf(' - ')
    const page = Number(embed.title.substring(slashIndex + 1, spaceIndex))
    const nameIndex = embed.title.indexOf(':')
    const manga = embed.title.substring(spaceIndex + 3, nameIndex)

    const command = registry.getCommand('read')
    if (!command) return

    if (emoji.name === '➡') {
      if (embed.title.endsWith('Last')) {
        // Go to next chapter
        handler.executeCommand(messageToUse, command, [manga, `${chapter} + 1`, '1'])
      } else {
        handler.executeCommand(messageToUse, command, [manga, `${chapter}`, `${page + 1}`])
      }
    } else {
      if (page === 1) {
        if (chapter === 1) return
        // Go to last chapter
        handler.executeCommand(messageToUse, command, [manga, `${chapter} - 1`, '1'])
      } else {
        handler.executeCommand(messageToUse, command, [manga, `${chapter}`, `${page - 1}`])
      }
    }
  })

export default BotClient
