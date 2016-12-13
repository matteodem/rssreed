import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'

import { collection as itemCollection } from '../imports/data/collections/item'
import { collection as rssResourceCollection } from '../imports/data/collections/rssresource'

import { createReader, resetReader } from '../imports/data/rss/feedreader'

Meteor.methods({
  addRSSResource(url) {
    check(url, String)

    const id = rssResourceCollection.insert({
      url,
    })

    createReader(id, url)
  },
  removeRSSResource(_id) {
    check(_id, String)

    rssResourceCollection.remove({ _id })
    resetReader(_id)
  },
  getItemsCount() {
    return itemCollection.find().count()
  }
})

const getSortedItems = limit => itemCollection.find({}, { sort: { publishDate: -1 }, limit })

Meteor.publish('initialData', () => [
  getSortedItems(10),
  rssResourceCollection.find(),
])

Meteor.publish('additionalItems', count => {
  check(count, Number)
  return getSortedItems(count)
})

Meteor.startup(() => {
  rssResourceCollection
    .find()
    .fetch()
    .forEach(d => createReader(d._id, d.url))
})
