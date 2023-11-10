/**
 * database.js
 *
 * This file contains database related globals.
 *
 * The database and collection connections is instantiated locally in each module,
 * this file contains the collection names and other application specific globals.
 */

///
// Collections.
///
const documentCollections = {
	"data": module.context.configuration.data_coll_name,
	"dataset": module.context.configuration.dataset_coll_name,
}

const documentViews = {
	"data_view": module.context.configuration.data_view_name,
	"dataset_view": module.context.configuration.dataset_view_name
}

const edgeCollections = {}

///
// Exports.
///
module.exports = {
	documentCollections,
	documentViews,

	edgeCollections
}

