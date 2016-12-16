import FeedSub from 'feedsub'

import { collection as itemCollection } from '../collections/item'

const readers = []
const intervalInMinutes = 10

const createReader = (id, userId, readerUrl) => {
  const reader = new FeedSub(readerUrl, {
    interval: intervalInMinutes,
    emitOnStart: true,
  })

  const removeItems = () => itemCollection.remove({ readerUrl, userId })

  reader.on('items', Meteor.bindEnvironment(items => {
    items.forEach(item => {
      const { title, link, description, pubdate, category } = item

      itemCollection.insert({
        readerUrl,
        userId,
        title,
        link,
        description,
        tags: category,
        publishDate: new Date(pubdate),
      })
    })
  }))

  reader.on('error', err => console.log(err))

  removeItems()

  reader.start()

  readers.push({
    id,
    reader,
    reset: () => {
      reader.stop()
      removeItems()
    }
  })
}

const resetReader = (id) => readers.filter(r => r.id === id).forEach(r => r.reset())

export {
  createReader,
  resetReader,
}
