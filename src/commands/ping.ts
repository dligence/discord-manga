import { Command, Context, ExecutionResult } from 'patron'
import { Message, TextChannel } from 'eris'

class Ping extends Command {
  constructor() {
    super({
      names: ['ping', 'pong'],
      description: 'is the bot alive?',
      usableContexts: [Context.Guild, Context.DM]
    })
  }

  async run(message: Message) {
    const response = await message.channel.createMessage('Pong')
    const channelWithoutBotPerms = message.member?.guild.channels.get('649648304761602060') as TextChannel
    const logPost = await channelWithoutBotPerms.createMessage('my log post').catch(() => undefined)
    if (!logPost)
      return ExecutionResult.fromFailure({
        message,
        response,
        newContent: 'Error unable to log.'
      })

    return
  }
}

module.exports = new Ping()
