/**
 * dataset.js
 *
 * Dataset model.
 */
'use strict'

const _ = require('lodash')
const joi = require('joi')

module.exports = {

	schema: joi.object({
		// Describe the attributes with joi here
		_domain: joi.array()
			.required()
			.items(joi.string())
			.description("Data domains"),
		_tag: joi.array()
			.items(joi.string())
			.description("Data tags"),
		_subjects: joi.string()
			.required()
			.description("Data subject"),
		_classes: joi.array()
			.required()
			.items(joi.string())
			.description("Data descriptor classes")
	}).unknown(true),

	forClient(obj) {
		// Implement outgoing transformations here
		obj = _.omit(obj, ['_id', '_rev', '_oldRev'])
		return obj
	},

	fromClient(obj) {
		// Implement incoming transformations here
		return obj
	}

}
