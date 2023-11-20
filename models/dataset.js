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
		_key: joi.string()
			.optional()
			.description("The key of the dataset"),
		std_project: joi.string()
			.required()
			.description("The dataset's project"),
		std_dataset: joi.string()
			.required()
			.description("The dataset's code or acronym"),
		std_date_submission: joi.string()
			.required()
			.regex(/^[0-9]+$/)
			.description("Dataset submission date"),
		_title: joi.object({
			iso_639_3_eng: joi.string().required()
		})
			.required()
			.description("Dataset title"),
		_description: joi.object({
			iso_639_3_eng: joi.string().required()
		})
			.required()
			.description("Dataset description"),
		count: joi.number()
			.integer()
			.description("Number of data records in dataset"),
		_subject: joi.string()
			.required()
			.description("Data subject"),
		_std_terms_key: joi.array()
			.required()
			.items(joi.string())
			.description("List of fields that make a data entry unique"),
		std_terms_summary: joi.array()
			.items(joi.string())
			.description("List of fields that can be used to make data summaries"),
		_domain: joi.array()
			.items(joi.string())
			.description("Data domains"),
		_tag: joi.array()
			.items(joi.string())
			.description("Data tags"),
		_classes: joi.array()
			.items(joi.string())
			.description("Data descriptor classes"),
		std_terms: joi.array()
			.items(joi.string())
			.description("Data descriptors"),
		std_terms_quant: joi.array()
			.items(joi.string())
			.description("Quantitative data descriptors"),
		std_dataset_markers: joi.array()
			.optional()
			.items(
				joi.object({
					species: joi.string().required().description("Species"),
					chr_GenIndex: joi.string().required().description("Genetic index descriptor key"),
					chr_MarkerType: joi.string().required().description("Marker type"),
					chr_NumberOfLoci: joi.number().integer().required().description("Number of Loci"),
					chr_SequenceLength: joi.number().integer().optional().description("Sequence length"),
					chr_GenoTech: joi.string().required().description("Method and technologies used")
				})
			)
			.description("Dataset genetic indexes marker combinations")
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
