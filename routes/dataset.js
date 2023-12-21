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
const {aql, db} = require('@arangodb')
const createRouter = require('@arangodb/foxx/router')
const queryFilters = require('../utils/queryFilters')

///
// Errors.
///
const status = require('statuses')
const httpError = require('http-errors')

//
// Error codes.
//
const HTTP_NOT_FOUND = status('not found');

///
// Globals.
///
const Model = require('../models/dataset')
const ModelDescription = dd`
	The dataset record contains the following properties:
	- \`_key\`: The dataset unique identifier.
	- \`std_project\`: Dataset project code.
	- \`std_dataset\`: Dataset code or acronym.
	- \`std_date_submission\`: Dataset submission date.
	- \`std_terms_key\`: List of key fields.
	- \`std_terms_summary\`: List of summary fields
	- \`_subject\`: Dataset data subject.
	- \`_title\`: Dataset title.
	- \`_description\`: Dataset description.
	- \`_citation\`: Required citations.
	- \`count\`: Number of data records.
	- \`std_date_start\`: Data date range start.
	- \`std_date_edd\`: Data date range end.
	- \`_subjects\`: List of subjects featured in data descriptors.
	- \`_classes\`: List of classes featured in data descriptors.
	- \`_domain\`: List of domains featured in data descriptors.
	- \`_tag\`: List of tags featured in data descriptors.
	- \`species_list\`: List of species featured in data.
	- \`std_terms\`: List of variables featured in data.
	- \`std_terms_quant\`: List of quantitative variables featured in data.
	- \`std_dataset_markers\`: List of species/markers combinations.`
const ModelQuery = require('../models/datasetQuery')
const ModelQueryDescription = dd`
	The body is an object that contains the query parameters:
	- \`_key\`: Provide a list of matching dataset unique identifiers.
	- \`std_project\`: Provide a list of matching project codes.
	- \`std_dataset\`: Provide a wildcard search string for the dataset code.
	- \`std_date\`: Data date range, provide search values for start and end dates.
	- \`std_date_submission\`: Dataset submission date range, provide start and end dates.
	- \`_title\`: Provide space delimited keywords to search dataset title.
	- \`_description\`: Provide space delimited keywords to search dataset description.
	- \`_citation\`: Provide space delimited keywords to search dataset citations.
	- \`std_terms_key\`: Provide list of dataset key fields with all or any selector.
	- \`std_terms_summary\`: Provide list of dataset summary fields with all or any selector.
	- \`count\`: Provide data records count range.
	- \`_subject\`: Provide list of matching subjects.
	- \`_classes\`: Provide list of matching classes.
	- \`_domain\`: Provide list of matching domains.
	- \`_tag\`: Provide list of dataset tags with all or any selector.
	- \`species_list\`: Provide space delimited keywords to search species.
	- \`std_terms\`: Provide list of featured variables in the dataset with all or any selector.
	- \`std_terms_quant\`: Provide list of featured quantitative variables in the dataset with all or any selector.
	Omit the properties that you don't want to search on.`
const ModelCategories = require('../models/datasetCategories')
const ModelCategoriesDescription = dd`
	The service will return the following dataset statistics:
	- \`count\`: Number of data records.
	- \`std_date_start\`: Data start date.
	- \`std_date_endt\`: Data end date.
	- \`_subject\`: List of subjects featured in data descriptors.
	- \`_classes\`: List of classes featured in data descriptors.
	- \`_domain\`: List of domains featured in data descriptors.
	- \`_tag\`: List of tags featured in data descriptors.
	- \`species_list\`: List of species featured in data.
	- \`std_terms\`: List of descriptors featured in data.
	- \`std_terms_quant\`: List of quantitative descriptors featured in data.`
const ErrorModel = require("../models/error_generic");
const opSchema = joi.string()
	.valid("AND", "OR")
	.default("AND")
	.required()
	.description('Chaining operator for query filters')
const keySchema = joi.string()
	.required()
	.description('The dataset key')
const keyListSchema = joi.array()
	.items(joi.string())
	.required()
	.description('The list of dataset keys')

///
// Query parameters.
///
// const QueryParameters = [
// 	"_key",
// 	"std_project", "std_dataset",
// 	"std_date", "std_date_submission",
// 	"_domain", "_tag", "_subjects", "_classes",
// 	"std_terms",
// 	"_title", "_description"
// ]

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
 * Query datasets.
 *
 * The service allows selecting datasets based on a series of selection criteria,
 * it will return the list of matching dataset objects.
 */
router.post(
	'query/obj/:op',
	(req, res) => {
		try{
			res.send(searchDatasetObjects(req, res))
		} catch (error) {
			throw error                                                         // ==>
		}
	},
	'queryDatasetObjects'
)
	.summary('Query datasets')
	.description(dd`
		Retrieve dataset objects based on a set of query parameters, fill body \
		with selection criteria and the service will return matching list of \
		dataset objects.
	`)

	.pathParam('op', opSchema)
	.body(ModelQuery, ModelQueryDescription)
	.response([Model], ModelDescription)

/**
 * Get dataset data descriptor qualifications.
 *
 * The service will return the list of classes, domains,tags and subjects
 * belonging to the provided dataset descriptors. The service will also return
 * the list of descriptors comprising the data of the dataset.
 *
 * Note that these qualifications are part of the dataset record, this service
 * will return the refreshed list of qualifications according only to the dataset's
 * data.
 */
router.get(
	'qual/:key',
	(req, res) => {
		try{
			res.send(getDatasetCategories(req, res))
		} catch (error) {
			throw error                                                         // ==>
		}
	},
	'getDatasetCategories'
)
	.summary('Get dataset summary')
	.description(dd`
		Return data summaries related to provided dataset key.
		The service will scan all dataset data records and compile a series of \
		summaries. This data should already be part of the dataset record, \
		except that in this case the statistics are returned dynamically.
	`)

	.pathParam('key', keySchema)
	.response(ModelCategories, ModelCategoriesDescription)

/**
 * Update dataset.
 *
 * The service will retrieve dynamically the data summaries and update the
 * dataset records.
 *
 * You should use this service whenever the dataset data changes. The service
 * will retrieve the summary data and replace it in the dataset records.
 */
router.put(
	'update',
	(req, res) => {
		try{
			res.send(updateDataset(req, res))
		} catch (error) {
			throw error                                                         // ==>
		}
	},
	'updateDatasets'
)
	.summary('Update datasets')
	.description(dd`
		Update the summary data in the datasets.
		This service should be used whenever the dataset data changes: it will
		update the summary data and replace the dataset records.
		Provide in the body the list of dataset keys.
	`)

	.body(keyListSchema)
	.response(200, [Model], ModelDescription)
	.response(404, ErrorModel, dd`Record not found.`)


/**
 * HANDLERS
 */


/**
 * Search datasets and return matching objects.
 *
 * This service allows querying datasets based on a set oc search criteria,
 * and will return the matching dataset objects.
 *
 * @param request
 * @param response
 * @returns {[Object]}
 */
function searchDatasetObjects(request, response)
{
	///
	// Get chain operator.
	///
	const op = request.pathParams.op

	///
	// Get query filters.
	//
	const filters = datasetQueryFilters(request, response)
	if(filters.length === 0) {
		return []                                                               // ==>
	}

	///
	// Build filters block.
	///
	const query = aql`
		FOR doc IN VIEW_DATASET
			SEARCH ${aql.join(filters, ` ${op} `)}
		RETURN doc
	`

	///
	// Query.
	///
	return db._query(query).toArray()                                           // ==>

} // searchDatasetObjects()

/**
 * Get dataset data qualifications.
 *
 * This function will collect all descriptors of the dataset's data and return
 * the aggregated catalogue of all descriptor classes, domains, tags, subjects
 * and the list of descriptors.
 *
 * @param request
 * @param response
 * @returns {[Object]}
 */
function getDatasetCategories(request, response)
{
	///
	// Get chain operator.
	///
	const key = request.pathParams.key

	///
	// Build filters block.
	///
	const query = aql`
		FOR dset IN VIEW_DATASET
		    SEARCH dset._key == ${key}
		    
		    LET data = (
		        FOR dat IN VIEW_DATA
		            SEARCH dat.std_dataset_id == dset._key
		            COLLECT AGGREGATE items = COUNT(),
		                              vars = UNIQUE(ATTRIBUTES(dat, true)),
		                              taxa = SORTED_UNIQUE(dat.species),
									  start = MIN(dat.std_date),
									  end = MAX(dat.std_date)
		        RETURN {
		            count: items,
		            std_terms: REMOVE_VALUES(SORTED_UNIQUE(FLATTEN(vars)), ['std_dataset_id', '_private']),
		            species_list: taxa,
		            std_date_start: start,
		            std_date_end: end
		        }
		    )[0]
		
		    LET quantitative = (
		        FOR doc IN terms
		            FILTER doc._key IN data.std_terms
		            FILTER doc._data._class IN ["_class_quantity", "_class_quantity_calculated", "_class_quantity_averaged"]
		        RETURN doc._key
		    )
		
		    LET categories = (
		        FOR doc IN terms
		            FILTER doc._key IN data.std_terms
		            COLLECT AGGREGATE classes = UNIQUE(doc._data._class),
		                              domains = UNIQUE(doc._data._domain),
		                              tags = UNIQUE(doc._data._tag),
		                              subjects = UNIQUE(doc._data._subject)
		        RETURN {
		            _classes: SORTED_UNIQUE(REMOVE_VALUE(classes, null)),
		            _domain: SORTED_UNIQUE(REMOVE_VALUE(FLATTEN(domains), null)),
		            _tag: SORTED_UNIQUE(REMOVE_VALUE(FLATTEN(tags), null)),
		            _subjects: SORTED_UNIQUE(REMOVE_VALUE(subjects, null))
		        }
		    )[0]
		
		RETURN {
			count: data.count,
		    std_date_start: data.std_date_start,
		    std_date_end: data.std_date_end,
		    _subjects: categories._subjects,
		    _classes: categories._classes,
		    _domain: categories._domain,
		    _tag: categories._tag,
		    species_list: data.species_list,
		    std_terms: data.std_terms,
		    std_terms_quant: quantitative
		}
	`

	///
	// Query.
	///
	let result = {}
	const recs = db._query(query).toArray()

	///
	// Check result.
	///
	if(Object.keys(recs).length !== 0) {
		result = recs[0]
		for(const [key, value] of Object.entries(result)) {
			if(result[key] === null) {
				delete result[key]
			} else if(Array.isArray(value) && value.length === 0) {
				delete result[key]
			}
		}
	}

	///
	// Query.
	///
	return result                                                               // ==>

} // getDatasetCategories()

/**
 * Update dataset.
 *
 * This function will retrieve the dataset records and statistics identified
 * by the list of dataset keys parameter in the body.
 *
 * Once retrieved the updated dataset records it will replace them in the
 * database.
 *
 * @param request
 * @param response
 * @returns {[Object]}
 */
function updateDataset(request, response)
{
	///
	// Get chain operator.
	///
	const keys = request.body

	///
	// Build filters block.
	///
	let query = aql`
		LET records = (
		    FOR dset IN VIEW_DATASET
		        SEARCH dset._key IN ${keys}
		    RETURN UNSET(
		        dset,
		        [
		            "_id", "_rev",
		            "count",
		            "std_date_start", "std_date_end",
		            "_subjects", "_classes", "_domain", "_tag",
		            "species_list",
		            "std_terms", "std_terms_quant"
		        ]
		    )
		)
		
		FOR record IN records
		    LET data = (
		        FOR dat IN VIEW_DATA
		            SEARCH dat.std_dataset_id == record._key
		            COLLECT AGGREGATE items = COUNT(),
		                              vars = UNIQUE(ATTRIBUTES(dat, true)),
		                              taxa = SORTED_UNIQUE(dat.species),
		                              start = MIN(dat.std_date),
		                              end = MAX(dat.std_date)
		        RETURN {
		            count: items,
		            std_terms: REMOVE_VALUES(
		                SORTED_UNIQUE(FLATTEN(vars)),
		                ['std_dataset_id', '_private']
		            ),
		            species_list: taxa,
		            std_date_start: start,
		            std_date_end: end
		        }
		    )[0]
		
		    LET quantitative = (
		        FOR doc IN terms
		            FILTER doc._key IN data.std_terms
		            FILTER doc._data._class IN ["_class_quantity", "_class_quantity_calculated", "_class_quantity_averaged"]
		        RETURN doc._key
		    )
		    
		    LET categories = (
		        FOR doc IN terms
		            FILTER doc._key IN data.std_terms
		            COLLECT AGGREGATE classes = UNIQUE(doc._data._class),
		                              domains = UNIQUE(doc._data._domain),
		                              tags = UNIQUE(doc._data._tag),
		                              subjects = UNIQUE(doc._data._subject)
		        RETURN {
		            _classes: SORTED_UNIQUE(REMOVE_VALUE(classes, null)),
		            _domain: SORTED_UNIQUE(REMOVE_VALUE(FLATTEN(domains), null)),
		            _tag: SORTED_UNIQUE(REMOVE_VALUE(FLATTEN(tags), null)),
		            _subjects: SORTED_UNIQUE(REMOVE_VALUE(subjects, null))
		        }
		    )[0]
		
		RETURN MERGE(
		    record,
		    {
		        count: data.count,
		        std_date_start: data.std_date_start,
		        std_date_end: data.std_date_end,
		        _subjects: categories._subjects,
		        _classes: categories._classes,
		        _domain: categories._domain,
		        _tag: categories._tag,
		        species_list: data.species_list,
		        std_terms: data.std_terms,
		        std_terms_quant: quantitative
		    }
		)
	`

	///
	// Query updated dataset records.
	///
	const datasets = db._query(query).toArray()
	for(const dataset of datasets)
	{
		///
		// Clean dataset.
		///
		for(const [key, value] of Object.entries(dataset))
		{
			///
			// Delete null properties.
			///
			if(dataset[key] === null) {
				delete dataset[key]
			}

			///
			// Handle arrays.
			///
			if(Array.isArray(value))
			{
				///
				//Remove array null elements.
				///
				for (let i = value.length - 1; i >= 0; i--) {
					if (value[i] === null) {
						value.splice(i, 1);
					}
				}

				///
				// Remove empty arrays.
				///
				if(value.length === 0) {
					delete dataset[key]
				}
			}

			///
			// Replace dataset.
			///
			db._query(aql`REPLACE ${dataset} IN dataset`)
		}
	}

	return datasets                                                     // ==>

} // updateDataset()


/**
 * UTILITIES
 */


/**
 * Return dataset query filters.
 *
 * This function will return the list of filters needed to query datasets.
 *
 * @param request {Object}: Service request.
 * @param response {Object}: Service response.
 * @returns {[String]}: Array of AQL filter conditions.
 */
function datasetQueryFilters(request, response)
{
	///
	// Iterate body properties.
	///
	const filters = []
	for(const [key, value] of Object.entries(request.body)) {
		///
		// Parse body properties.
		///
		let filter = null
		switch(key) {
			case '_key':
			case 'std_project':
			case '_subject':
				filter = queryFilters.filterList(key, value)
				break

			case'std_dataset':
				filter = queryFilters.filterPattern(key, value)
				break

			case '_title':
			case '_description':
				filter = queryFilters.filterTokens(`${key}.iso_639_3_eng`, value, 'text_en')
				break

			case '_citation':
			case 'species_list':
				filter = queryFilters.filterTokens(key, value, 'text_en')
				break

			case 'std_date':
				filter = queryFilters.filterDateRange(value)
				break

			case 'std_date_submission':
			case 'count':
				filter = queryFilters.filterIntegerRange(key, value)
				break

			case '_classes':
			case '_domain':
			case '_tag':
			case 'std_terms_key':
			case 'std_terms_summary':
			case 'std_terms':
			case 'std_terms_quant':
				filter = queryFilters.filterLists(key, value, value.doAll)
				break
		}

		///
		// Add clause.
		///
		if(filter !== null) {
			filters.push(filter)
		}
	}

	return filters                                                      // ==>

} // datasetQueryFilters()
