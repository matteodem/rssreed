import { Mongo } from 'meteor/mongo'

const collection = new Mongo.Collection('rssresource')

if (Meteor.isServer) {
  collection._ensureIndex({ url: 1 }, { unique: true })
}

export {
  collection,
}
