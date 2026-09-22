sap.ui.define([

], function () {
	"use strict";

	return {

		valueHelpDialogSupName: function (oEvent, oController, SNListJson, SupNameSearchToken, myThis) {
			oController.oControl = oEvent.getSource();
			var that = myThis;
			var sText = oController.getOwnerComponent().getModel("i18n").getResourceBundle();
			var aCols = {
				"cols": [{
					"label": sText.getText("supplierId"),
					"template": "SUPPLIERID",
					"width": "auto"
				}, {
					"label": sText.getText("supplierName"),
					"template": "SUPPLIERNAME",
					"width": "auto"
				}]
			};
			that._SNSearchField = new sap.m.SearchField({
				placeholder: "{i18n>supplierName}",
				showSearchButton: true,
				liveChange: function (oEvent) {
					oController.onSupNameSearch(oEvent);
				}
			});
			that.oColModel = new sap.ui.model.json.JSONModel(aCols);
			that._oValueHelpDialogSupName = sap.ui.xmlfragment("com.takeda.Accrual_UI5.fragment.supplierValueHelp", that);
			that.getView().addDependent(oController._oValueHelpDialogSupName);
			var oFilterBar = that._oValueHelpDialogSupName.getFilterBar();
			oFilterBar.setBasicSearch(that._SNSearchField);
			that._oValueHelpDialogSupName.getTableAsync().then(function (oTable) {
				var finalData = SNListJson;
				oTable.setModel(finalData);
				// oTable.setFixedColumnCount();
				oTable.setModel(that.oColModel, "columns");
				oTable.setSelectionMode("MultiToggle");
				// oTable.addStyleClass("onbehalf");
				if (oTable.bindRows) {
					oTable.bindAggregation("rows", "/results");
				}
				oTable.attachEvent("rowSelectionChange", {}, this._supNameFilterSelectionChange, this);
				if (oTable.bindItems) {
					oTable.bindAggregation("items", "/results", function () {
						return new sap.m.ColumnListItem({
							cells: aCols.map(function (column) {
								return new sap.m.Label({
									text: "{" + column.template + "}"
								});
							})
						});
					});
				}
				that._oValueHelpDialogSupName.update();
			}.bind(that));
			if (SupNameSearchToken !== undefined) {
				that._oValueHelpDialogSupName.setTokens(SupNameSearchToken);
			}
			that._oValueHelpDialogSupName.open();
		},

		supNameSearch: function (oEvent, oController, emailId, loginUserRole, pstype, that, selectedSuppValueHelp) {
			sap.ui.core.BusyIndicator.hide();
			var aFilters = [];
			var SNListJson = new sap.ui.model.json.JSONModel();
			if (oEvent.getParameters().newValue === "") {
				return 0;
			}
			var valNew = oEvent.getParameters().newValue;
			// 		// Case sensitive 
			var string = oEvent.getParameters().newValue;
			var n = string.split(".");
			var vfinal = "";
			if (isNaN(valNew) === true) {
				for (var i = 0; i < n.length; i++) {
					var spaceput = "";
					var spaceCount = n[i].replace(/^(\s*).*$/, "$1").length;
					n[i] = n[i].replace(/^\s+/, "");
					// var newstring = n[i].charAt(n[i]).toUpperCase() + n[i].slice(1);
					var newstring = n[i].charAt(n[i]).toUpperCase() + n[i].slice(1).toLocaleLowerCase();
					for (var j = 0; j < spaceCount; j++)
						spaceput = spaceput + " ";
					vfinal = vfinal + spaceput + newstring + ".";
				}
				vfinal = vfinal.substring(0, vfinal.length - 1);
			} else {
				vfinal = valNew;
			}
			var filter = new sap.ui.model.Filter([
					// new sap.ui.model.Filter("SUPPLIERNAME", sap.ui.model.FilterOperator.Contains, oEvent.getParameters().newValue.toUpperCase()),
					// new sap.ui.model.Filter("SUPPLIERNAME", sap.ui.model.FilterOperator.Contains, oEvent.getParameters().newValue.toLowerCase()),
					new sap.ui.model.Filter("SUPPLIERNAME", sap.ui.model.FilterOperator.Contains, valNew),
				],
				false);
			aFilters.push(filter);
			// Using this method to get the Supplier Name

			if ((selectedSuppValueHelp === 'M') || (selectedSuppValueHelp === 'S')) {
				var supplierList = that.getOwnerComponent().getModel();
				var uri = "/openPOParameters(IP_PSTYPE='" + pstype + "',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results";
			} else if (selectedSuppValueHelp === 'T') {
				var supplierList = that.getOwnerComponent().getModel("thresholdModel");
				var uri = "/thresholdParameters(IP_PSTYPE='9',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results";
			} else if (selectedSuppValueHelp === 'H') { //gree
				var supplierList = that.getOwnerComponent().getModel("thresholdModel");
				var uri = "/thresholdParameters(IP_PSTYPE='0',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results";
			} else if (selectedSuppValueHelp === 'E') {
				var supplierList = that.getOwnerComponent().getModel("excludedPOModel");
				var uri = "/exclusionPOParameters(IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results";
			};

			sap.ui.core.BusyIndicator.show();
			supplierList.read(uri, {
				filters: aFilters,
				select: "SUPPLIERID,SUPPLIERNAME",
				urlParameters: {
					"$top": "1000"
				},
				success: function (oData, oResponse) {
					// Remove duplicate Item numbers to be shown 
					oData.results = oData.results.filter((arr, index, self) => index === self.findIndex((t) =>
						(t.SUPPLIERID === arr.SUPPLIERID)));
					var attModel = new sap.ui.model.json.JSONModel();
					sap.ui.core.BusyIndicator.hide();
					SNListJson.setData(oData);
					attModel.setData(oData);
					oController._oValueHelpDialogSupName.getTableAsync().then(function (oTable) {
						var finalData = attModel;
						oTable.setModel(finalData);
						oTable.setModel(oController.oColModel, "columns");
						if (oTable.bindRows) {
							oTable.bindAggregation("rows", "/results");
						}
						if (oTable.bindItems) {
							oTable.bindAggregation("items", "/results", function () {
								return new sap.m.ColumnListItem({
									cells: aCols.map(function (column) {
										return new sap.m.Label({
											text: "{" + column.template + "}"
										});
									})
								});
							});
						}
						oController._oValueHelpDialogSupName.update();
					}.bind(this));
					oController._oValueHelpDialogSupName._oTable.setNoData(oController.geti18nText("nodata"));
				},
				error: function () {
					oController._oValueHelpDialogSupName._oTable.setNoData(oController.geti18nText("nodata"));
					sap.ui.core.BusyIndicator.hide();
				}
			});
			return SNListJson;
		},

		pressOkSupName: function (oEvent, oController, SupNameSearchToken, that, poID) {
			SupNameSearchToken = oEvent.getParameter("tokens");
			oController.getView().byId(poID).setTokens(SupNameSearchToken);
			that._oValueHelpDialogSupName.close();
			return SupNameSearchToken;
		},

		pressCancelSupName: function (that) {
			that._oValueHelpDialogSupName.close();
		},

		_supNameFilterSelectionChange: function (oEvent, oController, poID) {
			var supplierNames = oEvent.getSource().getSelectedIndices();
			var oModel = oEvent.getSource().getBinding("rows").getModel();
			var aTokens = [];
			oController.supplierID = [];
			$.each(supplierNames, function () {
				var supplierName = oModel.getProperty(oEvent.getSource().getContextByIndex(this).sPath).SUPPLIERNAME;
				var oToken = new sap.m.Token({
					"text": supplierName,
					"key": supplierName
				});
				oController.supplierID.push(oToken);
			});
			oController.getView().byId(poID).setTokens(oController.supplierID);
		},

		suppIDFilterEnter: function (oEvent, oController) {
			var suppId = oEvent.getParameter('value');
			if (suppId !== "") {
				var oToken = new sap.m.Token({
					"text": suppId,
					"key": suppId
				});
				var poID = oEvent.mParameters.id.split('--')[1];
				if (poID === 'ownerServSuppName' || poID === 'ownerServTBSSuppName') {
					if (oController.supplierID == undefined) {
						oController.supplierID = [];
						oController.supplierID.push(oToken);
						oController.getView().byId(poID).setTokens(oController.supplierID);
						oController.getView().byId(poID).setValue("");
					} else {
						oController.supplierID.push(oToken);
						oController.getView().byId(poID).setTokens(oController.supplierID);
						oController.getView().byId(poID).setValue("");
					}
					return oController.supplierID;
				} else if (poID === 'matServSuppName' || poID === 'matServTBSSuppName') {
					if (oController.supplierMatID == undefined) {
						oController.supplierMatID = [];
						oController.supplierMatID.push(oToken);
						oController.getView().byId(poID).setTokens(oController.supplierMatID);
						oController.getView().byId(poID).setValue("");
					} else {
						oController.supplierMatID.push(oToken);
						oController.getView().byId(poID).setTokens(oController.supplierMatID);
						oController.getView().byId(poID).setValue("");
					}
					return oController.supplierMatID;
				} else if (poID === 'threServSuppName') {
					if (oController.supplierThreID == undefined) {
						oController.supplierThreID = [];
						oController.supplierThreID.push(oToken);
						oController.getView().byId(poID).setTokens(oController.supplierThreID);
						oController.getView().byId(poID).setValue("");
					} else {
						oController.supplierThreID.push(oToken);
						oController.getView().byId(poID).setTokens(oController.supplierThreID);
						oController.getView().byId(poID).setValue("");
					}
					return oController.supplierThreID;
				} else if (poID === 'matThreSuppNames') { //gree start
					if (oController.supplierThreMatID == undefined) {
						oController.supplierThreMatID = [];
						oController.supplierThreMatID.push(oToken);
						oController.getView().byId(poID).setTokens(oController.supplierThreMatID);
						oController.getView().byId(poID).setValue("");
					} else {
						oController.supplierThreMatID.push(oToken);
						oController.getView().byId(poID).setTokens(oController.supplierThreMatID);
						oController.getView().byId(poID).setValue("");
					}
					return oController.supplierThreMatID; //gree end
				} else if (poID === 'exclServSuppName') {
					if (oController.supplierExclID == undefined) {
						oController.supplierExclID = [];
						oController.supplierExclID.push(oToken);
						oController.getView().byId(poID).setTokens(oController.supplierExclID);
						oController.getView().byId(poID).setValue("");
					} else {
						oController.supplierExclID.push(oToken);
						oController.getView().byId(poID).setTokens(oController.supplierExclID);
						oController.getView().byId(poID).setValue("");
					}
					return oController.supplierExclID;
				}
			}

		}

	};

});