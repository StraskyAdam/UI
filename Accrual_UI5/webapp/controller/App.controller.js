sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";
	var oController, emailId, sPostURI;
	return Controller.extend("com.takeda.Accrual_UI5.controller.App", {
		onInit: function () {
			oController = this;
			oController.oRouter = sap.ui.core.UIComponent.getRouterFor(this);

		},
		onAfterRendering: function () {
			if (window.location.hostname.substr(0, 6) === "webide") {
				// If application is running from WebIDE	
				// emailId = "abhishek.ks@takeda.com";
				emailId = "charlotte.abaya@takeda.com";

			} else {
				// If application is running from FLP	
				emailId = new sap.ushell.services.UserInfo().getUser().getEmail().toLowerCase();
			}
			this.getUserRoleFlag();
			this.getUserLanguage();
			if (window.location.hostname.substr(0, 6) === "webide") {} else {
				var apptext = this.getOwnerComponent().getModel('i18n').getResourceBundle().getText("appTitle");
				sap.ushell.resources.i18n.aPropertyFiles[0].mProperties["appTitle"] = apptext;
			}
		},
		// Method to hide or make visible TBS Tile based on roles
		getUserRoleFlag: function () {
			var roleModel = this.getOwnerComponent().getModel("userRoleFlagModel");
			oController.oGlobalBusyDialog = new sap.m.BusyDialog().open();
			/*roleModel.read("/roleParameters(IP_EMAIL='" + emailId + "')/Results", {
				success: function (oData, oResponse) {
					var loginUserRole = oData.results[0].FLAG;
					if (loginUserRole === "X") {
						oController.oGlobalBusyDialog.close();
						oController.oRouter.navTo("RouteMain");
					} else {
						oController.oGlobalBusyDialog.close();
						oController.oRouter.navTo("BusinessPage");
					}
				},
				error: function (error) {
					oController.oGlobalBusyDialog.open();
				}
			});*/
			if (window.location.hostname.substr(0, 6) === "webide") {
				// If application is running from WebIDE	
				sPostURI = "/XSA_HTTP_ACCRUAL/xsodata/userRoleID.xsodata/roleParameters(IP_EMAIL='" + emailId + "')/Results";
			} else {
				// If application is running from FLP	
				sPostURI = "/comtakedaAccrual_UI5/XSA_HTTP_ACCRUAL/xsodata/userRoleID.xsodata/roleParameters(IP_EMAIL='" + emailId + "')/Results";
			}
			$.ajax({
				type: "GET",
				url: sPostURI,
				dataType: "json",
				async: true,
				cache: false,
				contentType: "application/json; charset=utf-8",

				success: function (oData, oResponse) {
					var loginUserRole = oData.d.results[0].FLAG;
					if (loginUserRole === "X") {
						oController.oGlobalBusyDialog.close();
						oController.oRouter.navTo("RouteMain");
					} else {
						oController.oGlobalBusyDialog.close();
						oController.oRouter.navTo("BusinessPage");
					}
				},
				error: function (error) {
					oController.oGlobalBusyDialog.open();
				}

			});
		},

		getUserLanguage: function () {
			var lang = sap.ui.getCore().getConfiguration().getLanguage().toUpperCase();
			if (lang == "ZH-TW") {
				lang = "ZH_TW";
			}
			var jsonLang = {
				"EMAIL_ID": emailId,
				"LANGUAGE": lang
			};
			if (window.location.hostname.substr(0, 6) === "webide") {
				// If application is running from WebIDE	
				sPostURI = "/XSA_HTTP_ACCRUAL/xsjs/";
			} else {
				// If application is running from FLP	
				sPostURI = "/comtakedaAccrual_UI5/XSA_HTTP_ACCRUAL/xsjs/";
			}
			$.ajax({
				type: "POST",
				url: sPostURI + "updateUserLang.xsjs",
				dataType: "json",
				async: true,
				cache: false,
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify(jsonLang),
				success: function (data, Response) {

				},
				error: function (error) {

				}
			});
		}

	});
});