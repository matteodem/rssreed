import 'tachyons/css/tachyons.css'
import 'purecss/build/pure.css'
import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { ReactiveVar } from 'meteor/reactive-var'
import { Template } from 'meteor/templating'

import { collection as itemCollection } from '../imports/data/collections/item'
import { collection as rssCollection } from '../imports/data/collections/rssresource'
import './main.html'

Meteor.subscribe('initialData')

let showEndpoints = ReactiveVar(false)

Template.endpoints.onRendered(function () {
  this.autorun(() => {
    showEndpoints.set(rssCollection.find().count() === 0)
  })
})

Template.endpoints.helpers({
  endpoint() {
    return rssCollection.find()
  },
  noEndpoint() {
    return rssCollection.find().count() === 0
  },
  showEndpointsList() {
    return showEndpoints.get()
  },
  toggleButtonClass() {
    return showEndpoints.get() ? 'ion-arrow-down-b' : 'ion-arrow-right-b'
  },
})

Template.endpoints.events({
  'click .remove-endpoint'() {
    Meteor.call('removeRSSResource', this._id)
  },
  'click .toggle-endpoints-list'() {
    showEndpoints.set(!showEndpoints.get('showEndpoints'))
  }
})

Template.endpoints.events({
  'keyup .rss-endpoint': function (e) {
    const val = e.target.value.trim()

    if (e.keyCode === 13 && val) {
      Meteor.call('addRSSResource', val)
      e.target.value = ''
    }
  },
})

let itemsLoaded = new ReactiveVar(10)
let totalItemCount = new ReactiveVar(0)

Template.list.onCreated(function listOnCreated() {
  Meteor.call('getItemsCount', (err, count) => {
    totalItemCount.set(count)
  })
})

Template.list.helpers({
  formattedPublishDate() {
    return moment(this.publishDate).format('D.MM.YYYY, H:mm:ss')
  },
  formattedEndpoint() {
    return this.readerUrl
      .replace(/http(s)?:\/\/(www\.)?/, '')
      .replace(/\?.+/, '')
    ;
  },
  item() {
    return itemCollection.find({}, {
      sort: { publishDate: -1 },
    })
  },
  showLoadMore() {
    return itemsLoaded.get() < totalItemCount.get()
  }
})

Template.list.events({
  'click .load-more': function () {
    itemsLoaded.set(itemsLoaded.get() + 20)
    Meteor.subscribe('additionalItems', itemsLoaded.get())
  },
})
