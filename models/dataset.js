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
		std_date: joi.string()
			.required()
			.regex(/^[0-9]+$/)
			.description("Dataset measurements date"),
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
			.description("Data descriptor classes"),
		std_terms: joi.array()
			.required()
			.items(joi.string())
			.description("Data descriptors"),
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
