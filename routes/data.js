/**
 * data.js
 *
 * This set of services can be used to perform basic CRUD operations on data.
 */
'use strict'

const dd = require('dedent')
const joi = require('joi')
const httpError = require('http-errors')
const status = require('statuses')
const {aql, db} = require('@arangodb')
const { errors } = require('@arangodb')
const { context } = require('@arangodb/locals')
const createRouter = require('@arangodb/foxx/router')

const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code
const HTTP_NOT_FOUND = status('not found')
const HTTP_CONFLICT = status('conflict')

const database = require('../globals/database')
const Model = require('../models/data')
const keySchema = joi.string().required()
    .description('The key of the dataset')

const collection = db._collection(database.documentCollections.data)

const router = createRouter()
module.exports = router

router.tag('Data CRUD')

router.get(function (req, res) {
  res.send(collection.all())
}, 'list')
.response([Model], 'A list of Data.')
.summary('List all Data')
.description(dd`
  Retrieves a list of all Data.
`)

router.post(function (req, res) {
  const doc = req.body
  let meta
  try {
    meta = collection.save(doc)
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_DUPLICATE) {
      throw httpError(HTTP_CONFLICT, e.message)
    }
    throw e
  }
  res.status(201)
  res.set('location', req.makeAbsolute(
    req.reverse('detail', { key: doc._key })
  ))
  res.send({ ...doc, ...meta })
}, 'create')
.body(Model, 'The datum to create.')
.response(201, Model, 'The created datum.')
.error(HTTP_CONFLICT, 'The datum already exists.')
.summary('Create a new datum')
.description(dd`
  Creates a new datum from the request body and
  returns the saved document.
`)

router.get(':key', function (req, res) {
  const key = req.pathParams.key
  let doc
  try {
    doc = collection.document(key)
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message)
    }
    throw e
  }
  res.send(doc)
}, 'detail')
.pathParam('key', keySchema)
.response(Model, 'The datum.')
.summary('Fetch a datum')
.description(dd`
  Retrieves a datum by its key.
`)

router.put(':key', function (req, res) {
  const key = req.pathParams.key
  const doc = req.body
  let meta
  try {
    meta = collection.replace(key, doc)
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message)
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message)
    }
    throw e
  }
  res.send({ ...doc, ...meta })
}, 'replace')
.pathParam('key', keySchema)
.body(Model, 'The data to replace the datum with.')
.response(Model, 'The new datum.')
.summary('Replace a datum')
.description(dd`
  Replaces an existing datum with the request body and
  returns the new document.
`)

router.patch(':key', function (req, res) {
  const key = req.pathParams.key
  const patchData = req.body
  let doc
  try {
    collection.update(key, patchData)
    doc = collection.document(key)
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message)
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message)
    }
    throw e
  }
  res.send(doc)
}, 'update')
.pathParam('key', keySchema)
.body(joi.object().description('The data to update the datum with.'))
.response(Model, 'The updated datum.')
.summary('Update a datum')
.description(dd`
  Patches a datum with the request body and
  returns the updated document.
`)

router.delete(':key', function (req, res) {
  const key = req.pathParams.key
  try {
    collection.remove(key)
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message)
    }
    throw e
  }
}, 'delete')
.pathParam('key', keySchema)
.response(null)
.summary('Remove a datum')
.description(dd`
  Deletes a datum from the database.
`)
