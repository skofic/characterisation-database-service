/**
 * dataset.js
 *
 * This set of services can be used to perform basic CRUD operations on datasets.
 */
'use strict'

///
// Imports.
///
const dd = require('dedent')
const joi = require('joi')
const httpError = require('http-errors')
const status = require('statuses')
const {aql, db} = require('@arangodb')
const {errors} = require('@arangodb')
const {context} = require('@arangodb/locals')
const createRouter = require('@arangodb/foxx/router')

///
// Messages.
///
const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code
const HTTP_NOT_FOUND = status('not found')
const HTTP_CONFLICT = status('conflict')

///
// Globals.
///
const Model = require('../models/dataset')
const ModelQuery = require('../models/datasetQuery')
const keySchema = joi.string()
	.required()
	.description('The key of the dataset')
const keyListSchema = joi.array()
	.items(joi.string())
	.required()
	.description('The list of dataset keys')

///
// Collections.
///
const database = require('../globals/database')
const collection = db._collection(database.documentCollections.dataset)

///
// Parameters.
///
const parameters = [
	"project", "dataset",
	"date", "date_submission",
	"subject", "domain", "tag",
	"variable",
	"title", "description"
]


///
// Router.
///
const router = createRouter()
module.exports = router

///
// Service tag.
///
router.tag('Dataset')


/**
 * SERVICES
 */


/**
 * Select datasets.
 *
 * The service allows selecting datasets based on a series of selection criteria.
 *
 */
router.post(
	'query/key',
	(req, res) => {
		try{
			res.send(testQuery(req, res))
		} catch (error) {
			throw error                                                         // ==>
		}
	},
	'queryDatasetKeys'
)
	.summary('Query dataset keys')
	.description(dd`
		Retrieve dataset keys based on a set of query parameters, fill body with selection \
		criteria and the service will return matching list of dataset keys.
	`)
	.body(ModelQuery, dd`
		The body is an object that contains the query parameters: \		
		- \`project\`: Project code, provide a list of project codes.
		- \`dataset\`: dataset code, provide a list of dataset codes.
		- \`date\`: Dataset date range, provide start and end dates with inclusion flags.
		- \`date_submission\`: Dataset submission date range, provide start and end dates with inclusion flags.
		- \`subject\`: Dataset data subjects, provide list of subjects.
		- \`domain\`: Dataset data domains, provide list of domains.
		- \`tag\`: Dataset data tags, provide list of tags.
		- \`variable\`: Dataset data descriptors, provide list of global identifiers.
		- \`title\`: Dataset data title text, provide keywords.
		- \`description\`: Dataset data description text, provide keywords.
		Remove the properties that do not have selection values.
	`)
	.response(keyListSchema)


/**
 * UTILITIES
 */


function testQuery(request, response)
{
	///
	// Get valid query parameters.
	///
	const query_parameters = {}
	for (const parameter of parameters) {
		if (request.body[parameter] !== undefined) {
			switch (parameter) {
				case "date":
				case "date_submission":
					query_parameters[parameter] = request.body[parameter]
					break;
				default:
					if (request.body[parameter].length > 0) {
						query_parameters[parameter] = request.body[parameter]
					}
					break;
			}
		}
	}

	///
	// Check if empty.
	///
	if(Object.keys(query_parameters).length === 0) {
		return []                                                               // ==>
	}

	///
	// Parse filters.
	///
	const filters = []
	for(const [key, value] of Object.entries(query_parameters)) {
		switch (key) {
			case 'project':
				filters.push(`doc.std_project IN [${value}]`)
				break
			case "dataset":
				filters.push(`doc.std_dataset IN [${value}]`)
				break
			case "date":
				filters.push(`IN_RANGE(doc.std_date, ${value.start}, ${value.end}, ${value.include_start}, ${value.include_end})`)
				break
			case "date_submission":
				filters.push(`IN_RANGE(doc.std_date_submission, ${value.start}, ${value.end}, ${value.include_start}, ${value.include_end})`)
				break
			case "subject":
				filters.push(`doc._subject IN [${value}]`)
				break
			case "domain":
				filters.push(`doc._domain ANY IN [${value}]`)
				break
			case "tag":
				filters.push(`doc._tag ANY IN [${value}]`)
				break
			case "variable":
				filters.push(`doc.std_terms ANY IN [${value}]`)
				break
			case "title":
			case "description":
				break
		}
	}

	return `${filters.join(' AND ')}`

	///
	// Build filters block.
	///
	const query = aql`
		FOR doc IN ${collection}
			FILTER ${filters.join(' AND \n')}
		RETURN doc._key
	`

	///
	// Query.
	///
	return db._query(query).toArray()                                           // ==>

} // testQuery()
