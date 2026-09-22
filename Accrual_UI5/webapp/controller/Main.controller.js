sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";
	var oController;
	return Controller.extend("com.takeda.Accrual_UI5.controller.Main", {
		onInit: function () {
			oController = this;
			oController.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		},
		// Method to Navigate to PO Owner Page
		onBusinessPage: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("BusinessPage");
		},
		// Method to Navigate to TBS Page
		onTBSTilePage: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("TBSPage");
		},
		onLinkPress: function () {
			var videoDialog = oController.getView().byId("LoginDialog");

			if (!videoDialog) {
				videoDialog = sap.ui.xmlfragment(oController.getView().getId(), "com.takeda.Accrual_UI5.fragment.loginVideo", oController);
				oController.getView().addDependent(videoDialog);
			}
			videoDialog.open();
			var url = "https://web.microsoftstream.com/embed/video/538f8048-fdf6-43e7-bae4-adec7411c743";
			var sIframeId = this.getView().byId(this.createId("loginlink")).getId();
			$("#" + sIframeId).attr("src", url);

		},
		onCloseRef: function () {
			oController.getView().byId("LoginDialog").close();
		},

	});
});