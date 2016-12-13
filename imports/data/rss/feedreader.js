import FeedSub from 'feedsub'

import { collection as itemCollection } from '../collections/item'

const readers = []
const intervalInMinutes = 10

// TODO: output endpoint url to item

const createReader = (id, readerUrl) => {
  const reader = new FeedSub(readerUrl, {
    interval: intervalInMinutes,
    emitOnStart: true,
  })

  const removeItems = () => itemCollection.remove({ readerUrl })

  reader.on('items', Meteor.bindEnvironment(items => {
    items.forEach(item => {
      const { title, link, description, pubdate, category } = item

      itemCollection.insert({
        readerUrl,
        title,
        link,
        description,
        tags: category,
        publishDate: new Date(pubdate),
      })
    })
  }))

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
