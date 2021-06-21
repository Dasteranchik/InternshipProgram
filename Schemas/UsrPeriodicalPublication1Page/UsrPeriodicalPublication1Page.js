define("UsrPeriodicalPublication1Page", ["UsrConfigurationConstants", "RightUtilities"],
    function (UsrConfigurationConstants, RightUtilities) {
        return {
            entitySchemaName: "UsrPeriodicalPublication",
            messages: {
                "GetCreateIssuesBP": {
                    mode: Terrasoft.MessageMode.PTP,
                    direction: Terrasoft.MessageDirectionType.SUBSCRIBE
                }
            },
            attributes: {
                "CanCreateIssuesBP": {
                    "type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
                    "dataValueType": Terrasoft.DataValueType.BOOLEAN,
                    "value": true
                },
                "UsrTemplate": {
                    dependencies: [{
                        columns: ["UsrTemplate"],
                        methodName: "setDataFromTemplate"
                    }],
                    lookupListConfig: {
                        columns: ["UsrComment", "UsrResponsibleLookup"]
                    }
                },
                "UsrView": {
                    dependencies: [{
                        columns: ["UsrType"],
                        methodName: "setDataFromType"
                    }],
                    lookupListConfig: {
                        filter: function () {
                            var filterType = this.Terrasoft.createFilterGroup();
                            var type = this.get("UsrType");
                            if (type && type.value) {
                                filterType.addItem(Terrasoft.createColumnFilterWithParameter(
                                    Terrasoft.ComparisonType.EQUAL,
                                    "UsrType",
                                    type.value));
                            }
                            return filterType;
                        }
                    }
                },
            },
            modules: /**SCHEMA_MODULES*/ {} /**SCHEMA_MODULES*/,
            details: /**SCHEMA_DETAILS*/ {
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
            } /**SCHEMA_DETAILS*/,
            businessRules: /**SCHEMA_BUSINESS_RULES*/ {} /**SCHEMA_BUSINESS_RULES*/,
            methods: {

                setDataFromTemplate: function () {
                    var template = this.get("UsrTemplate");
                    if (Ext.isEmpty(template)) {
                        return;
                    }
                    this.set("UsrCommentString", template.UsrComment);
                    this.set("UsrResponsibleLookup", template.UsrResponsibleLookup);
                },

                setDataFromType: function () {
                    this.set("UsrView", null);
                },

                getActions: function () {
                    var actionMenuItems = this.callParent(arguments);
                    this.checkAccessIssues();
                    actionMenuItems.addItem(this.getButtonMenuItem({
                        "Caption": { "bindTo": "Resources.Strings.AddingDetailsButton" },
                        "Tag": "onReleaseButton",
                        "Visible": { "bindTo": "CanCreateIssuesBP" }
                    }));
                    return actionMenuItems;
                },

                checkAccessIssues: function () {
                    RightUtilities.checkCanExecuteOperation({
                        operation: "CanCreateIssuesBP"
                    }, function (result) {
                        this.set("CanCreateIssuesBP", result);
                    }, this);
                },

                onEntityInitialized: function () {
                    this.callParent(arguments);
                    this.sandbox.subscribe("GetCreateIssuesBP",
                        function (args) { this.$CanCreateIssuesBP = args; },
                        this, ["UsrPeriodicalPublicationSection"]
                    );

                },

                setValidationConfig: function() {
                    this.callParent(arguments);
                    this.addColumnValidator("UsrReleaseDate", this.nameReleaseDate);
                },

                nameReleaseDate: function() {
                    var invalidMessage = "";
                    var dateNow = new Date();
                    var dateSpecified = this.get("UsrReleaseDate");
                    if( dateSpecified > dateNow){
                        invalidMessage = this.get("Resources.Strings.InvalidDate");
                    }
                    return{
                        invalidMessage: invalidMessage
                    };
                },

                asyncValidate: function (callback, scope) {
                    this.callParent([function (response) {
                        if (!this.validateResponse(response)) {
                            return;
                        }
                        if (this.get("UsrFrequencyrLookup").value === UsrConfigurationConstants.Daily || this.get("UsrName")) {
                            Terrasoft.chain(
                                function (next) {
                                    this.numberDailyPublishedPublications(function (result) {
                                        next(result);
                                    }, this);
                                },
                                function (next, countPublication) {
                                    this.checkingAcceptableDailies(function (maxCount) {
                                        if (countPublication >= maxCount && this.get("UsrValidBoolean")) {
                                            var messageTemplate = this.get("Resources.Strings.LimitPublicationMessage");
                                            var message = Ext.String.format(messageTemplate, maxCount);
                                            this.showInformationDialog(message);
                                            response.success = false;
                                        }
                                        next();
                                    });
                                },
                                function (next) {
                                    this.checkingNameMatch(function (result){
                                        if (!(result.success)){
                                            var message = scope.get("Resources.Strings.DuplicateName");
                                            scope.showInformationDialog(message);
                                            response.success = false;
                                        }
                                        next();
                                    }); 
                                },
                                function (next) {
                                    callback.call(scope || this, response);
                                    next();
                                },
                            this);
                        } else{
                            callback.call(scope || this, response);
                        }
                        return;
                        }, 
                    this]);
                },

                checkingNameMatch: function (callback) {
                    var name = this.get("UsrName");
                    var id = this.get("Id");
                    var response = { success: true };
                    var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
                        rootSchemaName: "UsrPeriodicalPublication"
                    });
                    var nameFilter = esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
                        "UsrName", name);
                    var idFilter = esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.NOT_EQUAL,
                        "Id", id);
                    esq.filters.logicalOperation = Terrasoft.LogicalOperatorType.AND;
                    esq.filters.add("nameFilter", nameFilter);
                    esq.filters.add("idFilter", idFilter);
                    esq.getEntityCollection(function (result) {
                        var item = result.collection.first();
                        if(!(Ext.isEmpty(item))){
                            response.success = false;
                        }
                        callback.call(this, response);
                    }, this);
                },

                numberDailyPublishedPublications: function (callback) {
                    var frequency = this.get("UsrFrequencyrLookup");
                    var response = { success: false };
                    if (frequency && frequency.value) {
                        var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
                            rootSchemaName: "UsrPeriodicalPublication"
                        });
                        esq.addAggregationSchemaColumn(
                            "Id", this.Terrasoft.AggregationType.COUNT, "Count");
                        var dailyFrequencyFilter = esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
                            "UsrFrequencyrLookup", UsrConfigurationConstants.Daily);
                        var isActiveFilter = esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
                            "UsrValidBoolean", true);
                        esq.filters.logicalOperation = Terrasoft.LogicalOperatorType.AND;
                        esq.filters.add("dailyFrequencyFilter", dailyFrequencyFilter);
                        esq.filters.add("isActiveFilter", isActiveFilter);
                        esq.getEntityCollection(function (result) {
                            var item = result.collection.first();
                            callback(item.get("Count"));
                        }, this);
                    } else {
                        callback.call(this, response);
                    }
                },

                checkingAcceptableDailies: function (callback) {
                    this.Terrasoft.SysSettings.querySysSettingsItem(
                        "MaxNumberActiveDailyPublication",
                        function (maxCount) {
                            callback.call(this, maxCount);
                        }, this);
                },

                startProcess: function (callback) {
                    Terrasoft.ProcessModuleUtilities.executeProcess({
                        sysProcessName: "UsrCreateIssues",
                        parameters: {
                            ProcessRes: this.get("UsrResponsibleLookup").value,
                            ProcessPeriodicalId: this.get("UsrFrequencyrLookup").value,
                            Id: this.get("Id")
                        },
                        callback: callback,
                        scope: this
                    });
                },

                onReleaseButton: function () {
                    this.startProcess(
                        function () {
                            var message = this.get("Resources.Strings.LimitPublicationMessage");
                            this.showInformationDialog(message);
                            this.hideBodyMask();
                        });
                },
            },
            dataModels: /**SCHEMA_DATA_MODELS*/ {} /**SCHEMA_DATA_MODELS*/,
            diff: /**SCHEMA_DIFF*/[{
                "operation": "insert",
                "name": "UsrName",
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
                "name": "UsrTemplate",
                "values": {
                    "layout": {
                        "colSpan": 12,
                        "rowSpan": 1,
                        "column": 0,
                        "row": 3,
                        "layoutName": "Header"
                    },
                    "bindTo": "UsrTemplate"
                },
                "parentName": "Header",
                "propertyName": "items",
                "index": 6
            },
            {
                "operation": "insert",
                "name": "UsrCommentString",
                "values": {
                    "layout": {
                        "colSpan": 24,
                        "rowSpan": 1,
                        "column": 0,
                        "row": 5,
                        "layoutName": "Header"
                    },
                    "bindTo": "UsrCommentString",
                    "enabled": true
                },
                "parentName": "Header",
                "propertyName": "items",
                "index": 7
            },
            {
                "operation": "insert",
                "name": "UsrType",
                "values": {
                    "layout": {
                        "colSpan": 12,
                        "rowSpan": 1,
                        "column": 12,
                        "row": 3,
                        "layoutName": "Header"
                    },
                    "bindTo": "UsrType"
                },
                "parentName": "Header",
                "propertyName": "items",
                "index": 8
            },
            {
                "operation": "insert",
                "name": "UsrView",
                "values": {
                    "layout": {
                        "colSpan": 12,
                        "rowSpan": 1,
                        "column": 0,
                        "row": 4,
                        "layoutName": "Header"
                    },
                    "bindTo": "UsrView"
                },
                "parentName": "Header",
                "propertyName": "items",
                "index": 9
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
            ] /**SCHEMA_DIFF*/
        };
    });