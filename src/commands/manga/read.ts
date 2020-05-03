import { Command, Context } from 'patron'
import nodefetch from 'node-fetch'

interface ReadCommandArgs {
  manga: string
  chapter: number
  page: number
}

const ReadCommand = new Command({
  names: ['read'],
  description: 'time to read manga',
  usableContexts: [Context.DM, Context.Guild],
  arguments: [
    {
      example: '5',
      key: 'manga',
      name: 'Manga name',
      type: 'string'
    },
    {
      example: '5',
      key: 'chapter',
      name: 'chapter #',
      type: 'integer',
      defaultValue: 1
    },
    {
      example: '1',
      key: 'page',
      name: 'page #',
      type: 'integer',
      defaultValue: 1
    }
  ]
})

ReadCommand.run = async (message, args: ReadCommandArgs) => {
  console.log('[READ] Manga Being Read')
  const data = await nodefetch(
    `https://mangapanda.com/${args.manga.toLowerCase().split(' ').join('-')}/${args.chapter}/${args.page}`
  )
    .then(res => res.text())
    .catch(() => undefined)
  if (!data) {
    message.channel.createMessage(`Did not find any manga that met your search criteria. Please try again.`)
    return
  }

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

  const response = await message.channel.createMessage({
    embed: {
      author: {
        name: 'MangaBot',
        icon_url: message.member?.guild.shard.client.user.avatarURL
      },
      title: `${args.chapter}/${args.page} - ${args.manga}: Chapter ${args.chapter} Page ${
        args.page === maxPages ? 'Last' : args.page
      }`,
      image: { url },
      footer: { text: `Powered By MangaPanda` }
    }
  })

  if (args.page > 1 || args.chapter > 1) await response.addReaction('⬅')
  response.addReaction('➡')
}

module.exports = ReadCommand
