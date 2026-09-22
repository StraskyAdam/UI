sap.ui.define([

], function () {
	"use strict";

	return {

		// For PO NUMBER Filters
		valueHelpDialogPONum: function (oEvent, oController, POListJson, PONumSearchToken, myThis) {
			oController.oControl = oEvent.getSource();
			var that = myThis;
			var sText = oController.getOwnerComponent().getModel("i18n").getResourceBundle();
			// Adding three columns
			var aCols = {
				"cols": [{
					"label": sText.getText("PoNum"),
					"template": "PONUMBER",
					"width": "auto"
				}, 
				// {
				// 	"label": sText.getText("lineItem"),
				// 	"template": "ITEMNO",
				// 	"width": "auto"
				// }, 
				{
					"label": sText.getText("lineDesc"),
					"template": "POLINEDESC",
					"width": "auto"
				}]
			};
			that._POSearchField = new sap.m.SearchField({
				placeholder: "{i18n>PoNum}",
				showSearchButton: true,
				liveChange: function (oEvent) {
					oController.onPOSearch(oEvent);
				}
			});
			that.oColModel = new sap.ui.model.json.JSONModel(aCols);
			that._oValueHelpDialogPONum = sap.ui.xmlfragment("com.takeda.Accrual_UI5.fragment.poValueHelp", that);
			that.getView().addDependent(oController._oValueHelpDialogPONum);
			var oFilterBar = that._oValueHelpDialogPONum.getFilterBar();
			oFilterBar.setBasicSearch(that._POSearchField);
			that._oValueHelpDialogPONum.getTableAsync().then(function (oTable) {
				var finalData = POListJson;
				oTable.setModel(finalData);
				// oTable.setFixedColumnCount();
				oTable.setModel(that.oColModel, "columns");
				oTable.setSelectionMode("MultiToggle");
				// oTable.addStyleClass("onbehalf");
				if (oTable.bindRows) {
					oTable.bindAggregation("rows", "/results");
				}
				oTable.attachEvent("rowSelectionChange", {}, this._poNumFilterSelectionChange, this);
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
				that._oValueHelpDialogPONum.update();
			}.bind(that));
			if (PONumSearchToken !== undefined) {
				that._oValueHelpDialogPONum.setTokens(PONumSearchToken);
			}
			that._oValueHelpDialogPONum.open();
		},
		// PO Search -- Event
		poSearch: function (oEvent, oController, emailId, loginUserRole, pstype, that, selectedPOValueHelp) {
			sap.ui.core.BusyIndicator.hide();
			var aFilters = [];
			var POListJson = new sap.ui.model.json.JSONModel();
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
					var newstring = n[i].charAt(n[i]).toUpperCase() + n[i].slice(1);
					for (var j = 0; j < spaceCount; j++)
						spaceput = spaceput + " ";
					vfinal = vfinal + spaceput + newstring + ".";
				}
				vfinal = vfinal.substring(0, vfinal.length - 1);
			} else {
				vfinal = valNew;
			}
			var filter = new sap.ui.model.Filter([
					new sap.ui.model.Filter("PONUMBER", sap.ui.model.FilterOperator.Contains, vfinal),
				],
				false);
			aFilters.push(filter);
			
			sap.ui.core.BusyIndicator.show();
			
			if ((selectedPOValueHelp === 'M') || (selectedPOValueHelp === 'S')) {
			   // Using this method to get the PO List
			  var poList = that.getOwnerComponent().getModel();
			  var uri = "/openPOParameters(IP_PSTYPE='" + pstype + "',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results";	
			} else if (selectedPOValueHelp === 'T') {
			  var poList = that.getOwnerComponent().getModel("thresholdModel");
			  var uri = "/thresholdParameters(IP_PSTYPE='9',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results";
			} else if (selectedPOValueHelp === 'H') { //gree
				var poList = that.getOwnerComponent().getModel("thresholdModel");
				var uri = "/thresholdParameters(IP_PSTYPE='0',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results";
			} else if (selectedPOValueHelp === 'E') {
			  var poList = that.getOwnerComponent().getModel("excludedPOModel");
			  var uri = "/exclusionPOParameters(IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results";
			}
			
			poList.read( uri, {
				filters: aFilters,
				// select: "PONUMBER,ITEMNO,POLINEDESC",
				select: "PONUMBER,POLINEDESC",
				urlParameters: {
					"$top": "1000"
				},
				success: function (oData, oResponse) {
					var attModel = new sap.ui.model.json.JSONModel();
					sap.ui.core.BusyIndicator.hide();
					 oData.results = oData.results.filter((arr, index, self) => index === self.findIndex((t) =>
											(t.PONUMBER === arr.PONUMBER)));
					POListJson.setData(oData);
					attModel.setData(oData);
					oController._oValueHelpDialogPONum.getTableAsync().then(function (oTable) {
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
						oController._oValueHelpDialogPONum.update();
					}.bind(this));
					oController._oValueHelpDialogPONum._oTable.setNoData(oController.geti18nText("nodata"));
				},
				error: function () {
					oController._oValueHelpDialogPONum._oTable.setNoData(oController.geti18nText("nodata"));
					sap.ui.core.BusyIndicator.hide();
				}
			});
			return POListJson;
		},

		// When the user presses OK 
		pressOkPONum: function (oEvent, oController, PONumSearchToken, that, poID) {
			PONumSearchToken = oEvent.getParameter("tokens");
			oController.poList = PONumSearchToken;
			oController.getView().byId(poID).setTokens(oController.poList);
			that._oValueHelpDialogPONum.close();
			return PONumSearchToken;
		},

		// When the user presses Cancel 
		pressCancelPONum: function (that) {
			that._oValueHelpDialogPONum.close();
		},

		// Filter Change
		_poNumFilterSelectionChange: function (oEvent, oController, poID) {
			var poNumSel = oEvent.getSource().getSelectedIndices();
			var oModel = oEvent.getSource().getBinding("rows").getModel();
			
			if (oController.poList === undefined){
				oController.poList = [];
			}
			
			$.each(poNumSel, function () {
				var poNumber = oModel.getProperty(oEvent.getSource().getContextByIndex(this).sPath).PONUMBER;
				var oToken = new sap.m.Token({
					"key": poNumber
				});
			});
			oController.getView().byId(poID).setTokens(oController.poList);
			

		},
			
		// On PO Value Filter 
		poFilterEnter: function(oEvent,oController){
			var poNum = oEvent.getParameter('value');
			if ( poNum !== "" ) {
				var oToken = new sap.m.Token({
							"text": poNum,
							"key": poNum
						});
				var poID = oEvent.mParameters.id.split('--')[1];
				if ( poID === 'ownerServPoNum' || poID === 'ownerServTBSPoNum' ) {
					if (oController.poList == undefined) {
							oController.poList = [];
							oController.poList.push(oToken);
							oController.getView().byId(poID).setTokens(oController.poList);
							oController.getView().byId(poID).setValue("");
					} else {
						oController.poList.push(oToken);
						oController.getView().byId(poID).setTokens(oController.poList);
						oController.getView().byId(poID).setValue("");
					}
				
					return oController.poList;
				}else if ( poID === 'matServPoNum' || poID === 'matServTBSPoNum' ) {
					if (oController.poMatList == undefined) {
							oController.poMatList = [];
							oController.poMatList.push(oToken);
							oController.getView().byId(poID).setTokens(oController.poMatList);
							oController.getView().byId(poID).setValue("");
					} else {
						oController.poMatList.push(oToken);
						oController.getView().byId(poID).setTokens(oController.poMatList);
						oController.getView().byId(poID).setValue("");
					}
					return oController.poMatList;
				}else if ( poID === 'threServPoNum' ) {
					if (oController.poThreMatList == undefined) {
							oController.poThreMatList = [];
							oController.poThreMatList.push(oToken)
							oController.getView().byId(poID).setTokens(oController.poThreMatList);
							oController.getView().byId(poID).setValue("");
					} else {
						oController.poThreMatList.push(oToken);
						oController.getView().byId(poID).setTokens(oController.poThreMatList);
						oController.getView().byId(poID).setValue("");
					}
					return oController.poThreMatList;
				} else if (poID === 'matThrePoNumber') { //gree start
					if (oController.poThreMaterList == undefined) {
						oController.poThreMaterList = [];
						oController.poThreMaterList.push(oToken)
						oController.getView().byId(poID).setTokens(oController.poThreMaterList);
						oController.getView().byId(poID).setValue("");
					} else {
						oController.poThreMaterList.push(oToken);
						oController.getView().byId(poID).setTokens(oController.poThreMaterList);
						oController.getView().byId(poID).setValue("");
					}
					return oController.poThreMaterList; //gree end
				}else if ( poID === 'exclServPoNum' ) {
					if (oController.poExclMatList == undefined) {
							oController.poExclMatList = [];
							oController.poExclMatList.push(oToken);
							oController.getView().byId(poID).setTokens(oController.poExclMatList);
							oController.getView().byId(poID).setValue("");
					} else {
						oController.poExclMatList.push(oToken);
						oController.getView().byId(poID).setTokens(oController.poExclMatList);
						oController.getView().byId(poID).setValue("");
					}
					return oController.poExclMatList;
				}
			}
			
		},

	};

});