/* global Backbone, _ , i18n, $*/
var form_helper = require('../lib/form_helper');
var RefSvc = require('../service/ServiceReferential');
var ErrorHelper = require('../lib/error_helper');

var template = require('./templates/reference');
module.exports = Backbone.View.extend({
	tagName: 'tr',
	template: template,
	/*Best practice for debugging to name the anonymous function. In order to see it in the stack trace.*/
	initialize: function initializeReferenceView() {
		this.isEdit = false;
		this.listenTo(this.model, 'validated:valid', this.modelValid);
		this.listenTo(this.model, 'validated:invalid', this.modelInValid);
		this.listenTo(this.model, 'change:errors', this.render);
		this.listenTo(this.model, 'save:success', this.saveSuccess);
		this.listenTo(this.model, 'save:error', this.saveError);
	},
	events: {
		"click button#edit": "toogleEditMode",
		"click button[type='submit']": 'save',
		"click button#cancel": "toogleEditMode"
	},
	toogleEditMode: function toogleEditMode(event) {
		event.preventDefault();
		this.isEdit = !this.isEdit;
		this.render();
	},
	save: function saveReferenceChange(event) {
		event.preventDefault();
		//Bind the model on the form.
		form_helper.formModelBinder({
			inputs: $('input', this.$el)
		}, this.model);
		// require("../lib/model-validation-promise").validate(this.model).then(function(success) {
		// 	console.log(success);
		// }).catch(function(error){console.error(error);});
		this.model.validate();
	},
	saveSuccess: function refSaveSuccess(model) {
		//console.log(model);
		Backbone.Notification.addNotification({
			type: 'success',
			message: i18n.t('reference.save.success')
		}, true);
	},
	saveError: function refSaveError(response) {
		ErrorHelper.manageResponseErrors(response, {
			isDisplay: true
		});
	},
	//When there is a validation problem, we put the errors into the model in order to display them in the form.
	modelInValid: function refModelInValid(model, errors) {
		this.model.setErrors(errors);
	},

	//When the model is valid, the  process continue.
	modelValid: function refModelValid() {
		var refView = this;
		this.model.unsetErrors();
		RefSvc.save(this.model.toJSON()).then(refView.saveSuccess).catch(refView.saveError);
	},
	render: function renderVirtualMachine() {
		this.$el.html(
			this.template(
				_.extend(
					this.model.toJSON(), {
						isEdit: this.isEdit
					})
			));
		return this;
	}
});