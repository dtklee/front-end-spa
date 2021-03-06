require 'lib/view_helper'
config = require 'config'

class Application extends Backbone.Marionette.Application

  initialize: =>

    @on "initialize:after", (options) =>
      Backbone.history.start
        #pushState: true
        root: config.approot

      # Freeze the object
      Object.freeze? this

    @addInitializer (options) =>
      # All navigation that is relative should be passed through the navigate
      # method, to be processed by the router. If the link has a `data-bypass`
      # attribute, bypass the delegation completely.
      $(document).on "click", "a[href]:not([data-bypass])", (evt) ->
        # Get the absolute anchor href.
        # @router.previousRoute = location.href
        href =
          prop: $(this).prop("href")
          attr: $(this).attr("href")
        # Get the absolute root.
        root = location.protocol + "//" + location.host # + config.approot

        # Ensure the root is part of the anchor href, meaning it's relative.
        if href.prop.slice(0, root.length) is root
          # Stop the default event to ensure the link will not cause a page
          # refresh.
          evt.preventDefault()
          # `Backbone.history.navigate` is sufficient for all Routers and will
          # trigger the correct events. The Router's internal `navigate` method
          # calls this anyways.  The fragment is sliced from the root.
          Backbone.history.navigate(href.attr, true)
    
    #Initialisation of the translations, warning, it has to be done before the first render.
    @addInitializer (options) =>
      # Initiate the translation
      resources = require 'internationalization/all'
      i18n.init({resStore: resources, lng: config.lang}, (content)-> console.log('Translation correctly initialized.'))

    #Initialiation of backbone validation model, 
    # the prototype of the model is extended in order to replace standard backbone validate method.
    @addInitializer (options) =>
      _.extend(Backbone.Model.prototype, Backbone.Validation.mixin)

    # Add a notification functionnality into Backbone.
    @addInitializer (options) =>
      window.Backbone.Notification = require './lib/backbone_notification'
    
    # Add an initializer to the logger with the config define in the app config.
    @addInitializer (options) =>
      console.log 'config log', config.log
      window.l = new Logger(config.appName, config.log.level, {options : config.log})

    @addInitializer (options) =>
      # Add the main layout
      AppLayout = require 'views/app-layout'
      @layout = new AppLayout()
      @layout.render()

    
    @addInitializer (options) =>
      # Instantiate the router
      Router = require 'lib/router'
      @router = new Router()

    @start()

module.exports = new Application()