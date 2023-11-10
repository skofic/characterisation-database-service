/**
 * dataQuery.js
 *
 * Dataset query model.
 */
'use strict'

const _ = require('lodash')
const joi = require('joi')

module.exports = {

	schema: joi.object({
		// Describe the attributes with joi here
		std_dataset_id: joi.array()
			.items(joi.string())
			.description("Dataset identifiers"),
		gcu_id_number: joi.string()
			.description("GCU identifier wildcard"),
		std_date: joi.object({
			start: joi.string()
				.required(),
			end: joi.string()
				.required(),
			include_start: joi.boolean()
				.required(),
			include_end: joi.boolean()
				.required()
		}).description("Dataset measurement date range"),
		species: joi.string()
			.description("Scientific name tokens"),
		tree_code: joi.array()
			.items(joi.string())
			.description("Tree identifiers")
	})
		.description("Dataset search parameters"),

	forClient(obj) {
		// Implement outgoing transformations here
		obj = _.omit(obj, ['_id', '_key', '_rev', '_oldRev'])
		return obj
	},

	fromClient(obj) {
		// Implement incoming transformations here
		return obj
	}

}
