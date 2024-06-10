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
const httpError = require('http-errors')
const createRouter = require('@arangodb/foxx/router')
const queryFilters = require('../utils/queryFilters')

///
// Database globals.
///
const database = require('../globals/database')

///
// Globals.
///
const Model = require('../models/data')
const ModelDescription = dd`
  The service will return a list of data records, these records, will contain \
  the following attributes:
  - \`std_dataset_id\`: The dataset unique identifier, required.
  - \`std_date\`: The date of the measurement, optional.
  - \`species\`: The scientific name of the measured tree or population, optional.
  - \`gcu_id_number\`: The gene conservation unit identifier, optional.
  - \`chr_tree_code\`: The tree identifier, optional.\n
  Besides the above attributes, the records may contain any data.`
const ModelQuery = require('../models/dataQuery')
const ModelQueryDescription = dd`
	The body is an object that contains the query parameters:
	- \`gcu_id_number\`: GCU identifier, provide a wildcard search string.
	- \`std_date\`: Data measurement date range, provide start and end dates with inclusion flags.
	- \`species\`: Scientific name, provide space delimited keywords.
	- \`chr_tree_code\`: Tree identifier codes, provide list of tree codes.\n
	Omit the properties that you don't want to search on.
`
const ErrorModel = require("../models/error_generic");
const SortListModel = joi.array()
	.items(joi.string())
	.description("List of fields to sort on")
const opSchema = joi.string()
	.valid('AND', 'OR')
	.default('AND')
	.required()
	.description("Chaining operator for query filters")
const opStat = joi.string()
	.valid('MIN', 'MAX', 'AVG', 'MEDIAN', 'STDDEV', 'VARIANCE')
	.default('AVG')
	.required()
	.description("MIN: minimum; MAX: maximum; AVG: average; MEDIAN: median; STDDEV: standard deviation; VARIANCE: variance")
const opSummary = joi.string()
	.required()
	.description("Descriptor global identifier on which to summarise data. Note that it should be one of the elements of the `std_terms_summary` property in the dataset record.")
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
const sortListSchema = joi.array()
	.items(joi.string())
	.default([])
	.description("The list of fields to sort on")
const sortOrderSchema = joi.string()
	.valid("ASC", "DESC")
	.default("ASC")
	.description("The sort order")

///
// Query parameters.
///
const QueryParameters = [
	'std_dataset_id', 'gcu_id_number',
	'std_date',
	'species',
	'chr_tree_code'
]

///
// Collections and views.
///
const collection_dataset = db._collection(database.globals.collections.dataset.name)
//const collection_dataset = db._collection(database.documentCollections.dataset)


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
 * All dataset data.
 *
 * The service will return all data belonging to the provided dataset identifier,
 * the service also allows limiting data results.
 */
router.post(
	(req, res) => {
		try{
			res.send(datasetData(req, res))
		} catch (error) {
			throw error                                                         // ==>
		}
	},
	'allDatasetData'
)
	.summary('Get data records')
	.description(dd`
		Retrieve data records belonging to the provided dataset.
		Provide the dataset identifier, the start element and the elements count \
		in the path parameters, optionally provide the list of fields to sort results \
		and the order.
	`)

	.queryParam('dataset', datasetSchema)
	.queryParam('start', queryStartSchema)
	.queryParam('limit', queryLimitSchema)
	.queryParam('order', sortOrderSchema)

	.body(SortListModel)

	.response([Model], ModelDescription)

/**
 * Dataset data statistics.
 *
 * The service will return dataset statistics if possible.
 */
router.get(
	(req, res) => {
		try{
			res.send(datasetSummary(req, res))
		} catch (error) {
			throw error                                                         // ==>
		}
	},
	'datasetSummaryData'
)
	.summary('Get data statistics')
	.description(dd`
		Retrieve dataset summary data.
		Provide the dataset identifier, the desired summary statistic and the \
		descriptor global identifier on which to summarise in the path parameters.
	`)

	.queryParam('dataset', datasetSchema)
	.queryParam('stat', opStat)
	.queryParam('summary', opSummary)

	.response([joi.object()])
	.response(404, ErrorModel, "Dataset not found.")
	.response(400, ErrorModel, "All other user errors.")

/**
 * Query dataset data.
 *
 * The service will return data belonging to the provided dataset identifier
 * according to the provided query parameters, the service also allows limiting
 * data results.
 */
router.post(
	'query',
	(req, res) => {
		try{
			res.send(searchData(req, res))
		} catch (error) {
			throw error                                                         // ==>
		}
	},
	'queryDatasetData'
)
	.summary('Query data records')
	.description(dd`
		The service will allow querying the data elements belonging to the provided dataset.
	`)

	.queryParam('dataset', datasetSchema)
	.queryParam('op', opSchema)
	.queryParam('start', queryStartSchema)
	.queryParam('limit', queryLimitSchema)

	.body(ModelQuery, ModelQueryDescription)

	.response([Model])


/**
 * HANDLERS
 */


/**
 * Return all dataset data records.
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
	const dset = request.queryParams.dataset
	const start = request.queryParams.start
	const limit = request.queryParams.limit
	const order = request.queryParams.order

	const sort = request.body

	///
	// Set sort statement.
	///
	let sortElements = []
	let sortStatement = aql``
	if(sort.length > 0) {
		sortElements.push(aql`SORT`)
		sortElements.push(aql`${sort.join(", ")}`)
		sortElements.push(aql`${order}`)
		sortStatement = aql.join(sortElements, "\n")
	}

	///
	// Determine dataset type.
	///
	const query = aql`
		FOR set IN VIEW_DATASET
		    SEARCH set._key == ${dset}
		    
		    LET markers = HAS(set, 'std_dataset_markers')
		                ? set.std_dataset_markers
		                : []
		
		    FOR dat IN VIEW_DATA
		        SEARCH dat.std_dataset_id == set._key
		        LIMIT ${start}, ${limit}
		
		        LET meta = (
		            FOR doc IN markers
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
		        
		        ${sortStatement}
		
		    RETURN MERGE(
		        UNSET(
		            dat,
		            APPEND(
		                ["_id", "_key", "_rev", "std_dataset_id", "_private"],
		                set.std_dataset_markers[*].chr_GenIndex
		            )
		        ),
		        MERGE_RECURSIVE(meta)
		    )
	`

	///
	// Query.
	///
	return db._query(query).toArray()                                           // ==>

} // datasetData()

/**
 * Return dataset data summary.
 *
 * This service expects a dataset identifier, a summary statistic
 * and a field global identifier as path parameters.
 *
 * It will return the statistics indicated by the path parameter
 * on the field passed as a path parameter.
 *
 * @param request
 * @param response
 * @returns {[Object]}
 */
function datasetSummary(request, response)
{
	///
	// Globals.
	///
	let result

	///
	// Get parameters.
	///
	const dset = request.queryParams.dataset
	const stat = request.queryParams.stat
	const summary = request.queryParams.summary

	///
	// Get dataset.
	///
	const dataset = collection_dataset.document(dset)

	///
	// Check number of summary fields.
	///
	if(!dataset.hasOwnProperty('std_terms_summary')) {
		throw httpError(400, `You must have at least one summary field.`)       // ==>
	}

	///
	// Check pivot.
	///
	if(!dataset.std_terms_summary.includes(summary)) {
		throw httpError(400, `Descriptor ${summary} not a summary field.`)        // ==>
	}

	///
	// Handle genetic indexes.
	///
	if(dataset.hasOwnProperty('std_dataset_markers')) {
		return datasetGeneticSummary(request, response, dataset, stat, summary)   // ==>
	}

	return datasetDataSummary(request, response, dataset, stat, summary)          // ==>

} // datasetSummary()

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
	const op = request.queryParams.op
	const dataset = request.queryParams.dataset
	const start = request.queryParams.start
	const limit = request.queryParams.limit

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
		FOR set IN VIEW_DATASET
		    SEARCH set._key == ${dataset}
		    
		    LET markers = HAS(set, 'std_dataset_markers')
		                ? set.std_dataset_markers
		                : []
		
		    FOR dat IN VIEW_DATA
		        SEARCH dat.std_dataset_id == set._key AND
				       ( ${aql.join(filters, ` ${op} `)} )
		        LIMIT ${start}, ${limit}

		        LET meta = (
		            FOR doc IN markers
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
		        UNSET(
		            dat,
		            APPEND(
		                ["_id", "_key", "_rev", "std_dataset_id", "_private"],
		                set.std_dataset_markers[*].chr_GenIndex
		            )
		        ),
		        MERGE_RECURSIVE(meta)
		    )
	`

	///
	// Query.
	///
	return db._query(query).toArray()                                           // ==>

} // searchData()


/**
 * UTILITIES
 */


/**
 * Return dataset summary.
 *
 * This function will return summary data for the dataset.
 *
 * @param request {Object}: Service request.
 * @param response {Object}: Service response.
 * @param theDataset {Object}: Dataset record.
 * @param theSummary {String}: Summary statistic function name.
 * @param theField {String}: Pivot descriptor global identifier.
 * @returns {[Object]}: Array of summary data.
 */
function datasetDataSummary(
	request,
	response,
	theDataset,
	theSummary,
	theField)
{
	///
	// Save summary fragment.
	///
	let stat
	switch(theSummary) {
		case 'MIN':
			stat = aql`MIN(groups[*].dat[field])`
			break
		case 'MAX':
			stat = aql`MAX(groups[*].dat[field])`
			break
		case 'AVG':
			stat = aql`AVG(groups[*].dat[field])`
			break
		case 'MEDIAN':
			stat = aql`MEDIAN(groups[*].dat[field])`
			break
		case 'STDDEV':
			stat = aql`STDDEV(groups[*].dat[field])`
			break
		case 'VARIANCE':
			stat = aql`VARIANCE(groups[*].dat[field])`
			break
		default:
			throw httpError(400, `Invalid summary ${theSummary}.`)
	}

	///
	// Make summary.
	///
	const query = aql`
	    FOR dat IN VIEW_DATA
	        SEARCH dat.std_dataset_id == ${theDataset._key}

	        COLLECT summary = dat[${theField}]
	        INTO groups

	        LET quants = (
	            FOR field IN ${theDataset.std_terms_quant}
	            LET value = ${stat}
	            RETURN value != null ? { [field]: ${stat} } : {}
	        )

	    RETURN MERGE(
	        { [${theField}]: summary },
	        MERGE_RECURSIVE(quants)
	    )
	`

	///
	// Query.
	///
	return db._query(query).toArray()                                           // ==>

} // datasetDataSummary()

/**
 * Return genetic index summary.
 *
 * This function will return summary data for genetic indexes.
 *
 * @param request {Object}: Service request.
 * @param response {Object}: Service response.
 * @param theDataset {Object}: Dataset record.
 * @param theSummary {String}: Summary statistic function name.
 * @param theField {String}: Pivot descriptor global identifier.
 * @returns {[Object]}: Array of summary data.
 */
function datasetGeneticSummary(
	request,
	response,
	theDataset,
	theSummary,
	theField)
{
	///
	// Enforce species as pivot.
	//
	if(theField !== 'species') {
		throw httpError(400, `You can only get summary by species.`)            // ==>
	}

	///
	// Save summary fragment.
	///
	let stat
	switch(theSummary) {
		case 'MIN':
			stat = aql`MIN(groups[*].dat[doc.chr_GenIndex])`
			break
		case 'MAX':
			stat = aql`MAX(groups[*].dat[doc.chr_GenIndex])`
			break
		case 'AVG':
			stat = aql`AVG(groups[*].dat[doc.chr_GenIndex])`
			break
		case 'MEDIAN':
			stat = aql`MEDIAN(groups[*].dat[doc.chr_GenIndex])`
			break
		case 'STDDEV':
			stat = aql`STDDEV(groups[*].dat[doc.chr_GenIndex])`
			break
		case 'VARIANCE':
			stat = aql`VARIANCE(groups[*].dat[doc.chr_GenIndex])`
			break
		default:
			throw httpError(400, `Invalid summary ${theSummary}.`)
	}

	///
	// Make summary.
	///
	const query = aql`
	    LET items = (
	        FOR dat IN VIEW_DATA
	            SEARCH dat.std_dataset_id == ${theDataset._key}
	            COLLECT species = dat.species
	            INTO groups

	        FOR doc IN ${theDataset.std_dataset_markers}
	            FILTER doc.species == species

	        RETURN {
	            species: species,
	            properties: {
	                [CONCAT_SEPARATOR("_", doc.chr_GenIndex, "marker")]: doc.chr_SequenceLength == null ? {
	                    [doc.chr_GenIndex]: ${stat},
	                    chr_MarkerType: doc.chr_MarkerType,
	                    chr_NumberOfLoci: doc.chr_NumberOfLoci,
	                    chr_GenoTech: doc.chr_GenoTech
	                } : {
	                    [doc.chr_GenIndex]: ${stat},
	                    chr_MarkerType: doc.chr_MarkerType,
	                    chr_NumberOfLoci: doc.chr_NumberOfLoci,
	                    chr_SequenceLength: doc.chr_SequenceLength,
	                    chr_GenoTech: doc.chr_GenoTech
	                }
	            }
	        }
	    )

		FOR item IN items
		    COLLECT species = item.species
		    INTO groups

		RETURN MERGE(
			{ species: species },
			MERGE_RECURSIVE(groups[*].item.properties)
		)
	`

	///
	// Query.
	///
	return db._query(query).toArray()                                           // ==>

} // datasetGeneticSummary()

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
	// Iterate body properties.
	///
	const filters = []
	for(const [key, value] of Object.entries(request.body)) {
		///
		// Parse body properties.
		///
		let filter = null
		switch(key) {
			case 'gcu_id_number':
				filter = queryFilters.filterPattern(key, value)
				break

			case 'species':
				filter = queryFilters.filterTokens(key, value, 'text_en')
				break

			case 'std_date':
				filter = queryFilters.filterDateInterval(value)
				break

			case 'chr_tree_code':
				filter = queryFilters.filterList(key, value)
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

} // dataQueryFilters()
