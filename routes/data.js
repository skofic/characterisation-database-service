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
const status = require('statuses')
const {aql, db} = require('@arangodb')
const {errors} = require('@arangodb')
const createRouter = require('@arangodb/foxx/router')

///
// Globals.
///
const Model = require('../models/data')
const ModelQuery = require('../models/dataQuery')
const opSchema = joi.string()
	.valid('AND', 'OR')
	.default('AND')
	.required()
	.description("Chaining operator for query filters")
const datasetSchema = joi.string()
	.required()
	.description("The dataset identifier")
const queryStartSchema = joi.number()
	.integer()
	.default(0)
	.required()
	.description("The query results start element")
const queryLimitSchema = joi.number()
	.integer()
	.default(25)
	.required()
	.description("The query number of elements")

///
// Query parameters.
///
const QueryParameters = [
	'std_dataset_id', 'gcu_id_number',
	'std_date',
	'species',
	'tree_code'
]

///
// Collections.
///
const database = require('../globals/database')


///
// Router.
///
const router = createRouter()
module.exports = router

///
// Service tag.
///
router.tag('Data')


/**
 * SERVICES
 */


/**
 * Query data.
 *
 * The service allows selecting data based on a series of selection criteria,
 * it will return the list of matching data records.
 */
router.post(
	'query/:op',
	(req, res) => {
		try{
			res.send(searchData(req, res))
		} catch (error) {
			throw error                                                         // ==>
		}
	},
	'queryData'
)
	.summary('Query data')
	.description(dd`
		Retrieve data records based on a set of query parameters, fill body with selection \
		criteria and the service will return matching list of data records.
	`)

	.pathParam('op', opSchema)
	.body(ModelQuery, dd`
		The body is an object that contains the query parameters:
		- \`std_dataset_id\`: Dataset unique identifier, provide a list of matching dataset keys.
		- \`gcu_id_number\`: GCU identifier, provide a wildcard search string.
		- \`std_date\`: Data measurement date range, provide start and end dates with inclusion flags.
		- \`species\`: Scientific name, provide space delimited keywords.
		- \`tree_code\`: Tree identifier codes, provide list of tree codes.
		Omit the properties that you don't want to search on.
	`)
	.response([Model])

/**
 * Dataset data.
 *
 * The service allows selecting data from the provided dataset identifier.
 */
router.get(
	'dataset/:dataset/:start/:limit',
	(req, res) => {
		try{
			res.send(datasetData(req, res))
		} catch (error) {
			throw error                                                         // ==>
		}
	},
	'datasetData'
)
	.summary('Get all dataset data records')
	.description(dd`
		Retrieve data records belonging to the provided dataset.
		Provide the dataset identifier, the start element and the elements count in the path parameters.
	`)

	.pathParam('dataset', datasetSchema)
	.pathParam('start', queryStartSchema)
	.pathParam('limit', queryLimitSchema)

	.response([Model])


/**
 * HANDLERS
 */


/**
 * Search data and return matching records.
 *
 * This service allows querying data based on a set oc search criteria,
 * and will return the matching data records.
 *
 * @param request
 * @param response
 * @returns {[Object]}
 */
function searchData(request, response)
{
	///
	// Get chain operator.
	///
	const op = request.pathParams.op

	///
	// Get query filters.
	//
	const filters = dataQueryFilters(request, response)
	if(filters.length === 0) {
		return []                                                               // ==>
	}

	///
	// Build filters block.
	///
	const query = aql`
		FOR doc IN VIEW_DATA
			SEARCH ${aql.join(filters, ` ${op} `)}
		RETURN doc
	`

	///
	// Query.
	///
	return db._query(query).toArray()                                           // ==>

} // searchData()

/**
 * Return dataset data records.
 *
 * This service expects a dataset identifier as a path parameter,
 * and will return all data records belonging to that dataset.
 *
 * The service also expects the query start and limit
 *
 * @param request
 * @param response
 * @returns {[Object]}
 */
function datasetData(request, response)
{
	///
	// Get chain operator.
	///
	const dset = request.pathParams.dataset
	const start = request.pathParams.start
	const limit = request.pathParams.limit

	///
	// Determine dataset type.
	///
	let query
	const dataset = db._document(database.documentCollections.dataset + '/' + dset)
	if(dataset.hasOwnProperty('std_dataset_markers'))
	{
		///
		// Build filters block.
		///
		query = aql`
		LET attrs = ["_id", "_key", "_rev", "std_dataset_id"]
		
		FOR set IN VIEW_DATASET
		    SEARCH set._key == ${dset}
		    
		    LET idx = set.std_dataset_markers[*].chr_GenIndex
		        
		    FOR dat IN VIEW_DATA
		        SEARCH dat.std_dataset_id == ${dset}
		        
		        LET meta = (
		            FOR doc IN set.std_dataset_markers
		                FILTER doc.species == dat.species
		                
		            RETURN {
		                [CONCAT_SEPARATOR("_", doc.chr_GenIndex, "marker")]: doc.chr_SequenceLength == null ? {
		                    [doc.chr_GenIndex]: dat[doc.chr_GenIndex],
		                    chr_MarkerType: doc.chr_MarkerType,
		                    chr_NumberOfLoci: doc.chr_NumberOfLoci,
		                    chr_GenoTech: doc.chr_GenoTech
		                } : {
		                    [doc.chr_GenIndex]: dat[doc.chr_GenIndex],
		                    chr_MarkerType: doc.chr_MarkerType,
		                    chr_NumberOfLoci: doc.chr_NumberOfLoci,
		                    chr_SequenceLength: doc.chr_SequenceLength,
		                    chr_GenoTech: doc.chr_GenoTech
		                }
		            }
		        )
		    
		    RETURN MERGE(
		        UNSET(dat, APPEND(attrs, idx)),
		        MERGE_RECURSIVE(meta)
		    )
		`
	}
	else
	{
		///
		// Build filters block.
		///
		query = aql`
			FOR doc IN VIEW_DATA
				SEARCH doc.std_dataset_id == ${dset}
				LIMIT ${start}, ${limit}
			RETURN doc
		`
	}

	///
	// Query.
	///
	return db._query(query).toArray()                                           // ==>

} // datasetData()


/**
 * UTILITIES
 */


/**
 * Return data query filters.
 *
 * This function will return the list of filters needed to query data.
 *
 * @param request {Object}: Service request.
 * @param response {Object}: Service response.
 * @returns {[String]}: Array of AQL filter conditions.
 */
function dataQueryFilters(request, response)
{
	///
	// Get valid query parameters.
	///
	const parameters = {}
	for (const parameter of QueryParameters) {
		if (request.body[parameter] !== undefined) {
			switch (parameter) {
				case 'gcu_id_number':
				case 'std_date':
				case 'species':
					parameters[parameter] = request.body[parameter]
					break
				default:
					if (request.body[parameter].length > 0) {
						parameters[parameter] = request.body[parameter]
					}
					break
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
			case 'std_dataset_id':
			case 'tree_code':
				parts.push(aql`doc[${key}] IN ${value}`)
				break
			// Match value string.
			case 'gcu_id_number':
				parts.push(aql`LIKE(doc[${key}], ${value})`)
				break
			// Match dates.
			case 'std_date':
				parts.push(aql`IN_RANGE(doc[${key}], ${value.start}, ${value.end}, ${value.include_start}, ${value.include_end})`)
				break
			// Match text.
			case 'species':
				parts.push(aql`ANALYZER(doc[${key}] IN TOKENS(${value}, "text_en"), "text_en")`)
				break
		}
	}

	return parts                                                                // ==>

} // dataQueryFilters()
