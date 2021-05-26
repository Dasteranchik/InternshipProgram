define("UsrPeriodicalPublicationSection", ["RightUtilities"], function(RightUtilities) {
    return {
        entitySchemaName: "UsrPeriodicalPublication",
        messages: {
            "GetCreateIssuesBP": {
                mode: Terrasoft.MessageMode.PTP,
                direction: Terrasoft.MessageDirectionType.PUBLISH
            }
        },
        attributes: {

        },
        methods: {
            init: function() {
                this.callParent(arguments);
                this.sandbox.publish("GetCreateIssuesBP",
                    this.checkAccessIssues(), ["UsrPeriodicalPublication1Page"]
                );
            },
            checkAccessIssues: function() {
                RightUtilities.checkCanExecuteOperation({
                    operation: "CanCreateIssuesBP"
                }, function(result) {
                    this.set("CanCreateIssuesBP", result);
                }, this);
            },
        },
        details: /**SCHEMA_DETAILS*/ {} /**SCHEMA_DETAILS*/ ,
        diff: /**SCHEMA_DIFF*/ [] /**SCHEMA_DIFF*/ ,
    };
});