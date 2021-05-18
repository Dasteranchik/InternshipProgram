define("UsrPeriodicalPublication1Page", ["UsrConfigurationConstants", "RightUtilities"], 
	function(UsrConfigurationConstants, RightUtilities) {
	return {
		entitySchemaName: "UsrPeriodicalPublication",
		attributes: {
			"canCreateIssuesBP": {
				"type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				"dataValueType": Terrasoft.DataValueType.BOOLEAN,
				"value": true
			},
		},
		messages: {
			"GetCreateIssuesBP": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			}
		},
		modules: /**SCHEMA_MODULES*/{}/**SCHEMA_MODULES*/,
		details: /**SCHEMA_DETAILS*/{
			"Files": {
				"schemaName": "FileDetailV2",
				"entitySchemaName": "UsrPeriodicalPublicationFile",
				"filter": {
					"masterColumn": "Id",
					"detailColumn": "UsrPeriodicalPublication"
				}
			},
			"UsrIssuesEditionDetail": {
				"schemaName": "UsrIssuesEditionDetail",
				"entitySchemaName": "UsrIssuesEdition",
				"filter": {
					"detailColumn": "UsrCodeColumn",
					"masterColumn": "Id"
				}
			}
		}/**SCHEMA_DETAILS*/,
		businessRules: /**SCHEMA_BUSINESS_RULES*/{}/**SCHEMA_BUSINESS_RULES*/,
		methods: {
			getActions: function() {
				var actionMenuItems = this.callParent(arguments);
				this.checkAccessIssues();
				actionMenuItems.addItem(this.getButtonMenuItem({
					"Caption": {"bindTo": "Resources.Strings.AddingDetailsButton"},
					"Tag": "onReleaseButton",
					"Visible": { "bindTo": "canCreateIssuesBP" }
				}));
				return actionMenuItems;
			},
			checkAccessIssues: function() {
				RightUtilities.checkCanExecuteOperation({
					operation: "CanCreateIssuesBP"
				}, function(result) {
					this.set("canCreateIssuesBP", result);
				}, this);
			},
			onEntityInitialized: function(){
				this.callParent(arguments);
				this.sandbox.subscribe("GetCreateIssuesBP",
					function(args){this.$canCreateIssuesBP = args;},
					this,
					["UsrPeriodicalPublicationSection"]
					);
				
			},
			
			asyncValidate: function(callback, scope) {
				this.callParent([function(response) {
					if (!this.validateResponse(response)) {
						return;
					}
					//esq.count
					//условие на валидацию, дабы не всегда срабатывало
					//collection.js изучить
					Terrasoft.chain(
						function(next) {
							this.numberDailyPublishedPublications(function(result){
								next(result);
							}, this);
						},
						function(next, countPublication) {
							this.checkingAcceptableDailies(function(result){
								if (result){
									var msg = scope.get("Resources.Strings.LimitPublicationMessage");
									scope.showInformationDialog(msg);
									response.success = false;
								}
								next();
							}, this, countPublication);
						},
						function(next) {
							callback.call(scope || this, response);
								next();
						},
						this
					);
				}, 
				this]);
			},
			numberDailyPublishedPublications: function(callback) {
					var frequency = this.get("UsrFrequencyrLookup");
					var response = {success: false};
					if (frequency && frequency.value) {
						var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: "UsrPeriodicalPublication"
						});
						esq.addColumn("Id");
						var dailyFrequencyFilter = esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, 
							"UsrFrequencyrLookup", UsrConfigurationConstants.Daily);
						var isActiveFilter = esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, 
							"UsrValidBoolean", true);
						esq.filters.logicalOperation = Terrasoft.LogicalOperatorType.AND;
						esq.filters.add("dailyFrequencyFilter", dailyFrequencyFilter);
						esq.filters.add("isActiveFilter", isActiveFilter);
						esq.getEntityCollection(function (result) {
							callback(result.collection.collection.length);
						}, this);
					} else{
						callback.call(this, response);
					}
			},
			checkingAcceptableDailies: function(callback, scope, countPublication){//переименовать
				this.Terrasoft.SysSettings.querySysSettingsItem("MaxNumberActiveDailyPublication", function(maxCount) {
					var frequency = scope.get("UsrFrequencyrLookup");
					var active = scope.get("UsrValidBoolean");
					callback(frequency.value === UsrConfigurationConstants.Daily
						&& active && countPublication >= maxCount);
				});
			},
			startProcess: function(callback) {
                Terrasoft.ProcessModuleUtilities.executeProcess({
                    sysProcessName: "UsrCreateIssues",
                    parameters:{
                        ProcessRes: this.get("UsrResponsibleLookup").value,
                        ProcessPeriodicalId: this.get("UsrFrequencyrLookup").value,
                        Id: this.get("Id")
                    },
                    callback: callback,
                    scope: this
                });
            },
            onReleaseButton: function(){
                this.startProcess(
                    function(){
						this.showInformationDialog("6 записей Выпуски было добавлено");
						this.hideBodyMask();
						//this.reloadEntity(); перезагружает карточку со всем
                });
            },
		},
		dataModels: /**SCHEMA_DATA_MODELS*/{}/**SCHEMA_DATA_MODELS*/,
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"name": "UsrNamedac09aa8-88f6-40e9-8298-62985a98d1a1",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 0,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "UsrName"
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "UsrName3b3a2aa8-ab63-4c30-8aa8-58b60a07de2c",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 0,
						"layoutName": "Header"
					},
					"bindTo": "UsrName"
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "UsrCodeString",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 12,
						"row": 0,
						"layoutName": "Header"
					},
					"bindTo": "UsrCodeString",
					"enabled": true
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "UsrValidBoolean",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 1,
						"layoutName": "Header"
					},
					"bindTo": "UsrValidBoolean",
					"enabled": true
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 2
			},
			{
				"operation": "insert",
				"name": "UsrReleaseDate",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 12,
						"row": 1,
						"layoutName": "Header"
					},
					"bindTo": "UsrReleaseDate",
					"enabled": true
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 3
			},
			{
				"operation": "insert",
				"name": "UsrFrequencyrLookup",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 2,
						"layoutName": "Header"
					},
					"bindTo": "UsrFrequencyrLookup",
					"enabled": true,
					"contentType": 3
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 4
			},
			{
				"operation": "insert",
				"name": "UsrResponsibleLookup",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 12,
						"row": 2,
						"layoutName": "Header"
					},
					"bindTo": "UsrResponsibleLookup",
					"enabled": true,
					"contentType": 5
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 5
			},
			{
				"operation": "insert",
				"name": "UsrCommentString",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 3,
						"layoutName": "Header"
					},
					"bindTo": "UsrCommentString",
					"enabled": true
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 6
			},
			{
				"operation": "insert",
				"name": "NotesAndFilesTab",
				"values": {
					"caption": {
						"bindTo": "Resources.Strings.NotesAndFilesTabCaption"
					},
					"items": [],
					"order": 0
				},
				"parentName": "Tabs",
				"propertyName": "tabs",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "UsrIssuesEditionDetail",
				"values": {
					"itemType": 2,
					"markerValue": "added-detail"
				},
				"parentName": "NotesAndFilesTab",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "Files",
				"values": {
					"itemType": 2
				},
				"parentName": "NotesAndFilesTab",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "NotesControlGroup",
				"values": {
					"itemType": 15,
					"caption": {
						"bindTo": "Resources.Strings.NotesGroupCaption"
					},
					"items": []
				},
				"parentName": "NotesAndFilesTab",
				"propertyName": "items",
				"index": 2
			},
			{
				"operation": "insert",
				"name": "Notes",
				"values": {
					"bindTo": "UsrNotes",
					"dataValueType": 1,
					"contentType": 4,
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 24
					},
					"labelConfig": {
						"visible": false
					},
					"controlConfig": {
						"imageLoaded": {
							"bindTo": "insertImagesToNotes"
						},
						"images": {
							"bindTo": "NotesImagesCollection"
						}
					}
				},
				"parentName": "NotesControlGroup",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "merge",
				"name": "ESNTab",
				"values": {
					"order": 1
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
