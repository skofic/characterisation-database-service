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
for (const [key, collection] of Object.entries(database.globals.collections)) {
	if (!db._collection(collection.name)) {
		log +=`Creating document collection ${collection.name}.\n`
		const coll = db._createDocumentCollection(collection.name)
		for(const index of collection.index) {
			coll.ensureIndex(index)
		}
	} else if (context.isProduction) {
		log += `Collection ${collection.name} already exists. Leaving it untouched.\n`
	}
}

// ///
// // Create edge collections.
// ///
// for (const [key, collection] of Object.entries(database.globals.edges)) {
// 	if (!db._collection(collection.name)) {
// 		log +=`Creating edge collection ${collection.name}.\n`
// 		const coll = db._createEdgeCollection(collection.name)
// 		for(const index of collection.index) {
// 			coll.ensureIndex(index)
// 		}
// 	} else if (context.isProduction) {
// 		log += `Collection ${collection.name} already exists. Leaving it untouched.\n`
// 	}
// }

///
// Create analyzers.
///
var analyzer_name
const db_name = db._name()
analyzer_name = `${db_name}::geojson`
if(analyzers.analyzer(analyzer_name) === null) {
	analyzers.save(
		analyzer_name,
		"geojson",
		{ type: "shape", "legacy": false}
	)
}

///
// Create views.
///
for (const [key, value] of Object.entries(database.globals.views)) {
	if(db._view(value.name) === null) {
		db._createView(value.name, value.type, value.properties)
	}
}

module.exports = log
