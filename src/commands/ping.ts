import { Command } from 'patron'
import { Message } from 'eris'

class Ping extends Command {
  constructor() {
    super({
      names: ['ping', 'pong'],
      description: 'is the bot alive?'
    })
  }

  async run(message: Message) {
    message.channel.createMessage('Pong')
  }
}

module.exports = new Ping()
