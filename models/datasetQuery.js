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
		_key: joi.array()
			.items(joi.string())
			.description("Dataset identifiers"),
		std_project: joi.array()
			.items(joi.string())
			.description("Dataset project codes"),
		std_dataset: joi.string()
			.description("Dataset code or acronym wildcard"),
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
		std_date_submission: joi.object({
			start: joi.string()
				.required(),
			end: joi.string()
				.required(),
			include_start: joi.boolean()
				.required(),
			include_end: joi.boolean()
				.required()
		}).description("Dataset submission date range"),
		_domain: joi.array()
			.items(joi.string())
			.description("Data tags"),
		_tag: joi.array()
			.items(joi.string())
			.description("Data domains"),
		_subjects: joi.array()
			.items(joi.string())
			.description("Data measurement subjects"),
		_classes: joi.array()
			.items(joi.string())
			.description("Data classes"),
		std_terms: joi.array()
			.items(joi.string())
			.description("Data variables"),
		_title: joi.string()
			.description("Dataset title tokens"),
		_description: joi.string()
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
