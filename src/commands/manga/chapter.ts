import { Command, Context } from 'patron'
import { Message } from 'eris'
import nodefetch from 'node-fetch'

interface ChapterCommandArgs {
  chapter: number
  manga: string
}

export async function fetchAndSendPage(message: Message, args: ChapterCommandArgs, page = 1) {
  const fullurl = `https://mangapanda.com/${args.manga.toLowerCase().split(' ').join('-')}/${args.chapter}/${page}`
  const data = await nodefetch(fullurl)
    .then(res => res.text())
    .catch(() => undefined)
  if (!data)
    return message.channel.createMessage(`Did not find any manga that met your search criteria. Please try again.`)

  const imgIndex = data.indexOf('id="img"')
  const imgString = data.substring(imgIndex)
  const srcIndex = imgString.indexOf('src=')
  const start = imgString.substring(srcIndex + 5)
  const endIndex = start.indexOf('" alt="')
  const url = start.substring(0, endIndex)

  const pagesIndex = data.indexOf('</select> of ')
  const pageStart = data.substring(pagesIndex + 13)
  const pagesEndIndex = pageStart.indexOf('</div>')
  const maxPages = Number(pageStart.substring(0, pagesEndIndex))

  message.channel
    .createMessage({
      embed: {
        author: {
          name: 'MangaBot',
          icon_url: message.member?.guild.shard.client.user.avatarURL
        },
        title: `${args.manga.toUpperCase()}: Chapter ${args.chapter} Page ${page === maxPages ? 'Last' : page}`,
        image: { url },
        footer: { text: `Powered By MangaPanda` }
      }
    })
    .then(msg =>
      setTimeout(
        () =>
          msg.edit({
            embed: {
              author: {
                name: 'MangaBot',
                icon_url: message.member?.guild.shard.client.user.avatarURL
              },
              title: `Click Here To View On Website!`,
              description: `The image is automatically hidden after 20 minutes, in order to support the source website. Support the manga websites which allow us to read and fall in love with manga!`,
              url: fullurl,
              footer: { text: `Powered By MangaPanda` }
            }
          }),
        600000
      )
    )

  if (maxPages !== page) fetchAndSendPage(message, args, page + 1)
  return
}

const ChapterCommand = new Command({
  names: ['chapter'],
  description: 'Read a full chapter of manga.',
  usableContexts: [Context.DM, Context.Guild],
  arguments: [
    {
      key: 'chapter',
      type: 'integer',
      defaultValue: 1
    },
    {
      key: 'manga',
      type: 'string',
      remainder: true
    }
  ]
})

ChapterCommand.run = async (message, args: ChapterCommandArgs) => {
  console.log('[CHAPTER] Full chapter loaded.')
  fetchAndSendPage(message, args)
}

module.exports = ChapterCommand
