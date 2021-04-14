define("UsrIssuesBP", ["MsgChannelUtilities"], function() {
	return {
		entitySchemaName: "UsrIssuesEdition",
		init: function () {
			this.callParent(arguments);
			this.subscriptionFunction();
		},
		subscriptionFunction: function() {
			Terrasoft.ServerChannel.on(Terrasoft.EventName.ON_MESSAGE,
			this.bpListenerMessage, this);
		},
		bpListenerMessage: function(scope, message) {
			if (!message || message.Header.Sender !== "ReloadDetailConcert") {
				return;
			}
			var message2 = message.Body;
			if (!this.Ext.isEmpty(message2) && message2 === "UpdateDetail") {
				this.updateDetail();
			}
		},
	};
});