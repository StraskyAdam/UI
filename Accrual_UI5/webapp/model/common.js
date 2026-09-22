sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/core/format/NumberFormat"
], function (JSONModel, MessageBox, NumberFormat) {
	"use strict";
	var userRoleDataModel;
	return {
		/* Get PDF */
		getPDF: function (oController) {
			var oRootPath = jQuery.sap.getModulePath("com.takeda.Accrual_UI5"),
				sPath = oRootPath + '/pdf/UserGuide.pdf';

			var pdfModel = new sap.ui.model.json.JSONModel({
				Source: sPath,
				Title: oController.geti18nText("guide"),
				Height: "600px"
			});
			oController.getView().setModel(pdfModel, "pdfModel");
		},

		/* Get the Configuration Values from backend */
		getConfigValues: function (oController) {
			var configValuesModel = oController.getOwnerComponent().getModel("config");
			var configDataModel = new sap.ui.model.json.JSONModel();
			var that = oController;
			configValuesModel.read("/configValues", {
				success: function (oData, oResponse) {
					configDataModel.setData(oData);
					that.getView().setModel(configDataModel, "configDataModel");
				},
				error: function (error) {}
			});
		},

		/* Get User Role */
		getUserRole: function (oController, emailId) {
			oController.RoleDef = $.Deferred();
			var userRoleModel = oController.getOwnerComponent().getModel("userRoleModel");
			userRoleDataModel = new sap.ui.model.json.JSONModel();
			var filters = new Array();
			var filterByName = new sap.ui.model.Filter("USER_EMAILID", sap.ui.model.FilterOperator.EQ, emailId);
			filters.push(filterByName);

			var that = oController;
			userRoleModel.read("/userRole", {
				filters: filters,
				urlParameters: {
					"$top": 1
				},
				success: function (oData, oResponse) {
					userRoleDataModel.setData(oData);
					// Set UserModel
					that.getView().setModel(userRoleDataModel, "userRoleDataModel");
					oController.RoleDef.resolve();

				},
				error: function (error) {
					oController.RoleDef.resolve();
				}
			});

		},
		// get links based on roles
		getLinksData: function (oController) {
			oController.LinkDefTBS = $.Deferred();
			var linkModel = oController.getOwnerComponent().getModel("helpLinkModel");
			var linkJSONModel = new sap.ui.model.json.JSONModel();
			var that = oController,
				linkArr = [];
			var lang = sap.ui.getCore().getConfiguration().getLanguage().toUpperCase();
			if (lang == "ZH-TW") {
				lang = "ZH_TW";
			} else {
				lang = sap.ui.getCore().getConfiguration().getLanguage().slice(0, 2).toUpperCase();
			}
			linkModel.read("/helpLinksParameters(IP_LANG='" + lang + "')/Results", {

				success: function (oData, oResponse) {
					// var model = userRoleDataModel;
					var checkUserLoginRole = userRoleDataModel.oData.results[0].USER_ROLE;
					for (var i = 0; i < oData.results.length; i++) {
						if (oData.results[i].ROLE === "PO_OWNER") {
							linkArr.push(oData.results[i]);
						}
						if (oData.results[i].ROLE !== "PO_OWNER" && checkUserLoginRole === "TBS") {
							linkArr.push(oData.results[i]);
						} else if (checkUserLoginRole.toUpperCase() === "FINANCE" && oData.results[i].ROLE.search("FINANCE") > 0) {
							linkArr.push(oData.results[i]);
						} else if (checkUserLoginRole.toUpperCase() === "ADMIN" && oData.results[i].ROLE.search("ADMIN") > 0) {
							linkArr.push(oData.results[i]);
						} else if (checkUserLoginRole.toUpperCase() === "ADMIN" && oData.results[i].ROLE === "TBS") {
							linkArr.push(oData.results[i]);
						} else if (checkUserLoginRole.toUpperCase() === "FINANCE" && oData.results[i].ROLE === "TBS") {
							linkArr.push(oData.results[i]);
						}
					}
					linkJSONModel.setData(linkArr);
					that.getView().setModel(linkJSONModel, "refLinkModel");
					oController.LinkDefTBS.resolve();
				},
				error: function (error) {
					this.displayErrorMessage(oController);
					oController.LinkDefTBS.resolve();
				}
			});
		},
		/* Get User Details */
		getUserDetails: function (oController, emailId) {
			var userDetailsModel = oController.getOwnerComponent().getModel("userDetails");
			var userModel = new sap.ui.model.json.JSONModel();
			var filters = new Array();
			var filterByName = new sap.ui.model.Filter("EMAILADDR", sap.ui.model.FilterOperator.EQ, emailId);
			filters.push(filterByName);

			var that = oController;
			userDetailsModel.read("/user", {
				filters: filters,
				urlParameters: {
					"$top": 1
				},
				success: function (oData, oResponse) {
					userModel.setData(oData);
					if (oData.results[0] === undefined) {
						oController.userDecimalFormat = "X";
					} else {
						oController.userDecimalFormat = oData.results[0].DECIMAL_FORMAT;
					}
					// Set UserModel
					that.getView().setModel(userModel, "userModel");
				},
				error: function (error) {

				}
			});

		},

		// Change the cell color ( editable )

		changeCellColor: function (cols, oTableBatch, oController, tableId, amountColId, PercColId, workStartColId, workEndColId) {
			// Initialize Variables 
			var aRows;
			// Fetching the Table Id
			oTableBatch = oController.getView().byId(tableId);
			cols = oTableBatch.getColumns();
			oTableBatch.addEventDelegate({
				onAfterRendering: function () {
					aRows = oTableBatch.getRows();
					cols = oTableBatch.getColumns();
					for (var j = 0; j < cols.length; j++) {
						if ((oTableBatch.getColumns()[j].getId().split("-")[2] === amountColId) ||
							(oTableBatch.getColumns()[j].getId().split("-")[2] === PercColId)) {
							for (var i = 0; i < aRows.length; i++) {
								var cCel3 = aRows[i].getCells()[j];
								// Changing the cell background color for editable fields
								$("#" + cCel3.getId()).parent().parent().css("background-color", "#ee110024");
							}
						} else if ((oTableBatch.getColumns()[j].getId().split("-")[2] === workStartColId) ||
							(oTableBatch.getColumns()[j].getId().split("-")[2] === workEndColId)) {
							for (var k = 0; k < aRows.length; k++) {
								var dateFields = aRows[k].getCells()[j].mProperties.text;
								if ((dateFields === "") || (dateFields === " ") || (dateFields === null) || (dateFields === undefined)) {
									// Changing link color
									aRows[k].getCells()[0].$().addClass("POLink");
								}
							}
						}
					}
				}
			}, oTableBatch);
			return cols;
		},

		changeCellColorThr: function (cols1, oTableBatch1, oController, tableId, amountColId, PercColId, workStartColId, workEndColId) {
			// Initialize Variables 
			var aRows1;
			// Fetching the Table Id
			oTableBatch1 = oController.getView().byId(tableId);
			cols1 = oTableBatch.getColumns();
			oTableBatch1.addEventDelegate({
				onAfterRendering: function () {
					aRows1 = oTableBatch1.getRows();
					cols1 = oTableBatch1.getColumns();
					for (var j = 0; j < cols1.length; j++) {
						if ((oTableBatch1.getColumns()[j].getId().split("-")[2] === amountColId) ||
							(oTableBatch1.getColumns()[j].getId().split("-")[2] === PercColId)) {
							for (var i = 0; i < aRows1.length; i++) {
								var cCel4 = aRows1[i].getCells()[j];
								// Changing the cell background color for editable fields
								$("#" + cCel4.getId()).parent().parent().css("background-color", "#ee110024");
							}
						} else if ((oTableBatch1.getColumns()[j].getId().split("-")[2] === workStartColId) ||
							(oTableBatch1.getColumns()[j].getId().split("-")[2] === workEndColId)) {
							for (var k = 0; k < aRows1.length; k++) {
								var dateFields = aRows1[k].getCells()[j].mProperties.text;
								if ((dateFields === "") || (dateFields === " ") || (dateFields === null) || (dateFields === undefined)) {
									// Changing link color
									aRows1[k].getCells()[0].$().addClass("POLink");
								}
							}
						}
					}
				}
			}, oTableBatch1);
			return cols1;
		},

		// If the Newly created PO ( created this month ) count > 0, then enable the icon below the table
		setNewPOIconVisibility: function (oController, allDataAct1, sId) {
			if (allDataAct1.filter(e => e.POCREATEDAT.getMonth().toString() + e.POCREATEDAT.getYear().toString() ===
					new Date().getMonth().toString() + new Date().getYear().toString()).length > 0)

			{
				oController.getView().byId(sId).setVisible(true)
			} else {
				oController.getView().byId(sId).setVisible(false)
			}
		},
		// // If PO Owner was notified within last 24 hrs, Legend
		setNotifIconVisibility: function (oController, allDataAct1, sId) {
			if (allDataAct1.filter(e => e.NOTIF_24_HR === 'X').length > 0) {
				oController.getView().byId(sId).setVisible(true)
			} else {
				oController.getView().byId(sId).setVisible(false)
			}
		},

		displayErrorMessage: function (oController) {

			var aConfigData = oController.getView().getModel("configDataModel").getData().results,
				sServiceNowLink = aConfigData.filter(function (ConfigData) {
					return ConfigData.CONFIG_NAME === "SERVICE_NOW";
				})[0].CONFIG_VALUE;

			if (!this.oErrorDialog) {
				this.oErrorDialog = new sap.m.Dialog({
					title: "Error",
					type: sap.m.DialogType.Message,
					state: sap.ui.core.ValueState.Error,
					content: [
						new sap.ui.layout.VerticalLayout({
							width: "20rem",
							content: [
								new sap.m.Text({
									text: oController.geti18nText("load")
								}),

								new sap.ui.layout.HorizontalLayout({
									content: [
										new sap.m.Text({
											text: oController.geti18nText("please"),
											width: "10.2rem"
										}),
										new sap.m.Link({
											text: oController.geti18nText("ticket"),
											width: "2.3rem",
											type: "Transparent",
											href: sServiceNowLink,
											target: "_blank"
										}),
										new sap.m.Text({
											text: oController.geti18nText("issue")
										})
									]
								})
							]
						})
					],
					endButton: new sap.m.Button({
						text: oController.geti18nText("close"),
						press: function () {
							this.oErrorDialog.close();
						}.bind(this)
					})
				});
			}

			this.oErrorDialog.open();
		},

		createTableCountModel: function () {
			var oModel = new JSONModel({
				PoOver50: 0,
				PoOver50Services: 0,
				PoOver50Materials: 0,
				PoUnder50: 0,
				PoUnder50Services: 0,
				PoUnder50Materials: 0,
				PoInformation: 0
			});
			return oModel;
		},

		updateTableCountModel: function (sProperty, iCount) {
			var oTableCountModel = this.getView().getModel("tableCountModel"),
				iCurrentCount,
				// iCurrentCount = oTableCountModel.getProperty(sProperty),

				oIntegerFormat = NumberFormat.getIntegerInstance({
					maxFractionDigits: 0,
					minFractionDigits: 0,
					groupingEnabled: true
				}, sap.ui.getCore().getConfiguration().getLocale());

			oTableCountModel.setProperty(sProperty, oIntegerFormat.format(iCount));

			if (sProperty === "/PoUnder50Materials") {
				iCurrentCount = oTableCountModel.getProperty("/PoUnder50Services");
				iCurrentCount = oIntegerFormat.parse(iCurrentCount);
				iCount = oIntegerFormat.format(iCount + iCurrentCount);
				oTableCountModel.setProperty("/PoUnder50", iCount);
			}

			if (sProperty === "/PoUnder50Services") {
				iCurrentCount = oTableCountModel.getProperty("/PoUnder50Materials");
				iCurrentCount = oIntegerFormat.parse(iCurrentCount);
				iCount = oIntegerFormat.format(iCount + iCurrentCount);
				oTableCountModel.setProperty("/PoUnder50", iCount);
			}

			if (sProperty === "/PoOver50Materials") {
				iCurrentCount = oTableCountModel.getProperty("/PoOver50Services");
				iCurrentCount = oIntegerFormat.parse(iCurrentCount);
				iCount = oIntegerFormat.format(iCount + iCurrentCount);
				oTableCountModel.setProperty("/PoOver50", iCount);
			}

			if (sProperty === "/PoOver50Services") {
				iCurrentCount = oTableCountModel.getProperty("/PoOver50Materials");
				iCurrentCount = oIntegerFormat.parse(iCurrentCount);
				iCount = oIntegerFormat.format(iCount + iCurrentCount);
				oTableCountModel.setProperty("/PoOver50", iCount);
			}

			if (sProperty === "/PoInformation") {
				iCount = oIntegerFormat.format(iCount);
				oTableCountModel.setProperty("/PoInformation", iCount);
			}
		}

	};

});