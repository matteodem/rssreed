import 'tachyons/css/tachyons.css'
import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { ReactiveVar } from 'meteor/reactive-var'
import { Template } from 'meteor/templating'

import { collection as itemCollection } from '../imports/data/collections/item'
import { collection as rssCollection } from '../imports/data/collections/rssresource'
import './main.html'

Meteor.subscribe('initialData')

const showEndpoints = ReactiveVar(false)

Template.endpoints.helpers({
  endpoint() {
    return rssCollection.find()
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
let totalItemCount = 1000000

Template.list.onCreated(function listOnCreated() {
  Meteor.call('getItemsCount', (err, count) => {
    totalItemCount = count
  })
})

Template.list.helpers({
  formattedPublishDate() {
    return moment(this.publishDate).format('D MMMM YYYY, H:mm:ss')
  },
  item() {
    return itemCollection.find({}, {
      sort: { publishDate: -1 },
    })
  },
  showLoadMore() {
    return itemsLoaded.get() < totalItemCount
  }
})

Template.list.events({
  'click .load-more': function () {
    itemsLoaded.set(itemsLoaded.get() + 20)
    console.log(itemsLoaded.get())
    Meteor.subscribe('additionalItems', itemsLoaded.get())
  },
})
