/**
 * database.js
 *
 * This file contains database related globals.
 *
 * The database and collection connections is instantiated locally in each module,
 * this file contains the collection names and other application specific globals.
 */

///
// Globals.
///
const globals = {
	"collections": {
		"data": {
			"name": module.context.configuration.data_coll_name,
			"index": []
		},
		"dataset": {
			"name": module.context.configuration.dataset_coll_name,
			"index": []
		}
	},
	"edges": {},
	"views": {
		"data_view": {
			"name": module.context.configuration.data_view_name,
			"type": "arangosearch",
			"properties": {
				"links": {
					"data": {
						"analyzers": [
							"identity"
						],
						"fields": {
							"std_date": {},
							"species": {
								"analyzers": [
									"text_en",
									"identity"
								]
							},
							"geometry": {
								"analyzers": [
									"geojson"
								]
							},
							"chr_tree_code": {},
							"gcu_id_number": {
								"analyzers": [
									"text_en",
									"identity"
								]
							},
							"std_dataset_id": {}
						},
						"includeAllFields": false,
						"storeValues": "id",
						"trackListPositions": false
					}
				}
			}
		},
		"dataset_view": {
			"name": module.context.configuration.dataset_view_name,
			"type": "arangosearch",
			"properties": {
				"links": {
					"dataset": {
						"analyzers": [
							"identity"
						],
						"fields": {
							"_title": {
								"fields": {
									"iso_639_3_eng": {
										"analyzers": [
											"text_en",
											"identity"
										]
									}
								}
							},
							"std_date_start": {},
							"_tag": {},
							"std_date_submission": {},
							"subjects": {},
							"count": {},
							"std_terms_quant": {},
							"std_dataset": {},
							"std_dataset_group": {},
							"_subjects": {},
							"_key": {},
							"_collection": {},
							"_classes": {},
							"_citation": {
								"fields": {
									"iso_639_3_eng": {
										"analyzers": [
											"text_en",
											"identity"
										]
									}
								}
							},
							"std_date_end": {},
							"std_terms_key": {},
							"std_terms_summary": {},
							"_subject": {},
							"std_date": {},
							"_domain": {},
							"_description": {
								"fields": {
									"iso_639_3_eng": {
										"analyzers": [
											"text_en",
											"identity"
										]
									}
								}
							},
							"species_list": {
								"analyzers": [
									"text_en",
									"identity"
								]
							},
							"std_terms": {},
							"std_project": {}
						},
						"includeAllFields": false,
						"storeValues": "id",
						"trackListPositions": false
					}
				}
			}
		}
	}
}

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

	edgeCollections,

	globals
}

