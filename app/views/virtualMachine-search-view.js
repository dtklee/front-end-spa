/*global Backbone*/

var template = require('./templates/virtualMachine-search');
var VirtualMachines = require('../models/virtualMachines');
var VirtualMachineResultsView = require("./virtualMachine-results-view");
var form_helper = require('../lib/form_helper');

module.exports = Backbone.View.extend({
	tagName: 'div',
	template: template,

	initialize: function initializeVirtualMachineSearch() {
		this.searchResults = new VirtualMachines();

		//handle the search action
		this.listenTo(this.searchResults, 'reset', this.renderSearchResult);
		//The view subscribe to the validation event of the model.
		this.listenTo(this.model, 'validated:valid', this.modelValid);
		this.listenTo(this.model, 'validated:invalid', this.modelInValid);
		//handle the clear criteria action
		this.listenTo(this.model, 'change', this.render);
	},

	events: {
		"submit form": 'searchVirtualMachine',
		"click button#resetBtn": 'clearSearchCriteria',
	},

	render: function renderVirtualMachineSearch() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},

	searchVirtualMachine: function searchVirtualMachine(event) {
		event.preventDefault();
		//bind form fields on model
		form_helper.formModelBinder({
			inputs: $('input', this.$el)
		}, this.model);
		this.model.validate()
	},

	//When there is a validation problem, we put the errors into the model in order to display them in the form.
	modelInValid: function searchModelInValid(model, errors) {
		this.model.set({
			'errors': errors
		});
		this.render();
	},

	//When the model is valid, the  process continue.
	modelValid: function modelValid(model) {
		this.model.unset('errors');
		this.searchResults.reset([{
			name: "toto",
			nbCpu: 2,
			memory: 4
		}, {
			name: "tata",
			nbCpu: 2,
			memory: 4
		}, {
			name: "titi",
			nbCpu: 2,
			memory: 4
		}]);
	},

	renderSearchResult: function renderSearchResult() {
		if (this.searchResults !== undefined) {
			if(this.searchResults.length === 0){
				/*Backbone.Notification.addNotification({
					type: 'info',
					message: i18n.t('virtualMachine.search.noResult')
				}, true);*/
			}else{
				var virtualMachineResultsView = new VirtualMachineResultsView({
					model: this.searchResults
				});
				$('div#results').html(virtualMachineResultsView.render().el);
			}
		}
	},

	clearSearchCriteria: function clearSearchCriteria(){
		event.preventDefault();
		//Backbone.Notification.clearNotifications();
		this.model.clear();
	}
});