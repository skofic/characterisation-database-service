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
		std_date_start: joi.string()
			.regex(/^[0-9]{4,8}$/)
			.description("Data start date, inclusive."),
		std_date_end: joi.string()
			.regex(/^[0-9]{4,8}$/)
			.description("Data end date, inclusive."),
		_subjects: joi.array()
			.required()
			.items(joi.string())
			.description("Data subject"),
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
		species_list: joi.array()
			.items(joi.string())
			.description("List of species in data, if any."),
		std_terms: joi.array()
			.required()
			.items(joi.string())
			.description("List of descriptors"),
		std_terms_quant: joi.array()
			.items(joi.string())
			.description("List of quantitative descriptors")
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
