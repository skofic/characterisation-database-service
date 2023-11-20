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
		count: joi.number()
			.required()
			.integer()
			.description("Number of data records in dataset."),
		_classes: joi.array()
			.required()
			.items(joi.string())
			.description("Data descriptor classes"),
		_domain: joi.array()
			.required()
			.items(joi.string())
			.description("Data domains"),
		_tag: joi.array()
			.items(joi.string())
			.description("Data tags"),
		_subjects: joi.array()
			.required()
			.items(joi.string())
			.description("Data subject"),
		std_terms: joi.array()
			.required()
			.items(joi.string())
			.description("List of descriptors"),
		std_terms_quant: joi.array()
			.items(joi.string())
			.description("List of quantitative descriptors"),
		species_list: joi.array()
			.items(joi.string())
			.description("List of species in data, if any."),
		std_date_start: joi.string()
			.description("Data start date, inclusive."),
		std_date_end: joi.string()
			.description("Data end date, inclusive.")
	}),

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
