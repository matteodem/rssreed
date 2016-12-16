import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'

import { collection as itemCollection } from '../imports/data/collections/item'
import { collection as rssResourceCollection } from '../imports/data/collections/rssresource'

import { createReader, resetReader } from '../imports/data/rss/feedreader'

const generateId = (id, userId) => `${id}_${userId}`

Meteor.methods({
  addRSSResource(url) {
    check(url, String)

    const userId = Meteor.userId()

    if (userId) {
      const id = rssResourceCollection.insert({
        url,
        userId,
      })

      createReader(generateId(id, userId), userId, url)
    }
  },
  removeRSSResource(_id) {
    check(_id, String)

    const userId = Meteor.userId()

    if (userId) {
      rssResourceCollection.remove({ _id, userId })
      resetReader(generateId(_id, userId))
    }
  },
  getItemsCount() {
    const userId = Meteor.userId()

    return itemCollection.find({ userId }).count()
  }
})

const getSortedItems = (userId, limit) => itemCollection.find(
  { userId },
  { sort: { publishDate: -1 }, limit }
)

Meteor.publish('initialData', function () {
  const userId = this.userId

  return [
    getSortedItems(userId, 10),
    rssResourceCollection.find({
      userId,
    }),
  ]
})

Meteor.publish('additionalItems', function (count) {
  check(count, Number)
  return getSortedItems(this.userId, count)
})
