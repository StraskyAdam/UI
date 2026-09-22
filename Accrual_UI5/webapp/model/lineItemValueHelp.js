sap.ui.define([

], function () {
	"use strict";

	return {

		valueHelpDialogItemNum: function (oEvent, oController, LIListJson, ItemNumSearchToken, myThis,psTyp) {
			oController.oControl = oEvent.getSource();
			var that = myThis;
			var sText = oController.getOwnerComponent().getModel("i18n").getResourceBundle();
			var aCols = {
				"cols": [{
					"label": sText.getText("lineItem"),
					"template": "ITEMNO",
					"width": "auto"
				}]
			};
			that._LISearchField = new sap.m.SearchField({
				placeholder: "{i18n>lineItem}",
				showSearchButton: true,
				liveChange: function (oEvent) {
					oController.onLineItemSearch(oEvent);
				}
			});
			that.oColModel = new sap.ui.model.json.JSONModel(aCols);
			that._oValueHelpDialogItemNum = sap.ui.xmlfragment("com.takeda.Accrual_UI5.fragment.itemValueHelp", that);
			that.getView().addDependent(oController._oValueHelpDialogItemNum);
			var oFilterBar = that._oValueHelpDialogItemNum.getFilterBar();
			oFilterBar.setBasicSearch(that._LISearchField);
			that._oValueHelpDialogItemNum.getTableAsync().then(function (oTable) {
				var finalData = LIListJson;
				oTable.setModel(finalData);

				oTable.setModel(that.oColModel, "columns");
				oTable.setSelectionMode("MultiToggle");

				if (oTable.bindRows) {
					oTable.bindAggregation("rows", "/results");
				}
				oTable.attachEvent("rowSelectionChange", {}, this._itemNumFilterSelectionChange, this);
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
				that._oValueHelpDialogItemNum.update();
			}.bind(that));
			if (ItemNumSearchToken !== undefined) {
				that._oValueHelpDialogItemNum.setTokens(ItemNumSearchToken);
			}
			// if (psTyp === 'S'){
			// 	if (oController.lineitem !== undefined) {
			// 		that._oValueHelpDialogItemNum.setTokens(oController.lineitem);
			// 	}
			// } else {
			// 	if (oController.lineMatItem !== undefined) {
			// 		that._oValueHelpDialogItemNum.setTokens(oController.lineMatItem);
			// 	}
			// }
			
			that._oValueHelpDialogItemNum.open();
		},

		lineItemSearch: function (oEvent, oController, emailId, loginUserRole, pstype, that, selectedItemValueHelp) {
			
			sap.ui.core.BusyIndicator.hide();
			
			var mythis = this;
			var filters1 = [];
			var aFilters = [];
			var LIListJson = new sap.ui.model.json.JSONModel();
			if (oEvent.getParameters().newValue === "") {
				return 0;
			}
			
			// Get the PO# entered 
			if (oController.poList !== undefined){
				if (oController.poList.length > 0){
					var poFilterKeyField = "PONUMBER eq '";
					var poFilterKey;
					for (var i=0; i < oController.poList.length; i++ ){
						var poNumber = oController.poList[i].getKey();
						if ( i > 0 ) {
							poFilterKey = poFilterKey + ' or ' + poFilterKeyField + poNumber + "'";
						}else {
							poFilterKey = poFilterKeyField + poNumber + "'";
						}
						
					}
				}
				
			}
			
			
			
			var valNew = oEvent.getParameters().newValue;
			// Case sensitive 
			var string = oEvent.getParameters().newValue;
			
			
			
			if ((string !== '') && ( string !== undefined )) {
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
			// 	var filter = new sap.ui.model.Filter([
			// 			new sap.ui.model.Filter("ITEMNO", sap.ui.model.FilterOperator.Contains, vfinal),
			// 		]);
			// 	aFilters.push(filter);
			
					var itemFilterKey = "ITEMNO eq '" + vfinal + "'";
					
				
			}
			
			var filterKey;
			if (poFilterKey == undefined || poFilterKey == ''){
				if (itemFilterKey == undefined || itemFilterKey == ''){
					filterKey = '';
				}else{
					filterKey = itemFilterKey;
				}
			} else {
				if (itemFilterKey == undefined || itemFilterKey == ''){
					filterKey = poFilterKey;
				}else{
					filterKey = poFilterKey + " AND " + itemFilterKey;
				}
				
				
				
			}
			
			// Using this method to get the itemList
				// Using this method to get the itemList
				var filter = new sap.ui.model.Filter([
					// new sap.ui.model.Filter("ITEMNO", sap.ui.model.FilterOperator.Contains, oEvent.getParameters().newValue.toUpperCase()),
					// new sap.ui.model.Filter("ITEMNO", sap.ui.model.FilterOperator.Contains, oEvent.getParameters().newValue.toLowerCase()),
					new sap.ui.model.Filter("ITEMNO", sap.ui.model.FilterOperator.Contains, valNew),
				],
				false);
			aFilters.push(filter);
			sap.ui.core.BusyIndicator.show();
			if ((selectedItemValueHelp === 'M') || (selectedItemValueHelp === 'S')) {
			  var itemList = that.getOwnerComponent().getModel();
			  var uri = "/openPOParameters(IP_PSTYPE='" + pstype + "',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results"; //?$filter=PONUMBER eq '8000024873'";	
			} else if (selectedItemValueHelp === 'T') {
			  var itemList = that.getOwnerComponent().getModel("thresholdModel");
			  var uri = "/thresholdParameters(IP_PSTYPE='9',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results";
			} else if (selectedItemValueHelp === 'H') { //gree
				var itemList = that.getOwnerComponent().getModel("thresholdModel");
				var uri = "/thresholdParameters(IP_PSTYPE='0',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results";
			} else if (selectedItemValueHelp === 'E') {
			  var itemList = that.getOwnerComponent().getModel("excludedPOModel");
			  var uri = "/exclusionPOParameters(IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results";
			}
			
			
			// itemList.read( uri,  
			itemList.read( uri, {
				filters: aFilters,
				
				select: "ITEMNO",
				urlParameters: {
					"$top": "1000"
					// "$filter": filterKey
				},
				success: function (oData, oResponse) {
	
					var attModel = new sap.ui.model.json.JSONModel();
					// Remove duplicate Item numbers to be shown 
					oData.results = oData.results.filter((arr, index, self) => index === self.findIndex((t) =>
						(t.ITEMNO === arr.ITEMNO)));
						oData.results = oData.results.sort(function (a, b) {
						if (a.ITEMNO < b.ITEMNO) {
							return -1;
						} else if (a.ITEMNO > b.ITEMNO) {
							return 1;
						} else {
							return 0;
						}
					});
					sap.ui.core.BusyIndicator.hide();
					LIListJson.setData(oData);
					attModel.setData(oData);
					oController._oValueHelpDialogItemNum.getTableAsync().then(function (oTable) {
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
						oController._oValueHelpDialogItemNum.update();
					}.bind(this));
					oController._oValueHelpDialogItemNum._oTable.setNoData(oController.geti18nText("nodata"));
				},
				error: function () {
					oController._oValueHelpDialogItemNum._oTable.setNoData(oController.geti18nText("nodata"));
					sap.ui.core.BusyIndicator.hide();
				}
			});
			return LIListJson;
		},
		
		
		pressOkLineItem: function (oEvent, oController, ItemNumSearchToken, that, pId) {
			ItemNumSearchToken = oEvent.getParameter("tokens");
			if ( (pId === 'ownerServItemNo') || (pId === 'ownerServTBSItemNo') 
				|| (pId === 'threServItemNo') || (pId === 'matThreItemNos') || (pId === 'exclServItemNo')){ //gree
				oController.lineitem = 	ItemNumSearchToken;
				oController.getView().byId(pId).setTokens(oController.lineitem);
			} else {
				oController.lineMatItem = 	ItemNumSearchToken;
				oController.getView().byId(pId).setTokens(oController.lineMatItem);
			}
			
			that._oValueHelpDialogItemNum.close();
			return ItemNumSearchToken;
		},

		pressCancelLineItem: function (that) {
			that._oValueHelpDialogItemNum.close();
		},

		_itemNumFilterSelectionChange: function (oEvent, oController, pID) {
			var itemSel = oEvent.getSource().getSelectedIndices();
			var oModel = oEvent.getSource().getBinding("rows").getModel();
			var aTokens = [];
			oController.lineitem = [];
			oController.lineMatItem = [];
			var sbTooltip = "";
			if ((pID === 'ownerServItemNo') || (pID === 'ownerServTBSItemNo') 
				|| (pID === 'threServItemNo') || (pID === 'matThreItemNos') || (pID === 'exclServItemNo') ){   //gree
				$.each(itemSel, function () {
					var itemNo = oModel.getProperty(oEvent.getSource().getContextByIndex(this).sPath).ITEMNO;
					var oToken = new sap.m.Token({
						"text": itemNo,
						"key": itemNo
					});
					oController.lineitem.push(oToken);
				});
				oController.lineitem = oController.lineitem.filter((arr, index, self) => index === self.findIndex((t) => (t.getProperty('key') === arr.getProperty('key'))) );
				oController.getView().byId(pID).setTokens(oController.lineitem);
			} else {
				$.each(itemSel, function () {
					var itemNo = oModel.getProperty(oEvent.getSource().getContextByIndex(this).sPath).ITEMNO;
					var oToken = new sap.m.Token({
						"text": itemNo,
						"key": itemNo
					});
					oController.lineMatItem.push(oToken);
				});
				oController.lineMatItem = oController.lineMatItem.filter((arr, index, self) => index === self.findIndex((t) => (t.getProperty('key') === arr.getProperty('key'))) );
				oController.getView().byId(pID).setTokens(oController.lineMatItem);
			}
			
		},
		// On Item Value Filter 
		itemFilterEnter: function (oEvent, oController, pID) {
			var itemNum = oEvent.getParameter('value');
			if ( itemNum !== "" ) {
				var oToken = new sap.m.Token({
					"text": itemNum,
					"key": itemNum
				});
	
				if ((pID === 'ownerServItemNo') || (pID === 'ownerServTBSItemNo')) {
	
					if (oController.lineitem == undefined) {
						oController.lineitem = [];
						oController.lineitem.push(oToken);
						oController.getView().byId(pID).setTokens(oController.lineitem);
						oController.getView().byId(pID).setValue("");
					} else {
						oController.lineitem.push(oToken);
						oController.getView().byId(pID).setTokens(oController.lineitem);
						oController.getView().byId(pID).setValue("");
					}
					return oController.lineitem;
					
				} else if ((pID === 'matServItemNo') || (pID === 'matServTBSItemNo')) {
					if (oController.lineMatItem == undefined) {
						oController.lineMatItem = [];
						oController.lineMatItem.push(oToken);
						oController.getView().byId(pID).setTokens(oController.lineMatItem);
						oController.getView().byId(pID).setValue("");
					} else {
						oController.lineMatItem.push(oToken);
						oController.getView().byId(pID).setTokens(oController.lineMatItem);
						oController.getView().byId(pID).setValue("");
					}
					return oController.lineMatItem;
	
				}else if (pID === 'threServItemNo')  {
					if (oController.lineThreItem == undefined) {
						oController.lineThreItem = [];
						oController.lineThreItem.push(oToken);
						oController.getView().byId(pID).setTokens(oController.lineThreItem);
						oController.getView().byId(pID).setValue("");
					} else {
						oController.lineThreItem.push(oToken);
						oController.getView().byId(pID).setTokens(oController.lineThreItem);
						oController.getView().byId(pID).setValue("");
					}
					return oController.lineThreItem;
					
				} else if (pID === 'matThreItemNos') { //gree start
					if (oController.lineThreMatItem == undefined) {
						oController.lineThreMatItem = [];
						oController.lineThreMatItem.push(oToken);
						oController.getView().byId(pID).setTokens(oController.lineThreMatItem);
						oController.getView().byId(pID).setValue("");
					} else {
						oController.lineThreMatItem.push(oToken);
						oController.getView().byId(pID).setTokens(oController.lineThreMatItem);
						oController.getView().byId(pID).setValue("");
					}
					return oController.lineThreMatItem; //gree end
					
				}else if (pID === 'exclServItemNo'){
					if (oController.lineExclItem == undefined) {
						oController.lineExclItem = [];
						oController.lineExclItem.push(oToken);
						oController.getView().byId(pID).setTokens(oController.lineExclItem);
						oController.getView().byId(pID).setValue("");
					} else {
						oController.lineExclItem.push(oToken);
						oController.getView().byId(pID).setTokens(oController.lineExclItem);
						oController.getView().byId(pID).setValue("");
					}
					return oController.lineExclItem;
				}
			}

		}

	};

});
	
	
