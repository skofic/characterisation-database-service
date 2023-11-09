/**
 * datasetQuery.js
 *
 * Dataset query model.
 */
'use strict'

const _ = require('lodash')
const joi = require('joi')

module.exports = {

	schema: joi.object({
		// Describe the attributes with joi here
		project: joi.array()
			.items(joi.string())
			.description("Dataset project codes"),
		dataset: joi.array()
			.items(joi.string())
			.description("Dataset codes or acronyms"),
		date: joi.object({
			start: joi.string()
				.required(),
			end: joi.string()
				.required(),
			include_start: joi.boolean()
				.required(),
			include_end: joi.boolean()
				.required()
		}),
		date_submission: joi.object({
			start: joi.string()
				.required(),
			end: joi.string()
				.required(),
			include_start: joi.boolean()
				.required(),
			include_end: joi.boolean()
				.required()
		}),
		subject: joi.array()
			.items(joi.string())
			.description("Dataset measurement subjects"),
		domain: joi.array()
			.items(joi.string())
			.description("Dataset tags"),
		tag: joi.array()
			.items(joi.string())
			.description("Dataset data domains"),
		variable: joi.array()
			.items(joi.string())
			.description("Dataset data variables"),
		title: joi.array()
			.items(joi.string())
			.description("Dataset title tokens"),
		description: joi.array()
			.items(joi.string())
			.description("Dataset description tokens")
	})
		.description("Dataset search parameters"),

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
