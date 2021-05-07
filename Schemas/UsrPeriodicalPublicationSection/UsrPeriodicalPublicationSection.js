define("UsrPeriodicalPublicationSection", [], function() {
	return {
		entitySchemaName: "UsrPeriodicalPublication",
		messages: {
			"GetEnabledPlanPaymentDate": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			}
		},
		attributes: {
			"canCreateIssuesBP": {
				"type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				"dataValueType": Terrasoft.DataValueType.BOOLEAN,
				"value": true
			},
		},
		methods: {
			init:function() {
				this.callParent(arguments);
				this.sandbox.subscribe("GetEnabledPlanPaymentDate",
					function(args){this.$canCreateIssuesBP = args;},
					this,
					["UsrPeriodicalPublicationSection"]
					);
			},
		},
		details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
		diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/,
	};
});
