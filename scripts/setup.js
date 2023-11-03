'use strict'

///
// Globals.
///
const {db} = require('@arangodb')
const {context} = require('@arangodb/locals')

///
// Database information.
///
const database = require('../globals/database')

///
// Lod.
///
let log = ""

///
// Handle document collections.
///
for (const [key, collection] of Object.entries(database.documentCollections)) {
	if (!db._collection(collection)) {
		log +=`Creating collection ${collection}.\n`
		const coll = db._createDocumentCollection(collection)
		switch (key) {
			case 'data':
				coll.ensureIndex({
					type: 'persistent',
					fields: ['std_dataset_id']
				})
				break

			case 'dataset':
				coll.ensureIndex({
					type: 'persistent',
					fields: ['std_terms[*]']
				})
				break
		}
	} else if (context.isProduction) {
		log += `Collection ${collection} already exists. Leaving it untouched.\n`
	}
}

///
// Create edge collections.
///
for (const [_, collection] of Object.entries(database.edgeCollections)) {
	if (!db._collection(collection)) {
		log +=`Creating collection ${collection}.\n`
		db._createEdgeCollection(collection)
	} else if (context.isProduction) {
		log += `Collection ${collection} already exists. Leaving it untouched.\n`
	}
}

module.exports = log
