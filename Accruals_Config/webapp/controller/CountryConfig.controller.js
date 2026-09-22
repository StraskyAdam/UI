/* global XLSX:true */
/* global readXlsxFile:true */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/Filter"

], function (Controller, JSONModel, MessageBox, Filter) {
	"use strict";
	// Initialize the variables
	var oController = this;
	var countryCodeSelected, countryNameSelected, companyCodeSelected, configNameSelected,
		configValueSelected, emailIDSelected, userCompanyCodeSelected, userAcessSelected, userRoleSelected,
		managementUnitSelected, costCenterSelected, currThresholdSelected, ccodeThresholdSelected, thresholdSelected,
		emailtemplSelected, emailLangSelected, emailSubSelected, emailBodySelected, emailStatusSelected,
		langCodeSelected, langTxtSelected;
	var FlagDialog = false;
	var helpLinkDesc, helpLink, helpId, videoLinkDesc, videoLink, videoId, emailId, role, language;
	var languageData = new sap.ui.model.json.JSONModel();

	return Controller.extend("com.takeda.Accrual_UI5.Accrual_Ctry.controller.CountryConfig", {
		onInit: function () {
			// Initialize the variables and the assigned List
			oController = this;

			if (window.location.hostname.substr(0, 6) === "webide") {
				oController.uri = "/XSA_HTTP_ACCRUAL/xsjs/";
			} else {

				oController.uri = "/comtakedaAccrual_UI5/XSA_HTTP_ACCRUAL/xsjs/";
			}

			oController.getcountryConfig();
			oController.getThreshold();
			oController.getConfig();
			oController.getUserRoles();
			oController.getEmailTemplates();
			oController.getLanguages();
			oController.getLinksData();
			// Set the roles to the JSON to the model.
			var oRootPath = jQuery.sap.getModulePath("com.takeda.Accrual_UI5.Accrual_Ctry"),
				roleModel = new JSONModel(oRootPath + "/data/Roles.json");
			this.getView().setModel(roleModel, "roleModel");
			// Set the Access to the JSON to the model.
			var accessModel = new JSONModel(oRootPath + "/data/Access.json");
			this.getView().setModel(accessModel, "accessModel");
			this.onRouteMatched();
		},
		onRouteMatched: function () {
			var Createobj = {
				"helpLinkDesc": "",
				"helpLink": "",
				"helpId": "",
				"role": "",
				"language1": ""
			};
			oController.LangDataUpdateModel = new sap.ui.model.json.JSONModel(Createobj);
			oController.getView().setModel(oController.LangDataUpdateModel, "LangDataUpdateModel");
		},
		getLinksData: function () {

			var linkModel = this.getOwnerComponent().getModel("linksModel");

			var oGlobalBusyDialog = new sap.m.BusyDialog();
			// oGlobalBusyDialog.open();
			var tabelID = this.getView().byId("helpTable");
			linkModel.read("/link", {

				success: function (oData, oResponse) {
					var attModel = new sap.ui.model.json.JSONModel();
					attModel.setData(oData);
					tabelID.setModel(attModel);
					tabelID.setVisibleRowCount(oData.results.length);
					oGlobalBusyDialog.close();
				},
				error: function (error) {
					oGlobalBusyDialog.close();
				}
			});
			var videolinkModel = this.getOwnerComponent().getModel("videolinkModel");

			var oGlobalBusyDialog = new sap.m.BusyDialog();
			// oGlobalBusyDialog.open();
			var videotabelID = this.getView().byId("videoTable");
			videolinkModel.read("/link", {

				success: function (oData, oResponse) {
					var attvideoModel = new sap.ui.model.json.JSONModel();
					attvideoModel.setData(oData);
					videotabelID.setModel(attvideoModel);
					videotabelID.setVisibleRowCount(oData.results.length);
					oGlobalBusyDialog.close();
				},
				error: function (error) {
					oGlobalBusyDialog.close();
				}
			});
		},
		actionLink: function (oEvent) {
			if (oEvent.getSource().getSelectedIndex() !== -1) {
				FlagDialog = true;
			} else {
				FlagDialog = false;
			}

			var context = oEvent.getParameter("rowContext");
			var oTableHelp = this.getView().byId("helpTable");

			helpLinkDesc = oTableHelp.getModel().getProperty("HELP_DESC", context);
			helpLink = oTableHelp.getModel().getProperty("HELP_LINK", context);
			helpId = oTableHelp.getModel().getProperty("HELP_ID", context);
			role = oTableHelp.getModel().getProperty("ROLE", context);
			language = oTableHelp.getModel().getProperty("LANGUAGE", context);
		},
		videoactionLink: function (oEvent) {
			if (oEvent.getSource().getSelectedIndex() !== -1) {
				FlagDialog = true;
			} else {
				FlagDialog = false;
			}

			var context = oEvent.getParameter("rowContext");
			var oTableVideo = this.getView().byId("videoTable");

			videoLinkDesc = oTableVideo.getModel().getProperty("VIDEO_DESC", context);
			videoLink = oTableVideo.getModel().getProperty("VIDEO_LINK", context);
			videoId = oTableVideo.getModel().getProperty("VIDEO_ID", context);
			role = oTableVideo.getModel().getProperty("ROLE", context);
			language = oTableVideo.getModel().getProperty("LANGUAGE", context);
		},
		onPressCreateLink: function (oEvent) {

			oController = this;
			sap.ui.core.BusyIndicator.show(0);
			oController.LinkLangDef = $.Deferred();
			if (oController._oDialog) {
				oController._oDialog.destroy();
			}
			oController._oDialog = sap.ui.xmlfragment("com.takeda.Accrual_UI5.Accrual_Ctry.fragment.LinksCreate", oController);
			oController.getView().addDependent(oController._oDialog);

			oController.languageValueModel = oController.getOwnerComponent().getModel("langModel");
			oController.languageDataModel = new sap.ui.model.json.JSONModel();
			oController.languageValueModel.read("/lang", {
				success: function (oData, oResponse) {
					var languageList = [];
					languageList = oData.results;
					oController.languageDataModel.setData(oData);
					oController.languageDataModel.setData(languageList);
					oController.getView().setModel(oController.languageDataModel, "languageDataModel");
					oController.LinkLangDef.resolve();
				},
				error: function (error) {
					oController.LinkLangDef.resolve();
				}
			});
			$.when(oController.LinkLangDef).done(function () {
				oController._oDialog.open();
				oController._oDialog.setModel(oController.languageDataModel);
				sap.ui.core.BusyIndicator.hide();

			});

		},
		onPressCreateVideoLink: function (oEvent) {

			oController = this;
			sap.ui.core.BusyIndicator.show(0);
			// oController.LinkLangDef = $.Deferred();
			// if (oController._oDialog) {
			// 	oController._oDialog.destroy();
			// }
			oController._oDialog = sap.ui.xmlfragment("com.takeda.Accrual_UI5.Accrual_Ctry.fragment.VideoCreate", oController);
			oController.getView().addDependent(oController._oDialog);

			oController.languageValueModel = oController.getOwnerComponent().getModel("langModel");
			oController.languageDataModel = new sap.ui.model.json.JSONModel();
			oController.languageValueModel.read("/lang", {
				success: function (oData, oResponse) {
					var languageList = [];
					languageList = oData.results;
					oController.languageDataModel.setData(oData);
					oController.languageDataModel.setData(languageList);
					oController.getView().setModel(oController.languageDataModel, "languageDataModel");
					oController.LinkLangDef.resolve();
				},
				error: function (error) {
					oController.LinkLangDef.resolve();
				}
			});
			$.when(oController.LinkLangDef).done(function () {
				oController._oDialog.open();
				oController._oDialog.setModel(oController.languageDataModel);
				sap.ui.core.BusyIndicator.hide();

			});

		},
		onPressChangeLink: function () {
			if (!FlagDialog) {
				MessageBox.information("Select Reference Link and Reference Topic");
				return 0;
			}
			oController = this;
			sap.ui.core.BusyIndicator.show(0);
			oController.LinkLangUpdateDef = $.Deferred();
			if (oController._oDialogUpdate) {
				oController._oDialogUpdate.destroy();
			}
			oController.getView().getModel("LangDataUpdateModel").setData([]);
			oController.getView().getModel("LangDataUpdateModel").refresh();
			var LangData = oController.getView().getModel("LangDataUpdateModel").getData();
			LangData.helpLinkDesc = helpLinkDesc;
			LangData.helpLink = helpLink;
			LangData.helpId = helpId;
			LangData.role = role;
			LangData.language1 = language;
			oController.getView().getModel("LangDataUpdateModel").setData(LangData);
			oController.getView().getModel("LangDataUpdateModel").refresh();
			// this.updateLinks();
			oController._oDialogUpdate = sap.ui.xmlfragment("com.takeda.Accrual_UI5.Accrual_Ctry.fragment.LinksUpdate", oController);
			oController.getView().addDependent(oController._oDialogUpdate);

			oController.languageValueModel = oController.getOwnerComponent().getModel("langModel");
			oController.languageDataModel = new sap.ui.model.json.JSONModel();
			oController.languageValueModel.read("/lang", {
				success: function (oData, oResponse) {
					var languageList = [];
					languageList = oData.results;
					oController.languageDataModel.setData(oData);
					oController.languageDataModel.setData(languageList);
					oController.getView().setModel(oController.languageDataModel, "languageDataModel");
					oController.LinkLangUpdateDef.resolve();
				},
				error: function (error) {
					oController.LinkLangUpdateDef.resolve();
				}
			});
			$.when(oController.LinkLangUpdateDef).done(function () {
				oController._oDialogUpdate.open();
				oController._oDialogUpdate.setModel(oController.languageDataModel);
				sap.ui.core.BusyIndicator.hide();

			});

			// if (this._oDialogUpdate) {
			// 	this._oDialogUpdate.destroy();
			// }
			// this._oDialogUpdate = sap.ui.xmlfragment("com.takeda.Accrual_UI5.Accrual_Ctry.fragment.LinksUpdate", this);

			// this.updateLinks();

			// this.getView().addDependent(this._oDialogUpdate);
			// return this._oDialogUpdate.open();
		},
		onPressChangeVideoLink: function () {
			if (!FlagDialog) {
				MessageBox.information("Select Reference Link and Reference Topic");
				return 0;
			}
			oController = this;
			sap.ui.core.BusyIndicator.show(0);
			oController.LinkLangUpdateDef = $.Deferred();
			if (oController._oDialogUpdate) {
				oController._oDialogUpdate.destroy();
			}
			oController.getView().getModel("LangDataUpdateModel").setData([]);
			oController.getView().getModel("LangDataUpdateModel").refresh();
			var LangData = oController.getView().getModel("LangDataUpdateModel").getData();
			LangData.videoLinkDesc = videoLinkDesc;
			LangData.videoLink = videoLink;
			LangData.videoId = videoId;
			LangData.role = role;
			LangData.language1 = language;
			oController.getView().getModel("LangDataUpdateModel").setData(LangData);
			oController.getView().getModel("LangDataUpdateModel").refresh();
			// this.updateLinks();
			oController._oDialogUpdate = sap.ui.xmlfragment("com.takeda.Accrual_UI5.Accrual_Ctry.fragment.VideoUpdate", oController);
			oController.getView().addDependent(oController._oDialogUpdate);

			oController.languageValueModel = oController.getOwnerComponent().getModel("langModel");
			oController.languageDataModel = new sap.ui.model.json.JSONModel();
			oController.languageValueModel.read("/lang", {
				success: function (oData, oResponse) {
					var languageList = [];
					languageList = oData.results;
					oController.languageDataModel.setData(oData);
					oController.languageDataModel.setData(languageList);
					oController.getView().setModel(oController.languageDataModel, "languageDataModel");
					oController.LinkLangUpdateDef.resolve();
				},
				error: function (error) {
					oController.LinkLangUpdateDef.resolve();
				}
			});
			$.when(oController.LinkLangUpdateDef).done(function () {
				oController._oDialogUpdate.open();
				oController._oDialogUpdate.setModel(oController.languageDataModel);
				sap.ui.core.BusyIndicator.hide();

			});

		},
		updateLinks: function () {
			// taking the values from the selected row and setting to Change Dialog
			var linkTopicSelected = sap.ui.getCore().byId("linkTopicChange");
			var linkSelected = sap.ui.getCore().byId("linkChange");
			var roleSelected = sap.ui.getCore().byId("linkRoleChange");
			var idSelected = sap.ui.getCore().byId("linkIdChange");

			var linkTopicUpdate = helpLinkDesc === "" ? null : helpLinkDesc;
			var linkUpdate = helpLink === "" ? null : helpLink;
			var roleUpdate = role === "" ? null : role;
			var idUpdate = helpId === "" ? null : helpId;

			linkTopicSelected.setValue(linkTopicUpdate);
			linkSelected.setValue(linkUpdate);
			roleSelected.setValue(roleUpdate);
			idSelected.setValue(idUpdate);
		},
		onSaveCreateLink: function () {
			var LinkDesc = sap.ui.getCore().byId("linkDescCreate").getValue();
			var Link = sap.ui.getCore().byId("LinkCreate").getValue();
			var roleC = sap.ui.getCore().byId("linkRoleCreate").getValue();
			var LinkId = sap.ui.getCore().byId("linkIdCreate").getValue();
			var LangId = sap.ui.getCore().byId("linkLangCreate").getSelectedKey();

			// Role is mandatory
			if (roleC === undefined ||
				roleC === null ||
				roleC === "") {
				MessageBox.error("Role is mandatory");
				return 0;
			}

			// Language is mandatory
			if (LangId === undefined ||
				LangId === null ||
				LangId === "") {
				MessageBox.error("Language is mandatory");
				return 0;
			}

			// Link Id is mandatory
			if (LinkId === undefined ||
				LinkId === null ||
				LinkId === "") {
				MessageBox.error("Link Id is mandatory");
				return 0;
			}

			// Reference Topic is mandatory
			if (LinkDesc === undefined ||
				LinkDesc === null ||
				LinkDesc === "") {
				MessageBox.error("Reference Topic is mandatory");
				return 0;
			}

			// Reference Link is mandatory
			if (Link === undefined ||
				Link === null ||
				Link === "") {
				MessageBox.error("Reference Link is mandatory");
				return 0;
			}

			this.saveLinkData(LinkDesc, Link, roleC, LinkId, LangId);
			this._oDialog.destroy();
		},
		onSaveCreateVideoLink: function () {
			var VideoLinkDesc = sap.ui.getCore().byId("videolinkDescCreate").getValue();
			var VideoLink = sap.ui.getCore().byId("videoLinkCreate").getValue();
			var roleC = sap.ui.getCore().byId("videolinkRoleCreate").getValue();
			var VideoLinkId = sap.ui.getCore().byId("videolinkIdCreate").getValue();
			var LangId = sap.ui.getCore().byId("videolinkLangCreate").getSelectedKey();

			// Role is mandatory
			if (roleC === undefined ||
				roleC === null ||
				roleC === "") {
				MessageBox.error("Role is mandatory");
				return 0;
			}

			// Language is mandatory
			if (LangId === undefined ||
				LangId === null ||
				LangId === "") {
				MessageBox.error("Language is mandatory");
				return 0;
			}

			// Link Id is mandatory
			if (VideoLinkId === undefined ||
				VideoLinkId === null ||
				VideoLinkId === "") {
				MessageBox.error("Link Id is mandatory");
				return 0;
			}

			// Reference Topic is mandatory
			if (VideoLinkDesc === undefined ||
				VideoLinkDesc === null ||
				VideoLinkDesc === "") {
				MessageBox.error("Reference Topic is mandatory");
				return 0;
			}

			// Reference Link is mandatory
			if (VideoLink === undefined ||
				VideoLink === null ||
				VideoLink === "") {
				MessageBox.error("Reference Link is mandatory");
				return 0;
			}

			this.saveVideoLinkData(VideoLinkDesc, VideoLink, roleC, VideoLinkId, LangId);
			this._oDialog.destroy();
		},
		onSaveChangeLink: function () {

			var LinkDesc = sap.ui.getCore().byId("linkTopicChange").getValue();
			var Link = sap.ui.getCore().byId("linkChange").getValue();
			var roleC = sap.ui.getCore().byId("linkRoleChange").getValue();
			var LinkId = sap.ui.getCore().byId("linkIdChange").getValue();
			var LangId = sap.ui.getCore().byId("linkLangChange").getSelectedKey();

			// Role is mandatory
			if (roleC === undefined ||
				roleC === null ||
				roleC === "") {
				MessageBox.error("Role is mandatory");
				return 0;
			}
			// Language is mandatory
			if (LangId === undefined ||
				LangId === null ||
				LangId === "") {
				MessageBox.error("Language is mandatory");
				return 0;
			}

			// Link Id is mandatory
			if (LinkId === undefined ||
				LinkId === null ||
				LinkId === "") {
				MessageBox.error("Link Id is mandatory");
				return 0;
			}

			// Reference Topic is mandatory
			if (LinkDesc === undefined ||
				LinkDesc === null ||
				LinkDesc === "") {
				MessageBox.error("Reference Topic is mandatory");
				return 0;
			}

			// Reference Link is mandatory
			if (Link === undefined ||
				Link === null ||
				Link === "") {
				MessageBox.error("Reference Link is mandatory");
				return 0;
			}

			this.saveLinkData(LinkDesc, Link, roleC, LinkId, LangId);
			this._oDialogUpdate.destroy();

		},
		onSaveChangeVideoLink: function () {

			var VideoLinkDesc = sap.ui.getCore().byId("VideolinkTopicChange").getValue();
			var VideoLink = sap.ui.getCore().byId("VideolinkChange").getValue();
			var roleC = sap.ui.getCore().byId("VideolinkRoleChange").getValue();
			var VideoLinkId = sap.ui.getCore().byId("VideolinkIdChange").getValue();
			var LangId = sap.ui.getCore().byId("VideolinkLangChange").getSelectedKey();

			// Role is mandatory
			if (roleC === undefined ||
				roleC === null ||
				roleC === "") {
				MessageBox.error("Role is mandatory");
				return 0;
			}
			// Language is mandatory
			if (LangId === undefined ||
				LangId === null ||
				LangId === "") {
				MessageBox.error("Language is mandatory");
				return 0;
			}

			// Link Id is mandatory
			if (VideoLinkId === undefined ||
				VideoLinkId === null ||
				VideoLinkId === "") {
				MessageBox.error("Link Id is mandatory");
				return 0;
			}

			// Reference Topic is mandatory
			if (VideoLinkDesc === undefined ||
				VideoLinkDesc === null ||
				VideoLinkDesc === "") {
				MessageBox.error("Reference Topic is mandatory");
				return 0;
			}

			// Reference Link is mandatory
			if (VideoLink === undefined ||
				VideoLink === null ||
				VideoLink === "") {
				MessageBox.error("Reference Link is mandatory");
				return 0;
			}

			this.saveVideoLinkData(VideoLinkDesc, VideoLink, roleC, VideoLinkId, LangId);
			this._oDialogUpdate.destroy();

		},

		saveLinkData: function (LinkDesc, Link, roleC, LinkId, LangId) {
			// Map to JSON data	
			//var lang = LangId.slice(0, 2);
			var JSON_DATA = {
				"ROLE": roleC,
				"HELP_ID": LinkId,
				"HELP_DESC": LinkDesc,
				"HELP_LINKS": Link,
				"LANGUAGE": LangId
			};
			// Making an AJAX POST call
			$.ajax({
				type: "POST",
				url: oController.uri + "insertHelpLinks.xsjs",
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify(JSON_DATA),
				async: false,
				cache: false,
				success: function (data) {
					MessageBox.success("Link Saved");
					oController.getLinksData();

				},
				error: function (error) {
					MessageBox.error("Failed To Save Link");
					oController.getLinksData();
				}
			});

			// reset the selection of records
			var oTable = this.getView().byId("helpTable");
			oTable.clearSelection();

		},
		saveVideoLinkData: function (VideoLinkDesc, VideoLink, roleC, VideoLinkId, LangId) {
			// Map to JSON data	
			//var lang = LangId.slice(0, 2);
			var JSON_DATA = {
				"ROLE": roleC,
				"VIDEO_ID": VideoLinkId,
				"VIDEO_DESC": VideoLinkDesc,
				"VIDEO_LINKS": VideoLink,
				"LANGUAGE": LangId
			};
			// Making an AJAX POST call
			$.ajax({
				type: "POST",
				url: oController.uri + "insertVideoLinks.xsjs",
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify(JSON_DATA),
				async: false,
				cache: false,
				success: function (data) {
					MessageBox.success("Link Saved");
					oController.getLinksData();

				},
				error: function (error) {
					MessageBox.error("Failed To Save Link");
					oController.getLinksData();
				}
			});

			// reset the selection of records
			var oTable = this.getView().byId("videoTable");
			oTable.clearSelection();

		},
		onPressDeleteLink: function () {
			if (!FlagDialog) {
				MessageBox.information("Select Link To Delete");
				return 0;
			}
			MessageBox.confirm("Are you sure want to delete the Config   ? ", {
				title: "Confirmation",
				icon: 'sap-icon://message-success',
				initialFocus: sap.m.MessageBox.Action.CANCEL,
				onClose: function (sButton) {
					if (sButton === MessageBox.Action.OK) {
						// Collect the data and call AJAX 
						var oTable = oController.getView().byId("helpTable");
						// Get the Data
						helpId = helpId === "" ? null : helpId;
						role = role === "" ? null : role;
						language = language === "" ? null : language;
						var jsonData = {
							"ROLE": role,
							"HELP_ID": helpId,
							"LANGUAGE": language
						};
						// Making an AJAX POST call
						$.ajax({
							type: "POST",
							url: oController.uri + "deleteHelpLinks.xsjs",

							dataType: "json",
							contentType: "application/json",
							data: JSON.stringify(jsonData),
							async: false,
							cache: false,
							success: function (data) {
								MessageBox.success("Link Deleted Successfully");
								//oController.getView().getModel().refresh();
								oController.getLinksData();

							},
							error: function (error) {
								MessageBox.error("Failed To Delete Link");
								//oController.getView().getModel().refresh();
								oController.getLinksData();
							}
						});
					} else if (sButton === MessageBox.Action.CANCEL) {
						// Do Nothing

					}
					oTable.clearSelection();
				}
			});

		},
		onPressDeleteVideoLink: function () {
			if (!FlagDialog) {
				MessageBox.information("Select Link To Delete");
				return 0;
			}
			MessageBox.confirm("Are you sure want to delete the Config   ? ", {
				title: "Confirmation",
				icon: 'sap-icon://message-success',
				initialFocus: sap.m.MessageBox.Action.CANCEL,
				onClose: function (sButton) {
					if (sButton === MessageBox.Action.OK) {
						// Collect the data and call AJAX 
						var oTable = oController.getView().byId("videoTable");
						// Get the Data
						videoId = videoId === "" ? null : videoId;
						role = role === "" ? null : role;
						language = language === "" ? null : language;
						var jsonData = {
							"ROLE": role,
							"VIDEO_ID": videoId,
							"LANGUAGE": language
						};
						// Making an AJAX POST call
						$.ajax({
							type: "POST",
							url: oController.uri + "deleteVideoLinks.xsjs",

							dataType: "json",
							contentType: "application/json",
							data: JSON.stringify(jsonData),
							async: false,
							cache: false,
							success: function (data) {
								MessageBox.success("Link Deleted Successfully");
								//oController.getView().getModel().refresh();
								oController.getLinksData();

							},
							error: function (error) {
								MessageBox.error("Failed To Delete Link");
								//oController.getView().getModel().refresh();
								oController.getLinksData();
							}
						});
					} else if (sButton === MessageBox.Action.CANCEL) {
						// Do Nothing

					}
					oTable.clearSelection();
				}
			});

		},
		onItemSelect: function (oEvent) {

			var oItem = oEvent.getParameter("item");
			this.byId("pageContainer").to(this.getView().createId(oItem.getKey()));
			if (oItem.getKey() === "page2") {
				oController.getConfig();
			}

		},

		getThreshold: function () {

			var readThresholdModel = this.getOwnerComponent().getModel("thresholdModel");

			var oGlobalBusyDialog = new sap.m.BusyDialog();
			// oGlobalBusyDialog.open();
			var tabelID = this.getView().byId("ThresholdTable");

			readThresholdModel.read("/threshold", {

				success: function (oData, oResponse) {
					var attModel = new sap.ui.model.json.JSONModel();
					attModel.setData(oData);
					tabelID.setModel(attModel);
					tabelID.setVisibleRowCount(oData.results.length);
					oGlobalBusyDialog.close();
				},
				error: function (error) {

					oGlobalBusyDialog.close();
				}
			});

		},

		getEmailTemplates: function () {

			var emailTemplateModel = this.getOwnerComponent().getModel("config");

			var oGlobalBusyDialog = new sap.m.BusyDialog();
			// oGlobalBusyDialog.open();
			var tabelID = this.getView().byId('emailTemplateTable');

			emailTemplateModel.read("/emailTemplate", {

				success: function (oData, oResponse) {
					var attModel = new sap.ui.model.json.JSONModel();
					attModel.setData(oData);
					tabelID.setModel(attModel);
					tabelID.setVisibleRowCount(oData.results.length);
					oGlobalBusyDialog.close();
				},
				error: function (error) {

					oGlobalBusyDialog.close();
				}
			});

		},
		getLanguages: function () {
			var configModel = this.getOwnerComponent().getModel("config");

			var oGlobalBusyDialog = new sap.m.BusyDialog();
			// oGlobalBusyDialog.open();
			var tabelID = this.getView().byId('langConfigTable');

			configModel.read("/configLang", {

				success: function (oData, oResponse) {
					var attModel = new sap.ui.model.json.JSONModel();
					attModel.setData(oData);
					tabelID.setModel(attModel);
					tabelID.setVisibleRowCount(oData.results.length);
					oGlobalBusyDialog.close();
				},
				error: function (error) {

					oGlobalBusyDialog.close();
				}
			});

		},
		getUserRoles: function () {

			var userRoleModel = this.getOwnerComponent().getModel("userRoleModel");
			oController.defUserRole = $.Deferred();
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			// oGlobalBusyDialog.open();
			var tabelID = this.getView().byId("UserRoleTable");
			userRoleModel.read("/userRole", {
				async: false,
				urlParameters: {
					"$inlinecount": "allpages",
					//"$skip": skip,
					"$top": 100
				},
				success: function (oData, oResponse) {
					oController.countUser = oData.__count;
					oController.defUserRole.resolve();
				},
				error: function (error) {

				}
			});
			$.when(oController.defUserRole).done(function () {
				var totalRecords = oController.countUser;
				var User_All = [];
				for (var i = 0; i <= totalRecords / 1000; i++) {
					var skip = i * 1000;
					userRoleModel.read("/userRole", {
						async: false,
						urlParameters: {
							"$inlinecount": "allpages",
							"$skip": skip,
							"$top": 1000
						},
						success: function (oData, oResponse) {

							var UserAll = oData;
							if (UserAll.results !== undefined) {
								User_All = User_All.concat(UserAll.results);
							}
							if (User_All.length == totalRecords) {
								var attModel = new sap.ui.model.json.JSONModel();
								attModel.setData(User_All);
								tabelID.setModel(attModel);
								tabelID.setVisibleRowCount(User_All.length);
								oGlobalBusyDialog.close();
							}
						},
						error: function (error) {

							oGlobalBusyDialog.close();
						}
					});
				}
			});
		},

		getConfig: function () {
			var configModel = this.getOwnerComponent().getModel("config");

			var oGlobalBusyDialog = new sap.m.BusyDialog();
			// oGlobalBusyDialog.open();
			var tabelID = this.getView().byId("ConfigTable");

			configModel.read("/configValues", {

				success: function (oData, oResponse) {
					var attModel = new sap.ui.model.json.JSONModel();
					attModel.setData(oData);
					tabelID.setModel(attModel);
					tabelID.setVisibleRowCount(oData.results.length);
					oGlobalBusyDialog.close();
				},
				error: function (error) {

					oGlobalBusyDialog.close();
				}
			});

		},

		getcountryConfig: function () {
			var ctryConfigModel = this.getOwnerComponent().getModel("ctryConfig");
			// this.getView().setModel(ctryConfigModel);
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			// oGlobalBusyDialog.open();
			var tabelID = this.getView().byId("countryConfigTable");

			ctryConfigModel.read("/ctryConfigPO", {

				success: function (oData, oResponse) {
					var attModel = new sap.ui.model.json.JSONModel();
					attModel.setData(oData);
					tabelID.setModel(attModel);
					tabelID.setVisibleRowCount(oData.results.length);
					oGlobalBusyDialog.close();
				},
				error: function (error) {

					oGlobalBusyDialog.close();
				}
			});

		},

		// Method: Search the emails
		onSearchCountryConfig: function (oEvt) {
			var aFilter = [];
			// var oTable = this.getView().byId('countryConfigTable');
			var sQuery = oEvt.getSource().getValue();
			if (sQuery && sQuery.length > 0) {

				var sQueryLower = sQuery.toLowerCase();
				var sQueryUpper = sQuery.toUpperCase();

				var filter = new Filter("COUNTRY_CODE", sap.ui.model.FilterOperator.Contains, sQueryLower);
				aFilter.push(filter);
				filter = new Filter("COUNTRY_NAME", sap.ui.model.FilterOperator.Contains, sQueryUpper);
				aFilter.push(filter);
				filter = new Filter("BUKRS", sap.ui.model.FilterOperator.Contains, sQueryUpper);
				aFilter.push(filter);

			}
			var list = this.getView().byId("countryConfigTable");
			var binding = list.getBinding("rows");
			binding.filter(aFilter);
		},

		// Method: Search the emails
		onSearchUserRoleConfig: function (oEvt) {
			var aFilter = [];
			// var oTable = this.getView().byId('countryConfigTable');
			var sQuery = oEvt.getSource().getValue();
			if (sQuery && sQuery.length > 0) {

				var sQueryLower = sQuery.toLowerCase();

				var filter = new Filter("USER_EMAILID", sap.ui.model.FilterOperator.Contains, sQueryLower);
				aFilter.push(filter);

			}
			var list = this.getView().byId("UserRoleTable");
			var binding = list.getBinding("rows");
			binding.filter(aFilter);
		},

		onPressConfigCreate: function (oEvent) {

			if (this._oDialog) {
				this._oDialog.destroy();
			}
			this._oDialog = sap.ui.xmlfragment("com.takeda.Accrual_UI5.Accrual_Ctry.view.ConfigCreate", this);
			this.getView().addDependent(this._oDialog);
			return this._oDialog.open();
		},

		onPressThresholdCreate: function (oEvent) {

			if (this._oDialog) {
				this._oDialog.destroy();
			}
			this._oDialog = sap.ui.xmlfragment("com.takeda.Accrual_UI5.Accrual_Ctry.view.ThresholdCreate", this);
			this.getView().addDependent(this._oDialog);
			return this._oDialog.open();

		},

		onPressEmailTemplateCreate: function (oEvent) {

			if (this._oDialog) {
				this._oDialog.destroy();
			}

			this._oDialog = sap.ui.xmlfragment("com.takeda.Accrual_UI5.Accrual_Ctry.view.EmailTemplateCreate", this);
			this.getView().addDependent(this._oDialog);

			languageData.setData(this.getView().byId('langConfigTable').getModel().getData());
			sap.ui.getCore().byId("emailCreateLanguage").setModel(languageData);

			return this._oDialog.open();
		},

		onPressUserRoleCreate: function (oEvent) {

			if (this._oDialog) {
				this._oDialog.destroy();
			}
			this._oDialog = sap.ui.xmlfragment("com.takeda.Accrual_UI5.Accrual_Ctry.view.UserRoleCreate", this);
			this.getView().addDependent(this._oDialog);
			return this._oDialog.open();
		},

		onPressConfigChange: function (oEvent) {
			if (!FlagDialog) {
				MessageBox.information("Select  Config to change Details");
				return 0;
			}
			if (this._oDialogUpdate) {
				this._oDialogUpdate.destroy();
			}
			this._oDialogUpdate = sap.ui.xmlfragment("com.takeda.Accrual_UI5.Accrual_Ctry.view.ConfigUpdate", this);

			this.updateConfigValue();

			this.getView().addDependent(this._oDialogUpdate);
			return this._oDialogUpdate.open();
		},

		// Event on press create
		onPressCreate: function (oEvent) {

			if (this._oDialog) {
				this._oDialog.destroy();
			}
			this._oDialog = sap.ui.xmlfragment("com.takeda.Accrual_UI5.Accrual_Ctry.view.CountryConfigCreate", this);
			this.getView().addDependent(this._oDialog);
			return this._oDialog.open();
		},
		// Event on press create
		onPressLangCreate: function (oEvent) {

			if (this._oDialog) {
				this._oDialog.destroy();
			}

			this._oDialog = sap.ui.xmlfragment("com.takeda.Accrual_UI5.Accrual_Ctry.view.LanguageCreate", this);
			this.getView().addDependent(this._oDialog);
			return this._oDialog.open();
		},
		// Event on press change
		onPressChange: function (oEvent) {
			if (!FlagDialog) {
				MessageBox.information("Select Country Config to change Details");
				return 0;
			}
			if (this._oDialogUpdate) {
				this._oDialogUpdate.destroy();
			}
			this._oDialogUpdate = sap.ui.xmlfragment("com.takeda.Accrual_UI5.Accrual_Ctry.view.CountryConfigChange", this);

			this.updateValue();

			this.getView().addDependent(this._oDialogUpdate);
			return this._oDialogUpdate.open();
		},

		onPressThresholdChange: function (oEvent) {

			if (!FlagDialog) {
				MessageBox.information("Select Currency and Company Code");
				return 0;
			}
			if (this._oDialogUpdate) {
				this._oDialogUpdate.destroy();
			}
			this._oDialogUpdate = sap.ui.xmlfragment("com.takeda.Accrual_UI5.Accrual_Ctry.view.ThresholdUpdate", this);

			this.updateThresholdRole();

			this.getView().addDependent(this._oDialogUpdate);
			return this._oDialogUpdate.open();

		},

		// Event on press change
		onPressUserRoleChange: function (oEvent) {
			if (!FlagDialog) {
				MessageBox.information("Select Email ID and Company Code");
				return 0;
			}
			if (this._oDialogUpdate) {
				this._oDialogUpdate.destroy();
			}
			this._oDialogUpdate = sap.ui.xmlfragment("com.takeda.Accrual_UI5.Accrual_Ctry.view.UserRoleUpdate", this);

			this.updateUserRole();

			this.getView().addDependent(this._oDialogUpdate);
			return this._oDialogUpdate.open();
		},
		// Event on press change
		onPressEmailTemplateChange: function (oEvent) {
			if (!FlagDialog) {
				MessageBox.information("Select Email Template");
				return 0;
			}
			if (this._oDialogUpdate) {
				this._oDialogUpdate.destroy();
			}

			this._oDialogUpdate = sap.ui.xmlfragment("com.takeda.Accrual_UI5.Accrual_Ctry.view.EmailTemplateChange", this);

			this.updateEmailTemplate();

			this.getView().addDependent(this._oDialogUpdate);

			languageData.setData(this.getView().byId('langConfigTable').getModel().getData());
			sap.ui.getCore().byId("emailCreateLanguage").setModel(languageData);

			return this._oDialogUpdate.open();
		},
		onConfigCancelUpdate: function (oEvent) {
			this._oDialogUpdate.destroy();
		},

		onThresholdCancelUpdate: function (oEvent) {
			this._oDialogUpdate.destroy();
		},

		onUserRoleUpdateCancel: function (oEvent) {
			this._oDialogUpdate.destroy();
		},

		onCancelEmailTempl: function (oEvent) {
			this._oDialogUpdate.destroy();
		},
		// On Cancel Update dialog box
		onCancelUpdate: function (oEvent) {
			this._oDialogUpdate.destroy();
		},
		// On Cancel dialog box
		onCancel: function (oEvent) {
			this._oDialog.destroy();
		},

		updateConfigValue: function () {
			// taking the values from the selected row and setting to Change Dialog
			var configNameUpdate = sap.ui.getCore().byId("configNameChange");
			var configValueUpdate = sap.ui.getCore().byId("configValueChange");

			var configNameChange = configNameSelected === "" ? null : configNameSelected;
			var configValueChange = configValueSelected === "" ? null : configValueSelected;

			configNameUpdate.setValue(configNameChange);
			configValueUpdate.setValue(configValueChange);

		},
		// On Update value
		updateValue: function () {
			// taking the values from the selected row and setting to Change Dialog
			var domainUpdate = sap.ui.getCore().byId("domainChange");
			var domainDescUpdate = sap.ui.getCore().byId("domainDescChange");

			var domainChange = countryCodeSelected === "" ? null : countryCodeSelected;
			var domainDescChange = countryNameSelected === "" ? null : countryNameSelected;

			domainUpdate.setValue(domainChange);
			domainDescUpdate.setValue(domainDescChange);

		},

		updateThresholdRole: function () {
			// taking the values from the selected row and setting to Change Dialog
			var currThresholdUpdate = sap.ui.getCore().byId("currThresholdChange");
			var ccodethresholdUpdate = sap.ui.getCore().byId("ccodethresholdChange");
			var thresholdUpdate = sap.ui.getCore().byId("thresholdChange");

			var currThresholdChange = currThresholdSelected === "" ? null : currThresholdSelected;
			var ccodethresholdChange = ccodeThresholdSelected === "" ? null : ccodeThresholdSelected;
			var thresholdChange = thresholdSelected === "" ? null : thresholdSelected;

			currThresholdUpdate.setValue(currThresholdChange);
			ccodethresholdUpdate.setValue(ccodethresholdChange);
			thresholdUpdate.setValue(thresholdChange);

		},

		// On Update value
		updateUserRole: function () {
			// taking the values from the selected row and setting to Change Dialog
			var emailIDUpdate = sap.ui.getCore().byId("emailIDUpdate");
			var userCompanyCodeUpdate = sap.ui.getCore().byId("companyCodeUpdate");
			var managementUnitUpdate = sap.ui.getCore().byId("managementUnitUpdate");
			var costCenterUpdate = sap.ui.getCore().byId("costCenterUpdate");
			var userAccessUpdate = sap.ui.getCore().byId("accessUpdate");
			var userRoleUpdate = sap.ui.getCore().byId("userRoleUpdate");

			var emailIDChange = emailIDSelected === "" ? null : emailIDSelected;
			var userCompanyCodeChange = userCompanyCodeSelected === "" ? null : userCompanyCodeSelected;
			var managementUnitChange = managementUnitSelected === "" ? null : managementUnitSelected;
			var costCenterChange = costCenterSelected === "" ? null : costCenterSelected;
			var userAccessChange = userAcessSelected === "" ? null : userAcessSelected;
			var userRoleChange = userRoleSelected === "" ? null : userRoleSelected;

			emailIDUpdate.setValue(emailIDChange);
			userCompanyCodeUpdate.setValue(userCompanyCodeChange);
			managementUnitUpdate.setValue(managementUnitChange);
			costCenterUpdate.setValue(costCenterChange);
			userAccessUpdate.setValue(userAccessChange);
			userRoleUpdate.setValue(userRoleChange);

		},
		// On Update value
		updateEmailTemplate: function () {
			// taking the values from the selected row and setting to Change Dialog
			var emailTemplTypeUpdate = sap.ui.getCore().byId("changeEmailTemplType");
			var emailLangUpdate = sap.ui.getCore().byId("emailCreateLanguage");
			var statusCheckUpdate = sap.ui.getCore().byId("changeEmailTemplCheck");
			var emailSubjectUpdate = sap.ui.getCore().byId("changeEmailTemplValSubject");
			var emailBodyUpdate = sap.ui.getCore().byId("changeEmailTemplVal2");

			var emailTemplTypeChange = emailtemplSelected === "" ? null : emailtemplSelected;
			var emailLangChange = emailLangSelected === "" ? null : emailLangSelected;
			var statusCheckChange = emailStatusSelected === "" ? false : true;
			var emailSubjectChange = emailSubSelected === "" ? null : emailSubSelected;
			var emailBodyChange = emailBodySelected === "" ? null : emailBodySelected;

			emailTemplTypeUpdate.setValue(emailTemplTypeChange);
			emailLangUpdate.setValue(emailLangChange);
			statusCheckUpdate.setEnabled(statusCheckChange);
			emailSubjectUpdate.setValue(emailSubjectChange);
			emailBodyUpdate.setValue(emailBodyChange);

		},
		onThresholdSaveUpdate: function (oEvent) {
			var currThresholdUpdate = sap.ui.getCore().byId("currThresholdChange").getValue();
			var ccodeThresholdUpdate = sap.ui.getCore().byId("ccodethresholdChange").getValue();
			var thresholdUpdate = sap.ui.getCore().byId("thresholdChange").getValue();

			// Currency is mandatory
			if (currThresholdUpdate === undefined ||
				currThresholdUpdate === null ||
				currThresholdUpdate === "") {
				MessageBox.error("Currency is mandatory");
				return 0;
			}

			// Company Code is mandatory
			if (ccodeThresholdUpdate === undefined ||
				ccodeThresholdUpdate === null ||
				ccodeThresholdUpdate === "") {
				MessageBox.error("Company Code is mandatory");
				return 0;
			}

			// Threshold is mandatory
			if (thresholdUpdate === undefined ||
				thresholdUpdate === null ||
				thresholdUpdate === "") {
				MessageBox.error("Threshold is mandatory");
				return 0;
			}
          





			this.saveThresholdData(currThresholdUpdate, ccodeThresholdUpdate, thresholdUpdate);
			this._oDialogUpdate.destroy();

		},
		onchangeEmailTemplSave: function (oEvent) {
			// taking the values from the selected row and setting to Change Dialog
			var emailTemplTypeUpdate = sap.ui.getCore().byId("changeEmailTemplType").getValue();
			var emailLangUpdate = sap.ui.getCore().byId("emailCreateLanguage").getValue();
			var statusCheckUpdate = sap.ui.getCore().byId("changeEmailTemplCheck").getEnabled() == false ? "" : "X";
			var emailSubjectUpdate = sap.ui.getCore().byId("changeEmailTemplValSubject").getValue();
			var emailBodyUpdate = sap.ui.getCore().byId("changeEmailTemplVal2").getValue();

			// Subject is mandatory
			if (emailSubjectUpdate === undefined ||
				emailSubjectUpdate === null ||
				emailSubjectUpdate === "") {
				MessageBox.error("Subject is mandatory");
				return 0;
			}

			// Email Body  is mandatory
			if (emailBodyUpdate === undefined ||
				emailBodyUpdate === null ||
				emailBodyUpdate === "") {
				MessageBox.error("Email Body is mandatory");
				return 0;
			}

			this.saveEmailTemplateData(emailTemplTypeUpdate, emailLangUpdate, statusCheckUpdate, emailSubjectUpdate, emailBodyUpdate);
			this._oDialogUpdate.destroy();

		},
		onConfigSaveUpdate: function (oEvent) {
			var configNameUpdate = sap.ui.getCore().byId("configNameChange").getValue();
			var configValueUpdate = sap.ui.getCore().byId("configValueChange").getValue();

			// Config Name is mandatory
			if (configNameUpdate === undefined ||
				configNameUpdate === null ||
				configNameUpdate === "") {
				MessageBox.error("Config Name is mandatory");
				return 0;
			}

			// Config Value is mandatory
			if (configValueUpdate === undefined ||
				configValueUpdate === null ||
				configValueUpdate === "") {
				MessageBox.error("Config Value is mandatory");
				return 0;
			}

			this.saveConfigData(configNameUpdate, configValueUpdate);
			this._oDialogUpdate.destroy();

		},

		onUserRoleUpdateSave: function (oEvent) {
			var emailID = sap.ui.getCore().byId("emailIDUpdate").getValue().toLowerCase();
			var compCode = sap.ui.getCore().byId("companyCodeUpdate").getValue();
			var managementUnit = sap.ui.getCore().byId("managementUnitUpdate").getValue();
			var costCenter = sap.ui.getCore().byId("costCenterUpdate").getValue();
			var accessRole = sap.ui.getCore().byId("accessUpdate").getValue();
			var userRole = sap.ui.getCore().byId("userRoleUpdate").getValue();

			// Email ID is mandatory
			if (emailID === undefined ||
				emailID === null ||
				emailID === "") {
				MessageBox.error("Email ID is mandatory");
				return 0;
			}

			// Company Code is mandatory
			if (compCode === undefined ||
				compCode === null ||
				compCode === "") {
				MessageBox.error("Company Code is mandatory");
				return 0;
			}

			// Management Unit is mandatory
			if (managementUnit === undefined ||
				managementUnit === null ||
				managementUnit === "") {
				MessageBox.error("Management Unit is mandatory");
				return 0;
			}

			// Cost Center is mandatory
			if (costCenter === undefined ||
				costCenter === null ||
				costCenter === "") {
				MessageBox.error("Cost Center is mandatory");
				return 0;
			}
			// Cost Center lenght check- aod405 
             if(costCenter.length >= 10000){
             	MessageBox.error("Cost Center Maximum Length Reached to 10k ");
             	return 0;
             }
             	
             			// Access is mandatory
			if (accessRole === undefined ||
				accessRole === null ||
				accessRole === "") {
				MessageBox.error("Access is mandatory");
				return 0;
			}

			// User Role is mandatory
			if (userRole === undefined ||
				userRole === null ||
				userRole === "") {
				MessageBox.error("User Role is mandatory");
				return 0;
			}

			this.saveUserRoleData(emailID, compCode, accessRole, userRole, managementUnit, costCenter);
			this._oDialogUpdate.destroy();
		},

		onUserRoleUpdate: function (oEvent) {
			var configNameUpdate = sap.ui.getCore().byId("configNameChange").getValue();
			var configValueUpdate = sap.ui.getCore().byId("configValueChange").getValue();

			// Config Name is mandatory
			if (configNameUpdate === undefined ||
				configNameUpdate === null ||
				configNameUpdate === "") {
				MessageBox.error("Config Name is mandatory");
				return 0;
			}

			// Config Value is mandatory
			if (configValueUpdate === undefined ||
				configValueUpdate === null ||
				configValueUpdate === "") {
				MessageBox.error("Config Value is mandatory");
				return 0;
			}

			this.saveConfigData(configNameUpdate, configValueUpdate);
			this._oDialogUpdate.destroy();

		},

		onSaveUpdate: function (oEvent) {
			var ctryCodeUpdate = sap.ui.getCore().byId("ctryChange").getValue();
			var ctryNameUpdate = sap.ui.getCore().byId("ctryNameChange").getValue();
			var compCdeUpdate = sap.ui.getCore().byId("ctryNameChange").getValue();

			// Country Code is mandatory
			if (ctryCodeUpdate === undefined ||
				ctryCodeUpdate === null ||
				ctryCodeUpdate === "") {
				MessageBox.error("Country Code is mandatory");
				return 0;
			}

			// Country Name is mandatory
			if (ctryNameUpdate === undefined ||
				ctryNameUpdate === null ||
				ctryNameUpdate === "") {
				MessageBox.error("Country Name is mandatory");
				return 0;
			}

			// Company Code is mandatory
			if (compCdeUpdate === undefined ||
				compCdeUpdate === null ||
				compCdeUpdate === "") {
				MessageBox.error("Company Code is mandatory");
				return 0;
			}

			this.saveData(ctryCodeUpdate, ctryNameUpdate, compCdeUpdate);
			this._oDialogUpdate.destroy();

		},

		onConfigSave: function (oEvent) {
			var configName = sap.ui.getCore().byId("configNameCreate").getValue();
			var configValue = sap.ui.getCore().byId("configValueCreate").getValue();

			// Config Name is mandatory
			if (configName === undefined ||
				configName === null ||
				configName === "") {
				MessageBox.error("Config Name is mandatory");
				return 0;
			}

			// Config Value is mandatory
			if (configValue === undefined ||
				configValue === null ||
				configValue === "") {
				MessageBox.error("Config Value is mandatory");
				return 0;
			}

			this.saveConfigData(configName, configValue);
			this._oDialog.destroy();
		},

		onThresholdSave: function (oEvent) {
			var currThreshold = sap.ui.getCore().byId("currThresholdCreate").getValue().toUpperCase();
			var ccodeThreshold = sap.ui.getCore().byId("ccodethresholdCreate").getValue();
			var threshold = sap.ui.getCore().byId("thresholdCreate").getValue();

			// Currency is mandatory
			if (currThreshold === undefined ||
				currThreshold === null ||
				currThreshold === "") {
				MessageBox.error("Currency is mandatory");
				return 0;
			}

			// Company Code is mandatory
			if (ccodeThreshold === undefined ||
				ccodeThreshold === null ||
				ccodeThreshold === "") {
				MessageBox.error("Company Code is mandatory");
				return 0;
			}

			// Threshold is mandatory
			if (threshold === undefined ||
				threshold === null ||
				threshold === "") {
				MessageBox.error("Threshold is mandatory");
				return 0;
			}

			this.saveThresholdData(currThreshold, ccodeThreshold, threshold);
			this._oDialog.destroy();

		},

		onLangSave: function (oEvent) {
			var langCode = sap.ui.getCore().byId("langCodeCreate").getValue().toUpperCase();
			var languageTxt = sap.ui.getCore().byId("languageCreate").getValue();

			// Langauge Code is mandatory
			if (langCode === undefined ||
				langCode === null ||
				langCode === "") {
				MessageBox.error("Language Code is mandatory");
				return 0;
			}

			// Language is mandatory
			if (languageTxt === undefined ||
				languageTxt === null ||
				languageTxt === "") {
				MessageBox.error("Language is mandatory");
				return 0;
			}

			this.saveLanguageData(langCode, languageTxt);
			this._oDialog.destroy();

		},

		onUserRoleSave: function (oEvent) {
			var emailID = sap.ui.getCore().byId("emailIDCreate").getValue().toLowerCase();
			var compCode = sap.ui.getCore().byId("companyCodeCreate").getValue();
			var managementUnit = sap.ui.getCore().byId("managementUnitCreate").getValue();
			var costCenter = sap.ui.getCore().byId("costCenterCreate").getValue();
			var accessRole = sap.ui.getCore().byId("accessCreate").getValue();
			var userRole = sap.ui.getCore().byId("userRoleCreate").getValue();

			// Email ID is mandatory
			if (emailID === undefined ||
				emailID === null ||
				emailID === "") {
				MessageBox.error("Email ID is mandatory");
				return 0;
			}

			// Company Code is mandatory
			if (compCode === undefined ||
				compCode === null ||
				compCode === "") {
				MessageBox.error("Company Code is mandatory");
				return 0;
			}

			// Management Unit is mandatory
			if (managementUnit === undefined ||
				managementUnit === null ||
				managementUnit === "") {
				MessageBox.error("Management Unit is mandatory");
				return 0;
			}

			// Cost Center is mandatory
			if (costCenter === undefined ||
				costCenter === null ||
				costCenter === "") {
				MessageBox.error("Cost Center is mandatory");
				return 0;
			}

              if(costCenter.length >= 10000){
             	MessageBox.error(" Cost Center Maximum Length Reached to 10k ");
             	return 0;
             }





			// Access is mandatory
			if (accessRole === undefined ||
				accessRole === null ||
				accessRole === "") {
				MessageBox.error("Access is mandatory");
				return 0;
			}

			// User Role is mandatory
			if (userRole === undefined ||
				userRole === null ||
				userRole === "") {
				MessageBox.error("User Role is mandatory");
				return 0;
			}
			
			
			
			

			this.saveUserRoleData(emailID, compCode, accessRole, userRole, managementUnit, costCenter);
			this._oDialog.destroy();
		},

		onCreateEmailTemplSave: function (oEvent) {
			var emailTemplType = sap.ui.getCore().byId("createEmailTemplType").getValue().toUpperCase();
			var emailLang = sap.ui.getCore().byId("emailCreateLanguage").getSelectedKey();
			var statusCheck = (sap.ui.getCore().byId("createEmailTemplCheck").getSelected() === true) ? "X" : "";
			var emailSubject = sap.ui.getCore().byId("createEmailTemplValSubject").getValue();
			var emailBody = sap.ui.getCore().byId("createEmailTemplVal2").getValue();

			// Email Template Type  is mandatory
			if (emailTemplType === undefined ||
				emailTemplType === null ||
				emailTemplType === "") {
				MessageBox.error("Email Template Type is mandatory");
				return 0;
			}

			// Language is mandatory
			if (emailLang === undefined ||
				emailLang === null ||
				emailLang === "") {
				MessageBox.error("Language is mandatory");
				return 0;
			}

			// Subject is mandatory
			if (emailSubject === undefined ||
				emailSubject === null ||
				emailSubject === "") {
				MessageBox.error("Subject is mandatory");
				return 0;
			}

			// Body is mandatory
			if (emailBody === undefined ||
				emailBody === null ||
				emailBody === "") {
				MessageBox.error("Email Body is mandatory");
				return 0;
			}

			this.saveEmailTemplateData(emailTemplType, emailLang, statusCheck, emailSubject, emailBody);
			this._oDialog.destroy();
		},

		onSave: function (oEvent) {
			var countryCode = sap.ui.getCore().byId("ctryCreate").getValue();
			var countryName = sap.ui.getCore().byId("ctryNameCreate").getValue();
			var compCode = sap.ui.getCore().byId("cmpCdeCreate").getValue();

			// Country Code is mandatory
			if (countryCode === undefined ||
				countryCode === null ||
				countryCode === "") {
				MessageBox.error("Country Code is mandatory");
				return 0;
			}

			// Country Name is mandatory
			if (countryName === undefined ||
				countryName === null ||
				countryName === "") {
				MessageBox.error("Country Name is mandatory");
				return 0;
			}

			// Company Code is mandatory
			if (compCode === undefined ||
				compCode === null ||
				compCode === "") {
				MessageBox.error("Company Code is mandatory");
				return 0;
			}

			this.saveData(countryCode, countryName, compCode);
			this._oDialog.destroy();
		},

		saveThresholdData: function (currThreshold, ccodeThreshold, threshold) {

			// var that = this;
			// Map to JSON data		
			var JSON_DATA = {
				"CURRENCY": currThreshold,
				"COMPANY_CODE": ccodeThreshold,
				"PO_THRESHOLD": threshold
			};
			// Making an AJAX POST call
			$.ajax({
				type: "POST",
				url: oController.uri + "insertThreshold.xsjs",
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify(JSON_DATA),
				async: false,
				cache: false,
				success: function (data) {
					MessageBox.success("Threshold Saved");
					oController.getThreshold();

				},
				error: function (error) {
					MessageBox.error("Failed To Save Threshold");
					oController.getThreshold();
				}
			});

			// reset the selection of records
			var oTable = this.getView().byId("ThresholdTable");
			oTable.clearSelection();

		},
		saveLanguageData: function (langCode, languageTxt) {

			var that = this;
			// Map to JSON data		
			var JSON_DATA = {
				"LANG_CODE": langCode,
				"LANGUAGE": languageTxt
			};
			// Making an AJAX POST call
			$.ajax({
				type: "POST",
				url: oController.uri + "insertLanguage.xsjs",
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify(JSON_DATA),
				async: false,
				cache: false,
				success: function (data) {
					MessageBox.success("Language Saved");
					oController.getLanguages();

				},
				error: function (error) {
					MessageBox.error("Failed To Save Language");
					oController.getLanguages();
				}
			});

			// reset the selection of records
			var oTable = this.getView().byId("langConfigTable");
			oTable.clearSelection();

		},

		saveEmailTemplateData: function (emailTemplType, emailLang, statusCheck, emailSubject, emailBody) {

			var that = this;
			// Map to JSON data		
			var JSON_DATA = {
				"TEMPLATE_NAME": emailTemplType,
				"LANGUAGE": emailLang,
				"SUBJECT": emailSubject,
				"BODY": emailBody,
				"STATUS": statusCheck
			};
			// Making an AJAX POST call
			$.ajax({
				type: "POST",
				url: oController.uri + "insertEmailTemplate.xsjs",
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify(JSON_DATA),
				async: false,
				cache: false,
				success: function (data) {
					MessageBox.success("Email Template Saved");
					oController.getEmailTemplates();

				},
				error: function (error) {
					MessageBox.error("Failed To Save Email Template");
					oController.getEmailTemplates();
				}
			});

			// reset the selection of records
			var oTable = this.getView().byId("emailTemplateTable");
			oTable.clearSelection();

		},
		saveUserRoleData: function (emailID, companyCode, accessRole, userRole, managementUnit, costCenter) {
			// var that = this;
			// Map to JSON data		
			var JSON_DATA = {
				"USER_ROLE": userRole,
				"USER_EMAILID": emailID,
				"USER_ACCESS": accessRole,
				"COMPANY_CODE": companyCode,
				"MANAGEMENT_UNIT": managementUnit,
				"COST_CENTER": costCenter
			};
			// Making an AJAX POST call
			$.ajax({
				type: "POST",
				url: oController.uri + "insertUserRole.xsjs",
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify(JSON_DATA),
				async: false,
				cache: false,
				success: function (data) {
					MessageBox.success("User Roles Saved");
					oController.getUserRoles();

				},
				error: function (error) {
					MessageBox.error("Failed To Save User Roles");
					oController.getUserRoles();
				}
			});

			// reset the selection of records
			var oTable = this.getView().byId("UserRoleTable");
			oTable.clearSelection();
		},

		saveConfigData: function (configName, configValue) {
			// var that = this;
			// Map to JSON data		
			var JSON_DATA = {
				"name": configName,
				"value": configValue
			};
			// Making an AJAX POST call
			$.ajax({
				type: "POST",
				url: oController.uri + "insertConfigValues.xsjs",
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify(JSON_DATA),
				async: false,
				cache: false,
				success: function (data) {
					MessageBox.success("Config Details Saved");

					oController.getConfig();

				},
				error: function (error) {
					MessageBox.error("Failed To Save Config");
					oController.getConfig();
				}
			});

			// reset the selection of records
			var oTable = this.getView().byId("ConfigTable");
			oTable.clearSelection();
		},

		saveData: function (countryCode, countryName, compCode) {
			// var that = this;
			// Map to JSON data		
			var JSON_DATA = {
				"country_code": countryCode,
				"country_name": countryName,
				"bukrs": compCode
			};
			// Making an AJAX POST call
			$.ajax({
				type: "POST",
				url: oController.uri + "insertCountry.xsjs",
				//url: "/comtakedaAccrual_UI5/XSA_HTTP_ACCRUAL/xsjs/insertCountry.xsjs",
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify(JSON_DATA),
				async: false,
				cache: false,
				success: function (data) {
					MessageBox.success("Country Details Saved");
					//oController.getView().getModel().refresh();
					oController.getcountryConfig();

				},
				error: function (error) {
					MessageBox.error("Failed To Save Country");
					// oController.getView().getModel().refresh();
					oController.getcountryConfig();
				}
			});

			// reset the selection of records
			var oTable = this.getView().byId("countryConfigTable");
			oTable.clearSelection();
		},

		onPressThresholdDelete: function () {

			if (!FlagDialog) {
				MessageBox.information("Select Currency Code To Delete");
				return 0;
			}

			MessageBox.confirm("Are you sure want to delete the Threshold   ? ", {
				title: "Confirmation",
				icon: 'sap-icon://message-success',
				initialFocus: sap.m.MessageBox.Action.CANCEL,
				onClose: function (sButton) {
					if (sButton === MessageBox.Action.OK) {
						// Collect the data and call AJAX 
						var oTable = oController.getView().byId("ThresholdTable");

						// Get the Data
						thresholdSelected = thresholdSelected === "" ? null : thresholdSelected;
						ccodeThresholdSelected = ccodeThresholdSelected === "" ? null : ccodeThresholdSelected;
						currThresholdSelected = currThresholdSelected === "" ? null : currThresholdSelected;

						var jsonData = {
							"CURRENCY": currThresholdSelected,
							"COMPANY_CODE": ccodeThresholdSelected
						};

						// Making an AJAX POST call
						$.ajax({
							type: "POST",
							url: oController.uri + "deleteThreshold.xsjs",

							dataType: "json",
							contentType: "application/json",
							data: JSON.stringify(jsonData),
							async: false,
							cache: false,
							success: function (data) {
								MessageBox.success("Threshold Deleted Successfully");
								//oController.getView().getModel().refresh();
								oController.getThreshold();

							},
							error: function (error) {
								MessageBox.error("Failed To Delete Threshold");
								//oController.getView().getModel().refresh();
								oController.getThreshold();
							}
						});
					} else if (sButton === MessageBox.Action.CANCEL) {
						// Do Nothing

					}
					oTable.clearSelection();
				}
			});

		},

		onPressConfigDelete: function () {

			if (!FlagDialog) {
				MessageBox.information("Select Config name To Delete");
				return 0;
			}

			MessageBox.confirm("Are you sure want to delete the Config   ? ", {
				title: "Confirmation",
				icon: 'sap-icon://message-success',
				initialFocus: sap.m.MessageBox.Action.CANCEL,
				onClose: function (sButton) {
					if (sButton === MessageBox.Action.OK) {
						// Collect the data and call AJAX 
						var oTable = oController.getView().byId("ConfigTable");

						// Get the Data
						configNameSelected = configNameSelected === "" ? null : configNameSelected;
						configValueSelected = configValueSelected === "" ? null : configValueSelected;

						var jsonData = {
							"name": configNameSelected,
							"value": configValueSelected
						};

						// Making an AJAX POST call
						$.ajax({
							type: "POST",
							url: oController.uri + "deleteConfigValues.xsjs",

							dataType: "json",
							contentType: "application/json",
							data: JSON.stringify(jsonData),
							async: false,
							cache: false,
							success: function (data) {
								MessageBox.success("Config Name Deleted Successfully");
								//oController.getView().getModel().refresh();
								oController.getConfig();

							},
							error: function (error) {
								MessageBox.error("Failed To Delete Config Name");
								//oController.getView().getModel().refresh();
								oController.getConfig();
							}
						});
					} else if (sButton === MessageBox.Action.CANCEL) {
						// Do Nothing

					}
					oTable.clearSelection();
				}
			});

		},

		onPressLangDelete: function () {

			if (!FlagDialog) {
				MessageBox.information("Select Language Code To Delete");
				return 0;
			}

			MessageBox.confirm("Are you sure want to delete the Language Code   ? ", {
				title: "Confirmation",
				icon: 'sap-icon://message-success',
				initialFocus: sap.m.MessageBox.Action.CANCEL,
				onClose: function (sButton) {
					if (sButton === MessageBox.Action.OK) {
						// Collect the data and call AJAX 
						var oTable = oController.getView().byId("langConfigTable");

						// Get the Data
						langCodeSelected = langCodeSelected == "" ? null : langCodeSelected;
						langTxtSelected = langTxtSelected == "" ? null : langTxtSelected;

						var jsonData = {
							"LANG_CODE": langCodeSelected,
						};

						// Making an AJAX POST call
						$.ajax({
							type: "POST",
							url: oController.uri + "deleteLanguages.xsjs",
							dataType: "json",
							contentType: "application/json",
							data: JSON.stringify(jsonData),
							async: false,
							cache: false,
							success: function (data) {
								MessageBox.success("Langauge Deleted Successfully");
								//oController.getView().getModel().refresh();
								oController.getLanguages();

							},
							error: function (error) {
								MessageBox.error("Failed To Delete Langauge");
								//oController.getView().getModel().refresh();
								oController.getLanguages();
							}
						});
					} else if (sButton === MessageBox.Action.CANCEL) {
						// Do Nothing

					}
					oTable.clearSelection();
				}
			});

		},

		onPressUserRoleDelete: function () {

			if (!FlagDialog) {
				MessageBox.information("Select Email ID  To Delete");
				return 0;
			}

			MessageBox.confirm("Are you sure want to delete the Email ID Role   ? ", {
				title: "Confirmation",
				icon: 'sap-icon://message-success',
				initialFocus: sap.m.MessageBox.Action.CANCEL,
				onClose: function (sButton) {
					if (sButton === MessageBox.Action.OK) {
						// Collect the data and call AJAX 
						var oTable = oController.getView().byId("ConfigTable");

						// Get the Data
						emailIDSelected = emailIDSelected === "" ? null : emailIDSelected;
						userCompanyCodeSelected = userCompanyCodeSelected === "" ? null : userCompanyCodeSelected;
						userAcessSelected = userAcessSelected === "" ? null : userAcessSelected;
						userRoleSelected = userRoleSelected === "" ? null : userRoleSelected;

						var jsonData = {
							"USER_EMAILID": emailIDSelected,
							"COMPANY_CODE": userCompanyCodeSelected
						};

						// Making an AJAX POST call
						$.ajax({
							type: "POST",
							url: oController.uri + "deleteUserRole.xsjs",

							dataType: "json",
							contentType: "application/json",
							data: JSON.stringify(jsonData),
							async: false,
							cache: false,
							success: function (data) {
								MessageBox.success("User Role Deleted Successfully");
								//oController.getView().getModel().refresh();
								oController.getUserRoles();

							},
							error: function (error) {
								MessageBox.error("Failed To Delete User Role");
								//oController.getView().getModel().refresh();
								oController.getUserRoles();
							}
						});
					} else if (sButton === MessageBox.Action.CANCEL) {
						// Do Nothing

					}
					oTable.clearSelection();
				}
			});

		},

		onPressDelete: function () {

			if (!FlagDialog) {
				MessageBox.information("Select Country Code To Delete");
				return 0;
			}

			MessageBox.confirm("Are you sure want to delete the Country Code  ? ", {
				title: "Confirmation",
				icon: 'sap-icon://message-success',
				initialFocus: sap.m.MessageBox.Action.CANCEL,
				onClose: function (sButton) {
					if (sButton === MessageBox.Action.OK) {
						// Collect the data and call AJAX 
						var oTable = oController.getView().byId("countryConfigTable");

						// Get the Data
						countryCodeSelected = countryCodeSelected === "" ? null : countryCodeSelected;
						countryNameSelected = countryNameSelected === "" ? null : countryNameSelected;
						companyCodeSelected = companyCodeSelected === "" ? null : companyCodeSelected;

						var jsonData = {
							"country_code": countryCodeSelected,
							"country_name": countryNameSelected,
							"bukrs": companyCodeSelected
						};

						// Making an AJAX POST call
						$.ajax({
							type: "POST",
							url: oController.uri + "deleteCountry.xsjs",
							dataType: "json",
							contentType: "application/json",
							data: JSON.stringify(jsonData),
							async: false,
							cache: false,
							success: function (data) {
								MessageBox.success("Country Code Deleted Successfully");
								//oController.getView().getModel().refresh();
								oController.getcountryConfig();

							},
							error: function (error) {
								MessageBox.error("Failed To Delete Country Code");
								//oController.getView().getModel().refresh();
								oController.getcountryConfig();
							}
						});
					} else if (sButton === MessageBox.Action.CANCEL) {
						// Do Nothing

					}
					oTable.clearSelection();
				}
			});

		},
		onPressEmailTemplateDelete: function () {

			if (!FlagDialog) {
				MessageBox.information("Select Email Template To Delete");
				return 0;
			}

			MessageBox.confirm("Are you sure want to delete the Email Template  ? ", {
				title: "Confirmation",
				icon: 'sap-icon://message-success',
				initialFocus: sap.m.MessageBox.Action.CANCEL,
				onClose: function (sButton) {
					if (sButton === MessageBox.Action.OK) {
						// Collect the data and call AJAX 
						var oTable = oController.getView().byId("emailTemplateTable");

						// Get the Data
						emailtemplSelected = emailtemplSelected == "" ? null : emailtemplSelected;
						emailLangSelected = emailLangSelected == "" ? null : emailLangSelected;

						var jsonData = {
							"TEMPLATE_NAME": emailtemplSelected,
							"LANGUAGE": emailLangSelected
						};

						// Making an AJAX POST call
						$.ajax({
							type: "POST",
							url: oController.uri + "deleteEmailTemplate.xsjs",
							dataType: "json",
							contentType: "application/json",
							data: JSON.stringify(jsonData),
							async: false,
							cache: false,
							success: function (data) {
								MessageBox.success("Email Template Deleted Successfully");
								//oController.getView().getModel().refresh();
								oController.getEmailTemplates();

							},
							error: function (error) {
								MessageBox.error("Failed To Delete Email Template");
								//oController.getView().getModel().refresh();
								oController.getEmailTemplates();
							}
						});
					} else if (sButton === MessageBox.Action.CANCEL) {
						// Do Nothing

					}
					oTable.clearSelection();
				}
			});

		},

		action: function (oEvent) {

			if (oEvent.getSource().getSelectedIndex() !== -1) {
				FlagDialog = true;
			} else {
				FlagDialog = false;
			}

			var context = oEvent.getParameter("rowContext");
			var oTableDele = this.getView().byId("countryConfigTable");

			countryCodeSelected = oTableDele.getModel().getProperty("COUNTRY_CODE", context);

			countryNameSelected = oTableDele.getModel().getProperty("COUNTRY_NAME", context);
			companyCodeSelected = oTableDele.getModel().getProperty("BUKRS", context);

		},

		actionConfig: function (oEvent) {
			if (oEvent.getSource().getSelectedIndex() !== -1) {
				FlagDialog = true;
			} else {
				FlagDialog = false;
			}

			var context = oEvent.getParameter("rowContext");
			var oTableDele = this.getView().byId("ConfigTable");

			configNameSelected = oTableDele.getModel().getProperty("CONFIG_NAME", context);
			configValueSelected = oTableDele.getModel().getProperty("CONFIG_VALUE", context);

		},
		actionUserRole: function (oEvent) {
			if (oEvent.getSource().getSelectedIndex() !== -1) {
				FlagDialog = true;
			} else {
				FlagDialog = false;
			}

			var context = oEvent.getParameter("rowContext");
			var oTableDele = this.getView().byId("UserRoleTable");

			emailIDSelected = oTableDele.getModel().getProperty("USER_EMAILID", context);
			userCompanyCodeSelected = oTableDele.getModel().getProperty("COMPANY_CODE", context);
			managementUnitSelected = oTableDele.getModel().getProperty("MANAGEMENT_UNIT", context);
			costCenterSelected = oTableDele.getModel().getProperty("COST_CENTER", context);
			userAcessSelected = oTableDele.getModel().getProperty("USER_ACCESS", context);
			userRoleSelected = oTableDele.getModel().getProperty("USER_ROLE", context);

		},

		actionThreshold: function (oEvent) {
			if (oEvent.getSource().getSelectedIndex() !== -1) {
				FlagDialog = true;
			} else {
				FlagDialog = false;
			}

			var context = oEvent.getParameter("rowContext");
			var oTableDele = this.getView().byId("ThresholdTable");

			currThresholdSelected = oTableDele.getModel().getProperty("CURRENCY", context);
			ccodeThresholdSelected = oTableDele.getModel().getProperty("COMPANY_CODE", context);
			thresholdSelected = oTableDele.getModel().getProperty("PO_THRESHOLD", context);

		},
		actionEmailTempl: function (oEvent) {
			if (oEvent.getSource().getSelectedIndex() !== -1) {
				FlagDialog = true;
			} else {
				FlagDialog = false;
			}

			var context = oEvent.getParameter("rowContext");
			var oTableDele = this.getView().byId("emailTemplateTable");

			emailtemplSelected = oTableDele.getModel().getProperty("TEMPLATE_NAME", context);
			emailLangSelected = oTableDele.getModel().getProperty("LANGUAGE", context);
			emailSubSelected = oTableDele.getModel().getProperty("SUBJECT", context);
			emailBodySelected = oTableDele.getModel().getProperty("BODY", context);
			emailStatusSelected = oTableDele.getModel().getProperty("STATUS", context);

		},

		actionLang: function (oEvent) {
			if (oEvent.getSource().getSelectedIndex() !== -1) {
				FlagDialog = true;
			} else {
				FlagDialog = false;
			}

			var context = oEvent.getParameter("rowContext");
			var oTableDele = this.getView().byId("langConfigTable");

			langCodeSelected = oTableDele.getModel().getProperty("LANG_CODE", context);
			langTxtSelected = oTableDele.getModel().getProperty("LANGUAGE", context);

		}

	});
});