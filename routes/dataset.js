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

///
// Globals.
///
const Model = require('../models/dataset')
const ModelQuery = require('../models/datasetQuery')
const ModelCategories = require('../models/datasetCategories')
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
const QueryParameters = [
	"_key",
	"std_project", "std_dataset",
	"std_date", "std_date_submission",
	"_domain", "_tag", "_subjects", "_classes",
	"std_terms",
	"_title", "_description"
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
 * Query datasets.
 *
 * The service allows selecting datasets based on a series of selection criteria,
 * it will return the list of matching dataset keys.
 */
router.post(
	'query/key/:op',
	(req, res) => {
		try{
			res.send(searchDatasetKeys(req, res))
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

	.pathParam('op', opSchema)
	.body(ModelQuery, dd`
		The body is an object that contains the query parameters:
		- \`_key\`: Dataset unique identifier, provide a list of matching dataset keys.
		- \`std_project\`: Project code, provide a list of matching project codes.
		- \`std_dataset\`: Dataset code, provide a wildcard search string.
		- \`std_date\`: Dataset date range, provide start and end dates with inclusion flags.
		- \`std_date_submission\`: Dataset submission date range, provide start and end dates with inclusion flags.
		- \`_domain\`: Dataset data domains, provide list of domain codes.
		- \`_tag\`: Dataset data tags, provide list of tag codes.
		- \`_subjects\`: Dataset data subjects, provide list of subject codes.
		- \`_classes\`: Dataset data subjects, provide list of subject codes.
		- \`std_terms\`: Dataset data descriptors, provide list of global identifiers.
		- \`_title\`: Dataset data title text, provide space delimited keywords.
		- \`_description\`: Dataset data description text, provide space delimited keywords.
		Omit the properties that you don't want to search on.
	`)
	.response(keyListSchema)

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
	.summary('Query dataset objects')
	.description(dd`
		Retrieve dataset objects based on a set of query parameters, fill body with selection \
		criteria and the service will return matching list of dataset objects.
	`)

	.pathParam('op', opSchema)
	.body(ModelQuery, dd`
		The body is an object that contains the query parameters:
		- \`_key\`: Dataset unique identifier, provide a list of matching dataset keys.
		- \`std_project\`: Project code, provide a list of matching project codes.
		- \`std_dataset\`: Dataset code, provide a wildcard search string.
		- \`std_date\`: Dataset date range, provide start and end dates with inclusion flags.
		- \`std_date_submission\`: Dataset submission date range, provide start and end dates with inclusion flags.
		- \`_domain\`: Dataset data domains, provide list of domain codes.
		- \`_tag\`: Dataset data tags, provide list of tag codes.
		- \`_subjects\`: Dataset data subjects, provide list of subject codes.
		- \`_classes\`: Dataset data subjects, provide list of subject codes.
		- \`std_terms\`: Dataset data descriptors, provide list of global identifiers.
		- \`_title\`: Dataset data title text, provide space delimited keywords.
		- \`_description\`: Dataset data description text, provide space delimited keywords.
		Omit the properties that you don't want to search on.
	`)
	.response([Model])

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
	.summary('Get dataset data categories')
	.description(dd`
		Retrieve dataset objects based on a set of query parameters, fill body with selection \
		criteria and the service will return matching list of dataset objects.
		Note that this data is already in the dataset record, this service will \
		return this data dynamically by probing the dataset data records.
	`)

	.pathParam('key', keySchema)
	.response(ModelCategories)


/**
 * HANDLERS
 */


/**
 * Search datasets and return matching keys.
 *
 * This service allows querying datasets based on a set oc search criteria,
 * and will return the matching dataset keys.
 *
 * @param request
 * @param response
 * @returns {[String]}
 */
function searchDatasetKeys(request, response)
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
		RETURN doc._key
	`

	///
	// Query.
	///
	return db._query(query).toArray()                                           // ==>

} // searchDatasetKeys()

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
		
		RETURN HAS(dset, 'std_dataset_markers')
			 ? {
			    _key: dset._key,
			    std_project: dset.std_project,
			    std_dataset: dset.std_dataset,
			    std_date_submission: dset.std_date_submission,
			    _title: dset._title,
			    _description: dset._description,
			    _citation: dset._citation,
			    count: data.count,
			    _subject: dset._subject,
			    _subjects: categories._subjects,
			    std_terms_key: dset.std_terms_key,
			    std_terms_summary: dset.std_terms_summary,
			    std_date_start: data.start,
			    std_date_end: data.end,
			    _domain: categories._domain,
			    _tag: categories._tag,
			    _classes: categories._classes,
			    species_list: data.species_list,
			    std_terms: data.std_terms,
			    std_terms_quant: quantitative,
			    std_dataset_markers: dset.std_dataset_markers
			 } : {
			    _key: dset._key,
			    std_project: dset.std_project,
			    std_dataset: dset.std_dataset,
			    std_date_submission: dset.std_date_submission,
			    _title: dset._title,
			    _description: dset._description,
			    _citation: dset._citation,
			    count: data.count,
			    _subject: dset._subject,
			    _subjects: categories._subjects,
			    std_terms_key: dset.std_terms_key,
			    std_terms_summary: dset.std_terms_summary,
			    std_date_start: data.start,
			    std_date_end: data.end,
			    _domain: categories._domain,
			    _tag: categories._tag,
			    _classes: categories._classes,
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

		///
		// Clean data.
		///
		if(result._description === null) {
			delete result._description
		}
		if(result._citation === null) {
			delete result._citation
		}
		if(result._subjects.length === 0) {
			delete result._subjects
		}
		if(result.std_terms_summary === null) {
			delete result.std_terms_summary
		}
		if(result.std_date_start === null) {
			delete result.std_date_start
		}
		if(result.std_date_end === null) {
			delete result.std_date_end
		}
		if(result._domain.length === 0) {
			delete result._domain
		}
		if(result._tag.length === 0) {
			delete result._tag
		}
		if(result._classes.length === 0) {
			delete result._classes
		}
		if(result.species_list.length === 1 && result.species_list[0] === null) {
			delete result.species_list
		}
		if(result.std_terms_quant.length === 0) {
			delete result.std_terms_quant
		}
	}

	///
	// Query.
	///
	return result                                                               // ==>

} // getDatasetCategories()


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
	// Get valid query parameters.
	///
	const parameters = {}
	for (const parameter of QueryParameters) {
		if (request.body[parameter] !== undefined) {
			switch (parameter) {
				case "std_dataset":
				case "std_date":
				case "std_date_submission":
				case "_title":
				case "_description":
					parameters[parameter] = request.body[parameter]
					break;
				default:
					if (request.body[parameter].length > 0) {
						parameters[parameter] = request.body[parameter]
					}
					break;
			}
		}
	}

	///
	// Check if empty.
	///
	if(Object.keys(parameters).length === 0) {
		return []                                                               // ==>
	}

	///
	// Parse filters.
	///
	// const filters = [aql`FOR doc IN ${collection}`]
	const parts = []
	for(const [key, value] of Object.entries(parameters)) {
		switch (key) {
			// Match values.
			case '_key':
			case 'std_project':
			case "_domain":
			case "_tag":
			case '_subjects':
			case '_classes':
			case "std_terms":
				parts.push(aql`doc[${key}] IN ${value}`)
				break
			// Match value string.
			case 'std_dataset':
				parts.push(aql`LIKE(doc[${key}], ${value})`)
				break
			// Match dates.
			case "std_date":
			case "std_date_submission":
				parts.push(aql`IN_RANGE(doc[${key}], ${value.start}, ${value.end}, ${value.include_start}, ${value.include_end})`)
				break
			// Match text.
			case "_title":
			case "_description":
				parts.push(aql`ANALYZER(doc[${key}].iso_639_3_eng IN TOKENS(${value}, "text_en"), "text_en")`)
				break
		}
	}

	return parts                                                                // ==>

} // datasetQueryFilters()
