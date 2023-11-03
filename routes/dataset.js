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
const database = require('../globals/database')
const Model = require('../models/dataset')
const ModelKey = require('../models/dataset_key')
const keySchema = joi.string().required()
	.description('The key of the dataset')

///
// Collections.
///
const collection = db._collection(database.documentCollections.dataset)

///
// Router.
///
const router = createRouter()
module.exports = router

///
// Service tag.
///
router.tag('Dataset CRUD')


/**
 * Get all records.
 *
 * The service will return the full list of all datasets.
 * No sorting or selection is applied.
 */
router.get(
	function (req, res) {
		res.send(collection.all())
	},
	'list'
)
	.response([ModelKey], 'List of dataset records.')
	.summary('Get full list of datasets')
	.description(dd`
		Retrieves the list of all dataset records.
		No sorting or selection is applied.
	`)

/**
 * Create a new record.
 *
 * This service will create a new dataset record.
 * Note that you are responsible for providing the dataset key.
 */
router.post(
	function (req, res) {
		const doc = req.body
		let meta

		try
		{
			meta = collection.save(doc)

			res.status(201)
			res.set('location', req.makeAbsolute(
				req.reverse('detail', {key: doc._key})
			))

			res.send({...doc, ...meta})
		}

		catch (error)
		{
			if (error.isArangoError && error.errorNum === ARANGO_DUPLICATE) {
				throw httpError(HTTP_CONFLICT, error.message)
			}
			throw error
		}
	},
	'create'
)
	.body(ModelKey, 'The dataset to create.')
	.response(201, Model, 'The created dataset.')
	.error(HTTP_CONFLICT, 'The dataset already exists.')
	.summary('Create a new dataset')
	.description(dd`
		Creates a new dataset from the request body and returns the saved document.
	`)

/**
 * Return record by key.
 *
 * The service will return the dataset matching the provided key.
 */
router.get(
	':key', function (req, res){
		const key = req.pathParams.key
		let doc

		try
		{
			doc = collection.document(key)
		}

		catch (error)
		{
			if (error.isArangoError && error.errorNum === ARANGO_NOT_FOUND) {
				throw httpError(HTTP_NOT_FOUND, error.message)
			}
			throw error
		}

		res.send(doc)
	},
	'detail'
)
	.pathParam('key', keySchema)
	.response(ModelKey, 'The dataset.')
	.summary('Fetch a dataset')
	.description(dd`
		Retrieves a dataset by its key.
	`)

/**
 * Replace record.
 *
 * This service will replace the record identified by the provided key.
 */
router.put(
	':key', function (req, res) {
		const key = req.pathParams.key
		const doc = req.body
		let meta

		try
		{
			meta = collection.replace(key, doc)
		}

		catch (error)
		{
			if (error.isArangoError && error.errorNum === ARANGO_NOT_FOUND) {
				throw httpError(HTTP_NOT_FOUND, error.message)
			}
			if (error.isArangoError && error.errorNum === ARANGO_CONFLICT) {
				throw httpError(HTTP_CONFLICT, error.message)
			}
			throw error
		}

		res.send({...doc, ...meta})
	},
	'replace'
)
	.pathParam('key', keySchema)
	.body(Model, 'The data to replace the dataset with.')
	.response(Model, 'The new dataset.')
	.summary('Replace a dataset')
	.description(dd`
		Replaces an existing dataset with the request body and returns the new document.
	`)

/**
 * Update record.
 *
 * Update dataset identified by the provided key with the provided object.
 */
router.patch(
	':key', function (req, res) {
		const key = req.pathParams.key
		const patchData = req.body
		let doc

		try
		{
			collection.update(key, patchData)
			doc = collection.document(key)
		}

		catch (error)
		{
			if (error.isArangoError && error.errorNum === ARANGO_NOT_FOUND) {
				throw httpError(HTTP_NOT_FOUND, error.message)
			}
			if (error.isArangoError && error.errorNum === ARANGO_CONFLICT) {
				throw httpError(HTTP_CONFLICT, error.message)
			}
			throw error
		}

		res.send(doc)
	},
	'update'
)
	.pathParam('key', keySchema)
	.body(joi.object().description('The data to update the dataset with.'))
	.response(Model, 'The updated dataset.')
	.summary('Update a dataset')
	.description(dd`
		Patches a dataset with the request body and returns the updated document.
	`)

/**
 * Delete record.
 *
 * This service will delete the dataset identified by the provided key.
 */
router.delete(
	':key', function (req, res) {
		const key = req.pathParams.key

		try
		{
			collection.remove(key)
		}

		catch (error) {
			if (error.isArangoError && error.errorNum === ARANGO_NOT_FOUND) {
				throw httpError(HTTP_NOT_FOUND, error.message)
			}
			throw error
		}
	},
	'delete'
)
	.pathParam('key', keySchema)
	.response(null)
	.summary('Remove a dataset')
	.description(dd`
		Deletes a dataset from the database.
	`)
