var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');
var igv = require('./igv.js')

// When serialiazing the entire widget state for embedding, only values that
// differ from the defaults will be specified.

var TrackModel = widgets.WidgetModel.extend({
    defaults: _.extend(widgets.WidgetModel.prototype.defaults(), {
        _model_name : 'TrackModel',
        _view_name : 'TrackView',
        _model_module : 'ipyigv',
        _view_module : 'ipyigv',
        _model_module_version : '0.1.0',
        _view_module_version : '0.1.0',
    })
  });


var ReferenceGenomeModel = widgets.WidgetModel.extend({
    defaults: _.extend(widgets.WidgetModel.prototype.defaults(), {
        _model_name : 'ReferenceGenomeModel',
        _view_name : 'ReferenceGenomeView',
        _model_module : 'ipyigv',
        _view_module : 'ipyigv',
        _model_module_version : '0.1.0',
        _view_module_version : '0.1.0',
    }),
  }, {
    serializers: _.extend({
        tracks: { deserialize: widgets.unpack_models }
      }, widgets.WidgetModel.serializers)
});


var IgvModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name : 'IgvModel',
        _view_name : 'IgvBrowser',
        _model_module : 'ipyigv',
        _view_module : 'ipyigv',
        _model_module_version : '0.1.0',
        _view_module_version : '0.1.0',
    })
  }, {
    serializers: _.extend({
        reference: { deserialize: widgets.unpack_models }
      }, widgets.DOMWidgetModel.serializers)
});

var ReferenceGenomeView = widgets.WidgetView.extend({


  render: function() {
    console.log("rendering ReferenceGenomeView")
    // this.listenTo(this.model, 'change:tracks', this.update_tracks, this)
  },

});

var TrackView = widgets.WidgetView.extend({
  render: function() {
    console.log("rendering TrackView")
  },
});


var IgvBrowser = widgets.DOMWidgetView.extend({
    // Defines how the widget gets rendered into the DOM

    tracks_initialized: false,

    render: function() {
      console.log("rendering browser")
      this.igvDiv = document.createElement("div");
      // console.log('model', this.model)
      reference = this.model.get('reference')
      var options =  {reference: this.model.get('reference')} // { "genome": this.model.get('genome') };
      igv.createBrowser(this.igvDiv, options)
        .then(function (browser) {
            console.log("Created IGV browser with options ", options);
            igv.browser = browser
          })

      this.el.appendChild(this.igvDiv)

      console.log("configuring track_views")
      this.track_views = new widgets.ViewList(this.add_track_view, this.remove_track_view, this)
      this.track_views.update(reference.get('tracks'))
      this.tracks_initialized = true
      console.log("Done configuring track_views")

      // IMPORTANT: do this after this.track_views.update(...), or this.update_tracks gets called
      this.listenTo(this.model, 'change:reference', this.update_reference, this)
      this.listenTo(this.model.get('reference'), 'change:tracks', this.update_tracks, this)

      //this.model.on('change:genome', this.update_genome, this)
    },

    update_reference: function() {
      console.log('Updating browser.reference with ', this.model.get('reference'))
      //this.browser.loadGenome({"id": this.model.get('genome')})
    },

    update_tracks: function() {
      if (this.tracks_initialized) {
        console.log('Updating tracks_views with '+ this.model.get('tracks'))
        this.track_views.update(this.model.get('reference').get('tracks'))
      }
      else {
        console.log ("tracks not yet initialized - skipping")
      }
      //this.browser.loadGenome({"id": this.model.get('genome')})
    },

    add_track_view: function(child) {
      console.log('add_track_view with child :', child)
      if (!this.tracks_initialized) {
        console.log("track_view not yet initialized, skipping");
        return
      }
      igv.browser.loadTrack(child.attributes)
          .then(function (newTrack) {
              console.log("new track loaded in browser: " + newTrack.name)
            })
          .catch(function(error) {
            console.log("error loading Track: ", error)
          })
    },

    remove_track_view: function(child) {
      console.log('removing Track to genome', child)
    }
});


module.exports = {
    IgvModel: IgvModel,
    IgvBrowser: IgvBrowser,
    ReferenceGenomeView: ReferenceGenomeView,
    ReferenceGenomeModel: ReferenceGenomeModel,
    TrackView: TrackView,
    TrackModel: TrackModel,
};
