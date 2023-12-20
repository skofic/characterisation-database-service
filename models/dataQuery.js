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
		gcu_id_number: joi.string()
			.description("GCU identifier wildcard search string"),
		std_date: joi.object({
			std_date_start: joi.string()
				.regex(/^[0-9]{4,8}$/),
			std_date_end: joi.string()
				.regex(/^[0-9]{4,8}$/)
		})
			.or('std_date_start','std_date_end')
			.description("Provide start and/or end dates"),
		species: joi.string()
			.description("Scientific name tokens search string"),
		chr_tree_code: joi.array()
			.items(joi.string())
			.description("List of tree identifiers")
	})
		.description("Data search parameters"),

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
