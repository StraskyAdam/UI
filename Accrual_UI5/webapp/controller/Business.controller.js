sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Label",
	"sap/m/MessageToast",
	"sap/m/Text",
	"sap/ui/core/format/NumberFormat",
	"sap/m/TextArea",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"com/takeda/Accrual_UI5/model/formatter",
	"com/takeda/Accrual_UI5/model/common",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/export/library",
	"sap/ui/export/Spreadsheet",
	"com/takeda/Accrual_UI5/model/poValueHelp",
	"com/takeda/Accrual_UI5/model/lineItemValueHelp",
	"com/takeda/Accrual_UI5/model/supplierValueHelp",
	"../utils/Constants"
], function (Controller, Dialog, DialogType, Button, ButtonType, Label, MessageToast, Text, NumberFormat, TextArea, Filter,
	FilterOperator, MessageBox,
	formatter, common, JSONModel, ResourceModel, exportLibrary, Spreadsheet, poValueHelp, lineItemValueHelp, supplierValueHelp, Constants) {
	"use strict";
	var oController, poValue, percentCal, tAmount, jsonArray = [],
		spathg,
		userDecimalFormat, aribaLink, oTableBatch, userModel, sCETDateTime,
		month = [],
		thresholdArray = [],
		globalEvent,
		sPostURI, allDataAct1 = [],
		allDataAct2Thre_markAll,

		allDataThre1 = [],
		allDataThre2 = [],
		oTableBatch1, aRows1, cols1, //gree
		allDataThre1 = [],
		allDataThre2 = [], //gree
		tableRowObject,
		allDataThre1 = [],
		allDataThre2 = [],
		oTableBatch1, aRows1, Cols1, //gree
		allDataAct2 = [],
		sapPOArr = [],
		tWork, amountCal,
		emailId, sapPOStr, loginUserRole = "X",
		aRows, cols, count = 0,
		materialPOClosure, servicePOClosure,
		serPO = 0,
		DialogFlag = 0,
		DialogFlagThre = 0,
		matPO = 0,
		iBactUpon1 = 0,
		iBactUpon2 = 0,
		iBThre1 = 0,
		iBThre2 = 0,
		closurFlagActUpon, closurFlagThre,
		jsonArrayfinal2 = [];

	month[0] = "January";
	month[1] = "February";
	month[2] = "March";
	month[3] = "April";
	month[4] = "May";
	month[5] = "June";
	month[6] = "July";
	month[7] = "August";
	month[8] = "September";
	month[9] = "October";
	month[10] = "November";
	month[11] = "December";

	var EdmType = exportLibrary.EdmType;

	var POListJson = new sap.ui.model.json.JSONModel();
	var LIListJson = new sap.ui.model.json.JSONModel();
	var SNListJson = new sap.ui.model.json.JSONModel();
	var POMatListJson = new sap.ui.model.json.JSONModel();
	var LIMatListJson = new sap.ui.model.json.JSONModel();
	var SNMatListJson = new sap.ui.model.json.JSONModel();
	var POThreListJson = new sap.ui.model.json.JSONModel();
	var LIThreListJson = new sap.ui.model.json.JSONModel();
	var SNThreListJson = new sap.ui.model.json.JSONModel();
	var POThreMatListJson = new sap.ui.model.json.JSONModel();
	var LIThreMatListJson = new sap.ui.model.json.JSONModel();
	var SNThreMatListJson = new sap.ui.model.json.JSONModel();

	// Variables for Service PO Value Helps
	var selectedPOValueHelp;
	var selectedItemValueHelp;
	var selectedSuppValueHelp;

	var PONumSearchToken;
	var ItemNumSearchToken;
	var SupNameSearchToken;
	var POMatNumSearchToken;
	var ItemMatNumSearchToken;
	var SupMatNameSearchToken;
	var POThreNumSearchToken;
	var POThreMatNumSearchToken; //gree
	var ItemThreMatNumSearchToken //gree
	var ItemThreNumSearchToken;
	var SupThreNameSearchToken;
	var SupThreMatNameSearchToken; //gree
	// Variables for Material PO Value Helps

	// Variables for Exclusions PO Value Helps
	var POExclListJson = new sap.ui.model.json.JSONModel();
	var LIThreMatListJson = new sap.ui.model.json.JSONModel(); //gree
	var LIExclListJson = new sap.ui.model.json.JSONModel();
	var SNExclListJson = new sap.ui.model.json.JSONModel();

	var POExclNumSearchToken;
	var ItemExclNumSearchToken;
	var SupExclNameSearchToken;

	var rowSelection = [];
	var rowSelectionMaterial = [];

	var oTableMaterial, colsMaterial, rowsMaterial;

	//Start change 
	var
		POArrMin = 0,
		POArrMax = 0,
		GlobalData = [],
		GlobalResponse = [],
		asyncCallCounter = 0,
		GlobalError = [];

	let iTotalServicePOAbove50KCount = 0,
		iTotalServicePOUnder50KCount = 0,
		iTotalMaterialPOAbove50KCount = 0,
		iTotalMaterialPOUnder50KCount = 0;


	//End change 

	return Controller.extend("com.takeda.Accrual_UI5.controller.Business", {
		formatter: formatter,
		common: common,
		/**
         * initiates the page with the data coming from previous page and creates a local model for external links
         */
		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			// Route to Current Stock View    
			oRouter.getRoute("BusinessPage").attachPatternMatched(this.onObjectMatched, this);
			
			const oExternalLinks = Constants.EXTERNAL_LINKS;
			const oLinksModel = new JSONModel({
				sInvoiceTrack:oExternalLinks.IVT,
				sPoDepletionReport: oExternalLinks.PO_DEPLETION_REPORT           
			});
			this.getView().setModel(oLinksModel, "oExternalLinks");
						
			const oConstantsJSON = new JSONModel({
				thresholdPercentage: 10
			});
			this.getView().setModel(oConstantsJSON, "constantsModel");
			
			let oTable1 = this.byId("actUponB1");
		    let oTable2 = this.byId("MatTableB");
		    let oTable3 = this.byId("thrTab");
		    let oTable4 = this.byId("MatTableBThrs");
			let oTable5 = this.byId("infoTable");
		    // Enable filter menu entry on each table
		    if (oTable1) {
		        oTable1.getColumns().forEach(function (oColumn) {
		            oColumn.setShowFilterMenuEntry(true);
		        });
		    }
		
		    if (oTable2) {
		        oTable2.getColumns().forEach(function (oColumn) {
		            oColumn.setShowFilterMenuEntry(true);
		        });
		    }
		
		    if (oTable3) {
		        oTable3.getColumns().forEach(function (oColumn) {
		            oColumn.setShowFilterMenuEntry(true);
		        });
		    }
		
		    if (oTable4) {
		        oTable4.getColumns().forEach(function (oColumn) {
		            oColumn.setShowFilterMenuEntry(true);
		        });
		    }
		    
		    if (oTable5) {
		        oTable5.getColumns().forEach(function (oColumn) {
		            oColumn.setShowFilterMenuEntry(true);
		        });
		    }
		},

		onObjectMatched: function (oEvent) {

			//Creates new table count model each time view is accessed
			this.getView().setModel(common.createTableCountModel(), "tableCountModel");

			oController = this;
			// Show Busy Indicator
			sap.ui.core.BusyIndicator.show(0);
			oEvent.getSource()._oRouter._oRoutes.BusinessPage.mEventRegistry.patternMatched[0].oListener.oView.mAggregations.content[0].mAggregations
				.pages[0].mAggregations.content[0].mAggregations._header.setSelectedKey("DashboardTab");
			oEvent.getSource()._oRouter._oRoutes.BusinessPage.mEventRegistry.patternMatched[0].oListener.oView.mAggregations.content[0].mAggregations
				.pages[0].mAggregations.content[0].mAggregations._header.mAggregations.items[0].mAggregations.content[5].mAggregations.items[0].mAggregations
				._header.setSelectedKey("actUponTab");
			oController.SelSubKey = "actUponTab";
			if (window.location.hostname.substr(0, 6) === "webide") {
				// If application is running from WebIDE	
				emailId = "abhishek.ks@takeda.com";

				sPostURI = "/XSA_HTTP_ACCRUAL/xsjs/";
			} else {
				// If application is running from FLP	
				emailId = new sap.ushell.services.UserInfo().getUser().getEmail().toLowerCase();
				sPostURI = "/comtakedaAccrual_UI5/XSA_HTTP_ACCRUAL/xsjs/";
			}
			this.getMatTable();
			this._getThresholdValue();
			//Get Help PDF
			common.getPDF(oController);
			// Get the User Role
			common.getUserRole(oController, emailId);
			// Get the Users Details 
			common.getUserDetails(oController, emailId);
			// Get the Configuration Values from Backend
			common.getConfigValues(oController);
			// Get the Country Configuration
			this.getCountryConfig();
			// Get the Dashboard Data for the Users
			this.dashboardData();
			// Get the Timeline information
			this.getTimelineData();
			// Change the cell color ( editable )
			this.changeCellColor();
			this.changeCellColorThr();
			//this.getLinksData();

			this.rebindTables();
			// MVP2 changes Start of Code
			this.getView().byId("record").setVisible(false);
			this.getView().byId("recordMat").setVisible(false);
			this.getView().byId("recordThre").setVisible(false);
			this.getView().byId("recordMater").setVisible(false);
			// MVP2 changes End of Code
			if (oController._oPopUpDialog) {
				oController._oPopUpDialog = [];
			}
			if (oController._oPopUpDialog1) {
				oController._oPopUpDialog1 = [];
			}
			if (oController._oPopUpDialog2) {
				oController._oPopUpDialog2 = [];
			}
			if (oController._oPopUpDialog3) {
				oController._oPopUpDialog3 = [];
			}
			var d = new Date();
			d = new Date(d.toLocaleString("en-US", {
				timeZone: "Europe/Berlin"
			}));
			if (d.getDate() < 7) {
				oController.getView().byId("threPOClosureCheckBox").setEditable(false);
				oController.getView().byId("totalPOClosureMater").setEditable(false);
				oController.getView().byId("saveBtnThre").setVisible(false);
				this.getView().byId("saveBtn").setVisible(false);
				//  oController.getView().byId("threPOClosureCheckBox").setEditable(true);
				//oController.getView().byId("totalPOClosureMater").setEditable(true);
				//  oController.getView().byId("saveBtnThre").setVisible(true);
				//  this.getView().byId("saveBtn").setVisible(true);
			} else {
				oController.getView().byId("threPOClosureCheckBox").setEditable(true);
				oController.getView().byId("totalPOClosureMater").setEditable(true); //gree
				oController.getView().byId("saveBtnThre").setVisible(true);
				this.getView().byId("saveBtn").setVisible(true); //gree
			}

			// Initially set the Mark as Reviewed button to false
			this.getView().byId("saveBtn").setEnabled(false);
			this.getView().byId("saveBtnThre").setEnabled(false); //gree 

			var oRouter = this.getOwnerComponent().getRouter();
			// Route to Current Stock View    
			oRouter.getRoute("BusinessPage").attachPatternMatched(this.onObjectMatched, this);

			// Show Busy indicator for 2 seconds 
			setTimeout(() => {
				sap.ui.core.BusyIndicator.hide();
			}, 2000);
		},

		/* Get the i18N Model */
		geti18nText: function (name) {
			spathg = oController.getView().getModel('i18n').getResourceBundle();
			return oController.getView().getModel('i18n').getResourceBundle().getText(name);
		},
		getMatTable: function () {

			// Fetching the Table Id
			oTableMaterial = oController.getView().byId("MatTableB");
			oTableMaterial.addEventDelegate({
				onAfterRendering: function () {
					rowsMaterial = oTableMaterial.getRows();
					if (oTableMaterial.getRows().length > 0) {
						colsMaterial = oTableMaterial.getRows()[1].getCells();
					}
				}
			}, oTableMaterial);

		},
		onSelectDashTabs: function (oEvent) {
			oController.SelSubKey = oEvent.getSource().getSelectedKey();
		},
		onSelectMainTabs: function (oEvent) {
			oController.byId("linkTable").setVisible(false);
			var keyid = oEvent.getSource().getSelectedKey();
			var arr = [];
			if (keyid == "linkTab") {
				sap.ui.core.BusyIndicator.show(0);
				oController.LinksPath = oEvent.getSource();
				oController.RoleDef = $.Deferred();
				common.getUserRole(oController, emailId);
				$.when(oController.RoleDef).done(function () {
					oController.getLinksData();

					$.when(oController.LinkDefPoOwner).done(function () {
						var len = oController.LinksPath.mAggregations._header.mAggregations.items[2].mAggregations.content[1].mAggregations.items.length;
						arr = oController.getView().getModel("refLinkModel").getData();

						for (var i = 0; i < arr.length; i++) {
							if (arr[i].HELP_ID === "WBT_PRES") {
								arr[i].HELP_DESC = oController.geti18nText("WBT");
							} else if (arr[i].HELP_ID === "PO_START_END_DT") {
								arr[i].HELP_DESC = oController.geti18nText("Adj");
							} else if (arr[i].HELP_ID === "PO_CLOSE_REOPEN") {
								arr[i].HELP_DESC = oController.geti18nText("Clo");
							} else if (arr[i].HELP_ID === "PO_COMP_GOODRECV") {
								arr[i].HELP_DESC = oController.geti18nText("Comp");
							} else if (arr[i].HELP_ID === "PO_ADJ_AMT") {
								arr[i].HELP_DESC = oController.geti18nText("Adjust");
							} else if (arr[i].HELP_ID === "PO_NAVI_DAS") {
								arr[i].HELP_DESC = oController.geti18nText("Navi");
							} else if (arr[i].HELP_ID === "REP_PRB_GUIDE") {
								arr[i].HELP_DESC = oController.geti18nText("Guide");
							}
						}
						oController.getView().getModel("refLinkModel").setData([]);
						oController.getView().getModel("refLinkModel").setData(arr);
						oController.getView().getModel("refLinkModel").refresh();
						oController.byId("linkTable").setVisible(true);
						sap.ui.core.BusyIndicator.hide();
					});
				});
			}
			if (keyid == "VideoTab") {
				sap.ui.core.BusyIndicator.show(0);
				oController.getVideoLinksData();

			}
		},

		getLinksData: function () {
			oController.LinkDefPoOwner = $.Deferred();
			var linkModel = this.getOwnerComponent().getModel("helpLinkModel");
			var linkJSONModel = new sap.ui.model.json.JSONModel();
			var linkArr = [];
			var lang = sap.ui.getCore().getConfiguration().getLanguage().toUpperCase();
			if (lang == "ZH-TW") {
				lang = "ZH_TW";
			} else {
				lang = sap.ui.getCore().getConfiguration().getLanguage().slice(0, 2).toUpperCase();
			}
			linkModel.read("/helpLinksParameters(IP_LANG='" + lang + "')/Results", {

				success: function (oData, oResponse) {
					for (var i = 0; i < oData.results.length; i++) {
						if (oData.results[i].ROLE === "PO_OWNER") {
							linkArr.push(oData.results[i]);
						}
					}
					linkJSONModel.setData(linkArr);
					oController.getView().setModel(linkJSONModel, "refLinkModel");
					oController.LinkDefPoOwner.resolve();
				},
				error: function (error) {
					common.displayErrorMessage(oController);
					oController.LinkDefPoOwner.resolve();
				}
			});
		},
		getVideoLinksData: function () {
			oController.VideoLinkDefPoOwner = $.Deferred();
			var videolinkModel = this.getOwnerComponent().getModel("videolinkModel");
			var videolinkJSONModel = new sap.ui.model.json.JSONModel();
			var videolinkArr = [];
			var lang = sap.ui.getCore().getConfiguration().getLanguage().toUpperCase();
			if (lang == "EN") {
				lang = "EN";
			} else {
				lang = sap.ui.getCore().getConfiguration().getLanguage().slice(0, 2).toUpperCase();
			}

			videolinkModel.read("/videoLinksParameters(IP_LANG='" + "EN" + "')/Results", {

				success: function (oData, oResponse) {
					for (var i = 0; i < oData.results.length; i++) {
						// if (oData.results[i].ROLE === "PO_OWNER") {
						videolinkArr.push(oData.results[i]);
						oController.videoLinkData = videolinkArr;
						// }
					}
					videolinkJSONModel.setData(videolinkArr);
					oController.getView().setModel(videolinkJSONModel, "refVideoLinkModel");
					oController.VideoLinkDefPoOwner.resolve();
					sap.ui.core.BusyIndicator.hide();
				},
				error: function (error) {
					common.displayErrorMessage(oController);
					oController.VideoLinkDefPoOwner.resolve();
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		/* Get the Country Configuration Values from backend */
		getCountryConfig: function () {
			var ctryConfigModel = this.getOwnerComponent().getModel("ctryConfig");
			var ctryModel = new sap.ui.model.json.JSONModel();
			var that = this;
			ctryConfigModel.read("/ctryConfigPO", {

				success: function (oData, oResponse) {
					ctryModel.setData(oData);
					that.getView().setModel(ctryModel, "ctryModel");
				},
				error: function (error) {
					common.displayErrorMessage(oController);
				}
			});

		},

		// Get the Dashboard data for the logged in user.
		dashboardData: function () {
			/*
			// Get the dashboard Model
			var dashModel = this.getOwnerComponent().getModel("dashboardModel");
			this.getView().byId("ExTable").setModel(dashModel);
			var dashJSONModel = new sap.ui.model.json.JSONModel();
			var dashTableId = oController.getView().byId("ExTable");
			var dashTableArr = [];
			// Reading the Dashboard Service
			dashModel.read("/dashboardPOParameters(IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results", {
				urlParameters: {
					"$top": 1000
				},
				success: function (oData, oResponse) {
					for (var k in oData.results) {
						var dashArray = {};
						var userDecimalData = oController.userDecimalFormat;
						var pocount = parseInt(oData.results[k].POCOUNT);
						dashArray.POCOUNT1 = pocount;
						// // Format the amount as per the User's decimal notation
						dashArray.POCOUNT = formatter.formatCurrencyDashboard(userDecimalData, pocount);
						dashArray.microMaxValu = parseInt(oData.results[k].POCOUNT);
						//dashArray.POCOUNT = oData.results[k].POCOUNT;
						dashArray.POCURRENCY = oData.results[k].POCURRENCY;
						var serpocount = parseInt(oData.results[k].SERVPOCOUNT);
						dashArray.SERVPOCOUNT1 = serpocount;
						// // Format the amount as per the User's decimal notation
						dashArray.SERVPOCOUNT = formatter.formatCurrencyDashboard(userDecimalData, serpocount);
						dashArray.microMaxValu = parseInt(oData.results[k].SERVPOCOUNT);
						// dashArray.SERVPOCOUNT = oData.results[k].SERVPOCOUNT;
						var matpocount = parseInt(oData.results[k].MATPOCOUNT);
						dashArray.MATPOCOUNT1 = matpocount;
						// // Format the amount as per the User's decimal notation
						dashArray.MATPOCOUNT = formatter.formatCurrencyDashboard(userDecimalData, matpocount);
						dashArray.microMaxValu = parseInt(oData.results[k].MATPOCOUNT);
						// dashArray.MATPOCOUNT = oData.results[k].MATPOCOUNT;
						var poAmount = parseInt(oData.results[k].TOTPOAMOUNT);
						dashArray.TOTPOAMOUNT1 = poAmount;    
						// // Format the amount as per the User's decimal notation
						dashArray.TOTPOAMOUNT = formatter.formatCurrencyDashboard(userDecimalData, poAmount);
						dashArray.microMaxValu = parseInt(oData.results[k].TOTPOAMOUNT);
						var accAmount = parseInt(oData.results[k].TOTACCAMOUNT);
						dashArray.TOTACCAMOUNT1 = accAmount;
						// // Format the amount as per the User's decimal notation
						dashArray.TOTACCAMOUNT = formatter.formatCurrencyDashboard(userDecimalData, accAmount);
						dashArray.microAccValu = parseInt(oData.results[k].TOTACCAMOUNT);
						var invAmount = parseInt(oData.results[k].TOTINVAMOUNT);
						dashArray.TOTINVAMOUNT1 = invAmount;
						// // Format the amount as per the User's decimal notation
						dashArray.TOTINVAMOUNT = formatter.formatCurrencyDashboard(userDecimalData, invAmount);
						dashArray.microInvValu = parseInt(oData.results[k].TOTINVAMOUNT);
						var grpending = parseInt(oData.results[k].GRPENDING);
						dashArray.GRPENDING1 = grpending;
						
						// // Format the amount as per the User's decimal notation
						dashArray.GRPENDING = formatter.formatCurrencyDashboard(userDecimalData, grpending);
						dashTableArr.push(dashArray);
					}
					if (oData.results != undefined) {
						// If the record count > 5, then show only 5 as Row visible count
						var dashTableLength = oData.results.length > 5 ? 5 : oData.results.length;
						dashTableId.setVisibleRowCount(dashTableLength);
					}
					dashJSONModel.setData(dashTableArr);
					dashJSONModel.setSizeLimit(50000);
					dashTableId.setModel(dashJSONModel, "tradeJsn");
				},
				error: function (e) {
					common.displayErrorMessage(oController);
				}
			});
			*/
		},

		getAllServiceTableRecordsThr: function (oEvent) {
			sap.ui.core.BusyIndicator.show(0);
			oController.defThhIS = $.Deferred();
			var oModelID = oController.getOwnerComponent().getModel("thresholdModel");
			var skip = 0;
			var totalRecordsThre = oEvent.getSource().getSelectedIndices().length;
			var allDataThreIn_markAll = [];
			for (var i = 0; i <= totalRecordsThre / 1000; i++) {
				skip = i * 1000;
				oModelID.read("/thresholdParameters(IP_PSTYPE='9',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results", {
					async: false,
					urlParameters: {
						"$inlinecount": "allpages",
						"$skip": skip,
						"$top": 1000
					},
					success: function (oData, Response) {
						var aReceivedData = oData;
						if (aReceivedData.results !== undefined) {
							allDataThreIn_markAll = allDataThreIn_markAll.concat(aReceivedData.results);
							allDataThreIn_markAll = allDataThreIn_markAll.filter((arr, index, self) => index === self.findIndex((t) =>
								(t.PONUMBER === arr.PONUMBER && t.ITEMNO === arr.ITEMNO)));
							// Below loop is required for marking the PSTYPE as Service
							for (var j = 0; j < allDataThreIn_markAll.length; j++) {
								allDataThreIn_markAll[j].PSTYPE = '9';
							}
						}
						if (allDataThreIn_markAll.length == totalRecordsThre) {
							allDataThre1 = allDataThreIn_markAll;
							oController.defThhIS.resolve();

						}

					},
					error: function (response) {
						common.displayErrorMessage(oController);
					}
				});
			}

		},
		getAllMaterialTableRecordsThr: function (oEvent) {
			sap.ui.core.BusyIndicator.show(0);
			oController.defThhM = $.Deferred();
			var oModelID = oController.getOwnerComponent().getModel("thresholdModel");
			var skip = 0;
			var totalRecordsThre = oEvent.getSource().getSelectedIndices().length;
			allDataAct2Thre_markAll = [];
			for (var i = 0; i <= totalRecordsThre / 1000; i++) {
				skip = i * 1000;
				oModelID.read("/thresholdParameters(IP_PSTYPE='0',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results", {
					async: false,
					urlParameters: {
						"$inlinecount": "allpages",
						"$skip": skip,
						"$top": 1000
					},
					success: function (oData, Response) {
						var aReceivedData = oData;
						if (aReceivedData.results !== undefined) {
							allDataAct2Thre_markAll = allDataAct2Thre_markAll.concat(aReceivedData.results);
							allDataAct2Thre_markAll = allDataAct2Thre_markAll.filter((arr, index, self) => index === self.findIndex((t) =>
								(t.PONUMBER === arr.PONUMBER && t.ITEMNO === arr.ITEMNO)));
							// Below loop is required for marking the PSTYPE as Service
							for (var j = 0; j < allDataAct2Thre_markAll.length; j++) {
								allDataAct2Thre_markAll[j].PSTYPE = '0';
							}
						}
						if (allDataAct2Thre_markAll.length == totalRecordsThre) {
							allDataThre2 = allDataAct2Thre_markAll;
							oController.defThhM.resolve();

						}
					},
					error: function (response) {
						oController.defThhM.resolve();
						common.displayErrorMessage(oController);
					}
				});
			}

		},
		// Get the Timeline Data
		getTimelineData: function () {
			var d = new Date();
			// Converts the Date to CET time zone
			d = new Date(d.toLocaleString("en-US", {
				timeZone: "Europe/Berlin"
			}));

			// var mont = month[d.getMonth()];
			// var year = d.getFullYear();
			// var yearMon = mont + " " + year;
			if (d.getDate() < 7) {
				var mon = month[(d.getMonth(d.setMonth(d.getMonth() - 1)))];
				if (mon == "January") {
					mon = oController.geti18nText("jan");
				} else if (mon == "February") {
					mon = oController.geti18nText("feb");
				} else if (mon == "March") {
					mon = oController.geti18nText("mar");
				} else if (mon == "April") {
					mon = oController.geti18nText("apr");
				} else if (mon == "May") {
					mon = oController.geti18nText("may");
				} else if (mon == "June") {
					mon = oController.geti18nText("jun");
				} else if (mon == "July") {
					mon = oController.geti18nText("jul");
				} else if (mon == "August") {
					mon = oController.geti18nText("aug");
				} else if (mon == "September") {
					mon = oController.geti18nText("sep");
				} else if (mon == "October") {
					mon = oController.geti18nText("oct");
				} else if (mon == "November") {
					mon = oController.geti18nText("nov");
				} else if (mon == "December") {
					mon = oController.geti18nText("dec");
				}
				var yearMon = mon + " " + d.getFullYear();
			} else {
				var mon = month[d.getMonth()];
				if (mon == "January") {
					mon = oController.geti18nText("jan");
				} else if (mon == "February") {
					mon = oController.geti18nText("feb");
				} else if (mon == "March") {
					mon = oController.geti18nText("mar");
				} else if (mon == "April") {
					mon = oController.geti18nText("apr");
				} else if (mon == "May") {
					mon = oController.geti18nText("may");
				} else if (mon == "June") {
					mon = oController.geti18nText("jun");
				} else if (mon == "July") {
					mon = oController.geti18nText("jul");
				} else if (mon == "August") {
					mon = oController.geti18nText("aug");
				} else if (mon == "September") {
					mon = oController.geti18nText("sep");
				} else if (mon == "October") {
					mon = oController.geti18nText("oct");
				} else if (mon == "November") {
					mon = oController.geti18nText("nov");
				} else if (mon == "December") {
					mon = oController.geti18nText("dec");
				}
				var yearMon = mon + " " + d.getFullYear();
			}
			oController.getView().byId("presentMon").setText(yearMon);
			// for timeline
			var DateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd MMM"
			});
			var date = new Date();
			// Converts the Date to CET time zone
			date = new Date(date.toLocaleString("en-US", {
				timeZone: "Europe/Berlin"
			}));

			var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
			var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
			oController.getView().byId("bulletMicroTimeline").setMaxValue(lastDay.getDate());
			oController.getView().byId("bulletMicroTimeline").setScale(" " + month[lastDay.getMonth()]);
			oController.getView().byId("bulletMicroTimeline").setForecastValue(lastDay.getDate());
			oController.getView().byId("bulletMicroTimeline").setTargetValue(date.getDate());
			oController.getView().byId("startDate").setText(DateFormat.format(firstDay));
			oController.getView().byId("endDate").setText(DateFormat.format(lastDay));
			oController.getView().byId("bulletValue").setValue(date.getDate());
			date.setDate(7);
			var date7 = DateFormat.format(date);
			oController.getView().byId("cutOffDate").setText(date7);
		},

		// Change the cell color ( editable ) gree start
		changeCellColorThr: function () {
			// Fetching the Table Id
			oTableBatch1 = oController.getView().byId("thrTab");
			oTableBatch1.addEventDelegate({
				onAfterRendering: function () {
					aRows1 = oTableBatch1.getRows();
					if (oTableBatch1.getRows().length > 0) {
						cols1 = oTableBatch1.getRows()[1].getCells()

						// cols = oTableBatch.getColumns();
						for (var j = 0; j < cols1.length; j++) {
							if ((aRows1[1].getCells()[j].getId().split("-")[2] == "totalAmountThr") ||
								(aRows1[1].getCells()[j].getId().split("-")[2] == "totalPercentThr")) {
								for (var i = 0; i < aRows1.length; i++) {
									var cCel4 = aRows1[i].getCells()[j];
									// Changing the cell background color for editable fields
									$("#" + cCel4.getId()).parent().parent().css("background-color", "#ee110024");
								}
							}
						}

					}
				}
			}, oTableBatch1);
		},
		//gree end
		// Change the cell color ( editable )
		changeCellColor: function () {
			// Fetching the Table Id
			oTableBatch = oController.getView().byId("actUponB1");
			oTableBatch.addEventDelegate({
				onAfterRendering: function () {
					aRows = oTableBatch.getRows();
					if (oTableBatch.getRows().length > 0) {
						cols = oTableBatch.getRows()[1].getCells()

						// cols = oTableBatch.getColumns();
						for (var j = 0; j < cols.length; j++) {
							if ((aRows[1].getCells()[j].getId().split("-")[2] == "totalAmount") ||
								(aRows[1].getCells()[j].getId().split("-")[2] == "totalPercent")) {
								for (var i = 0; i < aRows.length; i++) {
									var cCel3 = aRows[i].getCells()[j];
									// Changing the cell background color for editable fields
									$("#" + cCel3.getId()).parent().parent().css("background-color", "#ee110024");
								}
							}
						}

					}
				}
			}, oTableBatch);
		},
		// This Method will trigger on before export of Smart table
		onBeforeExport: function (oEvent) {
			var mExcelSettings = oEvent.getParameter("exportSettings");
			mExcelSettings.workbook.columns.forEach((column) => {
				if (column.type === "Date") {
					column.type = sap.ui.export.EdmType.Date;
					column.format = "dd mmm yyyy"
				}
			});

			var sSmartTableID = oEvent.getParameters().id.split("--").pop(),
				sDateTimeFormatDisplay = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "yyyyMMddHHmmss"
				});
			var iRowCount = oEvent.mParameters.exportSettings.dataSource.count;
			if (iRowCount > 6000) {
				var errorText = oController.geti18nText("excelerror");
			    setTimeout(function() {
			        MessageBox.error(errorText);
			    }, 500);
				return;
			}

			switch (sSmartTableID) {
			case 'SmartTableBactUpon1':
				mExcelSettings.fileName = "Digital PO Accruals Dashboard Indirect Service_" + sDateTimeFormatDisplay.format(new Date());
				break;
			case 'SmartTableBactUpon2':
				mExcelSettings.fileName = "Digital PO Accruals Dashboard Indirect Material_" + sDateTimeFormatDisplay.format(new Date());
				break;
			case 'SmartTableBinfo':
				mExcelSettings.fileName = "Digital PO Accruals Dashboard Exclusion_" + sDateTimeFormatDisplay.format(new Date());
				break;
			case 'SmartTableBthreshold':
				mExcelSettings.fileName = "Digital PO Accruals Dashboard POs Under 50k Indirect Service_" + sDateTimeFormatDisplay.format(new Date());
				break;
			case 'SmartTableThres2':
				mExcelSettings.fileName = "Digital PO Accruals Dashboard POs Under 50k Indirect Material_" + sDateTimeFormatDisplay.format(new Date());
				break;
			};

		},
		// This Method will trigger on before rebind of Service table
		onBeforeRebindAct1Table: function (oEvent) {
			// Added SUZ9125
			rowSelection = [];

			// end SUZ9125
			var mBindingParams = oEvent.getParameter("bindingParams");
			var oSmtFilter = this.getView().byId("smartFilterBar");

			var oComboBox0 = oSmtFilter.getControlByKey("MyOwnFilterField0");
			var aCountKeys0 = oComboBox0.getTokens();
			if (aCountKeys0.length > 0) {

				for (var i = 0; i <= aCountKeys0.length - 1; i++) {
					var newFilter0 = new Filter("PONUMBER", FilterOperator.EQ, aCountKeys0[i].mProperties.key);
					mBindingParams.filters.push(newFilter0);
				}
			}
			var oComboBox1 = oSmtFilter.getControlByKey("MyOwnFilterField1");
			var aCountKeys1 = oComboBox1.getTokens();
			if (aCountKeys1.length > 0) {

				for (var j = 0; j <= aCountKeys1.length - 1; j++) {
					var newFilter1 = new Filter("ITEMNO", FilterOperator.EQ, aCountKeys1[j].mProperties.key);
					mBindingParams.filters.push(newFilter1);
				}
			}
			var oComboBox2 = oSmtFilter.getControlByKey("MyOwnFilterField2");
			var aCountKeys2 = oComboBox2.getTokens();
			if (aCountKeys2.length > 0) {

				for (var k = 0; k <= aCountKeys2.length - 1; k++) {
					var newFilter2 = new Filter("SUPPLIERNAME", FilterOperator.Contains, aCountKeys2[k].mProperties.key);
					mBindingParams.filters.push(newFilter2);
				}
			}
			var sPath = "/openPOParameters(IP_PSTYPE='9',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results";
			var oSmartTableBactUpon1 = this.getView().byId("SmartTableBactUpon1");
			// Setting the path to the Smart table
			oSmartTableBactUpon1.setTableBindingPath(sPath);
			oSmartTableBactUpon1.getModel().setSizeLimit(50000);
			// oController.oSmartTableBactUpon1.getBinding("columns").refresh(true); 
			// oController.oSmartTableBactUpon1.getModel().updateBindings();
			// oModel.setDefaultBindingMode("TwoWay");

			// get the array of columns
			var aColumns = oSmartTableBactUpon1._oPersController.getColumnKeys();
			// remove your property from that array
			if (aColumns.indexOf("TOTWRKCOMPAMT_CHAR") > -1) {
				aColumns.splice(aColumns.indexOf("TOTWRKCOMPAMT_CHAR"), 1);
			}
			if (aColumns.indexOf("TOTWRKCOMPPER") > -1) { // ao405- chanaged to TOTWRKCOMPPER back
				aColumns.splice(aColumns.indexOf("TOTWRKCOMPPER"), 1);
			}
			if (aColumns.indexOf("STRAIGHTLINEMTHD") > -1) {
				aColumns.splice(aColumns.indexOf("STRAIGHTLINEMTHD"), 1);
			}
			if (aColumns.indexOf("PO_CLOSURE") > -1) {
				aColumns.splice(aColumns.indexOf("PO_CLOSURE"), 1);
			}
			if (aColumns.indexOf("POVALUE,POCURRENCY") > -1) {
				aColumns.splice(aColumns.indexOf("POVALUE,POCURRENCY"), 1);
			}
			if (aColumns.indexOf("INVVALUE,POCURRENCY") > -1) {
				aColumns.splice(aColumns.indexOf("INVVALUE,POCURRENCY"), 1);
			}
			if (aColumns.indexOf("AMOUNTACCRUED,POCURRENCY") > -1) {
				aColumns.splice(aColumns.indexOf("AMOUNTACCRUED,POCURRENCY"), 1);
			}
			if (aColumns.indexOf("POCLOSURE_FLAG") > -1) {
				aColumns.splice(aColumns.indexOf("POCLOSURE_FLAG"), 1);
			}
			if (aColumns.indexOf("ITEMNO") > -1) {
				aColumns.splice(aColumns.indexOf("ITEMNO"), 1);
			}
			/*if (aColumns.indexOf("PONUMBER") > -1) {
				aColumns.splice(aColumns.indexOf("PONUMBER"), 1);
			}*/
			if (aColumns.indexOf("ACCRUALMETHOD") > -1) {
				aColumns.splice(aColumns.indexOf("ACCRUALMETHOD"), 1);
			}
			oSmartTableBactUpon1._oPersController.mProperties.columnKeys = aColumns;

			mBindingParams.events = {
				"dataReceived": function (oEvent) {

					var iCount = oEvent.getSource().getLength();
					iTotalServicePOAbove50KCount= iCount;
					// common.updateTableCountModel.call(this, "/PoOver50", iCount);
					common.updateTableCountModel.call(this, "/PoOver50Services", iCount);

					var aReceivedData = oEvent.getParameter('data');
					//	iBactUpon1 = aReceivedData.results.length;
					// allDataAct1 = aReceivedData.results;
					// concatinating the previous allDataAct1 Array with current received data 
					allDataAct1 = allDataAct1.concat(aReceivedData.results); // changed on 25 Oct
					// to delete the duplicate values
					// let newResultsArray = aReceivedData.results;
					// let differenceArray = allDataAct1.filter(x => !newResultsArray.includes(x));
					// allDataAct1 = differenceArray.concat(newResultsArray);
					allDataAct1 = allDataAct1.filter((arr, index, self) => index === self.findIndex((t) =>
						(t.PONUMBER === arr.PONUMBER && t.ITEMNO === arr.ITEMNO)));
					// to get the length of the whole records after scrolling
					iBactUpon1 = allDataAct1.length;

					for (var i = 0; i < iBactUpon1; i++) {
						allDataAct1[i].PSTYPE = '9';
					}
					// If the Newly created PO ( created this month ) count > 0, then enable the icon below the table
					common.setNewPOIconVisibility(oController, aReceivedData.results, "hboxNewPOServPOOwner");
					// sap.ui.core.BusyIndicator.hide();

				}.bind(this)
			};

		},

		// For PO NUMBER Filters
		onValueHelpDialogPONum: function (oEvent) {
			selectedPOValueHelp = '';
			// Get the calling fragment, Service or Material 
			if (oEvent.mParameters.id.split('--')[1] === 'ownerServPoNum') {
				poValueHelp.valueHelpDialogPONum(oEvent, oController, POListJson, PONumSearchToken, this);
				selectedPOValueHelp = 'S';
			} else if (oEvent.mParameters.id.split('--')[1] === 'matServPoNum') {
				poValueHelp.valueHelpDialogPONum(oEvent, oController, POMatListJson, POMatNumSearchToken, this);
				selectedPOValueHelp = 'M';
			} else if (oEvent.mParameters.id.split('--')[1] === 'threServPoNum') {
				poValueHelp.valueHelpDialogPONum(oEvent, oController, POThreListJson, POThreNumSearchToken, this);
				selectedPOValueHelp = 'T';
			} else if (oEvent.mParameters.id.split('--')[1] === 'matThrePoNumber') { //gree
				poValueHelp.valueHelpDialogPONum(oEvent, oController, POThreMatListJson, POThreMatNumSearchToken, this);
				selectedPOValueHelp = 'H';
			} else if (oEvent.mParameters.id.split('--')[1] === 'exclServPoNum') {
				poValueHelp.valueHelpDialogPONum(oEvent, oController, POExclListJson, POExclNumSearchToken, this);
				selectedPOValueHelp = 'E';
			}
		},

		onTokenUpdate: function (oEvent) {
			var tokenAction = oEvent.getParameter('type');
			if (tokenAction === 'removed') {
				var removedTokens = oEvent.getParameter('removedTokens');
				var poNum = removedTokens[0].getProperty("key");
				if (oEvent.mParameters.id.split('--')[1] === 'ownerServPoNum') {
					oController.poList.splice(oController.poList.findIndex((t) => (t.getProperty('key') === poNum)));
					PONumSearchToken = oController.poList;
					// var oHistoryTable = oController.getView().byId("SmartTableBactUpon1");
					// oHistoryTable.rebindTable(true);

				} else if (oEvent.mParameters.id.split('--')[1] === 'matServPoNum') {
					oController.poMatList.splice(oController.poMatList.findIndex((t) => (t.getProperty('key') === poNum)));
					POMatNumSearchToken = oController.poMatList;
					// var oHistoryTable = oController.getView().byId("SmartTableBactUpon2");
					// oHistoryTable.rebindTable(true);

				} else if (oEvent.mParameters.id.split('--')[1] === 'threServPoNum') {
					oController.poThreMatList.splice(oController.poThreMatList.findIndex((t) => (t.getProperty('key') === poNum)));
					POThreNumSearchToken = oController.poThreMatList;
					// var oHistoryTable = oController.getView().byId("SmartTableBthreshold");
					// oHistoryTable.rebindTable(true);

				} else if (oEvent.mParameters.id.split('--')[1] === 'matThrePoNumber') { //gree poThreMaterList
					oController.poThreMaterList.splice(oController.poThreMaterList.findIndex((t) => (t.getProperty('key') === poNum)));
					POThreMatNumSearchToken = oController.poThreMaterList;
					// var oHistoryTable = oController.getView().byId("SmartTableThres2");
					// oHistoryTable.rebindTable(true);

				} else if (oEvent.mParameters.id.split('--')[1] === 'exclServPoNum') {
					oController.poExclMatList.splice(oController.poExclMatList.findIndex((t) => (t.getProperty('key') === poNum)));
					POExclNumSearchToken = oController.poExclMatList;
					// var oHistoryTable = oController.getView().byId("SmartTableBinfo");
					// oHistoryTable.rebindTable(true);
				}
			}
		},

		onPoFilterEnter: function (oEvent) {
			if (oEvent.mParameters.id.split('--')[1] === 'ownerServPoNum') {
				PONumSearchToken = poValueHelp.poFilterEnter(oEvent, oController);
				var oHistoryTable = oController.getView().byId("SmartTableBactUpon1");
				oHistoryTable.rebindTable(true);
			} else if (oEvent.mParameters.id.split('--')[1] === 'matServPoNum') {
				POMatNumSearchToken = poValueHelp.poFilterEnter(oEvent, oController);
				var oHistoryTable = oController.getView().byId("SmartTableBactUpon2");
				oHistoryTable.rebindTable(true);

			} else if (oEvent.mParameters.id.split('--')[1] === 'threServPoNum') {
				POThreNumSearchToken = poValueHelp.poFilterEnter(oEvent, oController);
				var oHistoryTable = oController.getView().byId("SmartTableBthreshold");
				oHistoryTable.rebindTable(true);

			} else if (oEvent.mParameters.id.split('--')[1] === 'matThrePoNumber') { //gree
				POThreMatNumSearchToken = poValueHelp.poFilterEnter(oEvent, oController);
				var oHistoryTable = oController.getView().byId("SmartTableThres2");
				oHistoryTable.rebindTable(true);

			} else if (oEvent.mParameters.id.split('--')[1] === 'exclServPoNum') {
				POExclNumSearchToken = poValueHelp.poFilterEnter(oEvent, oController);
				var oHistoryTable = oController.getView().byId("SmartTableBinfo");
				oHistoryTable.rebindTable(true);
			}
		},

		onPOSearch: function (oEvent) {
			if (selectedPOValueHelp === 'S') {
				POListJson = poValueHelp.poSearch(oEvent, oController, emailId, loginUserRole, '9', this, selectedPOValueHelp);
			} else if (selectedPOValueHelp === 'M') {
				POMatListJson = poValueHelp.poSearch(oEvent, oController, emailId, loginUserRole, '0', this, selectedPOValueHelp);
			} else if (selectedPOValueHelp === 'T') {
				POThreListJson = poValueHelp.poSearch(oEvent, oController, emailId, loginUserRole, '0', this, selectedPOValueHelp);
			} else if (selectedPOValueHelp === 'H') { //gree
				POThreMatListJson = poValueHelp.poSearch(oEvent, oController, emailId, loginUserRole, '0', this, selectedPOValueHelp);
			} else if (selectedPOValueHelp === 'E') {
				POExclListJson = poValueHelp.poSearch(oEvent, oController, emailId, loginUserRole, '0', this, selectedPOValueHelp);
			}

		},

		onPoFilterEnter: function (oEvent) {
			if (oEvent.mParameters.id.split('--')[1] === 'ownerServPoNum') {
				PONumSearchToken = poValueHelp.poFilterEnter(oEvent, oController);
			} else if (oEvent.mParameters.id.split('--')[1] === 'matServPoNum') {
				POMatNumSearchToken = poValueHelp.poFilterEnter(oEvent, oController);

			} else if (oEvent.mParameters.id.split('--')[1] === 'threServPoNum') {
				POThreNumSearchToken = poValueHelp.poFilterEnter(oEvent, oController);

			} else if (oEvent.mParameters.id.split('--')[1] === 'matThrePoNumber') { //gree
				POThreMatNumSearchToken = poValueHelp.poFilterEnter(oEvent, oController);

			} else if (oEvent.mParameters.id.split('--')[1] === 'exclServPoNum') {
				POExclNumSearchToken = poValueHelp.poFilterEnter(oEvent, oController);
			}
		},

		onPressOkPONum: function (oEvent) {
			if (selectedPOValueHelp === 'S') {
				PONumSearchToken = poValueHelp.pressOkPONum(oEvent, oController, PONumSearchToken, this, "ownerServPoNum");
			} else if (selectedPOValueHelp === 'M') {
				POMatNumSearchToken = poValueHelp.pressOkPONum(oEvent, oController, POMatNumSearchToken, this, "matServPoNum");
			} else if (selectedPOValueHelp === 'T') {
				POThreNumSearchToken = poValueHelp.pressOkPONum(oEvent, oController, POThreNumSearchToken, this, "threServPoNum");
			} else if (selectedPOValueHelp === 'H') { //gree
				POThreMatNumSearchToken = poValueHelp.pressOkPONum(oEvent, oController, POThreMatNumSearchToken, this, "matThrePoNumber");
			} else if (selectedPOValueHelp === 'E') {
				POExclNumSearchToken = poValueHelp.pressOkPONum(oEvent, oController, POExclNumSearchToken, this, "exclServPoNum");
			}

		},

		onPressCancelPONum: function () {
			poValueHelp.pressCancelPONum(this);
		},

		_poNumFilterSelectionChange: function (oEvent) {
			if (selectedPOValueHelp === 'S') {
				poValueHelp._poNumFilterSelectionChange(oEvent, oController, "ownerServPoNum");
			} else if (selectedPOValueHelp === 'M') {
				poValueHelp._poNumFilterSelectionChange(oEvent, oController, "matServPoNum");
			} else if (selectedPOValueHelp === 'T') {
				poValueHelp._poNumFilterSelectionChange(oEvent, oController, "threServPoNum");
			} else if (selectedPOValueHelp === 'H') { //gree
				poValueHelp._poNumFilterSelectionChange(oEvent, oController, "matThrePoNumber");
			} else if (selectedPOValueHelp === 'E') {
				poValueHelp._poNumFilterSelectionChange(oEvent, oController, "exclServPoNum");
			}
		},

		// For LINE ITEM Filters
		onValueHelpDialogItemNum: function (oEvent) {
			selectedItemValueHelp = '';
			// Get the calling fragment, Service or Material 
			if (oEvent.mParameters.id.split('--')[1] === 'ownerServItemNo') {
				lineItemValueHelp.valueHelpDialogItemNum(oEvent, oController, LIListJson, ItemNumSearchToken, this, 'S');
				selectedItemValueHelp = 'S';
				LIListJson = lineItemValueHelp.lineItemSearch(oEvent, oController, emailId, loginUserRole, '9', this, selectedItemValueHelp);
			} else if (oEvent.mParameters.id.split('--')[1] === 'matServItemNo') {
				lineItemValueHelp.valueHelpDialogItemNum(oEvent, oController, LIMatListJson, ItemMatNumSearchToken, this, 'M');
				selectedItemValueHelp = 'M';
				LIListJson = lineItemValueHelp.lineItemSearch(oEvent, oController, emailId, loginUserRole, '0', this, selectedItemValueHelp);
			} else if (oEvent.mParameters.id.split('--')[1] === 'threServItemNo') {
				lineItemValueHelp.valueHelpDialogItemNum(oEvent, oController, LIThreListJson, ItemThreNumSearchToken, this, 'M');
				selectedItemValueHelp = 'T';
				LIListJson = lineItemValueHelp.lineItemSearch(oEvent, oController, emailId, loginUserRole, '0', this, selectedItemValueHelp);
			} else if (oEvent.mParameters.id.split('--')[1] === 'matThreItemNos') { //gree
				lineItemValueHelp.valueHelpDialogItemNum(oEvent, oController, LIThreMatListJson, ItemThreMatNumSearchToken, this, 'M');
				selectedItemValueHelp = 'H';
				LIListJson = lineItemValueHelp.lineItemSearch(oEvent, oController, emailId, loginUserRole, '0', this, selectedItemValueHelp);
			} else if (oEvent.mParameters.id.split('--')[1] === 'exclServItemNo') {
				lineItemValueHelp.valueHelpDialogItemNum(oEvent, oController, LIExclListJson, ItemExclNumSearchToken, this, 'M');
				selectedItemValueHelp = 'E';
				LIListJson = lineItemValueHelp.lineItemSearch(oEvent, oController, emailId, loginUserRole, '0', this, selectedItemValueHelp);
			}

		},
		onLineItemSearch: function (oEvent) {
			if (selectedItemValueHelp === 'S') {
				LIListJson = lineItemValueHelp.lineItemSearch(oEvent, oController, emailId, loginUserRole, '9', this, selectedItemValueHelp);
			} else if (selectedItemValueHelp === 'M') {
				LIMatListJson = lineItemValueHelp.lineItemSearch(oEvent, oController, emailId, loginUserRole, '0', this, selectedItemValueHelp);
			} else if (selectedItemValueHelp === 'T') {
				LIThreListJson = lineItemValueHelp.lineItemSearch(oEvent, oController, emailId, loginUserRole, '0', this, selectedItemValueHelp);
			} else if (selectedItemValueHelp === 'H') { //gree
				LIThreMatListJson = lineItemValueHelp.lineItemSearch(oEvent, oController, emailId, loginUserRole, '0', this, selectedItemValueHelp);
			} else if (selectedItemValueHelp === 'E') {
				LIExclListJson = lineItemValueHelp.lineItemSearch(oEvent, oController, emailId, loginUserRole, '0', this, selectedItemValueHelp);
			}
		},

		onItemFilterEnter: function (oEvent) {
			var pId = oEvent.mParameters.id.split('--')[1];
			if (oEvent.mParameters.id.split('--')[1] === 'ownerServItemNo') {
				ItemNumSearchToken = lineItemValueHelp.itemFilterEnter(oEvent, oController, pId);
			} else if (oEvent.mParameters.id.split('--')[1] === 'matServItemNo') {
				ItemMatNumSearchToken = lineItemValueHelp.itemFilterEnter(oEvent, oController, pId);

			} else if (oEvent.mParameters.id.split('--')[1] === 'threServItemNo') {
				ItemThreNumSearchToken = lineItemValueHelp.itemFilterEnter(oEvent, oController, pId);

			} else if (oEvent.mParameters.id.split('--')[1] === 'matThreItemNos') { //gree
				ItemThreMatNumSearchToken = lineItemValueHelp.itemFilterEnter(oEvent, oController, pId);

			} else if (oEvent.mParameters.id.split('--')[1] === 'exclServItemNo') {
				ItemExclNumSearchToken = lineItemValueHelp.itemFilterEnter(oEvent, oController, pId);
			}
		},

		onTokenItemUpdate: function (oEvent) {
			var tokenAction = oEvent.getParameter('type');
			if (tokenAction === 'removed') {
				var removedTokens = oEvent.getParameter('removedTokens');
				var itemNum = removedTokens[0].getProperty("key");
				var pID = oEvent.mParameters.id.split('--')[1];
				if (pID === 'ownerServItemNo') {
					oController.lineitem.splice(oController.lineitem.findIndex((t) => (t.getProperty('key') === itemNum)));
					ItemNumSearchToken = oController.lineitem;

				} else if (oEvent.mParameters.id.split('--')[1] === 'matServItemNo') {
					oController.lineMatItem.splice(oController.lineMatItem.findIndex((t) => (t.getProperty('key') === itemNum)));
					ItemNumSearchToken = oController.lineitem;

				} else if (oEvent.mParameters.id.split('--')[1] === 'threServItemNo') {
					oController.lineThreItem.splice(oController.lineThreItem.findIndex((t) => (t.getProperty('key') === itemNum)));
					ItemThreNumSearchToken = oController.lineThreItem;

				} else if (oEvent.mParameters.id.split('--')[1] === 'matThreItemNos') { //gree
					oController.lineThreMatItem.splice(oController.lineThreMatItem.findIndex((t) => (t.getProperty('key') === itemNum)));
					ItemThreMatNumSearchToken = oController.lineThreMatItem;

				} else if (oEvent.mParameters.id.split('--')[1] === 'exclServItemNo') {
					oController.lineExclItem.splice(oController.lineExclItem.findIndex((t) => (t.getProperty('key') === itemNum)));
					ItemExclNumSearchToken = oController.lineExclItem;

				}

			}

		},

		onPressOkLineItem: function (oEvent) {
			if (selectedItemValueHelp === 'S') {
				ItemNumSearchToken = lineItemValueHelp.pressOkLineItem(oEvent, oController, ItemNumSearchToken, this, "ownerServItemNo");
			} else if (selectedItemValueHelp === 'M') {
				ItemMatNumSearchToken = lineItemValueHelp.pressOkLineItem(oEvent, oController, ItemMatNumSearchToken, this, "matServItemNo");
			} else if (selectedItemValueHelp === 'T') {
				ItemThreNumSearchToken = lineItemValueHelp.pressOkLineItem(oEvent, oController, ItemThreNumSearchToken, this, "threServItemNo");
			} else if (selectedItemValueHelp === 'H') { //gree
				ItemThreMatNumSearchToken = lineItemValueHelp.pressOkLineItem(oEvent, oController, ItemThreMatNumSearchToken, this,
					"matThreItemNos");
			} else if (selectedItemValueHelp === 'E') {
				ItemExclNumSearchToken = lineItemValueHelp.pressOkLineItem(oEvent, oController, ItemExclNumSearchToken, this, "exclServItemNo");
			}

		},

		onPressCancelLineItem: function () {
			lineItemValueHelp.pressCancelLineItem(this);
		},

		_itemNumFilterSelectionChange: function (oEvent) {
			if (selectedItemValueHelp === 'S') {
				lineItemValueHelp._itemNumFilterSelectionChange(oEvent, oController, "ownerServItemNo");
			} else if (selectedItemValueHelp === 'M') {
				lineItemValueHelp._itemNumFilterSelectionChange(oEvent, oController, "matServItemNo");
			} else if (selectedItemValueHelp === 'T') {
				lineItemValueHelp._itemNumFilterSelectionChange(oEvent, oController, "threServItemNo");
			} else if (selectedItemValueHelp === 'H') { //gree
				lineItemValueHelp._itemNumFilterSelectionChange(oEvent, oController, "matThreItemNos");
			} else if (selectedItemValueHelp === 'E') {
				lineItemValueHelp._itemNumFilterSelectionChange(oEvent, oController, "exclServItemNo");
			}
		},

		// For Supplier Name Value Help
		onValueHelpDialogSupName: function (oEvent) {
			selectedSuppValueHelp = '';
			// Get the calling fragment, Service or Material 
			if (oEvent.mParameters.id.split('--')[1] === 'ownerServSuppName') {
				supplierValueHelp.valueHelpDialogSupName(oEvent, oController, SNListJson, SupNameSearchToken, this);
				selectedSuppValueHelp = 'S';
			} else if (oEvent.mParameters.id.split('--')[1] === 'matServSuppName') {
				supplierValueHelp.valueHelpDialogSupName(oEvent, oController, SNMatListJson, SupMatNameSearchToken, this);
				selectedSuppValueHelp = 'M';
			} else if (oEvent.mParameters.id.split('--')[1] === 'threServSuppName') {
				supplierValueHelp.valueHelpDialogSupName(oEvent, oController, SNThreListJson, SupThreNameSearchToken, this);
				selectedSuppValueHelp = 'T';
			} else if (oEvent.mParameters.id.split('--')[1] === 'matThreSuppNames') { //gree
				supplierValueHelp.valueHelpDialogSupName(oEvent, oController, SNThreMatListJson, SupThreMatNameSearchToken, this);
				selectedSuppValueHelp = 'H';
			} else if (oEvent.mParameters.id.split('--')[1] === 'exclServSuppName') {
				supplierValueHelp.valueHelpDialogSupName(oEvent, oController, SNExclListJson, SupExclNameSearchToken, this);
				selectedSuppValueHelp = 'T';
			}

		},

		onTokenSuppIDUpdate: function (oEvent) {
			var tokenAction = oEvent.getParameter('type');
			if (tokenAction === 'removed') {
				var removedTokens = oEvent.getParameter('removedTokens');
				var suppID = removedTokens[0].getProperty("key");

				if (oEvent.mParameters.id.split('--')[1] === 'ownerServSuppName') {
					oController.supplierID.splice(oController.supplierID.findIndex((t) => (t.getProperty('key') === suppID)));
					SupNameSearchToken = oController.supplierID;
					// var oHistoryTable = oController.getView().byId("SmartTableactUpon1");
					// oHistoryTable.rebindTable(true);

				} else if (oEvent.mParameters.id.split('--')[1] === 'matServSuppName') {
					oController.supplierMatID.splice(oController.supplierMatID.findIndex((t) => (t.getProperty('key') === suppID)));
					SupMatNameSearchToken = oController.supplierMatID;
					// var oHistoryTable = oController.getView().byId("SmartTableactUpon2");
					// oHistoryTable.rebindTable(true);

				} else if (oEvent.mParameters.id.split('--')[1] === 'threServSuppName') {
					oController.supplierThreID.splice(oController.supplierThreID.findIndex((t) => (t.getProperty('key') === suppID)));
					SupThreNameSearchToken = oController.supplierThreID;
					// var oHistoryTable = oController.getView().byId("SmartTableBthreshold");
					// oHistoryTable.rebindTable(true);

				} else if (oEvent.mParameters.id.split('--')[1] === 'matThreSuppNames') { //gree
					oController.supplierThreMatID.splice(oController.supplierThreMatID.findIndex((t) => (t.getProperty('key') === suppID)));
					SupThreMatNameSearchToken = oController.supplierThreMatID;
					// var oHistoryTable = oController.getView().byId("SmartTableThres2");
					// oHistoryTable.rebindTable(true);

				} else if (oEvent.mParameters.id.split('--')[1] === 'exclServSuppName') {
					oController.supplierExclID.splice(oController.supplierExclID.findIndex((t) => (t.getProperty('key') === suppID)));
					SupExclNameSearchToken = oController.supplierExclID;
					// var oHistoryTable = oController.getView().byId("SmartTableBinfo");
					// oHistoryTable.rebindTable(true);

				}
			}
		},

		onSuppIDFilterEnter: function (oEvent) {
			if (oEvent.mParameters.id.split('--')[1] === 'ownerServSuppName') {
				SupNameSearchToken = supplierValueHelp.suppIDFilterEnter(oEvent, oController);
				var oHistoryTable = oController.getView().byId("SmartTableactUpon1");
				oHistoryTable.rebindTable(true);

			} else if (oEvent.mParameters.id.split('--')[1] === 'matServSuppName') {
				SupMatNameSearchToken = supplierValueHelp.suppIDFilterEnter(oEvent, oController);
				var oHistoryTable = oController.getView().byId("SmartTableactUpon2");
				oHistoryTable.rebindTable(true);

			} else if (oEvent.mParameters.id.split('--')[1] === 'threServSuppName') {
				SupThreNameSearchToken = supplierValueHelp.suppIDFilterEnter(oEvent, oController);
				var oHistoryTable = oController.getView().byId("SmartTableBthreshold");
				oHistoryTable.rebindTable(true);

			} else if (oEvent.mParameters.id.split('--')[1] === 'matThreSuppNames') { //gree
				SupThreMatNameSearchToken = supplierValueHelp.suppIDFilterEnter(oEvent, oController);
				var oHistoryTable = oController.getView().byId("SmartTableThres2");
				oHistoryTable.rebindTable(true);

			} else if (oEvent.mParameters.id.split('--')[1] === 'exclServSuppName') {
				SupExclNameSearchToken = supplierValueHelp.suppIDFilterEnter(oEvent, oController);
				var oHistoryTable = oController.getView().byId("SmartTableBinfo");
				oHistoryTable.rebindTable(true);
			}
		},

		onSupNameSearch: function (oEvent) {
			if (selectedSuppValueHelp === 'S') {
				SNListJson = supplierValueHelp.supNameSearch(oEvent, oController, emailId, loginUserRole, '9', this, selectedSuppValueHelp);
			} else if (selectedSuppValueHelp === 'M') {
				SNMatListJson = supplierValueHelp.supNameSearch(oEvent, oController, emailId, loginUserRole, '0', this, selectedSuppValueHelp);
			} else if (selectedSuppValueHelp === 'T') {
				SNThreListJson = supplierValueHelp.supNameSearch(oEvent, oController, emailId, loginUserRole, '0', this, selectedSuppValueHelp);
			} else if (selectedSuppValueHelp === 'H') { //gree
				SNThreMatListJson = supplierValueHelp.supNameSearch(oEvent, oController, emailId, loginUserRole, '0', this, selectedSuppValueHelp);
			} else if (selectedSuppValueHelp === 'E') {
				SNExclListJson = supplierValueHelp.supNameSearch(oEvent, oController, emailId, loginUserRole, '0', this, selectedSuppValueHelp);
			}
		},

		onPressOkSupName: function (oEvent) {
			if (selectedSuppValueHelp === 'S') {
				SupNameSearchToken = supplierValueHelp.pressOkSupName(oEvent, oController, SupNameSearchToken, this, "ownerServSuppName");
			} else if (selectedSuppValueHelp === 'M') {
				SupMatNameSearchToken = supplierValueHelp.pressOkSupName(oEvent, oController, SupMatNameSearchToken, this, "matServSuppName");
			} else if (selectedSuppValueHelp === 'T') {
				SupThreNameSearchToken = supplierValueHelp.pressOkSupName(oEvent, oController, SupThreNameSearchToken, this, "threServSuppName");
			} else if (selectedSuppValueHelp === 'H') { //gree
				SupThreMatNameSearchToken = supplierValueHelp.pressOkSupName(oEvent, oController, SupThreMatNameSearchToken, this,
					"matThreSuppNames");
			} else if (selectedSuppValueHelp === 'E') {
				SupExclNameSearchToken = supplierValueHelp.pressOkSupName(oEvent, oController, SupExclNameSearchToken, this, "exclServSuppName");
			}
		},

		onPressCancelSupName: function () {
			supplierValueHelp.pressCancelSupName(this);
		},

		_supNameFilterSelectionChange: function (oEvent) {
			if (selectedSuppValueHelp === 'S') {
				supplierValueHelp._supNameFilterSelectionChange(oEvent, oController, "ownerServSuppName");
			} else if (selectedSuppValueHelp === 'M') {
				supplierValueHelp._supNameFilterSelectionChange(oEvent, oController, "matServSuppName");
			} else if (selectedSuppValueHelp === 'T') {
				supplierValueHelp._supNameFilterSelectionChange(oEvent, oController, "threServSuppName");
			} else if (selectedSuppValueHelp === 'H') { //gree
				supplierValueHelp._supNameFilterSelectionChange(oEvent, oController, "matThreSuppNames");
			} else if (selectedSuppValueHelp === 'E') {
				supplierValueHelp._supNameFilterSelectionChange(oEvent, oController, "exclServSuppName");
			}
		},

		onClearFilters: function (oEvent) {
			oController.getView().byId("ownerServPoNum").removeAllTokens();
			oController.getView().byId("ownerServItemNo").removeAllTokens();
			oController.getView().byId("ownerServSuppName").removeAllTokens();
			// Re populate the table
			var oHistoryTable = oController.getView().byId("SmartTableBactUpon1");
			oHistoryTable.rebindTable(true);
			// Clear the variables
			POListJson.oData.results = [];
			LIListJson.oData.results = [];
			SNListJson.oData.results = [];
			PONumSearchToken = {};
			ItemNumSearchToken = {};
			SupNameSearchToken = {};
			oController.lineitem = {};
			oController.poList = [];
			oController.supplierID = [];

		},

		onClearMatFilters: function (oEvent) {
			oController.getView().byId("matServPoNum").removeAllTokens();
			oController.getView().byId("matServItemNo").removeAllTokens();
			oController.getView().byId("matServSuppName").removeAllTokens();
			// Re populate the table
			var oHistoryTable = oController.getView().byId("SmartTableBactUpon2");
			oHistoryTable.rebindTable(true);
			// Clear the variables
			POMatListJson.oData.results = [];
			LIMatListJson.oData.results = [];
			SNMatListJson.oData.results = [];
			POMatNumSearchToken = {};
			ItemMatNumSearchToken = {};
			SupMatNameSearchToken = {};
			oController.lineMatItem = {};
			oController.poMatList = [];
		},

		//gree start
		onClearThreMatFilter: function (oEvent) {
			oController.getView().byId("matThrePoNumber").removeAllTokens();
			oController.getView().byId("matThreItemNos").removeAllTokens();
			oController.getView().byId("matThreSuppNames").removeAllTokens();
			// Re populate the table
			var oHistoryTable = oController.getView().byId("SmartTableThres2");
			oHistoryTable.rebindTable(true);
			// Clear the variables
			POThreMatListJson.oData.results = [];
			LIThreMatListJson.oData.results = [];
			SNThreMatListJson.oData.results = [];
			POThreMatNumSearchToken = {};
			ItemThreMatNumSearchToken = {};
			SupThreMatNameSearchToken = {};
			oController.poThreMaterList = [];
		},
		//gree end
		onClearThreFilters: function (oEvent) {
			oController.getView().byId("threServPoNum").removeAllTokens();
			oController.getView().byId("threServItemNo").removeAllTokens();
			oController.getView().byId("threServSuppName").removeAllTokens();
			// Re populate the table
			var oHistoryTable = oController.getView().byId("SmartTableBthreshold");
			oHistoryTable.rebindTable(true);
			// Clear the variables
			POThreListJson.oData.results = [];
			LIThreListJson.oData.results = [];
			SNThreListJson.oData.results = [];
			POThreNumSearchToken = {};
			ItemThreNumSearchToken = {};
			SupThreNameSearchToken = {};
			oController.lineitem = {};
			oController.poThreMatList = [];
		},

		onClearExclFilters: function (oEvent) {
			oController.getView().byId("exclServPoNum").removeAllTokens();
			oController.getView().byId("exclServItemNo").removeAllTokens();
			oController.getView().byId("exclServSuppName").removeAllTokens();
			// Re populate the table
			var oHistoryTable = oController.getView().byId("SmartTableBinfo");
			oHistoryTable.rebindTable(true);
			// Clear the variables
			POExclListJson.oData.results = [];
			LIExclListJson.oData.results = [];
			SNExclListJson.oData.results = [];
			POExclNumSearchToken = {};
			ItemExclNumSearchToken = {};
			SupExclNameSearchToken = {};
			oController.lineitem = {};
		},

		// This Method will trigger on before rebind of Material table
		onBeforeRebindAct2Table: function (oEvent) {
			rowSelectionMaterial = [];
			var mBindingParams = oEvent.getParameter("bindingParams");
			var oSmtFilter = this.getView().byId("smartFilterBar2");
			// oSmtFilter._aFields.splice(3,3);
			var oComboBox0 = oSmtFilter.getControlByKey("MyOwnFilterField0");
			var aCountKeys0 = oComboBox0.getTokens();
			if (aCountKeys0.length > 0) {
				for (var i = 0; i <= aCountKeys0.length - 1; i++) {
					var newFilter0 = new Filter("PONUMBER", FilterOperator.EQ, aCountKeys0[i].mProperties.key);
					mBindingParams.filters.push(newFilter0);
				}
			}
			var oComboBox1 = oSmtFilter.getControlByKey("MyOwnFilterField1");
			var aCountKeys1 = oComboBox1.getTokens();
			if (aCountKeys1.length > 0) {
				for (var j = 0; j <= aCountKeys1.length - 1; j++) {
					var newFilter1 = new Filter("ITEMNO", FilterOperator.EQ, aCountKeys1[j].mProperties.key);
					mBindingParams.filters.push(newFilter1);
				}
			}
			var oComboBox2 = oSmtFilter.getControlByKey("MyOwnFilterField2");
			var aCountKeys2 = oComboBox2.getTokens();
			if (aCountKeys2.length > 0) {
				for (var k = 0; k <= aCountKeys2.length - 1; k++) {
					var newFilter2 = new Filter("SUPPLIERNAME", FilterOperator.Contains, aCountKeys2[k].mProperties.key);
					mBindingParams.filters.push(newFilter2);
				}
			}
			var sPath = "/openPOParameters(IP_PSTYPE='0',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results";
			var oSmartTableBactUpon2 = this.getView().byId("SmartTableBactUpon2");
			// Setting the path to the Smart table
			oSmartTableBactUpon2.setTableBindingPath(sPath);
			var aColumns = oSmartTableBactUpon2._oPersController.getColumnKeys();
			if (aColumns.indexOf("POCLOSURE_FLAG") > -1) {
				aColumns.splice(aColumns.indexOf("POCLOSURE_FLAG"), 1);
			}
			if (aColumns.indexOf("PO_CLOSURE") > -1) {
				aColumns.splice(aColumns.indexOf("PO_CLOSURE"), 1);
			}
			if (aColumns.indexOf("PO_CLOSURE") > -1) {
				aColumns.splice(aColumns.indexOf("PO_CLOSURE"), 1);
			}
			if (aColumns.indexOf("ITEMNO") > -1) {
				aColumns.splice(aColumns.indexOf("ITEMNO"), 1);
			}
			/*if (aColumns.indexOf("PONUMBER") > -1) {
				aColumns.splice(aColumns.indexOf("PONUMBER"), 1);
			}*/
			if (aColumns.indexOf("POVALUE,POCURRENCY") > -1) {
				aColumns.splice(aColumns.indexOf("POVALUE,POCURRENCY"), 1);
			}
			if (aColumns.indexOf("GRVALUE") > -1) {
				aColumns.splice(aColumns.indexOf("GRVALUE"), 1);
			}
			if (aColumns.indexOf("INVVALUE") > -1) {
				aColumns.splice(aColumns.indexOf("INVVALUE"), 1);
			}
			if (aColumns.indexOf("AMOUNTACCRUED,POCURRENCY") > -1) {
				aColumns.splice(aColumns.indexOf("AMOUNTACCRUED,POCURRENCY"), 1);
			}

			oSmartTableBactUpon2._oPersController.mProperties.columnKeys = aColumns;
			mBindingParams.events = {
				"dataReceived": function (oEvent) {

					var iCount = oEvent.getSource().getLength();
					iTotalMaterialPOAbove50KCount = iCount;
					// common.updateTableCountModel.call(this, "/PoOver50", iCount);
					common.updateTableCountModel.call(this, "/PoOver50Materials", iCount);

					var aReceivedData = oEvent.getParameter('data');
					//	iBactUpon2 = aReceivedData.results.length;
					// allDataAct2 = aReceivedData.results;
					// concatinating the previous allDataAct1 Array with current received data 
					allDataAct2 = allDataAct2.concat(aReceivedData.results); // changed on 25 Oct

					// to delete the duplicate values
					allDataAct2 = allDataAct2.filter((arr, index, self) => index === self.findIndex((t) =>
						(t.PONUMBER === arr.PONUMBER && t.ITEMNO === arr.ITEMNO)));

					iBactUpon2 = allDataAct2.length;

					for (var i = 0; i < iBactUpon2; i++) {
						allDataAct2[i].PSTYPE = '0';
					}
					// mvp2 changes start
					if (iBactUpon2 < 0) {
						MessageBox.error(oController.geti18nText("nodata"));
						return;
					}
					// mvp2 changes end
					// If the Newly created PO ( created this month ) count > 0, then enable the icon below the table
					common.setNewPOIconVisibility(oController, aReceivedData.results, "hboxNewPOMatPOOwner");
					// sap.ui.core.BusyIndicator.hide();
				}.bind(this)
			};

		},
		// This Method will trigger on before rebind of Info table
		onBeforeRebindInfoTable: function (oEvent) {
			if (oEvent != undefined) {
				var oBindingParams = oEvent.getParameter("bindingParams");
				if (!oBindingParams.sorter.length) {
					oBindingParams.sorter.push(new sap.ui.model.Sorter("PSTYPE", true))
				}
			}
			var mBindingParams = oEvent.getParameter("bindingParams");
			var oSmtFilter = this.getView().byId("smartFilterBarInfo");
			var oComboBox0 = oSmtFilter.getControlByKey("FilterField0");
			var aCountKeys0 = oComboBox0.getTokens();
			if (aCountKeys0.length > 0) {
				for (var i = 0; i <= aCountKeys0.length - 1; i++) {
					var newFilter0 = new Filter("PONUMBER", FilterOperator.EQ, aCountKeys0[i].mProperties.key);
					mBindingParams.filters.push(newFilter0);
				}
			}
			var oComboBox1 = oSmtFilter.getControlByKey("FilterField1");
			var aCountKeys1 = oComboBox1.getTokens();
			if (aCountKeys1.length > 0) {
				for (var j = 0; j <= aCountKeys1.length - 1; j++) {
					var newFilter1 = new Filter("ITEMNO", FilterOperator.EQ, aCountKeys1[j].mProperties.key);
					mBindingParams.filters.push(newFilter1);
				}
			}
			var oComboBox2 = oSmtFilter.getControlByKey("FilterField2");
			var aCountKeys2 = oComboBox2.getTokens();
			if (aCountKeys2.length > 0) {
				for (var k = 0; k <= aCountKeys2.length - 1; k++) {
					var newFilter2 = new Filter("SUPPLIERNAME", FilterOperator.Contains, aCountKeys2[k].mProperties.key);
					mBindingParams.filters.push(newFilter2);
				}
			}
			var sPath = "/exclusionPOParameters(IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results";
			var SmartTableBinfo = this.getView().byId("SmartTableBinfo");
			SmartTableBinfo.setTableBindingPath(sPath);

			mBindingParams.events = {
				"dataReceived": function (oEvent) {
					var iCount = oEvent.getSource().getLength();
					common.updateTableCountModel.call(this, "/PoInformation", iCount);
				}.bind(this)
			};

			//	var obrandModel = this.getOwnerComponent().getModel("excludedPOModel");
			//	SmartTableBinfo.setModel(obrandModel);
		},
		// This Method will trigger on before rebind of Threshold table
		onBeforeRebindThresholdTable: function (oEvent) {

			if (oEvent != undefined) {
				var oBindingParams = oEvent.getParameter("bindingParams");
				if (!oBindingParams.sorter.length) {
					oBindingParams.sorter.push(new sap.ui.model.Sorter("PSTYPE", true))
				}
			}
			var mBindingParams = oEvent.getParameter("bindingParams");
			var oSmtFilter = this.getView().byId("smartFilterBarThre");
			var oComboBox0 = oSmtFilter.getControlByKey("FilterFieldThre0");
			var aCountKeys0 = oComboBox0.getTokens();

			if (aCountKeys0.length > 0) {
				for (var i = 0; i <= aCountKeys0.length - 1; i++) {
					var newFilter0 = new Filter("PONUMBER", FilterOperator.EQ, aCountKeys0[i].mProperties.key);
					mBindingParams.filters.push(newFilter0);
				}
			}
			var oComboBox1 = oSmtFilter.getControlByKey("FilterFieldThre1");
			var aCountKeys1 = oComboBox1.getTokens();

			if (aCountKeys1.length > 0) {
				for (var j = 0; j <= aCountKeys1.length - 1; j++) {
					var newFilter1 = new Filter("ITEMNO", FilterOperator.EQ, aCountKeys1[j].mProperties.key);
					mBindingParams.filters.push(newFilter1);
				}
			}
			var oComboBox2 = oSmtFilter.getControlByKey("FilterFieldThre2");
			var aCountKeys2 = oComboBox2.getTokens();

			if (aCountKeys2.length > 0) {
				for (var k = 0; k <= aCountKeys2.length - 1; k++) {
					var newFilter2 = new Filter("SUPPLIERNAME", FilterOperator.Contains, aCountKeys2[k].mProperties.key);
					mBindingParams.filters.push(newFilter2);
				}
			}

			// Only Service POs are considered for below threshold
			var sPath = "/thresholdParameters(IP_PSTYPE='9',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results";
			var SmartTableBthre = this.getView().byId("SmartTableBthreshold");
			SmartTableBthre.setTableBindingPath(sPath);
			//gree march 
			SmartTableBthre.getModel().setSizeLimit(50000);

			// get the array of columns
			var aColumns = SmartTableBthre._oPersController.getColumnKeys();
			// remove your property from that array
			if (aColumns.indexOf("TOTWRKCOMPAMT_CHAR,POCURRENCY") > -1) {
				aColumns.splice(aColumns.indexOf("TOTWRKCOMPAMT_CHAR,POCURRENCY"), 1);
			}
			if (aColumns.indexOf("TOTWRKCOMPPER") > -1) {
				aColumns.splice(aColumns.indexOf("TOTWRKCOMPPER"), 1);
			}
			if (aColumns.indexOf("STRAIGHTLINEMTHD") > -1) {
				aColumns.splice(aColumns.indexOf("STRAIGHTLINEMTHD"), 1);
			}
			if (aColumns.indexOf("PO_CLOSURE") > -1) {
				aColumns.splice(aColumns.indexOf("PO_CLOSURE"), 1);
			}
			if (aColumns.indexOf("POVALUE,POCURRENCY") > -1) {
				aColumns.splice(aColumns.indexOf("POVALUE,POCURRENCY"), 1);
			}
			if (aColumns.indexOf("INVVALUE,POCURRENCY") > -1) {
				aColumns.splice(aColumns.indexOf("INVVALUE,POCURRENCY"), 1);
			}
			if (aColumns.indexOf("AMOUNTACCRUED,POCURRENCY") > -1) {
				aColumns.splice(aColumns.indexOf("AMOUNTACCRUED,POCURRENCY"), 1);
			}
			if (aColumns.indexOf("POCLOSURE_FLAG") > -1) {
				aColumns.splice(aColumns.indexOf("POCLOSURE_FLAG"), 1);
			}
			if (aColumns.indexOf("ITEMNO") > -1) {
				aColumns.splice(aColumns.indexOf("ITEMNO"), 1);
			}
			/*if (aColumns.indexOf("PONUMBER") > -1) {
				aColumns.splice(aColumns.indexOf("PONUMBER"), 1);
			}*/
			if (aColumns.indexOf("ACCRUALMETHOD") > -1) {
				aColumns.splice(aColumns.indexOf("ACCRUALMETHOD"), 1);
			}
			SmartTableBthre._oPersController.mProperties.columnKeys = aColumns;

			mBindingParams.events = {
				"dataReceived": function (oEvent) {

					var iCount = oEvent.getSource().getLength();
					iTotalServicePOUnder50KCount = iCount;
					common.updateTableCountModel.call(this, "/PoUnder50Services", iCount);

					var aReceivedData = oEvent.getParameter('data');
					//	iBactUpon1 = aReceivedData.results.length;
					// allDataAct1 = aReceivedData.results;
					// concatinating the previous allDataAct1 Array with current received data 
					allDataThre1 = allDataThre1.concat(aReceivedData.results); // changed on 25 Oct
					// to delete the duplicate values
					// let newResultsArray = aReceivedData.results;
					// let differenceArray = allDataAct1.filter(x => !newResultsArray.includes(x));
					// allDataAct1 = differenceArray.concat(newResultsArray);
					allDataThre1 = allDataThre1.filter((arr, index, self) => index === self.findIndex((t) =>
						(t.PONUMBER === arr.PONUMBER && t.ITEMNO === arr.ITEMNO)));
					// to get the length of the whole records after scrolling
					iBThre1 = allDataThre1.length;

					for (var i = 0; i < iBThre1; i++) {
						allDataThre1[i].PSTYPE = '9';
					}
					// If the Newly created PO ( created this month ) count > 0, then enable the icon below the table
					common.setNewPOIconVisibility(oController, aReceivedData.results, "hboxNewPOThres");
					// sap.ui.core.BusyIndicator.hide();
				}.bind(this)
			};
			//var oThreshModel = this.getOwnerComponent().getModel("thresholdModel");
			//	SmartTableBthre.setModel(oThreshModel);

		},

		//gree start
		onBeforeRebindThresholdTable2: function (oEvent) {
			if (oEvent != undefined) {
				var oBindingParams = oEvent.getParameter("bindingParams");
				if (!oBindingParams.sorter.length) {
					oBindingParams.sorter.push(new sap.ui.model.Sorter("PSTYPE", true))
				}
			}
			var mBindingParams = oEvent.getParameter("bindingParams");
			var oSmtFilter = this.getView().byId("smartFilterBarThre2");
			var oComboBox0 = oSmtFilter.getControlByKey("FilterFieldThresh0");
			var aCountKeys0 = oComboBox0.getTokens();

			if (aCountKeys0.length > 0) {
				for (var i = 0; i <= aCountKeys0.length - 1; i++) {
					var newFilter0 = new Filter("PONUMBER", FilterOperator.EQ, aCountKeys0[i].mProperties.key);
					mBindingParams.filters.push(newFilter0);
				}
			}
			var oComboBox1 = oSmtFilter.getControlByKey("FilterFieldThresh1");
			var aCountKeys1 = oComboBox1.getTokens();

			if (aCountKeys1.length > 0) {
				for (var j = 0; j <= aCountKeys1.length - 1; j++) {
					var newFilter1 = new Filter("ITEMNO", FilterOperator.EQ, aCountKeys1[j].mProperties.key);
					mBindingParams.filters.push(newFilter1);
				}
			}
			var oComboBox2 = oSmtFilter.getControlByKey("FilterFieldThresh2");
			var aCountKeys2 = oComboBox2.getTokens();

			if (aCountKeys2.length > 0) {
				for (var k = 0; k <= aCountKeys2.length - 1; k++) {
					var newFilter2 = new Filter("SUPPLIERNAME", FilterOperator.Contains, aCountKeys2[k].mProperties.key);
					mBindingParams.filters.push(newFilter2);
				}
			}
			// 	// Only Service POs are considered for below threshold
			var sPath = "/thresholdParameters(IP_PSTYPE='0',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results";
			var SmartTableBthre1 = this.getView().byId("SmartTableThres2");
			SmartTableBthre1.setTableBindingPath(sPath);
			var aColumns = SmartTableBthre1._oPersController.getColumnKeys();
			if (aColumns.indexOf("POCLOSURE_FLAG") > -1) {
				aColumns.splice(aColumns.indexOf("POCLOSURE_FLAG"), 1);
			}
			if (aColumns.indexOf("PO_CLOSURE") > -1) {
				aColumns.splice(aColumns.indexOf("PO_CLOSURE"), 1);
			}
			if (aColumns.indexOf("PO_CLOSURE") > -1) {
				aColumns.splice(aColumns.indexOf("PO_CLOSURE"), 1);
			}
			if (aColumns.indexOf("ITEMNO") > -1) {
				aColumns.splice(aColumns.indexOf("ITEMNO"), 1);
			}
			/*if (aColumns.indexOf("PONUMBER") > -1) {
				aColumns.splice(aColumns.indexOf("PONUMBER"), 1);
			}*/
			if (aColumns.indexOf("POVALUE,POCURRENCY") > -1) {
				aColumns.splice(aColumns.indexOf("POVALUE,POCURRENCY"), 1);
			}
			if (aColumns.indexOf("GRVALUE") > -1) {
				aColumns.splice(aColumns.indexOf("GRVALUE"), 1);
			}
			if (aColumns.indexOf("INVVALUE") > -1) {
				aColumns.splice(aColumns.indexOf("INVVALUE"), 1);
			}
			if (aColumns.indexOf("AMOUNTACCRUED,POCURRENCY") > -1) {
				aColumns.splice(aColumns.indexOf("AMOUNTACCRUED,POCURRENCY"), 1);
			}
			SmartTableBthre1._oPersController.mProperties.columnKeys = aColumns;

			//	var oThreshModel = this.getOwnerComponent().getModel("thresholdModel");
			//	SmartTableBthre1.setModel(oThreshModel);

			mBindingParams.events = {

				"dataReceived": function (oEvent) {

					var iCount = oEvent.getSource().getLength();
					iTotalMaterialPOUnder50KCount = iCount;
					common.updateTableCountModel.call(this, "/PoUnder50Materials", iCount);

					var aReceivedData = oEvent.getParameter('data');
					//	iBactUpon2 = aReceivedData.results.length;
					// allDataAct2 = aReceivedData.results;
					// concatinating the previous allDataAct1 Array with current received data 
					allDataThre2 = allDataThre2.concat(aReceivedData.results); // changed on 25 Oct

					// to delete the duplicate values
					allDataThre2 = allDataThre2.filter((arr, index, self) => index === self.findIndex((t) =>
						(t.PONUMBER === arr.PONUMBER && t.ITEMNO === arr.ITEMNO)));

					iBThre2 = allDataThre2.length;

					for (var i = 0; i < iBThre2; i++) {
						allDataThre2[i].PSTYPE = '0';
					}
					// mvp2 changes start
					if (iBThre2 < 0) {
						MessageBox.error(oController.geti18nText("nodata"));
						return;
					}
					// mvp2 changes end
					// If the Newly created PO ( created this month ) count > 0, then enable the icon below the table
					common.setNewPOIconVisibility(oController, aReceivedData.results, "hboxNewPOMatPOOwnerThr");
					// sap.ui.core.BusyIndicator.hide();
				}.bind(this)
			};
		},
		//gree end

		// onChange function of a Services completed Amount 
		totalAmount: function (oEvent) {
			globalEvent = oEvent;
			oController.PoPath = oEvent.getSource();
			oController.tableRowObject1 = oController.PoPath.getParent();
			var selIndex = oEvent.getSource().getParent().getIndex();
			oController.getView().byId('SmartTableBactUpon1').getTable().removeSelectionInterval(selIndex, selIndex);

			tAmount = oEvent.getParameter('newValue').trim();

			if (tAmount !== "") {
				// Check if the user entered the value in correct format
				tAmount = formatter.checkValidAmount(oTableBatch, oEvent, cols, oController.userDecimalFormat, tAmount, spathg);
				if (tAmount == undefined) {
					return;
				}

				tAmount = formatter.priceToDecimal(oController.userDecimalFormat, tAmount, oTableBatch, cols, oEvent, spathg);
				if (isNaN(tAmount)) {
					return;
				}

				var tAmount1 = tAmount;
				// if (parseFloat(tAmount) > parseFloat(poValue)) {
				// 	tAmount = poValue.toString();
				// }
			}
			var poNum = oEvent.getSource().getParent().getBindingContext().getObject().PONUMBER;
			var itemNo = oEvent.getSource().getParent().getBindingContext().getObject().ITEMNO;
			poValue = oEvent.getSource().getParent().getBindingContext().getObject().POVALUE;
			var invAmount = oEvent.getSource().getParent().getBindingContext().getObject().INVVALUE;
			var exchangeRate = oEvent.getSource().getParent().getBindingContext().getObject().EXCHANGERATE;
			var nexchangeRate = exchangeRate.replace(",", ".");
			var amtTAccruedUSD;
			// MVP2 changes Start of Code
			if (invAmount < 0) {
				invAmount = 0;
			}
			// MVP2 changes End of Code
			var pocurr = oEvent.getSource().getParent().getBindingContext().getObject().POCURRENCY;
			poValue = poValue.split(" ")[0];
			percentCal = (tAmount / poValue) * 100;

			var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
				maxFractionDigits: 1,
				groupingEnabled: true,
				groupingSeparator: "",
				decimalSeparator: "."
			});

			percentCal = oNumberFormat.format(percentCal);
			var amtTAccrued = parseFloat((tAmount - invAmount)).toFixed(2);

			if (tAmount !== "") {
				var tAmountUSD = tAmount * nexchangeRate;
				tAmount = formatter.formatCurrency(oController.userDecimalFormat, tAmount);
				tAmountUSD = formatter.formatCurrency(oController.userDecimalFormat, tAmountUSD);
			}
			amtTAccrued = parseFloat(amtTAccrued);
			if (amtTAccrued < 0.00) {
				amtTAccrued = 0.00;
				amtTAccruedUSD = 0.00;
				amtTAccruedUSD = formatter.formatCurrency(oController.userDecimalFormat, amtTAccruedUSD);
				amtTAccrued = formatter.formatCurrency(oController.userDecimalFormat, amtTAccrued) + " " + pocurr;
			} else {
				amtTAccruedUSD = amtTAccrued * nexchangeRate;
				amtTAccruedUSD = formatter.formatCurrency(oController.userDecimalFormat, amtTAccruedUSD);
				amtTAccrued = formatter.formatCurrency(oController.userDecimalFormat, amtTAccrued) + " " + pocurr;
			}
			if (tAmount === "") {
				percentCal = "";
			}

			// poValue=  formatter.formatCurrency(oController.userDecimalFormat, poValue);
			for (var k = 0; k < cols.length; k++) {
				// Set the Amount Value State and Error 
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmount") >= 0) {
					if (parseFloat(tAmount1) > parseFloat(poValue)) {
						oEvent.getSource().getParent().getCells()[k].setValue(" ");
						oEvent.getSource().getParent().getCells()[k].setValueState("Error");
						oEvent.getSource().getParent().getCells()[k].setValueStateText(oController.geti18nText("notmore"));

						// return;
					} else if (tAmount < 0) {
						oEvent.getSource().getParent().getCells()[k].setValueState("Error");
						oEvent.getSource().getParent().getCells()[k].setValueStateText(oController.geti18nText("notneg"));
						oEvent.getSource().getParent().getCells()[k].setValue("");
						return;
					} else if (parseFloat(percentCal) > 100) {
						oEvent.getSource().getParent().getCells()[k].setValue("");
					} else {
						oEvent.getSource().getParent().getCells()[k].setValueState("None");
						oEvent.getSource().getParent().getCells()[k].setValueStateText("");
					}
				}
				// Set the Percentage Value State and Error 
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalPercent") >= 0) {
					if (parseFloat(percentCal) > 100) {
						oEvent.getSource().getParent().getCells()[k].setValue("");
						return;
					} else if (parseFloat(tAmount1) > parseFloat(poValue)) {
						oEvent.getSource().getParent().getCells()[k].setValue("");
						return;
					} else if (parseFloat(tAmount) > parseFloat(poValue)) {
						oEvent.getSource().getParent().getCells()[k].setValue("");
					} else if (tAmount < 0) {
						oEvent.getSource().getParent().getCells()[k].setValue("");
					} else {
						oEvent.getSource().getParent().getCells()[k].setValueState("None");
						oEvent.getSource().getParent().getCells()[k].setValueStateText("");
					}
				}

			}

			if (parseFloat(percentCal) > 100) {
				percentCal = "";
			}

			for (var k = 0; k < cols.length; k++) {
				// Added
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmount") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setValue(tAmount);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalPercent") >=
					0) {
					oEvent.getSource().getParent().getCells()[k].setValue(percentCal);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAccMet") >=
					0) {
					oEvent.getSource().getParent().getCells()[k].setText(oController.geti18nText("wtd"));
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalStLine") >=
					0) {
					oEvent.getSource().getParent().getCells()[k].setSelected(false);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmtAccru") >=
					0) {
					oEvent.getSource().getParent().getCells()[k].setText(amtTAccrued);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalUSDAmount") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setText(tAmountUSD);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalUSDAmtAccru") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setText(amtTAccruedUSD);
				}
			}
			if (jsonArray.length > 0) {
				var jsonIndex = jsonArray.findIndex(t => (t.PONUMBER === poNum && t.LINEITEM === itemNo));
				if (jsonIndex > 0) {
					jsonArray[jsonIndex].TOTALWORKCOMPLPERCENT = tWork;
					jsonArray[jsonIndex].TOTALWORKCOMPLTODATE = parseFloat(amountCal);
				}
			}

			var selIndex = oEvent.getSource().getParent().getIndex();
			oController.getView().byId('SmartTableBactUpon1').getTable().addSelectionInterval(selIndex, selIndex);
			// }
		},

		//gree start
		totalAmountThres: function (oEvent) {
			globalEvent = oEvent;
			oController.PoPath = oEvent.getSource();
			oController.tableRowObject2 = oController.PoPath.getParent();
			var selIndex = oEvent.getSource().getParent().getIndex();
			oController.getView().byId('SmartTableBthreshold').getTable().removeSelectionInterval(selIndex, selIndex);

			tAmount = oEvent.getParameter('newValue').trim();
			if (tAmount !== "") {
				// Check if the user entered the value in correct format
				tAmount = formatter.checkValidAmountThr(oTableBatch, oEvent, cols, oController.userDecimalFormat, tAmount, spathg);
				if (tAmount == undefined) {
					return;
				}

				tAmount = formatter.priceToDecimalThr(oController.userDecimalFormat, tAmount, oTableBatch, cols, oEvent, spathg);
				if (isNaN(tAmount)) {
					return;
				}

				var tAmount1 = tAmount;
				// if (parseFloat(tAmount) > parseFloat(poValue)) {
				// 	tAmount = poValue.toString();
				// }
			}
			var poNum = oEvent.getSource().getParent().getBindingContext().getObject().PONUMBER;
			var itemNo = oEvent.getSource().getParent().getBindingContext().getObject().ITEMNO;
			poValue = oEvent.getSource().getParent().getBindingContext().getObject().POVALUE;
			var invAmount = oEvent.getSource().getParent().getBindingContext().getObject().INVVALUE;
			var exchangeRate = oEvent.getSource().getParent().getBindingContext().getObject().EXCHANGERATE;
			var nexchangeRate = exchangeRate.replace(",", ".");
			var amtTAccruedUSD;
			// MVP2 changes Start of Code
			if (invAmount < 0) {
				invAmount = 0;
			}
			// MVP2 changes End of Code
			var pocurr = oEvent.getSource().getParent().getBindingContext().getObject().POCURRENCY;
			poValue = poValue.split(" ")[0];
			// tAmount = tAmount.split(" ")[0];
			percentCal = (tAmount / poValue) * 100;
			var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
				maxFractionDigits: 1,
				groupingEnabled: true,
				groupingSeparator: "",
				decimalSeparator: "."
			});
			percentCal = oNumberFormat.format(percentCal);
			var amtTAccrued = parseFloat((tAmount - invAmount)).toFixed(2);

			if (tAmount !== "") {
				var tAmountUSD = tAmount * nexchangeRate;
				tAmount = formatter.formatCurrency(oController.userDecimalFormat, tAmount);
				tAmountUSD = formatter.formatCurrency(oController.userDecimalFormat, tAmountUSD);
			}
			amtTAccrued = parseFloat(amtTAccrued);
			if (amtTAccrued < 0.00) {
				amtTAccrued = 0.00;
				amtTAccruedUSD = 0.00;
				amtTAccruedUSD = formatter.formatCurrency(oController.userDecimalFormat, amtTAccruedUSD);
				amtTAccrued = formatter.formatCurrency(oController.userDecimalFormat, amtTAccrued) + " " + pocurr;
			} else {
				amtTAccruedUSD = amtTAccrued * nexchangeRate;
				amtTAccruedUSD = formatter.formatCurrency(oController.userDecimalFormat, amtTAccruedUSD);
				amtTAccrued = formatter.formatCurrency(oController.userDecimalFormat, amtTAccrued) + " " + pocurr;
			}
			if (tAmount === "") {
				percentCal = "";
			}
			for (var k = 0; k < cols.length; k++) {
				// Set the Amount Value State and Error 
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmountThr") >= 0) {

					if (parseFloat(tAmount1) > parseFloat(poValue)) {
						oEvent.getSource().getParent().getCells()[k].setValue(" ");
						oEvent.getSource().getParent().getCells()[k].setValueState("Error");
						oEvent.getSource().getParent().getCells()[k].setValueStateText(oController.geti18nText("notmore"));

						// return;
					} else if (tAmount < 0) {
						oEvent.getSource().getParent().getCells()[k].setValueState("Error");
						oEvent.getSource().getParent().getCells()[k].setValueStateText(oController.geti18nText("notneg"));
						oEvent.getSource().getParent().getCells()[k].setValue("");
						return;
					} else if (parseFloat(percentCal) > 100) {
						oEvent.getSource().getParent().getCells()[k].setValue("");
					} else {
						oEvent.getSource().getParent().getCells()[k].setValueState("None");
						oEvent.getSource().getParent().getCells()[k].setValueStateText("");
					}

				}
				// Set the Percentage Value State and Error 
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalPercentThr") >=
					0) {

					if (parseFloat(percentCal) > 100) {
						oEvent.getSource().getParent().getCells()[k].setValue("");
						return;
					} else if (parseFloat(tAmount1) > parseFloat(poValue)) {
						oEvent.getSource().getParent().getCells()[k].setValue("");
						return;
					} else if (parseFloat(tAmount) > parseFloat(poValue)) {
						oEvent.getSource().getParent().getCells()[k].setValue("");
					} else if (tAmount < 0) {
						oEvent.getSource().getParent().getCells()[k].setValue("");
					} else {
						oEvent.getSource().getParent().getCells()[k].setValueState("None");
						oEvent.getSource().getParent().getCells()[k].setValueStateText("");
					}

				}
			}

			if (parseFloat(percentCal) > 100) {
				percentCal = "";
			}

			for (var k = 0; k < cols.length; k++) {
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmountThr") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setValue(tAmount);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalPercentThr") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setValue(parseFloat(percentCal).toFixed(1));
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalAccMetThr") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setText(oController.geti18nText("wtd"));
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalStLineThr") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setSelected(false);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalAmtAccruThr") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setText(amtTAccrued);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalUSDAmountThr") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setText(tAmountUSD);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalUSDAmtAccruThr") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setText(amtTAccruedUSD);
				}
			}

			if (jsonArrayfinal2.length > 0) { //march
				var jsonIndex = jsonArrayfinal2.findIndex(t => (t.PONUMBER === poNum && t.LINEITEM === itemNo));
				if (jsonIndex > 0) {
					jsonArrayfinal2[jsonIndex].TOTALWORKCOMPLPERCENT = tWork;
					jsonArrayfinal2[jsonIndex].TOTALWORKCOMPLTODATE = parseFloat(amountCal);
				}
			}

			var selIndex = oEvent.getSource().getParent().getIndex();
			oController.getView().byId('SmartTableBthreshold').getTable().addSelectionInterval(selIndex, selIndex);
			// }
		},
		//gree end

		// onChange function of a % Services completed  
		totalPercent: function (oEvent) {
			globalEvent = oEvent;
			oController.PoPath = oEvent.getSource();
			oController.tableRowObject1 = oController.PoPath.getParent();
			var selIndex = oEvent.getSource().getParent().getIndex();
			oController.getView().byId('SmartTableBactUpon1').getTable().removeSelectionInterval(selIndex, selIndex);

			var tWork = oEvent.getParameter('newValue').trim();
			var tWork1 = tWork;
			// if (tWork === "") {

			// } else if (parseFloat(tWork) > 100) {
			// 	tWork = '100';
			// }
			var poNum = oEvent.getSource().getParent().getBindingContext().getObject().PONUMBER;
			var itemNo = oEvent.getSource().getParent().getBindingContext().getObject().ITEMNO;
			poValue = oEvent.getSource().getParent().getBindingContext().getObject().POVALUE;
			poValue = poValue.split(" ")[0];
			var invAmount = oEvent.getSource().getParent().getBindingContext().getObject().INVVALUE;
			var exchangeRate = oEvent.getSource().getParent().getBindingContext().getObject().EXCHANGERATE;
			var amtTAccruedUSD;
			var nexchangeRate = exchangeRate.replace(",", ".");
			// MVP2 changes Start of Code
			if (invAmount < 0) {
				invAmount = 0;
			}
			// MVP2 changes End of Code
			var pocurr = oEvent.getSource().getParent().getBindingContext().getObject().POCURRENCY;
			var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
				maxFractionDigits: 2,
				groupingEnabled: true,
				groupingSeparator: "",
				decimalSeparator: "."
			});

			var amountCal = oNumberFormat.format((tWork1 * poValue) / 100);
			var amountCalUSD = amountCal * nexchangeRate;

			var amtTAccrued = (amountCal - invAmount).toFixed(2);
			var amtTAccruedUSD = amtTAccrued * nexchangeRate;

			amountCal = formatter.formatCurrency(oController.userDecimalFormat, amountCal);
			amountCalUSD = formatter.formatCurrency(oController.userDecimalFormat, amountCalUSD);
			amtTAccrued = parseFloat(amtTAccrued);
			if (amtTAccrued < 0.00) {
				amtTAccrued = 0.00;
				amtTAccruedUSD = 0.00;
				amtTAccrued = formatter.formatCurrency(oController.userDecimalFormat, amtTAccrued) + " " + pocurr;
				amtTAccruedUSD = formatter.formatCurrency(oController.userDecimalFormat, amtTAccruedUSD);
			} else {
				amtTAccrued = formatter.formatCurrency(oController.userDecimalFormat, amtTAccrued) + " " + pocurr;
				amtTAccruedUSD = formatter.formatCurrency(oController.userDecimalFormat, amtTAccruedUSD);
			}
			if (tWork === "") {
				amountCal = "";
				amountCalUSD = "";
			}
			for (var k = 0; k < cols.length; k++) {
				// Set the Amount Value State and Error 
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmount") >= 0) {
					if (parseFloat(amountCal) > parseFloat(poValue)) {
						oEvent.getSource().getParent().getCells()[k].setValueState("Error");
						oEvent.getSource().getParent().getCells()[k].setValueStateText(oController.geti18nText("notmore"));
						oEvent.getSource().getParent().getCells()[k].setValue("");
						return;
					} else if (parseFloat(tWork) > 100) {
						oEvent.getSource().getParent().getCells()[k].setValue("");
					} else if (tWork < 0) {
						oEvent.getSource().getParent().getCells()[k].setValue("");
					} else if (tWork.includes('.') && tWork.split('.')[1].length > 1) {
						oEvent.getSource().getParent().getCells()[k].setValue("");
						// return;
					}
					// 	else if(tWork.includes('.') && tWork.split('.')[1].length > 1){
					// 	// oEvent.getSource().getParent().getCells()[k].setValueState("Error");
					// 	// oEvent.getSource().getParent().getCells()[k].setValueStateText("Percentage should not be more than 1 decimal");
					// 	oEvent.getSource().getParent().getCells()[k].setValue("");
					// }
					else {
						oEvent.getSource().getParent().getCells()[k].setValueState("None");
						oEvent.getSource().getParent().getCells()[k].setValueStateText("");
					}
				}
				// Set the Percentage Value State and Error 
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalPercent") >= 0) {
					if (parseFloat(tWork) > 100) {
						oEvent.getSource().getParent().getCells()[k].setValueState("Error");
						oEvent.getSource().getParent().getCells()[k].setValueStateText(oController.geti18nText("notmorep"));
						oEvent.getSource().getParent().getCells()[k].setValue("");
						return;
					} else if (parseFloat(tWork) === 0) {
						oEvent.getSource().getParent().getCells()[k].setValue("0.0");
					} else if (tWork < 0) {
						oEvent.getSource().getParent().getCells()[k].setValueState("Error");
						oEvent.getSource().getParent().getCells()[k].setValueStateText(oController.geti18nText("notnegp"));
						oEvent.getSource().getParent().getCells()[k].setValue("");
						return;
					} else if (tWork.includes('.') && tWork.split('.')[1].length > 1) {
						oEvent.getSource().getParent().getCells()[k].setValueState("Error");
						oEvent.getSource().getParent().getCells()[k].setValueStateText(oController.geti18nText("notmoredec"));
						oEvent.getSource().getParent().getCells()[k].setValue("");
						return;
					}
					// else if(tWork.includes('.') && tWork.split('.')[1].length > 1){
					// 	oEvent.getSource().getParent().getCells()[k].setValueState("Error");
					// 	oEvent.getSource().getParent().getCells()[k].setValueStateText("Percentage should not be more than 1 decimal");
					// 	oEvent.getSource().getParent().getCells()[k].setValue("");
					// }
					else {
						oEvent.getSource().getParent().getCells()[k].setValueState("None");
						oEvent.getSource().getParent().getCells()[k].setValueStateText("");
					}
				}
			}

			if (parseFloat(amountCal) > parseFloat(poValue)) {
				amountCal = "";
			}

			for (var k = 0; k < cols.length; k++) {
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmount") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setValue(amountCal);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAccMet") >=
					0) {
					oEvent.getSource().getParent().getCells()[k].setText(oController.geti18nText("wtd"));
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalStLine") >=
					0) {
					oEvent.getSource().getParent().getCells()[k].setSelected(false);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmtAccru") >=
					0) {
					oEvent.getSource().getParent().getCells()[k].setText(amtTAccrued);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalUSDAmtAccru") >=
					0) {
					oEvent.getSource().getParent().getCells()[k].setText(amtTAccruedUSD);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalUSDAmount") >=
					0) {
					oEvent.getSource().getParent().getCells()[k].setText(amountCalUSD);
				}
			}
			if (jsonArray.length > 0) {
				var jsonIndex = jsonArray.findIndex(t => (t.PONUMBER === poNum && t.LINEITEM === itemNo));
				if (jsonIndex > 0) {
					jsonArray[jsonIndex].TOTALWORKCOMPLPERCENT = tWork;
					jsonArray[jsonIndex].TOTALWORKCOMPLTODATE = parseFloat(amountCal);
				}
			}

			var selIndex = oEvent.getSource().getParent().getIndex();
			oController.getView().byId('SmartTableBactUpon1').getTable().addSelectionInterval(selIndex, selIndex);
			// }
		},

		//gree start
		totalPercentThres: function (oEvent) {
			globalEvent = oEvent;
			oController.PoPath = oEvent.getSource();
			oController.tableRowObject2 = oController.PoPath.getParent();
			var selIndex = oEvent.getSource().getParent().getIndex();
			oController.getView().byId('SmartTableBthreshold').getTable().removeSelectionInterval(selIndex, selIndex);

			var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
				maxFractionDigits: 2,
				groupingEnabled: true,
				groupingSeparator: "",
				decimalSeparator: "."
			});
			var tWork = oEvent.getParameter('newValue').trim();
			var tWork1 = tWork;
			// tWork = oNumberFormat.format(tWork);
			// if (tWork === "") {

			// } else if (parseFloat(tWork) > 100) {
			// 	tWork = '100';
			// }
			var poNum = oEvent.getSource().getParent().getBindingContext().getObject().PONUMBER;
			var itemNo = oEvent.getSource().getParent().getBindingContext().getObject().ITEMNO;
			poValue = oEvent.getSource().getParent().getBindingContext().getObject().POVALUE;
			poValue = poValue.split(" ")[0];
			var invAmount = oEvent.getSource().getParent().getBindingContext().getObject().INVVALUE;
			var exchangeRate = oEvent.getSource().getParent().getBindingContext().getObject().EXCHANGERATE;
			var amtTAccruedUSD;
			var nexchangeRate = exchangeRate.replace(",", ".");

			// MVP2 changes Start of Code
			if (invAmount < 0) {
				invAmount = 0;
			}
			// MVP2 changes End of Code
			var pocurr = oEvent.getSource().getParent().getBindingContext().getObject().POCURRENCY;

			var amountCal = oNumberFormat.format((tWork * poValue) / 100);
			var amtTAccrued = (amountCal - invAmount).toFixed(2);
			var amtTAccruedUSD = amtTAccrued * nexchangeRate;
			var amountCalUSD = amountCal * nexchangeRate;

			amountCal = formatter.formatCurrency(oController.userDecimalFormat, amountCal);
			amountCalUSD = formatter.formatCurrency(oController.userDecimalFormat, amountCalUSD);
			amtTAccrued = parseFloat(amtTAccrued);
			if (amtTAccrued < 0.00) {
				amtTAccrued = 0.00;
				amtTAccruedUSD = 0.00;
				amtTAccruedUSD = formatter.formatCurrency(oController.userDecimalFormat, amtTAccruedUSD);
				amtTAccrued = formatter.formatCurrency(oController.userDecimalFormat, amtTAccrued) + " " + pocurr;
			} else {
				amtTAccrued = formatter.formatCurrency(oController.userDecimalFormat, amtTAccrued) + " " + pocurr;
				amtTAccruedUSD = formatter.formatCurrency(oController.userDecimalFormat, amtTAccruedUSD);
			}
			if (tWork === "") {
				amountCal = "";
				amountCalUSD = "";
			}
			for (var k = 0; k < cols.length; k++) {
				// Set the Amount Value State and Error 
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmountThr") >= 0) {

					if (parseFloat(amountCal) > parseFloat(poValue)) {
						oEvent.getSource().getParent().getCells()[k].setValueState("Error");
						oEvent.getSource().getParent().getCells()[k].setValueStateText(oController.geti18nText("notmore"));
						oEvent.getSource().getParent().getCells()[k].setValue("");
						return;
					} else if (parseFloat(tWork) > 100) {
						oEvent.getSource().getParent().getCells()[k].setValue("");
					} else if (tWork < 0) {
						oEvent.getSource().getParent().getCells()[k].setValue("");
					} else if (tWork.includes('.') && tWork.split('.')[1].length > 1) {
						oEvent.getSource().getParent().getCells()[k].setValue("");
						// return;
					} else {
						oEvent.getSource().getParent().getCells()[k].setValueState("None");
						oEvent.getSource().getParent().getCells()[k].setValueStateText("");
					}

				}
				// Set the Percentage Value State and Error 
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalPercentThr") >=
					0) {

					if (parseFloat(tWork) > 100) {
						oEvent.getSource().getParent().getCells()[k].setValueState("Error");
						oEvent.getSource().getParent().getCells()[k].setValueStateText(oController.geti18nText("notmorep"));
						oEvent.getSource().getParent().getCells()[k].setValue("");
						return;
					} else if (parseFloat(tWork) === 0) {
						oEvent.getSource().getParent().getCells()[k].setValue("0.0");
					} else if (tWork < 0) {
						oEvent.getSource().getParent().getCells()[k].setValueState("Error");
						oEvent.getSource().getParent().getCells()[k].setValueStateText(oController.geti18nText("notnegp"));
						oEvent.getSource().getParent().getCells()[k].setValue("");
						return;
					} else if (tWork.includes('.') && tWork.split('.')[1].length > 1) {
						oEvent.getSource().getParent().getCells()[k].setValueState("Error");
						oEvent.getSource().getParent().getCells()[k].setValueStateText(oController.geti18nText("notmoredec"));
						oEvent.getSource().getParent().getCells()[k].setValue("");
						return;
					} else {
						oEvent.getSource().getParent().getCells()[k].setValueState("None");
						oEvent.getSource().getParent().getCells()[k].setValueStateText("");
					}

				}
			}
			if (parseFloat(amountCal) > parseFloat(poValue)) {
				amountCal = "";
			}
			for (var k = 0; k < cols.length; k++) {
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmountThr") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setValue(amountCal);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalAccMetThr") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setText(oController.geti18nText("wtd"));
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalStLineThr") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setSelected(false);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalAmtAccruThr") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setText(amtTAccrued);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalUSDAmountThr") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setText(amountCalUSD);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalUSDAmtAccruThr") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setText(amtTAccruedUSD);
				}
			}
			// if (allDataThre1.length > 0) {      //march
			// 	var jsonIndex = oEvent.getSource().getParent().getIndex();
			// 	// var jsonIndex = allDataThre1.findIndex(t => (t.PONUMBER === poNum && t.LINEITEM === itemNo));
			// 	if (jsonIndex >= 0) {
			// 		allDataThre1[jsonIndex].TOTWRKCOMPPER = tWork;
			// 		allDataThre1[jsonIndex].TOTWRKCOMPAMT = amountCal;
			// 		allDataThre1[jsonIndex].AMOUNTACCRUED = amtTAccrued;
			// 		allDataThre1[jsonIndex].TOTWRKCOMPAMT_USD = amountCalUSD;
			// 		allDataThre1[jsonIndex].AMOUNTACCRUED_USD = amtTAccruedUSD;
			// 		// thresholdArray[jsonIndex].TOTALWORKCOMPLPERCENT = tWork;
			// 		// thresholdArray[jsonIndex].TOTALWORKCOMPLTODATE = parseFloat(amountCal);
			// 	}
			// }

			if (jsonArrayfinal2.length > 0) {
				var jsonIndex = jsonArrayfinal2.findIndex(t => (t.PONUMBER === poNum && t.LINEITEM === itemNo));
				if (jsonIndex > 0) {
					jsonArrayfinal2[jsonIndex].TOTALWORKCOMPLPERCENT = tWork;
					jsonArrayfinal2[jsonIndex].TOTALWORKCOMPLTODATE = parseFloat(amountCal);
				}
			}

			var selIndex = oEvent.getSource().getParent().getIndex();
			oController.getView().byId('SmartTableBthreshold').getTable().addSelectionInterval(selIndex, selIndex);
			// } 
		},

		onClickCheckBoxThre: function (oEvent) {
			globalEvent = oEvent;
			oController.PoPath = oEvent.getSource();
			oController.tableRowObject2 = oController.PoPath.getParent();
			var selected = oEvent.getParameter("selected");
			if (selected === true) {
				sap.ui.core.BusyIndicator.show(0);
				for (var k = 0; k < cols.length; k++) {
					if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAccMetThr") >=
						0) {
						oEvent.getSource().getParent().getCells()[k].setText(oController.geti18nText("stl"));
					}
				}
				var rData = oEvent.getSource().getParent().getBindingContext().getObject();
				var poval = rData.POVALUE === null ? "0.00" : rData.POVALUE;
				var povalcoco = rData.POVALUE_COCO === null ? "0.00" : rData.POVALUE_COCO;
				var pocu = rData.POCURRENCY;
				var invAmount = rData.INVVALUE === null ? "0.00" : rData.INVVALUE;
				// MVP2 changes Start of Code
				if (invAmount < 0) {
					invAmount = 0;
				}
				// MVP2 changes End of Code
				var cocu = rData.COCDECURR;
				var stdat = rData.WRKSTRTDATE;
				var DateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-dd"
				});
				if (stdat) {
					stdat = DateFormat.format(new Date(stdat));
				}
				var endat = rData.WRKENDDATE;
				if (endat) {
					endat = DateFormat.format(new Date(endat));
				}
				//var acmet = rData.ACCRUALMETHOD;
				// Get the straight line calculation from the backend.
				var acmet = 'STL';
				var totwrkcocde = rData.TOTWRKCOMPAMT_COCDECURR === null ? "0.00" : rData.TOTWRKCOMPAMT_COCDECURR;
				var edwtamt = rData.EDGEWTDAMT === null ? "0.00" : rData.EDGEWTDAMT;
				for (var k = 0; k < cols.length; k++) {
					if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmountThr") >=
						0) {
						var twc = oEvent.getSource().getParent().getCells()[k].getValue();
						twc = formatter.formatAccAmount(oController.userDecimalFormat, twc);
					} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
							"totalPercentThr") >= 0) {
						var twcPer = oEvent.getSource().getParent().getCells()[k].getValue();
						// If the Percent is null, then default it to 0.0, as this is required for backend Service
						if (twcPer === '') {
							twcPer = 0.0;
						}
					}
				}
				var cmp = rData.COMPANYCODE;
				var pst = "9";

				var accMetModel = this.getOwnerComponent().getModel("accrualMethodModel");
				this.getView().byId("dashboardBox").setModel(accMetModel);

				var url = "/methodParameters(IV_POVALUE='" + poval + "',IV_POCURRENCY='" + pocu + "',IV_WRKSTRTDATE='" + stdat +
					"',IV_WRKENDDATE='" + endat + "',IV_ACCRUALMETHOD='" + acmet + "',IV_TOTWRKCOMPAMT='" + twc +
					"',IV_EDGEWTDAMT='" + edwtamt + "',IV_TOTWRKCOMPPER='" + twcPer + "',IV_PSTYP='" + pst + "',IV_COMPANY='" + cmp + "')/Results";

				accMetModel.read(url, {
					async: false,
					success: function (oData, oResponse) {
						var WTDAmount = oData.results[0].TOTWRKCOMPAMT;
						var amtTAccrued = (WTDAmount - invAmount).toFixed(2);
						var WTDperc = oData.results[0].TOTWRKCOMPPER;

						var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
							maxFractionDigits: 1,
							groupingEnabled: true,
							groupingSeparator: "",
							decimalSeparator: "."
						});
						WTDperc = oNumberFormat.format(WTDperc);

						// WTDAmount = formatter.formatCurrency(oController.userDecimalFormat, amountCal);
						if (amtTAccrued < 0.00) {
							amtTAccrued = 0.00;
							amtTAccrued = formatter.formatCurrency(oController.userDecimalFormat, amtTAccrued) + " " + pocu;
						} else {
							amtTAccrued = formatter.formatCurrency(oController.userDecimalFormat, amtTAccrued) + " " + pocu;
						}
						for (var k = 0; k < cols.length; k++) {
							if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
									"totalAmountThr") >=
								0) {
								oEvent.getSource().getParent().getCells()[k].setValue(formatter.formatCurrency(oController.userDecimalFormat, oData.results[
									0].TOTWRKCOMPAMT));
							} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
									"totalPercentThr") >= 0) {
								oEvent.getSource().getParent().getCells()[k].setValue(WTDperc);
							} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
									"totalAmtAccruThr") >= 0) {
								oEvent.getSource().getParent().getCells()[k].setText(amtTAccrued);
							}
						}
						var selIndex = oEvent.getSource().getParent().getIndex();
						// Get the selected Indexes ( Remove if it is already in the selected list)
						var selectedIndexes = oController.getView().byId('SmartTableBthreshold').getTable().getSelectedIndices();
						if (selectedIndexes.includes(selIndex)) {
							oController.getView().byId('SmartTableBthreshold').getTable().removeSelectionInterval(selIndex, selIndex);
						}
						oController.getView().byId('SmartTableBthreshold').getTable().addSelectionInterval(selIndex, selIndex);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function (e) {
						common.displayErrorMessage(oController);
						sap.ui.core.BusyIndicator.hide();
					}
				});

			} else {

				for (var k = 0; k < cols.length; k++) {
					if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAccMetThr") >=
						0) {
						oEvent.getSource().getParent().getCells()[k].setText(oController.geti18nText("wtd"));
					}
					// else if (oTableBatch.getColumns()[k].getId().split("-")[2] === "markAsReviewedTabTBS") {
					// 	oEvent.getSource().getParent().getCells()[k].setSelected(false);
					// }
					// Start of change on 11 nov
					var selIndex = oEvent.getSource().getParent().getIndex();
					// Get the selected Indexes ( Remove if it is already in the selected list)
					var selectedIndexes = oController.getView().byId('SmartTableBthreshold').getTable().getSelectedIndices();
					if (selectedIndexes.includes(selIndex)) {
						oController.getView().byId('SmartTableBthreshold').getTable().removeSelectionInterval(selIndex, selIndex);
					}
					oController.getView().byId('SmartTableBthreshold').getTable().addSelectionInterval(selIndex, selIndex);
					// End of change on 11 nov

				}
			}
		},
		//gree end

		// This Method will trigger on click of Straight line method
		onClickCheckBox: function (oEvent) {
			globalEvent = oEvent;
			oController.PoPath = oEvent.getSource();
			oController.tableRowObject1 = oController.PoPath.getParent();
			var selected = oEvent.getParameter("selected");

			if (selected === true) {
				sap.ui.core.BusyIndicator.show(0);
				for (var k = 0; k < cols.length; k++) {
					if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAccMet") >= 0) {
						oEvent.getSource().getParent().getCells()[k].setText(oController.geti18nText("stl"));
					}
				}

				var rData = oEvent.getSource().getParent().getBindingContext().getObject();
				var poval = rData.POVALUE === null ? "0.00" : rData.POVALUE;
				var povalcoco = rData.POVALUE_COCO === null ? "0.00" : rData.POVALUE_COCO;
				var pocu = rData.POCURRENCY;
				var invAmount = rData.INVVALUE === null ? "0.00" : rData.INVVALUE;
				// MVP2 changes Start of Code
				if (invAmount < 0) {
					invAmount = 0;
				}
				// MVP2 changes End of Code
				var cocu = rData.COCDECURR;
				var stdat = rData.WRKSTRTDATE;
				var DateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-dd"
				});
				if (stdat) {
					stdat = DateFormat.format(new Date(stdat));
				}
				var endat = rData.WRKENDDATE;
				if (endat) {
					endat = DateFormat.format(new Date(endat));
				}
				// Get the straight line calculation from the backend.
				var acmet = 'STL';
				var totwrkcocde = rData.TOTWRKCOMPAMT_COCDECURR === null ? "0.00" : rData.TOTWRKCOMPAMT_COCDECURR;
				var edwtamt = rData.EDGEWTDAMT === null ? "0.00" : rData.EDGEWTDAMT;
				for (var k = 0; k < cols.length; k++) {
					if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmount") >= 0) {
						var twc = oEvent.getSource().getParent().getCells()[k].getValue();
						twc = formatter.formatAccAmount(oController.userDecimalFormat, twc);
					} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalPercent") >=
						0) {
						var twcPer = oEvent.getSource().getParent().getCells()[k].getValue();
						// If the Percent is null, then default it to 0.0, as this is required for backend Service
						if (twcPer === '') {
							twcPer = 0.0;
						}
					}
				}
				var cmp = rData.COMPANYCODE;
				var pst = "9";

				var accMetModel = this.getOwnerComponent().getModel("accrualMethodModel");
				this.getView().byId("dashboardBox").setModel(accMetModel);

				var url = "/methodParameters(IV_POVALUE='" + poval + "',IV_POCURRENCY='" + pocu + "',IV_WRKSTRTDATE='" + stdat +
					"',IV_WRKENDDATE='" + endat + "',IV_ACCRUALMETHOD='" + acmet + "',IV_TOTWRKCOMPAMT='" + twc +
					"',IV_EDGEWTDAMT='" + edwtamt + "',IV_TOTWRKCOMPPER='" + twcPer + "',IV_PSTYP='" + pst + "',IV_COMPANY='" + cmp + "')/Results";

				accMetModel.read(url, {
					async: false,
					success: function (oData, oResponse) {
						var WTDAmount = oData.results[0].TOTWRKCOMPAMT;
						var amtTAccrued = (WTDAmount - invAmount).toFixed(2);
						var WTDperc = oData.results[0].TOTWRKCOMPPER;

						var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
							maxFractionDigits: 1,
							groupingEnabled: true,
							groupingSeparator: "",
							decimalSeparator: "."
						});
						WTDperc = oNumberFormat.format(WTDperc);

						// WTDAmount = formatter.formatCurrency(oController.userDecimalFormat, amountCal);
						if (amtTAccrued < 0.00) {
							amtTAccrued = 0.00;
							amtTAccrued = formatter.formatCurrency(oController.userDecimalFormat, amtTAccrued) + " " + pocu;
						} else {
							amtTAccrued = formatter.formatCurrency(oController.userDecimalFormat, amtTAccrued) + " " + pocu;
						}
						for (var k = 0; k < cols.length; k++) {
							if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmount") >=
								0) {
								oEvent.getSource().getParent().getCells()[k].setValue(formatter.formatCurrency(oController.userDecimalFormat, oData.results[
									0].TOTWRKCOMPAMT));
							} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
									"totalPercent") >= 0) {
								oEvent.getSource().getParent().getCells()[k].setValue(WTDperc);
							} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
									"totalAmtAccru") >= 0) {
								oEvent.getSource().getParent().getCells()[k].setText(amtTAccrued);
							}
						}
						var selIndex = oEvent.getSource().getParent().getIndex();
						// Get the selected Indexes ( Remove if it is already in the selected list)
						var selectedIndexes = oController.getView().byId('SmartTableBactUpon1').getTable().getSelectedIndices();
						if (selectedIndexes.includes(selIndex)) {
							oController.getView().byId('SmartTableBactUpon1').getTable().removeSelectionInterval(selIndex, selIndex);
						}

						oController.getView().byId('SmartTableBactUpon1').getTable().addSelectionInterval(selIndex, selIndex);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function (e) {
						common.displayErrorMessage(oController);
						sap.ui.core.BusyIndicator.hide();
					}
				});

			} else {

				for (var k = 0; k < cols.length; k++) {
					if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAccMet") >= 0) {
						oEvent.getSource().getParent().getCells()[k].setText(oController.geti18nText("wtd"));
					}
					// else if (oTableBatch.getColumns()[k].getId().split("-")[2] === "markAsReviewedTab") {
					// 	oEvent.getSource().getParent().getCells()[k].setSelected(false);
					// }
					// Start of change on 11 nov
					var selIndex = oEvent.getSource().getParent().getIndex();
					// Get the selected Indexes ( Remove if it is already in the selected list)
					var selectedIndexes = oController.getView().byId('SmartTableBactUpon1').getTable().getSelectedIndices();
					if (selectedIndexes.includes(selIndex)) {
						oController.getView().byId('SmartTableBactUpon1').getTable().removeSelectionInterval(selIndex, selIndex);
					}

					oController.getView().byId('SmartTableBactUpon1').getTable().addSelectionInterval(selIndex, selIndex);
					// End of change on 11 nov

				}
			}
		},
		// Get the Audit log Data
		getAuditLogData: function (auditPo, lineItem) {
			// Fetching the Audit Model
			var auditModel = this.getOwnerComponent().getModel("auditModel");
			this.getView().byId("displayAuditHistoryTable").setModel(auditModel);
			var auditJsonModel = new sap.ui.model.json.JSONModel();
			var auditTableId = oController.getView().byId("displayAuditHistoryTable");
			var auditArr = [];
			var auditTitle = oController.geti18nText("PoNum") + ": " + auditPo + ", " + oController.geti18nText("lineItem") + ": " + lineItem;
			// Reading the Audit Service
			auditModel.read("/auditParameters(IP_PONUM='" + auditPo + "',IP_LINEITEM='" + lineItem + "')/Results", {
				urlParameters: {
					"$orderby": 'CHANGEDON desc',
					"$top": 1000
				},
				success: function (oData, oResponse) {
					oData.results.sort(function (a, b) {
						return b.CHANGEDON - a.CHANGEDON;
					});
					for (var k in oData.results) {
						oData.results[k]["CHANGEDON_CET"] = formatter.methodFormatTime(oData.results[k].CHANGEDON);
						auditArr.push(oData.results[k]);
					}
					for (var i = 0; i < auditArr.length; i++) {

						if (auditArr[i].FNAME === "Eligible for Closure") {
							auditArr[i].FNAME = oController.geti18nText("poclosure");
						} else if (auditArr[i].FNAME == "Accrual Method") {
							auditArr[i].FNAME = oController.geti18nText("Accrualmethod");
						} else if (auditArr[i].FNAME == "Straight Line Method") {
							auditArr[i].FNAME = oController.geti18nText("straightlinemthd");
						} else if (auditArr[i].FNAME == "% of Services Completed") {
							auditArr[i].FNAME = oController.geti18nText("percent");
						} else if (auditArr[i].FNAME == "Services Completed Amount") {
							auditArr[i].FNAME = oController.geti18nText("Amount");
						} else if (auditArr[i].FNAME == "Amount to be Accrued") {
							auditArr[i].FNAME = oController.geti18nText("AmountTo");
						} else if (auditArr[i].FNAME == "Status") {
							auditArr[i].FNAME = oController.geti18nText("status");
						}
					}
					auditJsonModel.setData(auditArr);
					auditJsonModel.setSizeLimit(50000);
					auditTableId.setModel(auditJsonModel, "AuditLog");
					oController.getView().byId("auditTitle").setText(auditTitle);
					if (auditArr.length > 0) {
						oController.getView().byId("auditExport").setVisible(true);
					} else {
						oController.getView().byId("auditExport").setVisible(false);
					}
				},
				error: function (e) {
					common.displayErrorMessage(oController);
				}
			});
		},
		// To Get the Audit log pop up
		detDialog1: function (oEvent) {
			var audRowData = oEvent.getSource().getParent().getBindingContext().getObject();
			var auditPo = audRowData.PONUMBER;
			var detDialog1 = oController.getView().byId("cdialog1");
			if (!detDialog1) {
				detDialog1 = sap.ui.xmlfragment(oController.getView().getId(), "com.takeda.Accrual_UI5.fragment.Audit", oController);
				oController.getView().addDependent(detDialog1);
			}
			oController.getAuditLogData(auditPo, audRowData.ITEMNO);

			detDialog1.open();
		},
		// To close the Audit log pop up
		onDetCancel1: function () {
			oController.getView().byId("cdialog1").close();
		},
		// Method will trigger on press of Create PO Link
		onPresscreatePOLink: function () {
			// get the create PO link from the config model 
			var configValues = oController.getView().getModel('configDataModel').getData().results;
			var createLink;
			for (var i = 0; i < configValues.length; i++) {
				if (configValues[i].CONFIG_NAME == 'ARIBA_CREATEPO') {
					createLink = configValues[i].CONFIG_VALUE;
				}
			}
			window.open(createLink);
		},
		// To get the Ariba link 
		getAribaLink: function (oEvent) {
			var detData = oEvent.getSource().getParent().getBindingContext().getObject();
			var epNum = detData.EPNUMBER;
			aribaLink = '';
			// get the Ariba link from the config model 
			var configValues = oController.getView().getModel('configDataModel').getData().results;
			for (var i = 0; i < configValues.length; i++) {
				if (configValues[i].CONFIG_NAME == 'ARIBA_WEBJUMP') {
					aribaLink = configValues[i].CONFIG_VALUE;
				}
			}
			aribaLink = aribaLink.replace('$$EPNUMBER$$', epNum);
		},
		// Method will trigger on press of PO Number
		onPressAribaLink: function (oEvent) {
			oController.getAribaLink(oEvent);
			window.open(aribaLink);
			// oController.getView().byId("aribaDLink").setHref(aribaLink);
			// oController.getView().byId("aribaDLink").setAttribute("href", aribaLink);
		},
		// To Get the details pop up
		detDialog: function () {
			var detDialog = oController.getView().byId("cdialog");
			if (!detDialog) {
				detDialog = sap.ui.xmlfragment(oController.getView().getId(), "com.takeda.Accrual_UI5.fragment.details", oController);
				oController.getView().addDependent(detDialog);
			}
			detDialog.open();
		},
		// Method will trigger on press of PO Details
		onLinkPress: function (oEvent) {
			// Show Busy Indicator
			sap.ui.core.BusyIndicator.show(0);
			oController.detDialog();
			oController.getAribaLink(oEvent);
			var DateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd MMM yyyy"
			});
			oController.getView().byId("ariba").setHref(aribaLink);
			var detData = oEvent.getSource().getParent().getBindingContext().getObject();
			oController.getView().byId("detpo").setText(oController.geti18nText("PoNum") + " #" + detData.PONUMBER);

			oController.getView().byId("detsupid").setText(detData.SUPPLIERID);
			oController.getView().byId("detsupn").setText(detData.SUPPLIERNAME);
			oController.getView().byId("detaccpo").setText(detData.POCURRENCY);
			oController.getView().byId("detpo1").setText(detData.POVALUE);
			oController.getView().byId("detaccCC").setText(detData.COCDECURR);

			oController.getView().byId("detcc").setText(detData.COMPANYCODE);
			oController.getView().byId("detcn").setText(detData.COMPANYNAME);
			oController.getView().byId("detpurgrp").setText(detData.PURCHASINGGRP);
			oController.getView().byId("detpurorg").setText(detData.PURCHASINGUNIT);
			oController.getView().byId("detrew").setText(detData.CHANGEDDATE === null ? ' ' : DateFormat.format(new Date(detData.CHANGEDDATE)));
			oController.getView().byId("detinvpro").setText(detData.INVPROCESSED);

			oController.getView().byId("detld").setText(detData.POLINEDESC);
			oController.getView().byId("detpo2").setText(detData.POVALUE);
			oController.getView().byId("detli").setText(detData.ITEMNO);

			oController.getView().byId("detws").setText(detData.WRKSTRTDATE === null ? ' ' : DateFormat.format(new Date(detData.WRKSTRTDATE)));
			oController.getView().byId("detwe").setText(detData.WRKENDDATE === null ? ' ' : DateFormat.format(new Date(detData.WRKENDDATE)));
			oController.getView().byId("detA").setText(detData.TOTWRKCOMPAMT);
			oController.getView().byId("detP").setText(detData.TOTWRKCOMPPER);
			oController.getView().byId("detlm").setText(detData.LASTMONTHWRKCOMP);
			oController.getView().byId("detinv").setText(detData.INVVALUE);
			oController.getView().byId("detamtto").setText(detData.AMOUNTACCRUED);
			oController.getView().byId("detcreadate").setText(DateFormat.format(new Date(detData.POCREATEDAT)));
			oController.getView().byId("detactnr").setText(detData.ZACTIVITYNBR);
			oController.getChart(detData);
			// Show Busy indicator for 2 seconds 
			setTimeout(() => {
				sap.ui.core.BusyIndicator.hide();
			}, 2000);
		},
		// To Get the Chart Data
		getChart: function (detData) {
			var detDates = detData.WRKSTRTDATE;
			var d2 = detData.WRKENDDATE;
			if ((detDates !== null) && (detDates !== undefined) && (d2 !== null) && (d2 !== undefined)) {
				var detMonth = detDates.getMonth();
				var detYear = detDates.getFullYear();
				var monthsDet;
				monthsDet = (d2.getFullYear() - detDates.getFullYear()) * 12;
				monthsDet -= detDates.getMonth();
				monthsDet += d2.getMonth();
				monthsDet = monthsDet <= 0 ? 0 : monthsDet;

				var timelineArray = [];

				var n = monthsDet;
				var invValueGraph = detData.INVVALUE;
				var workComGraph = detData.TOTWRKCOMPAMT;
				var stLineGraph;
				for (var i = 0; i <= n; i++) {
					var oTimeHorizonModel = {};

					oTimeHorizonModel.Week = month[detMonth] + " " + detYear;
					oTimeHorizonModel.stLineGraph = detData.POVALUE * (i + 1) / n;
					var newMon = month[new Date().getMonth()];
					var newYr = new Date().getFullYear();
					var newWeeks = newMon + " " + newYr;
					if (newWeeks === oTimeHorizonModel.Week) {
						oTimeHorizonModel.invValueGraph = invValueGraph;
						oTimeHorizonModel.workComGraph = workComGraph;
					} else {
						oTimeHorizonModel.invValueGraph = "";
						oTimeHorizonModel.workComGraph = "";
					}
					timelineArray.push(oTimeHorizonModel);
					if (detMonth == 11) {
						detMonth = 0;
						detYear = detYear + 1;
					} else {
						detMonth = detMonth + 1;
					}
				}
				var oModel = new sap.ui.model.json.JSONModel();
				var chartId = oController.getView().byId("idVizFrame");
				if (chartId === undefined) {
					chartId = oController.getView().byId("idVizFrame2");
				}
				oModel.setData(timelineArray);
				oModel.setSizeLimit(50000);
				chartId.setModel(oModel, "lineData");
			} else {

			}
		},
		// To Close the details pop up
		onDetCancel: function () {
			oController.getView().byId("cdialog").close();
		},
		onPressCancelS: function () {
			if (oController.selectedTableID === "actUponB1") {
				oController.onPressCancelPopUpDialog();
			} else if (oController.selectedTableID === "MatTableB") {
				oController.onSelectCancelPOClosureMat();
			} else if (oController.selectedTableID === "thrTab") {
				oController.onSelectCancelPOClsSthre();
			} else if (oController.selectedTableID === "MatTableBThrs") {
				oController.onSelctCancelPOMatrThre();
			}
		},
		onPressContPressPO: function (oEvent) {
			oController.TabPat = oEvent.getSource();
			if (oController.selectedTableID === "actUponB1") {
				oController.onPressMarkPOClosureDialog();
				//oController.PoPath.setEnabled(true); //fix for scrollbar issue  aod405 checkbox dissable 
				// oController.PoPath.getParent().mAggregations.cells[14].setEnabled(true);
				//oController.PoPath.getParent().mAggregations.cells[15].setEnabled(true);
				//oController.PoPath.getParent().mAggregations.cells[21].setEnabled(true);
			} else if (oController.selectedTableID === "MatTableB") {
				oController.onSelectContinuePOClosureMat();
				//oController.PoPath.setEnabled(true); //fix for scrollbar issue  aod405 checkbox dissable 
				// oController.PoPath.getParent().mAggregations.cells[14].setEnabled(true);
				//oController.PoPath.getParent().mAggregations.cells[15].setEnabled(true);
				//oController.PoPath.getParent().mAggregations.cells[21].setEnabled(true);

			} else if (oController.selectedTableID === "thrTab") {
				oController.onSelectPOClosureSThre();
				//oController.PoPath.setEnabled(true); //fix for scrollbar issue  aod405 checkbox dissable 
				//  oController.PoPath.getParent().mAggregations.cells[14].setEnabled(true);
				//oController.PoPath.getParent().mAggregations.cells[15].setEnabled(true);
				//oController.PoPath.getParent().mAggregations.cells[21].setEnabled(true);

			} else if (oController.selectedTableID === "MatTableBThrs") {
				oController.onSelectContinePOClosureMaterThre();
				//oController.PoPath.setEnabled(true); //fix for scrollbar issue  aod405 checkbox dissable 
				//oController.PoPath.getParent().mAggregations.cells[14].setEnabled(true);
				//oController.PoPath.getParent().mAggregations.cells[15].setEnabled(true);
				//oController.PoPath.getParent().mAggregations.cells[21].setEnabled(true);

			}
		},
		// <!--MVP2 changes Start of Code-->
		onPressCancelPopUpDialog: function () {
			serPO = 0;
			var selIndex = oController.POSselIndex;
			oController.PoPath.setEnabled(true);
			oController.PoPath.setSelected(false);
			//oController.getView().byId('SmartTableBactUpon1').getTable().removeSelectionInterval(selIndex, selIndex);
			oController._oPopUpDialog.close();
			oController._oPopUpDialog = [];
		},
		onPressMarkPOClosureDialog: function (oEvent) {
			var selIndex = oController.POSselIndex;
			oController.cols = oController.PoPath.getParent().getParent().getColumns();
			cols = oController.cols;

			// for (var i = 0; i < oController.PoPath.getParent().mAggregations.cells.length; i++) {
			// 	if (oController.PoPath.getParent().mAggregations.cells[i].sId.split("-")[2] === "totalAmount") {
			// 		var Index1 = i;
			// 	}
			// 	if (oController.PoPath.getParent().mAggregations.cells[i].sId.split("-")[2] === "totalPercent") {
			// 		var Index2 = i;
			// 	}
			// 	if (oController.PoPath.getParent().mAggregations.cells[i].sId.split("-")[2] === "totalStLine") {
			// 		var Index3 = i;
			// 	}
			// }
			// oController.PoPath.setEnabled(false);
			// oController.PoPath.getParent().mAggregations.cells[Index1].setEnabled(false);
			// oController.PoPath.getParent().mAggregations.cells[Index2].setEnabled(false);
			// oController.PoPath.getParent().mAggregations.cells[Index3].setEnabled(false);

			if (allDataAct1.length > 0) {
				var decimalFormat = oController.userDecimalFormat;
				// Get the PO# and Line Item # 			
				for (var k = 0; k < cols.length; k++) {
					if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search("poHBoxId") >=
						0) {
						var tableRowPONumber = oController.PoPath.getParent().getCells()[k].mAggregations.items[0].getText();
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search("itemNo") >=
						0) {
						var tableRowItemNumber = oController.PoPath.getParent().getCells()[k].getText();
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"idInvoiceAmounttoDate") >= 0) {
						if (decimalFormat == "Y") {
							var InvoicedAmounttillDateArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
								InvoicedAmounttillDateArr1 = InvoicedAmounttillDateArr[1].split(" ")[0],
								InvoicedAmounttillDateCurr = InvoicedAmounttillDateArr[1].split(" ")[1],
								InvoicedAmounttillDateArr2 = InvoicedAmounttillDateArr[0],
								InvoicedAmounttillDate = InvoicedAmounttillDateArr2 + "," + InvoicedAmounttillDateArr1;
						} else if (decimalFormat == " " || decimalFormat == "") {
							var InvoicedAmounttillDateArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
								InvoicedAmounttillDateArr1 = InvoicedAmounttillDateArr[1].split(" ")[0],
								InvoicedAmounttillDateCurr = InvoicedAmounttillDateArr[1].split(" ")[1],
								InvoicedAmounttillDateArr2 = InvoicedAmounttillDateArr[0],
								InvoicedAmounttillDate = InvoicedAmounttillDateArr2 + "," + InvoicedAmounttillDateArr1;
						} else if (decimalFormat == "X") {
							var InvoicedAmounttillDateArr = oController.PoPath.getParent().getCells()[k].getText().split("."),
								InvoicedAmounttillDateArr1 = InvoicedAmounttillDateArr[1].split(" ")[0],
								InvoicedAmounttillDateCurr = InvoicedAmounttillDateArr[1].split(" ")[1],
								InvoicedAmounttillDateArr2 = InvoicedAmounttillDateArr[0],
								InvoicedAmounttillDate = InvoicedAmounttillDateArr2 + "." + InvoicedAmounttillDateArr1;
						}

					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"idPOValue") >=
						0) {
						if (decimalFormat == "Y") {
							var POvalueArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
								POvalueArr1 = POvalueArr[1].split(" ")[0],
								POvalueCurr = POvalueArr[1].split(" ")[1],
								POvalueArr2 = POvalueArr[0],
								POvalue = POvalueArr2 + "," + POvalueArr1;
						} else if (decimalFormat == " " || decimalFormat == "") {
							var POvalueArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
								POvalueArr1 = POvalueArr[1].split(" ")[0],
								POvalueCurr = POvalueArr[1].split(" ")[1],
								POvalueArr2 = POvalueArr[0],
								POvalue = POvalueArr2 + "," + POvalueArr1;
						} else if (decimalFormat == "X") {
							var POvalueArr = oController.PoPath.getParent().getCells()[k].getText().split("."),
								POvalueArr1 = POvalueArr[1].split(" ")[0],
								POvalueCurr = POvalueArr[1].split(" ")[1],
								POvalueArr2 = POvalueArr[0],
								POvalue = POvalueArr2 + "." + POvalueArr1;
						}
					}
				}

				var jsonIndex = jsonArray.findIndex(t => t.PONUMBER === tableRowPONumber && t.LINEITEM === tableRowItemNumber);
				allDataAct1.forEach((data) => {
					if (data['PONUMBER'] === tableRowPONumber && data['ITEMNO'] === tableRowItemNumber) {
						//data['TOTWRKCOMPAMT'] = data['INVVALUE'];
						data['TOTWRKCOMPAMT'] = "0.00";
						tAmount = data['TOTWRKCOMPAMT'].split(" ")[0];
					}
				});
				var oFloatFormat;

				if (decimalFormat == " " || decimalFormat == "") {
					var Formatval = POvalue.split(","),
						FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
					if (Formatval.length == 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
						Formatval = FormatvalSplt2;
					} else
					if (Formatval.length > 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt1 = Formatval[1];
						FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
						Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
					}
					POvalue = parseFloat(Formatval);
				} else
				if (decimalFormat == "Y") {

					var Formatval = POvalue.split(","),
						FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
					if (Formatval.length == 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
						Formatval = FormatvalSplt2;
					} else
					if (Formatval.length > 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt1 = Formatval[1];
						FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
						Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
					}
					POvalue = parseFloat(Formatval);

				} else {
					var Formatval = POvalue.split("."),
						FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
					if (Formatval.length == 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
						Formatval = FormatvalSplt2;
					} else
					if (Formatval.length > 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt1 = Formatval[1];
						FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
						Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
					}
					POvalue = parseFloat(Formatval);
				}

				if (decimalFormat == " " || decimalFormat == "") {
					var Formatval = InvoicedAmounttillDate.split(","),
						FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
					if (Formatval.length == 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
						Formatval = FormatvalSplt2;
					} else
					if (Formatval.length > 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt1 = Formatval[1];
						FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
						Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
					}
					InvoicedAmounttillDate = parseFloat(Formatval);
				} else
				if (decimalFormat == "Y") {

					var Formatval = InvoicedAmounttillDate.split(","),
						FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
					if (Formatval.length == 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
						Formatval = FormatvalSplt2;
					} else
					if (Formatval.length > 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt1 = Formatval[1];
						FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
						Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
					}
					InvoicedAmounttillDate = parseFloat(Formatval);

				} else {

					var Formatval = InvoicedAmounttillDate.split("."),
						FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
					if (Formatval.length == 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
						Formatval = FormatvalSplt2;
					} else
					if (Formatval.length > 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt1 = Formatval[1];
						FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
						Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
					}
					InvoicedAmounttillDate = parseFloat(Formatval);
				}
				/*if (decimalFormat == " ") {
					var Formatval = tAmount.split(","),
						FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
					if (Formatval.length == 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
						Formatval = FormatvalSplt2;
					} else
					if (Formatval.length > 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt1 = Formatval[1];
						FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
						Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
					}
					tAmount = parseFloat(Formatval);
				} else
				if (decimalFormat == "Y") {

					var Formatval = tAmount.split(","),
						FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
					if (Formatval.length == 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
						Formatval = FormatvalSplt2;
					} else
					if (Formatval.length > 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt1 = Formatval[1];
						FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
						Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
					}
					tAmount = parseFloat(Formatval);

				} else {*/

				var Formatval = tAmount.split("."),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				tAmount = parseFloat(Formatval);
				/*	}*/
				percentCal = ((parseFloat(tAmount)) / (parseFloat(POvalue))) * 100;
				if (percentCal == 0) {
					percentCal = "0.0";
				} else {
					percentCal = percentCal.toFixed(1);
					percentCal = percentCal.toString();
				}
				var AmountAccured = ((parseFloat(tAmount)) - (parseFloat(InvoicedAmounttillDate)));
				if (AmountAccured < 0) {
					AmountAccured = 0.00;
				}
				var AmountAccured1 = AmountAccured;
				var oFormatOptions = sap.ui.core.format.NumberFormat.getFloatInstance({
					groupingSeparator: "",
					decimalSeparator: "."
				});
				var oFloatFormat = NumberFormat.getCurrencyInstance(oFormatOptions);
				AmountAccured = oFloatFormat.format(AmountAccured);
				allDataAct1.forEach((data) => {
					if (data['PONUMBER'] === tableRowPONumber && data['ITEMNO'] === tableRowItemNumber) {
						data['TOTWRKCOMPAMT_USD'] = data['TOTWRKCOMPAMT'];
						data['TOTWRKCOMPAMT_COCDECURR'] = data['TOTWRKCOMPAMT'];
						data['TOTWRKCOMPAMT_CHAR'] = data['TOTWRKCOMPAMT'];
						data['TOTWRKCOMPPER'] = percentCal;
						data['AMOUNTACCRUED'] = AmountAccured;
						data['AMOUNTACCRUED_USD'] = AmountAccured;
						data['ACCRUALMETHOD'] = "WTD";
						data['STRAIGHTLINEMTHD'] = "";
						data['PO_CLOSURE'] = "true";
						//data['POCLOSURE_FLAG'] = 1;	
						//data['CHECKFLAG'] = true;	
						data['STATUS'] = "Reviewed";
						data['MARKASREVIEWED'] = "X";
					}
				});

				for (var j = 0; j < allDataAct1.length; j++) {
					if (allDataAct1[j].PONUMBER === tableRowPONumber && allDataAct1[j].ITEMNO === tableRowItemNumber) {
						var tempTotalAmount, tempTotalPercent, tempTotalUSDAmount, tempAmountAccurred, tempAmountAccurredUSD, tempAccuralMethod,
							decimalFormat;
						decimalFormat = oController.userDecimalFormat;
						formatter.formatCurrencySelect(decimalFormat, allDataAct1, j);
						tempTotalAmount = allDataAct1[j].TOTWRKCOMPAMT_CHAR;
						tempTotalPercent = allDataAct1[j].TOTWRKCOMPPER;
						formatter.formatCurrencySelectcompAmtUSD(decimalFormat, allDataAct1, j);
						tempTotalUSDAmount = allDataAct1[j].TOTWRKCOMPAMT_USD;
						formatter.formatCurrencySelectAccAmt(decimalFormat, allDataAct1, j, AmountAccured1);
						tempAmountAccurred = allDataAct1[j].AMOUNTACCRUED + " " + InvoicedAmounttillDateCurr;
						formatter.formatCurrencySelectAccAmtUSD(decimalFormat, allDataAct1, j, AmountAccured1);
						tempAmountAccurredUSD = allDataAct1[j].AMOUNTACCRUED_USD;
						tempAccuralMethod = allDataAct1[j].ACCRUALMETHOD;
						if (tempAccuralMethod == "WTD") {
							tempAccuralMethod = "Work To Date"
						} else if (tempAccuralMethod == "STL") {
							tempAccuralMethod = "Straight Line"
						}
					}
				}
				for (k = 0; k < cols.length; k++) {
					if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search("totalAmount") >=
						0) {
						oController.PoPath.getParent().getCells()[k].setValue(tempTotalAmount);
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"totalPercent") >=
						0) {
						oController.PoPath.getParent().getCells()[k].setValue(tempTotalPercent);
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"totalUSDAmount") >= 0) {
						oController.PoPath.getParent().getCells()[k].setText(tempTotalUSDAmount);
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"totalAmtAccru") >= 0) {
						oController.PoPath.getParent().getCells()[k].setText(tempAmountAccurred);
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"totalUSDAmtAccru") >= 0) {
						oController.PoPath.getParent().getCells()[k].setText(tempAmountAccurredUSD);
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"totalAccMet") >= 0) {
						oController.PoPath.getParent().getCells()[k].setText(tempAccuralMethod);
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"totalStLine") >= 0) {
						if (tempAccuralMethod == "Work To Date") {
							oController.PoPath.getParent().getCells()[k].setSelected(false);
						}
					}
				}
				if (jsonArray[jsonIndex] !== undefined) {
					jsonArray[jsonIndex].PO_CLOSURE = servicePOClosure;
					oController.getView().byId('SmartTableBactUpon1').getTable().removeSelectionInterval(selIndex, selIndex);
					oController.getView().byId('SmartTableBactUpon1').getTable().addSelectionInterval(selIndex, selIndex);
				} else {
					oController.getView().byId('SmartTableBactUpon1').getTable().removeSelectionInterval(selIndex, selIndex);
					oController.getView().byId('SmartTableBactUpon1').getTable().addSelectionInterval(selIndex, selIndex);
				}
			} else {
				oController.getView().byId('SmartTableBactUpon1').getTable().removeSelectionInterval(selIndex, selIndex);
				oController.getView().byId('SmartTableBactUpon1').getTable().addSelectionInterval(selIndex, selIndex);
			}
			oController.getOwnerComponent().getModel().setProperty(oController.getView().byId("actUponB1").getContextByIndex(selIndex).getPath() +
				"/POCLOSURE_FLAG", "1");
			oController.getOwnerComponent().getModel().setProperty(oController.getView().byId("actUponB1").getContextByIndex(selIndex).getPath() +
				"/POCLOSURE_FLAG_LOCAL", true);
			oController._oPopUpDialog.close();
			oController._oPopUpDialog = [];
		},
		// On click of PO Closure Check box
		onSelectPOClosure: function (oEvent) {

			// assigning the flag							
			serPO = 1;
			servicePOClosure = oEvent.mParameters.selected.toString();
			oController.PoPath = oEvent.getSource();
			oController.selectedTableID = oEvent.getSource().getParent().getId().split("--")[1].split("-")[0];
			var selIndex = oController.PoPath.getParent().getIndex();
			/*oController.tableRowObjectSel1 = oController.TabPat.getParent().getParent().mAggregations.content[0].mAggregations.pages[0].mAggregations
				.content[0].mAggregations._header.mAggregations.items[0].mAggregations.content[5].mAggregations.items[0].mAggregations._header.mAggregations
				.items[0].mAggregations.content[0].mAggregations.items[2].getTable()._getFirstRenderedRowIndex();
			var diff1 = selIndex - oController.tableRowObjectSel1;*/
			/*oController.tableRowObject1 =  oController.PoPath.getParent().getParent().mAggregations.content[0].mAggregations.pages[0].mAggregations
				.content[0].mAggregations._header.mAggregations.items[0].mAggregations.content[5].mAggregations.items[0].mAggregations._header.mAggregations
				.items[0].mAggregations.content[0].mAggregations.items[2].getTable().mAggregations.rows[diff1];*/
			oController.tableRowObject1 = oController.PoPath.getParent();
			oController.POSselIndex = selIndex;
			var sMessagePO1 = oController.geti18nText('POClosureConfirm1'),
				sMessagePO2 = oController.geti18nText('POClosureConfirm2'),
				sMessagePO3 = oController.geti18nText('POClosureConfirm3'),
				sMessagePO4 = oController.geti18nText('POClosureConfirm4'),
				sMessagePO5 = oController.geti18nText('POClosureConfirm5');
			oController.FormattedtextoModel = new JSONModel({
				HTML: "<p>" + sMessagePO1 + "<strong>" + sMessagePO2 + "</strong>" + sMessagePO3 + "</p>" +
					"\n" +
					"<p>" + "<strong>" + sMessagePO4 + "</strong>" + sMessagePO5 + "</p>"
			});
			if (oController._oPopUpDialog) {
				oController._oPopUpDialog = [];
			}
			if (!oController._oPopUpDialog || oController._oPopUpDialog.length == 0) {
				oController._oPopUpDialog = sap.ui.xmlfragment("com.takeda.Accrual_UI5.fragment.POClosurePopUp", oController);
				oController.getView().addDependent(oController._oPopUpDialog);
				oController._oPopUpDialog.setModel(oController.FormattedtextoModel);
			}
			oController._oPopUpDialog.open();
		},
		onSelectContinuePOClosureMat: function () {
			var selIndex = oController.POSselIndex;
			oController.colsMaterial = oController.PoPath.getParent().getParent().getColumns();
			colsMaterial = oController.colsMaterial;
			/*oController.tableRowObjectSel1 = oController.TabPat.getParent().getParent().mAggregations.content[0].mAggregations.pages[0].mAggregations
				.content[0]
				.mAggregations._header.mAggregations.items[0].mAggregations.content[5].mAggregations.items[0].mAggregations._header.mAggregations.items[
					0].mAggregations.content[0].mAggregations.items[2].getTable()._getFirstRenderedRowIndex();
			var diff1 = selIndex - oController.tableRowObjectSel1;
			oController.tableRowObject1 = oController.TabPat.getParent().getParent().mAggregations.content[0].mAggregations.pages[0].mAggregations
				.content[0]
				.mAggregations._header.mAggregations.items[0].mAggregations.content[5].mAggregations.items[0].mAggregations._header.mAggregations.items[
					0].mAggregations.content[0].mAggregations.items[2].getTable().mAggregations.rows[diff1];*/
			var decimalFormat = oController.userDecimalFormat;
			for (var k = 0; k < colsMaterial.length; k++) {
				if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search("poMatHBoxId") >=
					0) {
					var tableRowPONumber = oController.PoPath.getParent().getCells()[k].mAggregations.items[0].getText();
				} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
						"itemMatNo") >=
					0) {
					var tableRowItemNumber = oController.PoPath.getParent().getCells()[k].getText();
				} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
						"idGoodsReceivedToDate") >=
					0) {

					if (decimalFormat == "Y") {
						var GoodsReceivedAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							GoodsReceivedAmtArr1 = GoodsReceivedAmtArr[1].split(" ")[0],
							GoodsReceivedAmtCurr = GoodsReceivedAmtArr[1].split(" ")[1],
							GoodsReceivedAmtArr2 = GoodsReceivedAmtArr[0],
							GoodsReceivedAmt = GoodsReceivedAmtArr2 + "," + GoodsReceivedAmtArr1;
					} else if (decimalFormat == " " || decimalFormat == "") {
						var GoodsReceivedAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							GoodsReceivedAmtArr1 = GoodsReceivedAmtArr[1].split(" ")[0],
							GoodsReceivedAmtCurr = GoodsReceivedAmtArr[1].split(" ")[1],
							GoodsReceivedAmtArr2 = GoodsReceivedAmtArr[0],
							GoodsReceivedAmt = GoodsReceivedAmtArr2 + "," + GoodsReceivedAmtArr1;
					} else if (decimalFormat == "X") {
						var GoodsReceivedAmtArr = oController.PoPath.getParent().getCells()[k].getText().split("."),
							GoodsReceivedAmtArr1 = GoodsReceivedAmtArr[1].split(" ")[0],
							GoodsReceivedAmtCurr = GoodsReceivedAmtArr[1].split(" ")[1],
							GoodsReceivedAmtArr2 = GoodsReceivedAmtArr[0],
							GoodsReceivedAmt = GoodsReceivedAmtArr2 + "." + GoodsReceivedAmtArr1;
					}
				} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
						"idInvoiceValue") >=
					0) {
					if (decimalFormat == "Y") {
						var InvoiceValueAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							InvoiceValueAmtArr1 = InvoiceValueAmtArr[1].split(" ")[0],
							InvoiceValueAmtCurr = InvoiceValueAmtArr[1].split(" ")[1],
							InvoiceValueAmtArr2 = InvoiceValueAmtArr[0],
							InvoiceValueAmt = InvoiceValueAmtArr2 + "," + InvoiceValueAmtArr1;
					} else if (decimalFormat == " " || decimalFormat == "") {
						var InvoiceValueAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							InvoiceValueAmtArr1 = InvoiceValueAmtArr[1].split(" ")[0],
							InvoiceValueAmtCurr = InvoiceValueAmtArr[1].split(" ")[1],
							InvoiceValueAmtArr2 = InvoiceValueAmtArr[0],
							InvoiceValueAmt = InvoiceValueAmtArr2 + "," + InvoiceValueAmtArr1;
					} else if (decimalFormat == "X") {
						var InvoiceValueAmtArr = oController.PoPath.getParent().getCells()[k].getText().split("."),
							InvoiceValueAmtArr1 = InvoiceValueAmtArr[1].split(" ")[0],
							InvoiceValueAmtCurr = InvoiceValueAmtArr[1].split(" ")[1],
							InvoiceValueAmtArr2 = InvoiceValueAmtArr[0],
							InvoiceValueAmt = InvoiceValueAmtArr2 + "." + InvoiceValueAmtArr1;
					}
				}
			}
			var ErrorAmtFlag = 0,
				oFloatFormat;

			if (decimalFormat == " " || decimalFormat == "") {
				var Formatval = GoodsReceivedAmt.split(","),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				GoodsReceivedAmt = parseFloat(Formatval);
			} else
			if (decimalFormat == "Y") {

				var Formatval = GoodsReceivedAmt.split(","),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}

				GoodsReceivedAmt = parseFloat(Formatval);

			} else {

				var Formatval = GoodsReceivedAmt.split("."),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}

				GoodsReceivedAmt = parseFloat(Formatval);

			}
			if (decimalFormat == " " || decimalFormat == "") {
				var Formatval = InvoiceValueAmt.split(","),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}

				InvoiceValueAmt = parseFloat(Formatval);
			} else if (decimalFormat == "Y") {

				var Formatval = InvoiceValueAmt.split(","),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				InvoiceValueAmt = parseFloat(Formatval);

			} else {

				var Formatval = InvoiceValueAmt.split("."),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				InvoiceValueAmt = parseFloat(Formatval);

			}
			/*	if ((parseFloat(GoodsReceivedAmt)) > (parseFloat(InvoiceValueAmt))) {
					ErrorAmtFlag = 1;
				}
				if (ErrorAmtFlag == 1) {
					var ErrMes = oController.geti18nText('GoodsError');
					MessageBox.warning(ErrMes);
					sap.ui.core.BusyIndicator.hide();
					oController.getView().byId('SmartTableBactUpon2').getTable().removeSelectionInterval(selIndex, selIndex);
					oController.PoPath.setEnabled(true);
					oController.PoPath.setSelected(false);
					oController._oPopUpDialog1.close();
					oController._oPopUpDialog1 = [];
					return;
				}*/
			// oController.PoPath.setEnabled(false);

			if (allDataAct2.length > 0) {
				allDataAct2.forEach((data) => {
					if (data['PONUMBER'] === tableRowPONumber && data['ITEMNO'] === tableRowItemNumber) {
						//	data['POCLOSURE_FLAG'] = 1;
						//	data['CHECKFLAG'] = true;
						data['PO_CLOSURE'] = "true";
						data['STATUS'] = "Reviewed";
						data['MARKASREVIEWED'] = "X";
						data['ACCRUALMETHOD'] = "WTD";
						data['STRAIGHTLINEMTHD'] = "";
					}
				});
				// Get the PO# and Line Item # 
				for (var k = 0; k < colsMaterial.length; k++) {
					if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search("poMatHBoxId") >=
						0) {
						var tableRowPONumber = oController.PoPath.getParent().getCells()[k].mAggregations.items[0].getText();
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"itemMatNo") >=
						0) {
						var tableRowItemNumber = oController.PoPath.getParent().getCells()[k].getText();
					}
				}

				var jsonIndex = jsonArray.findIndex(t => t.PONUMBER === tableRowPONumber && t.LINEITEM === tableRowItemNumber);

				if (jsonArray[jsonIndex] !== undefined) {
					jsonArray[jsonIndex].PO_CLOSURE = materialPOClosure;
					oController.getView().byId('SmartTableBactUpon2').getTable().removeSelectionInterval(selIndex, selIndex);
					oController.getView().byId('SmartTableBactUpon2').getTable().addSelectionInterval(selIndex, selIndex);
				} else {
					oController.getView().byId('SmartTableBactUpon2').getTable().removeSelectionInterval(selIndex, selIndex);
					oController.getView().byId('SmartTableBactUpon2').getTable().addSelectionInterval(selIndex, selIndex);
				}
			} else {
				oController.getView().byId('SmartTableBactUpon2').getTable().removeSelectionInterval(selIndex, selIndex);
				oController.getView().byId('SmartTableBactUpon2').getTable().addSelectionInterval(selIndex, selIndex);
			}
			oController.getOwnerComponent().getModel().setProperty(oController.getView().byId("MatTableB").getContextByIndex(selIndex).getPath() +
				"/POCLOSURE_FLAG", "1");
			oController.getOwnerComponent().getModel().setProperty(oController.getView().byId("MatTableB").getContextByIndex(selIndex).getPath() +
				"/POCLOSURE_FLAG_LOCAL", true);
			oController._oPopUpDialog1.close();
			oController._oPopUpDialog1 = [];
		},
		onSelectCancelPOClosureMat: function () {
			matPO = 0;
			var selIndex = oController.POSselIndex;
			oController.PoPath.setEnabled(true);
			oController.PoPath.setSelected(false);
			//oController.getView().byId('SmartTableBactUpon2').getTable().removeSelectionInterval(selIndex, selIndex);
			oController._oPopUpDialog1.close();
			oController._oPopUpDialog1 = [];

		},
		onSelectPOClosureMat: function (oEvent) {
			matPO = 1;
			materialPOClosure = oEvent.mParameters.selected.toString();
			oController.PoPath = oEvent.getSource();

			oController.selectedTableID = oEvent.getSource().getParent().getId().split("--")[1].split("-")[0];
			var selIndex = oController.PoPath.getParent().getIndex();
			oController.colsMaterial = oController.PoPath.getParent().getParent().getColumns();
			colsMaterial = oController.colsMaterial;
			oController.tableRowObject1 = oController.PoPath.getParent();
			oController.POSselIndex = selIndex;
			const oThresholdPercent = this.getView().getModel('constantsModel').getProperty("/thresholdPercentage")
			var sMessagePO1 = oController.geti18nText('POClosureConfirm1'),
				sMessagePO2 = oController.geti18nText('POClosureConfirm2'),
				sMessagePO3 = oController.geti18nText('POClosureConfirm3'),
				sMessagePO4 = oController.geti18nText('POClosureConfirm4'),
				sMessagePO5 = oController.geti18nText('POClosureConfirm5');
			oController.FormattedtextoModel = new JSONModel({
				HTML: "<p>" + sMessagePO1 + "<strong>" + sMessagePO2 + "</strong>" + sMessagePO3 + "</p>" +
					"\n" +
					"<p>" + "<strong>" + sMessagePO4 + "</strong>" + sMessagePO5 + "</p>"
			});
			if (oController._oPopUpDialog1) {
				oController._oPopUpDialog1 = [];
			}
			var decimalFormat = oController.userDecimalFormat;
			for (var k = 0; k < colsMaterial.length; k++) {
				if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search("poMatHBoxId") >=
					0) {
					var tableRowPONumber = oController.PoPath.getParent().getCells()[k].mAggregations.items[0].getText();
				} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
						"itemMatNo") >=
					0) {
					var tableRowItemNumber = oController.PoPath.getParent().getCells()[k].getText();
				} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
						"idGoodsReceivedToDate") >=
					0) {

					if (decimalFormat == "Y") {
						var GoodsReceivedAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							GoodsReceivedAmtArr1 = GoodsReceivedAmtArr[1].split(" ")[0],
							GoodsReceivedAmtCurr = GoodsReceivedAmtArr[1].split(" ")[1],
							GoodsReceivedAmtArr2 = GoodsReceivedAmtArr[0],
							GoodsReceivedAmt = GoodsReceivedAmtArr2 + "," + GoodsReceivedAmtArr1;
					} else if (decimalFormat == " " || decimalFormat == "") {
						var GoodsReceivedAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							GoodsReceivedAmtArr1 = GoodsReceivedAmtArr[1].split(" ")[0],
							GoodsReceivedAmtCurr = GoodsReceivedAmtArr[1].split(" ")[1],
							GoodsReceivedAmtArr2 = GoodsReceivedAmtArr[0],
							GoodsReceivedAmt = GoodsReceivedAmtArr2 + "," + GoodsReceivedAmtArr1;
					} else if (decimalFormat == "X") {
						var GoodsReceivedAmtArr = oController.PoPath.getParent().getCells()[k].getText().split("."),
							GoodsReceivedAmtArr1 = GoodsReceivedAmtArr[1].split(" ")[0],
							GoodsReceivedAmtCurr = GoodsReceivedAmtArr[1].split(" ")[1],
							GoodsReceivedAmtArr2 = GoodsReceivedAmtArr[0],
							GoodsReceivedAmt = GoodsReceivedAmtArr2 + "." + GoodsReceivedAmtArr1;
					}
				} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
						"idInvoiceValue") >=
					0) {
					if (decimalFormat == "Y") {
						var InvoiceValueAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							InvoiceValueAmtArr1 = InvoiceValueAmtArr[1].split(" ")[0],
							InvoiceValueAmtCurr = InvoiceValueAmtArr[1].split(" ")[1],
							InvoiceValueAmtArr2 = InvoiceValueAmtArr[0],
							InvoiceValueAmt = InvoiceValueAmtArr2 + "," + InvoiceValueAmtArr1;
					} else if (decimalFormat == " " || decimalFormat == "") {
						var InvoiceValueAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							InvoiceValueAmtArr1 = InvoiceValueAmtArr[1].split(" ")[0],
							InvoiceValueAmtCurr = InvoiceValueAmtArr[1].split(" ")[1],
							InvoiceValueAmtArr2 = InvoiceValueAmtArr[0],
							InvoiceValueAmt = InvoiceValueAmtArr2 + "," + InvoiceValueAmtArr1;
					} else if (decimalFormat == "X") {
						var InvoiceValueAmtArr = oController.PoPath.getParent().getCells()[k].getText().split("."),
							InvoiceValueAmtArr1 = InvoiceValueAmtArr[1].split(" ")[0],
							InvoiceValueAmtCurr = InvoiceValueAmtArr[1].split(" ")[1],
							InvoiceValueAmtArr2 = InvoiceValueAmtArr[0],
							InvoiceValueAmt = InvoiceValueAmtArr2 + "." + InvoiceValueAmtArr1;
					}
				}
			}
			var ErrorAmtFlag = 0,
				oFloatFormat;

			if (decimalFormat == " " || decimalFormat == "") {
				var Formatval = GoodsReceivedAmt.split(","),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				GoodsReceivedAmt = parseFloat(Formatval);
			} else
			if (decimalFormat == "Y") {

				var Formatval = GoodsReceivedAmt.split(","),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				GoodsReceivedAmt = parseFloat(Formatval);

			} else {

				var Formatval = GoodsReceivedAmt.split("."),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				GoodsReceivedAmt = parseFloat(Formatval);

			}
			if (decimalFormat == " " || decimalFormat == "") {
				var Formatval = InvoiceValueAmt.split(","),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				InvoiceValueAmt = parseFloat(Formatval);
			} else if (decimalFormat == "Y") {

				var Formatval = InvoiceValueAmt.split(","),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				InvoiceValueAmt = parseFloat(Formatval);

			} else {

				var Formatval = InvoiceValueAmt.split("."),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				InvoiceValueAmt = parseFloat(Formatval);

			}
			let fGR = parseFloat(GoodsReceivedAmt);
			let fInv = parseFloat(InvoiceValueAmt);
			let cGR = this._countDecimal(fGR);
			let cInv = this._countDecimal(fInv);
			let cMultiplier = 0;
			
			if(cGR > cInv){
				cMultiplier = cGR;
			}else{
				cMultiplier = cInv
			}
			let fMultiplier= this._finalMultiplier(cMultiplier);
			let iVariance = (((fGR*fMultiplier)-(fInv * fMultiplier))/(fGR*fMultiplier))*100;
			
			if ((fGR > fInv) && (iVariance > oThresholdPercent)) {
				ErrorAmtFlag = 1;
			}
			
			if (ErrorAmtFlag === 1) {
				var ErrMes = oController.geti18nText('GoodsError');
				MessageBox.warning(ErrMes);
				sap.ui.core.BusyIndicator.hide();
				//oController.getView().byId('SmartTableBactUpon2').getTable().removeSelectionInterval(selIndex, selIndex);
				oController.PoPath.setEnabled(true);
				oController.PoPath.setSelected(false);
				return;
			} else {
				if (!oController._oPopUpDialog1 || oController._oPopUpDialog1.length == 0) {
					oController._oPopUpDialog1 = sap.ui.xmlfragment("com.takeda.Accrual_UI5.fragment.POClosurePopUp", oController);
					oController.getView().addDependent(oController._oPopUpDialog1);
					oController._oPopUpDialog1.setModel(oController.FormattedtextoModel);
				}
				oController._oPopUpDialog1.open();
			}

		},
		onSelectPOClosureSThre: function () {
			var selIndex = oController.POSselIndex;
			oController.cols = oController.PoPath.getParent().getParent().getColumns();
			cols = oController.cols;
			/*	oController.tableRowObjectSel2 = oController.TabPat.getParent().getParent().mAggregations.content[0].mAggregations.pages[0].mAggregations
				.content[0]
				.mAggregations._header.mAggregations.items[0].mAggregations.content[5].mAggregations.items[0].mAggregations._header.mAggregations.items[
					0].mAggregations.content[0].mAggregations.items[2].getTable()._getFirstRenderedRowIndex();
			var diff2 = selIndex - oController.tableRowObjectSel2;
			oController.tableRowObject2 = oController.TabPat.getParent().getParent().mAggregations.content[0].mAggregations.pages[0].mAggregations
				.content[0]
				.mAggregations._header.mAggregations.items[0].mAggregations.content[5].mAggregations.items[0].mAggregations._header.mAggregations.items[
					0].mAggregations.content[0].mAggregations.items[2].getTable().mAggregations.rows[diff2];*/

			// for (var i = 0; i < oController.PoPath.getParent().mAggregations.cells.length; i++) {
			// 	if (oController.PoPath.getParent().mAggregations.cells[i].sId.split("-")[2] === "totalAmountThr") {
			// 		var Index1 = i;
			// 	}
			// 	if (oController.PoPath.getParent().mAggregations.cells[i].sId.split("-")[2] === "totalPercentThr") {
			// 		var Index2 = i;
			// 	}
			// 	if (oController.PoPath.getParent().mAggregations.cells[i].sId.split("-")[2] === "totalStLineThr") {
			// 		var Index3 = i;
			// 	}
			// }
			// oController.PoPath.setEnabled(false);
			// oController.PoPath.getParent().mAggregations.cells[Index1].setEnabled(false);
			// oController.PoPath.getParent().mAggregations.cells[Index2].setEnabled(false);
			// oController.PoPath.getParent().mAggregations.cells[Index3].setEnabled(false);
			var decimalFormat = oController.userDecimalFormat;
			if (allDataThre1.length > 0) {

				// Get the PO# and Line Item # 
				for (var k = 0; k < cols.length; k++) {
					if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search("threHbox") >=
						0) {
						var tableRowPONumber = oController.PoPath.getParent().getCells()[k].mAggregations.items[0].getText();
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"itemNum") >=
						0) {
						var tableRowItemNumber = oController.PoPath.getParent().getCells()[k].getText();
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"idInvoiceAmountToDateThre") >= 0) {
						if (decimalFormat == "Y") {
							var InvoicedAmounttillDateArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
								InvoicedAmounttillDateArr1 = InvoicedAmounttillDateArr[1].split(" ")[0],
								InvoicedAmounttillDateCurr = InvoicedAmounttillDateArr[1].split(" ")[1],
								InvoicedAmounttillDateArr2 = InvoicedAmounttillDateArr[0],
								InvoicedAmounttillDate = InvoicedAmounttillDateArr2 + "," + InvoicedAmounttillDateArr1;
						} else if (decimalFormat == " " || decimalFormat == "") {
							var InvoicedAmounttillDateArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
								InvoicedAmounttillDateArr1 = InvoicedAmounttillDateArr[1].split(" ")[0],
								InvoicedAmounttillDateCurr = InvoicedAmounttillDateArr[1].split(" ")[1],
								InvoicedAmounttillDateArr2 = InvoicedAmounttillDateArr[0],
								InvoicedAmounttillDate = InvoicedAmounttillDateArr2 + "," + InvoicedAmounttillDateArr1;
						} else if (decimalFormat == "X") {
							var InvoicedAmounttillDateArr = oController.PoPath.getParent().getCells()[k].getText().split("."),
								InvoicedAmounttillDateArr1 = InvoicedAmounttillDateArr[1].split(" ")[0],
								InvoicedAmounttillDateCurr = InvoicedAmounttillDateArr[1].split(" ")[1],
								InvoicedAmounttillDateArr2 = InvoicedAmounttillDateArr[0],
								InvoicedAmounttillDate = InvoicedAmounttillDateArr2 + "." + InvoicedAmounttillDateArr1;
						}

					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"idPOValueThre") >=
						0) {
						if (decimalFormat == "Y") {
							var POvalueArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
								POvalueArr1 = POvalueArr[1].split(" ")[0],
								POvalueCurr = POvalueArr[1].split(" ")[1],
								POvalueArr2 = POvalueArr[0],
								POvalue = POvalueArr2 + "," + POvalueArr1;
						} else if (decimalFormat == " " || decimalFormat == "") {
							var POvalueArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
								POvalueArr1 = POvalueArr[1].split(" ")[0],
								POvalueCurr = POvalueArr[1].split(" ")[1],
								POvalueArr2 = POvalueArr[0],
								POvalue = POvalueArr2 + "," + POvalueArr1;
						} else if (decimalFormat == "X") {
							var POvalueArr = oController.PoPath.getParent().getCells()[k].getText().split("."),
								POvalueArr1 = POvalueArr[1].split(" ")[0],
								POvalueCurr = POvalueArr[1].split(" ")[1],
								POvalueArr2 = POvalueArr[0],
								POvalue = POvalueArr2 + "." + POvalueArr1;
						}
					}
				}

				var jsonIndex = jsonArrayfinal2.findIndex(t => t.PONUMBER === tableRowPONumber && t.LINEITEM === tableRowItemNumber);
				allDataThre1.forEach((data) => {
					if (data['PONUMBER'] === tableRowPONumber && data['ITEMNO'] === tableRowItemNumber) {
						//data['TOTWRKCOMPAMT'] = data['INVVALUE'];
						data['TOTWRKCOMPAMT'] = "0.00";
						tAmount = data['TOTWRKCOMPAMT'].split(" ")[0];
					}
				});

				var oFloatFormat;

				if (decimalFormat == " " || decimalFormat == "") {
					var Formatval = POvalue.split(","),
						FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
					if (Formatval.length == 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
						Formatval = FormatvalSplt2;
					} else
					if (Formatval.length > 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt1 = Formatval[1];
						FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
						Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
					}
					POvalue = parseFloat(Formatval);
				} else
				if (decimalFormat == "Y") {

					var Formatval = POvalue.split(","),
						FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
					if (Formatval.length == 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
						Formatval = FormatvalSplt2;
					} else
					if (Formatval.length > 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt1 = Formatval[1];
						FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
						Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
					}
					POvalue = parseFloat(Formatval);

				} else {

					var Formatval = POvalue.split("."),
						FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
					if (Formatval.length == 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
						Formatval = FormatvalSplt2;
					} else
					if (Formatval.length > 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt1 = Formatval[1];
						FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
						Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
					}
					POvalue = parseFloat(Formatval);

				}

				if (decimalFormat == " " || decimalFormat == "") {
					var Formatval = InvoicedAmounttillDate.split(","),
						FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
					if (Formatval.length == 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
						Formatval = FormatvalSplt2;
					} else
					if (Formatval.length > 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt1 = Formatval[1];
						FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
						Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
					}
					InvoicedAmounttillDate = parseFloat(Formatval);
				} else
				if (decimalFormat == "Y") {

					var Formatval = InvoicedAmounttillDate.split(","),
						FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
					if (Formatval.length == 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
						Formatval = FormatvalSplt2;
					} else
					if (Formatval.length > 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt1 = Formatval[1];
						FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
						Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
					}
					InvoicedAmounttillDate = parseFloat(Formatval);

				} else {

					var Formatval = InvoicedAmounttillDate.split("."),
						FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
					if (Formatval.length == 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
						Formatval = FormatvalSplt2;
					} else
					if (Formatval.length > 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt1 = Formatval[1];
						FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
						Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
					}
					InvoicedAmounttillDate = parseFloat(Formatval);

				}
				/*	if (decimalFormat == " ") {
					var Formatval = tAmount.split(","),
						FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
					if (Formatval.length == 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
						Formatval = FormatvalSplt2;
					} else
					if (Formatval.length > 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt1 = Formatval[1];
						FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
						Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
					}
					tAmount = parseFloat(Formatval);
				} else
				if (decimalFormat == "Y") {

					var Formatval = tAmount.split(","),
						FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
					if (Formatval.length == 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
						Formatval = FormatvalSplt2;
					} else
					if (Formatval.length > 1) {
						FormatvalSplt0 = Formatval[0];
						FormatvalSplt1 = Formatval[1];
						FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
						Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
					}
					tAmount = parseFloat(Formatval);

				} else {*/

				var Formatval = tAmount.split("."),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				tAmount = parseFloat(Formatval);
				/*	}*/
				percentCal = ((parseFloat(tAmount)) / (parseFloat(POvalue))) * 100;
				if (percentCal === 0) {
					percentCal = "0.0";
				} else {
					percentCal = percentCal.toFixed(1);
					percentCal = percentCal.toString();
				}

				var AmountAccured = ((parseFloat(tAmount)) - (parseFloat(InvoicedAmounttillDate)));
				if (AmountAccured < 0) {
					AmountAccured = 0.00;
				}
				var AmountAccured2 = AmountAccured;
				var oFormatOptions = sap.ui.core.format.NumberFormat.getFloatInstance({
					groupingSeparator: "",
					decimalSeparator: "."
				});
				var oFloatFormat = NumberFormat.getCurrencyInstance(oFormatOptions);
				AmountAccured = oFloatFormat.format(AmountAccured);
				allDataThre1.forEach((data) => {
					if (data['PONUMBER'] === tableRowPONumber && data['ITEMNO'] === tableRowItemNumber) {
						data['TOTWRKCOMPAMT_USD'] = data['TOTWRKCOMPAMT'];
						data['TOTWRKCOMPAMT_COCDECURR'] = data['TOTWRKCOMPAMT'];
						data['TOTWRKCOMPAMT_CHAR'] = data['TOTWRKCOMPAMT'];
						data['TOTWRKCOMPPER'] = percentCal;
						data['AMOUNTACCRUED'] = AmountAccured;
						data['AMOUNTACCRUED_USD'] = AmountAccured;
						data['ACCRUALMETHOD'] = "WTD";
						data['STRAIGHTLINEMTHD'] = "";
						data['PO_CLOSURE'] = "true";
						//data['POCLOSURE_FLAG'] = 1;
						//data['CHECKFLAG'] = true;
						data['STATUS'] = "Reviewed";
						data['MARKASREVIEWED'] = "X";
					}
				});

				for (var j = 0; j < allDataThre1.length; j++) {
					if (allDataThre1[j].PONUMBER === tableRowPONumber && allDataThre1[j].ITEMNO === tableRowItemNumber) {
						var tempTotalAmount, tempTotalPercent, tempTotalUSDAmount, tempAmountAccurred, tempAmountAccurredUSD, tempAccuralMethod,
							decimalFormat;
						decimalFormat = oController.userDecimalFormat;
						formatter.formatCurrencySelectThre(decimalFormat, allDataThre1, j);
						tempTotalAmount = allDataThre1[j].TOTWRKCOMPAMT_CHAR;
						tempTotalPercent = allDataThre1[j].TOTWRKCOMPPER;
						formatter.formatCurrencySelectcompAmtUSDThre(decimalFormat, allDataThre1, j);
						tempTotalUSDAmount = allDataThre1[j].TOTWRKCOMPAMT_USD;
						formatter.formatCurrencySelectAccAmtThre(decimalFormat, allDataThre1, j, AmountAccured2);
						tempAmountAccurred = allDataThre1[j].AMOUNTACCRUED + " " + InvoicedAmounttillDateCurr;
						formatter.formatCurrencySelectAccAmtUSDThre(decimalFormat, allDataThre1, j, AmountAccured2);
						tempAmountAccurredUSD = allDataThre1[j].AMOUNTACCRUED_USD;
						tempAccuralMethod = allDataThre1[j].ACCRUALMETHOD;
						if (tempAccuralMethod == "WTD") {
							tempAccuralMethod = "Work To Date"
						} else if (tempAccuralMethod == "STL") {
							tempAccuralMethod = "Straight Line"
						}
					}
				}
				for (k = 0; k < cols.length; k++) {
					if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"totalAmountThr") >=
						0) {
						oController.PoPath.getParent().getCells()[k].setValue(tempTotalAmount);
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"totalPercentThr") >=
						0) {
						oController.PoPath.getParent().getCells()[k].setValue(tempTotalPercent);
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"totalUSDAmountThr") >= 0) {
						oController.PoPath.getParent().getCells()[k].setText(tempTotalUSDAmount);
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"totalAmtAccruThr") >= 0) {
						oController.PoPath.getParent().getCells()[k].setText(tempAmountAccurred);
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"totalUSDAmtAccruThr") >= 0) {
						oController.PoPath.getParent().getCells()[k].setText(tempAmountAccurredUSD);
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"totalAccMetThr") >= 0) {
						oController.PoPath.getParent().getCells()[k].setText(tempAccuralMethod);
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"totalStLineThr") >= 0) {
						if (tempAccuralMethod == "Work To Date") {
							oController.PoPath.getParent().getCells()[k].setSelected(false);
						}
					}
				}
				if (jsonArrayfinal2[jsonIndex] !== undefined) {
					jsonArrayfinal2[jsonIndex].PO_CLOSURE = servicePOClosure;
					oController.getView().byId('SmartTableBthreshold').getTable().removeSelectionInterval(selIndex, selIndex);
					oController.getView().byId('SmartTableBthreshold').getTable().addSelectionInterval(selIndex, selIndex);
				} else {
					oController.getView().byId('SmartTableBthreshold').getTable().removeSelectionInterval(selIndex, selIndex);
					oController.getView().byId('SmartTableBthreshold').getTable().addSelectionInterval(selIndex, selIndex);
				}
			} else {
				oController.getView().byId('SmartTableBthreshold').getTable().removeSelectionInterval(selIndex, selIndex);
				oController.getView().byId('SmartTableBthreshold').getTable().addSelectionInterval(selIndex, selIndex);
			}
			oController.getOwnerComponent().getModel().setProperty(oController.getView().byId("thrTab").getContextByIndex(selIndex).getPath() +
				"/POCLOSURE_FLAG", "1");
			oController.getOwnerComponent().getModel().setProperty(oController.getView().byId("thrTab").getContextByIndex(selIndex).getPath() +
				"/POCLOSURE_FLAG_LOCAL", true);
			oController._oPopUpDialog2.close();
			oController._oPopUpDialog2 = [];
		},
		onSelectCancelPOClsSthre: function () {
			serPO = 0;
			var selIndex = oController.POSselIndex;
			oController.PoPath.setEnabled(true);
			oController.PoPath.setSelected(false);
			//oController.getView().byId('SmartTableBthreshold').getTable().removeSelectionInterval(selIndex, selIndex);
			oController._oPopUpDialog2.close();
			oController._oPopUpDialog2 = [];
		},
		threPOClosureSelect: function (oEvent) {
			serPO = 1;
			servicePOClosure = oEvent.mParameters.selected.toString();
			oController.PoPath = oEvent.getSource();
			oController.selectedTableID = oEvent.getSource().getParent().getId().split("--")[1].split("-")[0];
			var selIndex = oController.PoPath.getParent().getIndex();
			oController.POSselIndex = selIndex;
			oController.tableRowObject2 = oController.PoPath.getParent();
			var sMessagePO1 = oController.geti18nText('POClosureConfirm1'),
				sMessagePO2 = oController.geti18nText('POClosureConfirm2'),
				sMessagePO3 = oController.geti18nText('POClosureConfirm3'),
				sMessagePO4 = oController.geti18nText('POClosureConfirm4'),
				sMessagePO5 = oController.geti18nText('POClosureConfirm5');
			oController.FormattedtextoModel = new JSONModel({
				HTML: "<p>" + sMessagePO1 + "<strong>" + sMessagePO2 + "</strong>" + sMessagePO3 + "</p>" +
					"\n" +
					"<p>" + "<strong>" + sMessagePO4 + "</strong>" + sMessagePO5 + "</p>"
			});
			if (oController._oPopUpDialog2) {
				oController._oPopUpDialog2 = [];
			}
			if (!oController._oPopUpDialog2 || oController._oPopUpDialog2.length == 0) {
				oController._oPopUpDialog2 = sap.ui.xmlfragment("com.takeda.Accrual_UI5.fragment.POClosurePopUp", oController);
				oController.getView().addDependent(oController._oPopUpDialog2);
				oController._oPopUpDialog2.setModel(oController.FormattedtextoModel);
			}
			oController._oPopUpDialog2.open();
		},
		//gree start
		onSelectContinePOClosureMaterThre: function () {
			var selIndex = oController.POSselIndex;
			oController.colsMaterial = oController.PoPath.getParent().getParent().getColumns();
			colsMaterial = oController.colsMaterial;
			/*oController.tableRowObjectSel2 = oController.TabPat.getParent().getParent().mAggregations.content[0].mAggregations.pages[0].mAggregations
				.content[0]
				.mAggregations._header.mAggregations.items[0].mAggregations.content[5].mAggregations.items[0].mAggregations._header.mAggregations.items[
					0].mAggregations.content[0].mAggregations.items[2].getTable()._getFirstRenderedRowIndex();
			var diff2 = selIndex - oController.tableRowObjectSel2;
			oController.tableRowObject2 = oController.TabPat.getParent().getParent().mAggregations.content[0].mAggregations.pages[0].mAggregations
				.content[0]
				.mAggregations._header.mAggregations.items[0].mAggregations.content[5].mAggregations.items[0].mAggregations._header.mAggregations.items[
					0].mAggregations.content[0].mAggregations.items[2].getTable().mAggregations.rows[diff2];*/
			var decimalFormat = oController.userDecimalFormat;
			for (var k = 0; k < colsMaterial.length; k++) {
				if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
						"poMatHBoxId2") >=
					0) {
					var tableRowPONumber = oController.PoPath.getParent().getCells()[k].mAggregations.items[0].getText();
				} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
						"itemMatNos") >=
					0) {
					var tableRowItemNumber = oController.PoPath.getParent().getCells()[k].getText();
				} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
						"idGoodsReceivedToDate") >=
					0) {

					if (decimalFormat == "Y") {
						var GoodsReceivedAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							GoodsReceivedAmtArr1 = GoodsReceivedAmtArr[1].split(" ")[0],
							GoodsReceivedAmtCurr = GoodsReceivedAmtArr[1].split(" ")[1],
							GoodsReceivedAmtArr2 = GoodsReceivedAmtArr[0],
							GoodsReceivedAmt = GoodsReceivedAmtArr2 + "," + GoodsReceivedAmtArr1;
					} else if (decimalFormat == " " || decimalFormat == "") {
						var GoodsReceivedAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							GoodsReceivedAmtArr1 = GoodsReceivedAmtArr[1].split(" ")[0],
							GoodsReceivedAmtCurr = GoodsReceivedAmtArr[1].split(" ")[1],
							GoodsReceivedAmtArr2 = GoodsReceivedAmtArr[0],
							GoodsReceivedAmt = GoodsReceivedAmtArr2 + "," + GoodsReceivedAmtArr1;
					} else if (decimalFormat == "X") {
						var GoodsReceivedAmtArr = oController.PoPath.getParent().getCells()[k].getText().split("."),
							GoodsReceivedAmtArr1 = GoodsReceivedAmtArr[1].split(" ")[0],
							GoodsReceivedAmtCurr = GoodsReceivedAmtArr[1].split(" ")[1],
							GoodsReceivedAmtArr2 = GoodsReceivedAmtArr[0],
							GoodsReceivedAmt = GoodsReceivedAmtArr2 + "." + GoodsReceivedAmtArr1;
					}
				} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
						"idInvoiceAmountThre") >=
					0) {
					if (decimalFormat == "Y") {
						var InvoiceValueAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							InvoiceValueAmtArr1 = InvoiceValueAmtArr[1].split(" ")[0],
							InvoiceValueAmtCurr = InvoiceValueAmtArr[1].split(" ")[1],
							InvoiceValueAmtArr2 = InvoiceValueAmtArr[0],
							InvoiceValueAmt = InvoiceValueAmtArr2 + "," + InvoiceValueAmtArr1;
					} else if (decimalFormat == " " || decimalFormat == "") {
						var InvoiceValueAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							InvoiceValueAmtArr1 = InvoiceValueAmtArr[1].split(" ")[0],
							InvoiceValueAmtCurr = InvoiceValueAmtArr[1].split(" ")[1],
							InvoiceValueAmtArr2 = InvoiceValueAmtArr[0],
							InvoiceValueAmt = InvoiceValueAmtArr2 + "," + InvoiceValueAmtArr1;
					} else if (decimalFormat == "X") {
						var InvoiceValueAmtArr = oController.PoPath.getParent().getCells()[k].getText().split("."),
							InvoiceValueAmtArr1 = InvoiceValueAmtArr[1].split(" ")[0],
							InvoiceValueAmtCurr = InvoiceValueAmtArr[1].split(" ")[1],
							InvoiceValueAmtArr2 = InvoiceValueAmtArr[0],
							InvoiceValueAmt = InvoiceValueAmtArr2 + "." + InvoiceValueAmtArr1;
					}
				}
			}
			var ErrorAmtFlag = 0,
				oFloatFormat;

			if (decimalFormat == " " || decimalFormat == "") {
				var Formatval = GoodsReceivedAmt.split(","),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				GoodsReceivedAmt = parseFloat(Formatval);
			} else
			if (decimalFormat == "Y") {

				var Formatval = GoodsReceivedAmt.split(","),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				GoodsReceivedAmt = parseFloat(Formatval);

			} else {

				var Formatval = GoodsReceivedAmt.split("."),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				GoodsReceivedAmt = parseFloat(Formatval);

			}
			if (decimalFormat == " " || decimalFormat == "") {
				var Formatval = InvoiceValueAmt.split(","),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				InvoiceValueAmt = parseFloat(Formatval);
			} else if (decimalFormat == "Y") {

				var Formatval = InvoiceValueAmt.split(","),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				InvoiceValueAmt = parseFloat(Formatval);

			} else {

				var Formatval = InvoiceValueAmt.split("."),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				InvoiceValueAmt = parseFloat(Formatval);

			}
			/*if ((parseFloat(GoodsReceivedAmt)) > (parseFloat(InvoiceValueAmt))) {
				ErrorAmtFlag = 1;
			}
			if (ErrorAmtFlag == 1) {
				MessageBox.error(
					"Material PO’s cannot be closed when the Goods Receipted amount is greater than the invoiced amount. Please adjust the good receipted amount to equal the invoiced amount prior to closing the PO in Ariba."
				)
				sap.ui.core.BusyIndicator.hide();
				oController.getView().byId('SmartTableThres2').getTable().removeSelectionInterval(selIndex, selIndex);
				oController.PoPath.setEnabled(true);
				oController.PoPath.setSelected(false);
				oController._oPopUpDialog3.close();
				oController._oPopUpDialog3 = [];
				return;
			}*/
			// oController.PoPath.setEnabled(false);
			if (allDataThre2.length > 0) {
				allDataThre2.forEach((data) => {
					if (data['PONUMBER'] === tableRowPONumber && data['ITEMNO'] === tableRowItemNumber) {
						//	data['POCLOSURE_FLAG'] = 1;
						//	data['CHECKFLAG'] = true;
						data['PO_CLOSURE'] = "true";
						data['STATUS'] = "Reviewed";
						data['MARKASREVIEWED'] = "X";
						data['ACCRUALMETHOD'] = "WTD";
						data['STRAIGHTLINEMTHD'] = "";
					}
				});
				// Get the PO# and Line Item # 
				for (var k = 0; k < colsMaterial.length; k++) {
					if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"poMatHBoxId2") >=
						0) {
						var tableRowPONumber = oController.PoPath.getParent().getCells()[k].mAggregations.items[0].getText();
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"itemMatNos") >=
						0) {
						var tableRowItemNumber = oController.PoPath.getParent().getCells()[k].getText();
					}
				}

				var jsonIndex = jsonArrayfinal2.findIndex(t => t.PONUMBER === tableRowPONumber && t.LINEITEM === tableRowItemNumber);

				if (jsonArrayfinal2[jsonIndex] !== undefined) {
					jsonArrayfinal2[jsonIndex].PO_CLOSURE = materialPOClosure;
					oController.getView().byId('SmartTableThres2').getTable().removeSelectionInterval(selIndex, selIndex);
					oController.getView().byId('SmartTableThres2').getTable().addSelectionInterval(selIndex, selIndex);
				} else {
					oController.getView().byId('SmartTableThres2').getTable().removeSelectionInterval(selIndex, selIndex);
					oController.getView().byId('SmartTableThres2').getTable().addSelectionInterval(selIndex, selIndex);
				}
			} else {
				oController.getView().byId('SmartTableThres2').getTable().removeSelectionInterval(selIndex, selIndex);
				oController.getView().byId('SmartTableThres2').getTable().addSelectionInterval(selIndex, selIndex);
			}
			oController.getOwnerComponent().getModel().setProperty(oController.getView().byId("MatTableBThrs").getContextByIndex(selIndex).getPath() +
				"/POCLOSURE_FLAG", "1");
			oController.getOwnerComponent().getModel().setProperty(oController.getView().byId("MatTableBThrs").getContextByIndex(selIndex).getPath() +
				"/POCLOSURE_FLAG_LOCAL", true);
			oController._oPopUpDialog3.close();
			oController._oPopUpDialog3 = [];
		},
		onSelctCancelPOMatrThre: function () {
			matPO = 0;
			var selIndex = oController.POSselIndex;
			oController.PoPath.setEnabled(true);
			oController.PoPath.setSelected(false);
			//oController.getView().byId('SmartTableThres2').getTable().removeSelectionInterval(selIndex, selIndex);
			oController._oPopUpDialog3.close();
			oController._oPopUpDialog3 = [];
		},
		onSelectthrePOClosureMater: function (oEvent) {
			matPO = 1;
			materialPOClosure = oEvent.mParameters.selected.toString();
			oController.PoPath = oEvent.getSource();
			oController.selectedTableID = oEvent.getSource().getParent().getId().split("--")[1].split("-")[0];
			var selIndex = oController.PoPath.getParent().getIndex();
			oController.colsMaterial = oController.PoPath.getParent().getParent().getColumns();
			colsMaterial = oController.colsMaterial;
			oController.tableRowObject2 = oController.PoPath.getParent();
			oController.POSselIndex = selIndex;
			const oThresholdPercent = this.getView().getModel('constantsModel').getProperty("/thresholdPercentage")
			var sMessagePO1 = oController.geti18nText('POClosureConfirm1'),
				sMessagePO2 = oController.geti18nText('POClosureConfirm2'),
				sMessagePO3 = oController.geti18nText('POClosureConfirm3'),
				sMessagePO4 = oController.geti18nText('POClosureConfirm4'),
				sMessagePO5 = oController.geti18nText('POClosureConfirm5');
			oController.FormattedtextoModel = new JSONModel({
				HTML: "<p>" + sMessagePO1 + "<strong>" + sMessagePO2 + "</strong>" + sMessagePO3 + "</p>" +
					"\n" +
					"<p>" + "<strong>" + sMessagePO4 + "</strong>" + sMessagePO5 + "</p>"
			});
			if (oController._oPopUpDialog3) {
				oController._oPopUpDialog3 = [];
			}
			var decimalFormat = oController.userDecimalFormat;
			for (var k = 0; k < colsMaterial.length; k++) {
				if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
						"poMatHBoxId2") >=
					0) {
					var tableRowPONumber = oController.PoPath.getParent().getCells()[k].mAggregations.items[0].getText();
				} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
						"itemMatNos") >=
					0) {
					var tableRowItemNumber = oController.PoPath.getParent().getCells()[k].getText();
				} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
						"idGoodsReceivedToDate") >=
					0) {

					if (decimalFormat == "Y") {
						var GoodsReceivedAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							GoodsReceivedAmtArr1 = GoodsReceivedAmtArr[1].split(" ")[0],
							GoodsReceivedAmtCurr = GoodsReceivedAmtArr[1].split(" ")[1],
							GoodsReceivedAmtArr2 = GoodsReceivedAmtArr[0],
							GoodsReceivedAmt = GoodsReceivedAmtArr2 + "," + GoodsReceivedAmtArr1;
					} else if (decimalFormat == " " || decimalFormat == "") {
						var GoodsReceivedAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							GoodsReceivedAmtArr1 = GoodsReceivedAmtArr[1].split(" ")[0],
							GoodsReceivedAmtCurr = GoodsReceivedAmtArr[1].split(" ")[1],
							GoodsReceivedAmtArr2 = GoodsReceivedAmtArr[0],
							GoodsReceivedAmt = GoodsReceivedAmtArr2 + "," + GoodsReceivedAmtArr1;
					} else if (decimalFormat == "X") {
						var GoodsReceivedAmtArr = oController.PoPath.getParent().getCells()[k].getText().split("."),
							GoodsReceivedAmtArr1 = GoodsReceivedAmtArr[1].split(" ")[0],
							GoodsReceivedAmtCurr = GoodsReceivedAmtArr[1].split(" ")[1],
							GoodsReceivedAmtArr2 = GoodsReceivedAmtArr[0],
							GoodsReceivedAmt = GoodsReceivedAmtArr2 + "." + GoodsReceivedAmtArr1;
					}
				} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
						"idInvoiceAmountThre") >=
					0) {
					if (decimalFormat == "Y") {
						var InvoiceValueAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							InvoiceValueAmtArr1 = InvoiceValueAmtArr[1].split(" ")[0],
							InvoiceValueAmtCurr = InvoiceValueAmtArr[1].split(" ")[1],
							InvoiceValueAmtArr2 = InvoiceValueAmtArr[0],
							InvoiceValueAmt = InvoiceValueAmtArr2 + "," + InvoiceValueAmtArr1;
					} else if (decimalFormat == " " || decimalFormat == "") {
						var InvoiceValueAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							InvoiceValueAmtArr1 = InvoiceValueAmtArr[1].split(" ")[0],
							InvoiceValueAmtCurr = InvoiceValueAmtArr[1].split(" ")[1],
							InvoiceValueAmtArr2 = InvoiceValueAmtArr[0],
							InvoiceValueAmt = InvoiceValueAmtArr2 + "," + InvoiceValueAmtArr1;
					} else if (decimalFormat == "X") {
						var InvoiceValueAmtArr = oController.PoPath.getParent().getCells()[k].getText().split("."),
							InvoiceValueAmtArr1 = InvoiceValueAmtArr[1].split(" ")[0],
							InvoiceValueAmtCurr = InvoiceValueAmtArr[1].split(" ")[1],
							InvoiceValueAmtArr2 = InvoiceValueAmtArr[0],
							InvoiceValueAmt = InvoiceValueAmtArr2 + "." + InvoiceValueAmtArr1;
					}
				}
			}
			var ErrorAmtFlag = 0,
				oFloatFormat;

			if (decimalFormat == " " || decimalFormat == "") {
				var Formatval = GoodsReceivedAmt.split(","),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				GoodsReceivedAmt = parseFloat(Formatval);
			} else
			if (decimalFormat == "Y") {

				var Formatval = GoodsReceivedAmt.split(","),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				GoodsReceivedAmt = parseFloat(Formatval);

			} else {

				var Formatval = GoodsReceivedAmt.split("."),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				GoodsReceivedAmt = parseFloat(Formatval);

			}
			if (decimalFormat == " " || decimalFormat == "") {
				var Formatval = InvoiceValueAmt.split(","),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\./g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				InvoiceValueAmt = parseFloat(Formatval);
			} else if (decimalFormat == "Y") {

				var Formatval = InvoiceValueAmt.split(","),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\ /g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				InvoiceValueAmt = parseFloat(Formatval);

			} else {

				var Formatval = InvoiceValueAmt.split("."),
					FormatvalSplt0, FormatvalSplt2, Formatval, FormatvalSplt1;
				if (Formatval.length == 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
					Formatval = FormatvalSplt2;
				} else
				if (Formatval.length > 1) {
					FormatvalSplt0 = Formatval[0];
					FormatvalSplt1 = Formatval[1];
					FormatvalSplt2 = FormatvalSplt0.replace(/\,/g, "");
					Formatval = FormatvalSplt2 + "." + FormatvalSplt1;
				}
				InvoiceValueAmt = parseFloat(Formatval);

			}
			let fGR = parseFloat(GoodsReceivedAmt);
			let fInv = parseFloat(InvoiceValueAmt);
			let cGR = this._countDecimal(fGR);
			let cInv = this._countDecimal(fInv);
			let cMultiplier = 0;
			
			if(cGR > cInv){
				cMultiplier = cGR;
			}else{
				cMultiplier = cInv
			}
			let fMultiplier= this._finalMultiplier(cMultiplier);
			let iVariance = (((fGR*fMultiplier)-(fInv * fMultiplier))/(fGR*fMultiplier))*100;
			
			if ((fGR > fInv) && (iVariance > oThresholdPercent)) {
				ErrorAmtFlag = 1;
			}
			
			if (ErrorAmtFlag === 1) {
				var ErrMes = oController.geti18nText('GoodsError');
				MessageBox.warning(ErrMes);
				sap.ui.core.BusyIndicator.hide();
				//oController.getView().byId('SmartTableThres2').getTable().removeSelectionInterval(selIndex, selIndex);
				oController.PoPath.setEnabled(true);
				oController.PoPath.setSelected(false);
				return;
			}
			if (!oController._oPopUpDialog3 || oController._oPopUpDialog3.length == 0) {
				oController._oPopUpDialog3 = sap.ui.xmlfragment("com.takeda.Accrual_UI5.fragment.POClosurePopUp", oController);
				oController.getView().addDependent(oController._oPopUpDialog3);
				oController._oPopUpDialog3.setModel(oController.FormattedtextoModel);
			}
			oController._oPopUpDialog3.open();
		},

		//gree march end
		mapThreStr: function (tableRow, tableRowObject, str, tableType) {
			str.PONUMBER = tableRow.PONUMBER;
			str.LINEITEM = tableRow.ITEMNO;
			str.EMAILID = tableRow.POOWNER_EMAIL; // PO owner emailId
			str.WORKCOMPLASTMONTHAMT = tableRow.LASTMONTHWRKCOMP;
			str.WORKCOMPLASTMONTHCURR = tableRow.POCURRENCY;
			str.REVIWED_BY = emailId; // logged in user Id
			str.MARKASREVIEWED = "X";
			str.STATUS = "Reviewed";
			str.INVVALUE = tableRow.INVVALUE;

			// Service Table 
			if (tableType == 'Service') {
				if (cols == undefined) {
					cols = oController.cols;
				}
				if (tableRowObject != undefined) {
					if (tableRowObject.getCells() == undefined) {
						tableRowObject = oController.tableRowObject2;
					}
				}
				if (tableRowObject) {
					// Get the PO# and Line Item # 
					for (var k = 0; k < cols.length; k++) {
						if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("threHbox") >= 0) {
							var tableRowPONumber = tableRowObject.getCells()[k].mAggregations.items[0].getText();
						} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("itemNum") >= 0) {
							var tableRowItemNumber = tableRowObject.getCells()[k].getText();
						}
					}

					if (tableRowPONumber === str.PONUMBER && tableRowItemNumber === str.LINEITEM) {
						// Populate the WTD Amount and Percentage   
						for (var k = 0; k < cols.length; k++) {
							if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("totalAmountThr") >= 0) {
								str.TOTALWORKCOMPLTODATE = tableRowObject.getCells()[k].getValue();
							} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("totalPercentThr") >= 0) {
								str.TOTALWORKCOMPLPERCENT = tableRowObject.getCells()[k].getValue();
							} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("totalAccMetThr") >= 0) {
								var accMet = tableRowObject.getCells()[k].getText();
							}
							// MVP2 changes Start of Code
							else if (serPO === 1) {
								str.PO_CLOSURE = servicePOClosure;
							} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("threPOClosureCheckBox") >= 0) {
								str.PO_CLOSURE = tableRowObject.getCells()[k].getSelected().toString();
							}
							// MVP2 changes End of Code
						}
					} else {
						var jsonArrayLocal = jsonArrayfinal2.filter(function (jsonArrayfinal2) {
							return jsonArrayfinal2.PONUMBER === tableRow.PONUMBER &&
								jsonArrayfinal2.LINEITEM === tableRow.ITEMNO;
						});
						if (jsonArrayLocal.length) {
							str.TOTALWORKCOMPLTODATE = jsonArrayLocal[0].TOTALWORKCOMPLTODATE;
							//	str.TOTALWORKCOMPLTODATE = jsonArrayLocal[0].TOTALWORKCOMPLTODATE;
							str.TOTALWORKCOMPLPERCENT = jsonArrayLocal[0].TOTALWORKCOMPLPERCENT;
							var accMet = tableRow.ACCRUALMETHOD;
							str.PO_CLOSURE = jsonArrayLocal[0].PO_CLOSURE;

						} else {
							// str.TOTALWORKCOMPLTODATE = tableRow.TOTWRKCOMPAMT;
							str.TOTALWORKCOMPLTODATE = tableRow.TOTWRKCOMPAMT_CHAR;
							str.TOTALWORKCOMPLPERCENT = tableRow.TOTWRKCOMPPER;
							var accMet = tableRow.ACCRUALMETHOD;
							// MVP2 changes Start of Code
							if (serPO === 1) {
								str.PO_CLOSURE = servicePOClosure;
							} else {
								str.PO_CLOSURE = tableRow.PO_CLOSURE;
							}
							// MVP2 changes End of Code
						}

					}
				} else {
					var jsonArrayLocal = jsonArrayfinal2.filter(function (jsonArrayfinal2) {
						return jsonArrayfinal2.PONUMBER === tableRow.PONUMBER &&
							jsonArrayfinal2.LINEITEM === tableRow.ITEMNO;
					});
					if (jsonArrayLocal.length) {
						str.TOTALWORKCOMPLTODATE = jsonArrayLocal[0].TOTALWORKCOMPLTODATE;
						//	str.TOTALWORKCOMPLTODATE = jsonArrayLocal[0].TOTALWORKCOMPLTODATE;
						str.TOTALWORKCOMPLPERCENT = jsonArrayLocal[0].TOTALWORKCOMPLPERCENT;
						var accMet = tableRow.ACCRUALMETHOD;
						str.PO_CLOSURE = jsonArrayLocal[0].PO_CLOSURE;

					} else {
						// str.TOTALWORKCOMPLTODATE = tableRow.TOTWRKCOMPAMT;
						str.TOTALWORKCOMPLTODATE = tableRow.TOTWRKCOMPAMT_CHAR;
						str.TOTALWORKCOMPLPERCENT = tableRow.TOTWRKCOMPPER;
						var accMet = tableRow.ACCRUALMETHOD;
						// MVP2 changes Start of Code
						if (serPO === 1) {
							str.PO_CLOSURE = servicePOClosure;
						} else {
							str.PO_CLOSURE = tableRow.PO_CLOSURE;
						}
						// MVP2 changes End of Code
					}
				}

			} else {
				// Material
				if (colsMaterial == undefined) {
					colsMaterial = oController.colsMaterial;
				}
				if (tableRowObject != undefined) {
					if (tableRowObject.getCells() == undefined) {
						tableRowObject = oController.tableRowObject2;
					}
				}
				if (tableRowObject) {
					// Get the PO# and Line Item # 
					for (var k = 0; k < cols.length; k++) {
						if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("poMatHBoxId2") >= 0) {
							var tableRowPONumber = tableRowObject.getCells()[k].mAggregations.items[0].getText();
						} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("itemMatNos") >= 0) {
							var tableRowItemNumber = tableRowObject.getCells()[k].getText();
						}
					}

					if (tableRowPONumber === str.PONUMBER && tableRowItemNumber === str.LINEITEM) {
						// Populate the WTD Amount and Percentage   
						for (var k = 0; k < cols.length; k++) {
							if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("totalPOClosureMater") >= 0) {
								str.PO_CLOSURE = tableRowObject.getCells()[k].getSelected().toString();
							}
						}
					} else {
						var jsonArrayLocal = jsonArrayfinal2.filter(function (jsonArrayfinal2) {
							return jsonArrayfinal2.PONUMBER === tableRow.PONUMBER &&
								jsonArrayfinal2.LINEITEM === tableRow.ITEMNO;
						});
						if (jsonArrayLocal.length) {
							str.PO_CLOSURE = jsonArrayLocal[0].PO_CLOSURE;
						} else {
							// MVP2 changes Start of Code
							// Checking the flag
							if (matPO === 1) {
								str.PO_CLOSURE = materialPOClosure;
							} else {
								str.PO_CLOSURE = tableRow.PO_CLOSURE;
							}
							// MVP2 changes End of Code
						}
					}
				} else {
					var jsonArrayLocal = jsonArrayfinal2.filter(function (jsonArrayfinal2) {
						return jsonArrayfinal2.PONUMBER === tableRow.PONUMBER &&
							jsonArrayfinal2.LINEITEM === tableRow.ITEMNO;
					});
					if (jsonArrayLocal.length) {
						str.PO_CLOSURE = jsonArrayLocal[0].PO_CLOSURE;
					} else {
						// MVP2 changes Start of Code
						// Checking the flag
						if (matPO === 1) {
							str.PO_CLOSURE = materialPOClosure;
						} else {
							str.PO_CLOSURE = tableRow.PO_CLOSURE;
						}
						// MVP2 changes End of Code
					}

				}
				str.TOTALWORKCOMPLTODATE = tableRow.TOTWRKCOMPAMT_CHAR;
				str.TOTALWORKCOMPLPERCENT = tableRow.TOTWRKCOMPPER;
				var accMet = tableRow.ACCRUALMETHOD;

			}
			if ((accMet === "Straight Line") || (accMet === "STL")) {
				accMet = "STL";
			} else {
				accMet = "WTD";
			}
			str.ACCRUALMETHOD = accMet;
			if (accMet === "STL") {
				str.STRAIGHTLINEMTHD = "X";
			} else {
				str.STRAIGHTLINEMTHD = "";
			}
			// Work Start Date 
			var datSt = tableRow.WRKSTRTDATE;
			var DateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyyMMdd"
			});
			if (datSt) {
				var StDate = DateFormat.format(new Date(datSt));
			}
			str.WORK_STARTDATE = StDate;
			// Work End Date 
			var datEd = tableRow.WRKENDDATE;
			if (datEd) {
				var EdDate = DateFormat.format(new Date(datEd));
			}
			str.WORK_ENDDATE = EdDate;
			// Convert the currency to decimal
			// if (str.TOTALWORKCOMPLTODATE !== "") {
			// Added by Rakesh
			if (str.TOTALWORKCOMPLTODATE !== "" && str.TOTALWORKCOMPLTODATE !== undefined &&
				isNaN(str.TOTALWORKCOMPLTODATE)) {

				str.TOTALWORKCOMPLTODATE = formatter.priceToDecimalThr(oController.userDecimalFormat, str.TOTALWORKCOMPLTODATE.toString());
			}
			if (str.TOTALWORKCOMPLPERCENT !== "" && str.TOTALWORKCOMPLPERCENT !== undefined) {
				var percentage = str.TOTALWORKCOMPLPERCENT.toString();
				var decimalFormat = oController.userDecimalFormat;
				str.TOTALWORKCOMPLPERCENT = formatter.percentagetoDecimal(decimalFormat, percentage, str);
			}
			// Amount Accured is always WTD - Invoice Value
			str.AMOUNT_ACCURED = parseFloat(str.TOTALWORKCOMPLTODATE) - parseFloat(tableRow.INVVALUE);
			// MVP2 changes Start of Code
			serPO = 0;
			matPO = 0;
		},
		// MVP2 changes End of Code

		// mapThreStr: function (threRowData, oEvent) {
		// 	oEvent = oController.threEvent;
		// 	var threStr = {};

		// 	threStr.PONUMBER = threRowData.PONUMBER;
		// 	threStr.LINEITEM = threRowData.ITEMNO;
		// 	threStr.PO_CLOSURE = threRowData.PO_CLOSURE;
		// 	var threTableId = oController.getView().byId("MatTableBThrs");
		// 	var rows = threTableId.getRows();
		// 	if (threTableId.getRows().length > 0) {
		// 		var threcols = threTableId.getRows()[1].getCells();
		// 	}
		// 	for (var k = 0; k < threcols.length; k++) {
		// 		if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
		// 				"threPOClosureCheckBox") >= 0) {
		// 			var selIndex = oEvent.getSource().getParent().getIndex();
		// 			threStr.PO_CLOSURE = oEvent.getSource().getParent().getCells()[k].getSelected().toString();
		// 			// allDataThre1[selIndex].PO_CLOSURE = threStr.PO_CLOSURE;
		// 		}
		// 	}
		// 	threStr.REVIWED_BY = emailId;
		// 	if (jsonArrayfinal2.length === 0) {
		// 		jsonArrayfinal2.push(threStr);
		// 	} else {
		// 		var thresholdArrayDuplicate = jsonArrayfinal2.filter(function (jsonArrayfinal2) {
		// 			return jsonArrayfinal2.PONUMBER === threStr.PONUMBER &&
		// 				jsonArrayfinal2.LINEITEM === threStr.LINEITEM;
		// 		});
		// 		if (thresholdArrayDuplicate.length > 0) {
		// 			jsonArrayfinal2 = jsonArrayfinal2.filter(function (jsonArrayfinal2) {
		// 				return jsonArrayfinal2.PONUMBER !== threStr.PONUMBER ||
		// 					jsonArrayfinal2.LINEITEM !== threStr.LINEITEM;
		// 			});
		// 		}
		// 		jsonArrayfinal2.push(threStr);
		// 	}
		// },
		onPressSaveThre: function () {
			var jsonData = {
				"statuspo": thresholdArray
			};

			$.ajax({
				type: "POST",
				url: sPostURI + "updateThresholdPOClosure.xsjs",
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify(jsonData),
				success: function (data, Response) {
					thresholdArray = [];
					MessageBox.success("Successfully Saved");
					var oHistoryTable = oController.getView().byId("SmartTableBthreshold");
					oHistoryTable.rebindTable(true);
					oController.getView().byId("recordThre").setVisible(false);
				},
				error: function (error) {
					common.displayErrorMessage(oController);
					var oHistoryTable = oController.getView().byId("SmartTableBthreshold");
					oHistoryTable.rebindTable(true);
					thresholdArray = [];
					oController.getView().byId("recordThre").setVisible(false);
				}
			});
		},
		// <!--MVP2 changes End of Code-->
		// Get the fields of the selected row
		mapStr: function (tableRow, tableRowObject, str, tableType) {
			str.PONUMBER = tableRow.PONUMBER;
			str.LINEITEM = tableRow.ITEMNO;
			str.EMAILID = tableRow.POOWNER_EMAIL; // PO owner emailId
			str.WORKCOMPLASTMONTHAMT = tableRow.LASTMONTHWRKCOMP;
			str.WORKCOMPLASTMONTHCURR = tableRow.POCURRENCY;
			str.REVIWED_BY = emailId; // logged in user Id
			str.MARKASREVIEWED = "X";
			str.STATUS = "Reviewed";
			str.INVVALUE = tableRow.INVVALUE;

			// Service Table 
			if (tableType == 'Service') {
				if (cols == undefined) {
					cols = oController.cols;
				}
				if (tableRowObject != undefined) {
					if (tableRowObject.getCells() == undefined) {
						tableRowObject = oController.tableRowObject1;
					}
				}
				if (tableRowObject) {
					// Get the PO# and Line Item # 
					for (var k = 0; k < cols.length; k++) {
						if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("poHBoxId") >= 0) {
							var tableRowPONumber = tableRowObject.getCells()[k].mAggregations.items[0].getText();
						} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("itemNo") >= 0) {
							var tableRowItemNumber = tableRowObject.getCells()[k].getText();
						}
					}

					if (tableRowPONumber === str.PONUMBER && tableRowItemNumber === str.LINEITEM) {
						// Populate the WTD Amount and Percentage   
						for (var k = 0; k < cols.length; k++) {
							if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("totalAmount") >= 0) {
								str.TOTALWORKCOMPLTODATE = tableRowObject.getCells()[k].getValue();
							} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("totalPercent") >= 0) {
								str.TOTALWORKCOMPLPERCENT = tableRowObject.getCells()[k].getValue();
							} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("totalAccMet") >= 0) {
								var accMet = tableRowObject.getCells()[k].getText();
							}
							// MVP2 changes Start of Code
							else if (serPO === 1) {
								str.PO_CLOSURE = servicePOClosure;
							} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("totalPOClosure") >= 0) {
								str.PO_CLOSURE = tableRowObject.getCells()[k].getSelected().toString();
							}
							// MVP2 changes End of Code
						}
					} else {
						var jsonArrayLocal = jsonArray.filter(function (jsonArray) {
							return jsonArray.PONUMBER === tableRow.PONUMBER &&
								jsonArray.LINEITEM === tableRow.ITEMNO;
						});
						if (jsonArrayLocal.length) {
							str.TOTALWORKCOMPLTODATE = jsonArrayLocal[0].TOTALWORKCOMPLTODATE;
							//	str.TOTALWORKCOMPLTODATE = jsonArrayLocal[0].TOTALWORKCOMPLTODATE;
							str.TOTALWORKCOMPLPERCENT = jsonArrayLocal[0].TOTALWORKCOMPLPERCENT;
							var accMet = tableRow.ACCRUALMETHOD;
							str.PO_CLOSURE = jsonArrayLocal[0].PO_CLOSURE;

						} else {
							// str.TOTALWORKCOMPLTODATE = tableRow.TOTWRKCOMPAMT;
							str.TOTALWORKCOMPLTODATE = tableRow.TOTWRKCOMPAMT_CHAR;
							str.TOTALWORKCOMPLPERCENT = tableRow.TOTWRKCOMPPER;
							var accMet = tableRow.ACCRUALMETHOD;
							// MVP2 changes Start of Code
							if (serPO === 1) {
								str.PO_CLOSURE = servicePOClosure;
							} else {
								str.PO_CLOSURE = tableRow.PO_CLOSURE;
							}
							// MVP2 changes End of Code
						}

					}
				} else {
					var jsonArrayLocal = jsonArray.filter(function (jsonArray) {
						return jsonArray.PONUMBER === tableRow.PONUMBER &&
							jsonArray.LINEITEM === tableRow.ITEMNO;
					});
					if (jsonArrayLocal.length) {
						str.TOTALWORKCOMPLTODATE = jsonArrayLocal[0].TOTALWORKCOMPLTODATE;
						//	str.TOTALWORKCOMPLTODATE = jsonArrayLocal[0].TOTALWORKCOMPLTODATE;
						str.TOTALWORKCOMPLPERCENT = jsonArrayLocal[0].TOTALWORKCOMPLPERCENT;
						var accMet = tableRow.ACCRUALMETHOD;
						str.PO_CLOSURE = jsonArrayLocal[0].PO_CLOSURE;

					} else {
						// str.TOTALWORKCOMPLTODATE = tableRow.TOTWRKCOMPAMT;
						str.TOTALWORKCOMPLTODATE = tableRow.TOTWRKCOMPAMT_CHAR;
						str.TOTALWORKCOMPLPERCENT = tableRow.TOTWRKCOMPPER;
						var accMet = tableRow.ACCRUALMETHOD;
						// MVP2 changes Start of Code
						if (serPO === 1) {
							str.PO_CLOSURE = servicePOClosure;
						} else {
							str.PO_CLOSURE = tableRow.PO_CLOSURE;
						}
						// MVP2 changes End of Code
					}
				}

			} else {
				// Material
				if (colsMaterial == undefined) {
					colsMaterial = oController.colsMaterial;
				}
				if (tableRowObject != undefined) {
					if (tableRowObject.getCells() == undefined) {
						tableRowObject = oController.tableRowObject1;
					}
				}
				if (tableRowObject) {
					// Get the PO# and Line Item # 
					for (var k = 0; k < cols.length; k++) {
						if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("poMatHBoxId") >= 0) {
							var tableRowPONumber = tableRowObject.getCells()[k].mAggregations.items[0].getText();
						} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("itemMatNo") >= 0) {
							var tableRowItemNumber = tableRowObject.getCells()[k].getText();
						}
					}

					if (tableRowPONumber === str.PONUMBER && tableRowItemNumber === str.LINEITEM) {
						// Populate the WTD Amount and Percentage   
						for (var k = 0; k < cols.length; k++) {
							if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("totalPOClosureMat") >= 0) {
								str.PO_CLOSURE = tableRowObject.getCells()[k].getSelected().toString();
							}
						}
					} else {
						var jsonArrayLocal = jsonArray.filter(function (jsonArray) {
							return jsonArray.PONUMBER === tableRow.PONUMBER &&
								jsonArray.LINEITEM === tableRow.ITEMNO;
						});
						if (jsonArrayLocal.length) {
							str.PO_CLOSURE = jsonArrayLocal[0].PO_CLOSURE;
						} else {
							// MVP2 changes Start of Code
							// Checking the flag
							if (matPO === 1) {
								str.PO_CLOSURE = materialPOClosure;
							} else {
								str.PO_CLOSURE = tableRow.PO_CLOSURE;
							}
							// MVP2 changes End of Code
						}
					}
				} else {
					var jsonArrayLocal = jsonArray.filter(function (jsonArray) {
						return jsonArray.PONUMBER === tableRow.PONUMBER &&
							jsonArray.LINEITEM === tableRow.ITEMNO;
					});
					if (jsonArrayLocal.length) {
						str.PO_CLOSURE = jsonArrayLocal[0].PO_CLOSURE;
					} else {
						// MVP2 changes Start of Code
						// Checking the flag
						if (matPO === 1) {
							str.PO_CLOSURE = materialPOClosure;
						} else {
							str.PO_CLOSURE = tableRow.PO_CLOSURE;
						}
						// MVP2 changes End of Code
					}

				}
				str.TOTALWORKCOMPLTODATE = tableRow.TOTWRKCOMPAMT_CHAR;
				str.TOTALWORKCOMPLPERCENT = tableRow.TOTWRKCOMPPER;
				var accMet = tableRow.ACCRUALMETHOD;

			}
			if ((accMet === "Straight Line") || (accMet === "STL")) {
				accMet = "STL";
			} else {
				accMet = "WTD";
			}
			str.ACCRUALMETHOD = accMet;
			if (accMet === "STL") {
				str.STRAIGHTLINEMTHD = "X";
			} else {
				str.STRAIGHTLINEMTHD = "";
			}
			// Work Start Date 
			var datSt = tableRow.WRKSTRTDATE;
			var DateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyyMMdd"
			});
			if (datSt) {
				var StDate = DateFormat.format(new Date(datSt));
			}
			str.WORK_STARTDATE = StDate;
			// Work End Date 
			var datEd = tableRow.WRKENDDATE;
			if (datEd) {
				var EdDate = DateFormat.format(new Date(datEd));
			}
			str.WORK_ENDDATE = EdDate;
			// Convert the currency to decimal
			// if (str.TOTALWORKCOMPLTODATE !== "") {
			// Added by Rakesh
			if (str.TOTALWORKCOMPLTODATE !== "" && str.TOTALWORKCOMPLTODATE !== undefined &&
				isNaN(str.TOTALWORKCOMPLTODATE)) {

				str.TOTALWORKCOMPLTODATE = formatter.priceToDecimal(oController.userDecimalFormat, str.TOTALWORKCOMPLTODATE.toString());
			}
			if (str.TOTALWORKCOMPLPERCENT !== "" && str.TOTALWORKCOMPLPERCENT !== undefined) {
				var percentage = str.TOTALWORKCOMPLPERCENT.toString();
				var decimalFormat = oController.userDecimalFormat;
				str.TOTALWORKCOMPLPERCENT = formatter.percentagetoDecimal(decimalFormat, percentage, str);
			}
			// Amount Accured is always WTD - Invoice Value
			str.AMOUNT_ACCURED = parseFloat(str.TOTALWORKCOMPLTODATE) - parseFloat(tableRow.INVVALUE);
			// MVP2 changes Start of Code
			serPO = 0;
			matPO = 0;
			// MVP2 changes End of Code
		},
		// Get the Selected Row Data
		getSelectedData: function (oEvent, str, aTableData) {
			// Get the Selected Row Data
			// var index = oEvent.mParameters.rowIndex;
			var index = this.getSelectedIndex(oEvent, aTableData);
			var tableRowObject = "";
			if (index >= 0) {
				var selectedRowData = aTableData[index];
				// Get the Selected Row Object
				// var tableRowObject = oEvent.getSource().getParent().getTable().getRows()[index];
				if (globalEvent !== undefined) {
					if (globalEvent.getSource().getParent === undefined) {
						// Get the table row object from the event
						if (oEvent.getSource().getParent().getTable().getRows() !== undefined) {
							tableRowObject = oEvent.getSource().getParent().getTable().getRows()[index];
						}
					} else {
						var tableRowObject = globalEvent.getSource().getParent();
					}
				}
				// If table Row Object is not set, then get the table row object from the event
				if (tableRowObject == "") {
					if (oEvent.getSource().getParent().getTable().getRows() !== undefined) {
						tableRowObject = oEvent.getSource().getParent().getTable().getRows()[index];
					}
				}
				if (oController.tableRowObject1 != undefined) {
					tableRowObject = oController.tableRowObject1;
				}
				// Map it to the array
				if (selectedRowData.PSTYPE === "9") {
					this.mapStr(selectedRowData, tableRowObject, str, 'Service');
				} else {
					this.mapStr(selectedRowData, tableRowObject, str, 'Material');
				}
			} else {
				jsonArray = [];
			}
		},
		//greesh start
		getSelectedData2: function (oEvent, str, aTableData) {
			// Get the Selected Row Data
			// var index = oEvent.mParameters.rowIndex;
			var index = this.getSelectedIndex(oEvent, aTableData);
			var tableRowObject = "";
			var selData = {};
			if (index >= 0) {
				var selectedRowData = aTableData[index];
				// Get the Selected Row Object
				// var tableRowObject = oEvent.getSource().getParent().getTable().getRows()[index];
				if (globalEvent !== undefined) {
					if (globalEvent.getSource().getParent === undefined) {
						// Get the table row object from the event
						if (oEvent.getSource().getParent().getTable().getRows() !== undefined) {
							tableRowObject = oEvent.getSource().getParent().getTable().getRows()[index];
						}
					} else {
						var tableRowObject = globalEvent.getSource().getParent();
					}
				}
				// If table Row Object is not set, then get the table row object from the event
				if (tableRowObject == "") {
					if (oEvent.getSource().getParent().getTable().getRows() !== undefined) {
						tableRowObject = oEvent.getSource().getParent().getTable().getRows()[index];
					}
				}
				if (oController.tableRowObject2 != undefined) {
					tableRowObject = oController.tableRowObject2;
				}
				// Map it to the array
				if (selectedRowData.PSTYPE === "9") {
					this.mapThreStr(selectedRowData, tableRowObject, str, 'Service');
				} else {
					this.mapThreStr(selectedRowData, tableRowObject, str, 'Material');
				}
			} else {
				jsonArrayfinal2 = [];
			}
		},
		//greesh end
		getSelectedIndex: function (oEvent, aTableData) {
			var sPONumber, sItemNumber, oContext;
			if (!oEvent.getParameters().rowContext) {
				return -1;
			}
			var selectedIndices = oEvent.getParameters().rowIndices[0];
			var sTableID = oEvent.getParameters().id.split("--").pop();
			oContext = oController.getView().byId(sTableID).getContextByIndex(selectedIndices).getObject();

			sPONumber = oContext.PONUMBER;
			sItemNumber = oContext.ITEMNO;

			// sPONumber = oEvent.getParameters().rowContext.sPath.split("'")[1];
			// sItemNumber = oEvent.getParameters().rowContext.sPath.split("'")[3];
			for (var i in aTableData) {
				if (aTableData[i].PONUMBER === sPONumber && aTableData[i].ITEMNO === sItemNumber) {
					return parseInt(i);
				}
			}
		},

		populateGlobalArrayThre: function (str, mode) {
			if (str.TOTALWORKCOMPLTODATE !== undefined ||
				str.TOTALWORKCOMPLPERCENT !== undefined) {

				// Mode - 1, Push, Mode - 2, Pop
				var filter = {};
				filter.PONUMBER = str.PONUMBER;
				filter.LINEITEM = str.LINEITEM;
				if (mode == 1) {
					if (jsonArrayfinal2.length > 0) {
						jsonArrayfinal2 = jsonArrayfinal2.filter(function (jsonArrayfinal2) {
							return jsonArrayfinal2.PONUMBER !== filter.PONUMBER ||
								jsonArrayfinal2.LINEITEM !== filter.LINEITEM;
						});

						jsonArrayfinal2.push(str);
					} else {
						jsonArrayfinal2.push(str);
					}
				} else {
					for (var k in jsonArrayfinal2) {
						jsonArrayfinal2 = jsonArrayfinal2.filter(item => {
							for (let key in filter) {
								if (item[key] === undefined || item[key] != filter[key])
									return true;
							}
							return false;
						});

					}
				}
			}

		},

		populateGlobalArray: function (str, mode) {
			if (str.TOTALWORKCOMPLTODATE !== undefined ||
				str.TOTALWORKCOMPLPERCENT !== undefined) {

				// Mode - 1, Push, Mode - 2, Pop
				var filter = {};
				filter.PONUMBER = str.PONUMBER;
				filter.LINEITEM = str.LINEITEM;
				if (mode == 1) {
					if (jsonArray.length > 0) {
						// for (var k in jsonArray) {
						// 	jsonArray = jsonArray.filter(item => {
						// 		for (let key in filter) {
						// 			if (item[key] === undefined || item[key] != filter[key])
						// 				return true;
						// 		}
						// 		return false;
						// 	});
						// }
						jsonArray = jsonArray.filter(function (jsonArray) {
							return jsonArray.PONUMBER !== filter.PONUMBER ||
								jsonArray.LINEITEM !== filter.LINEITEM;
						});

						jsonArray.push(str);
					} else {
						jsonArray.push(str);
					}
				} else {
					for (var k in jsonArray) {
						jsonArray = jsonArray.filter(item => {
							for (let key in filter) {
								if (item[key] === undefined || item[key] != filter[key])
									return true;
							}
							return false;
						});

					}
				}
			}

		},

		// Method will trigger on Select All
		markAllasReviewed: function (tableRow, tableRowObject, tableType) {
			var str = {};
			// Map the Table Row to str
			this.mapStr(tableRow, tableRowObject, str, tableType);
			// Push to the Global Array
			oController.populateGlobalArray(str, 1);
			oController.getView().byId("saveBtn").setEnabled(true);
		},

		//gree start
		markAllasReviewed2: function (tableRow, tableRowObject, tableType) {
			var str = {};
			// Map the Table Row to str
			this.mapThreStr(tableRow, tableRowObject, str, tableType);
			// Push to the Global Array
			oController.populateGlobalArrayThre(str, 1);
			oController.getView().byId("saveBtnThre").setEnabled(true);
		},
		onMarkAsReviewedSelect2: function (oEvent, str) {
			// Get the Selected Row Data
			var index = oEvent.getSource().getSelectedIndices();
			var sTableID = oEvent.getParameters().id.split("--").pop(),
				aTableData = [];

			if (sTableID === "thrTab") {
				aTableData = allDataThre1;
			} else if (sTableID === "MatTableBThrs") {
				aTableData = allDataThre2;
			}

			if (index.length > 0) {
				for (var j = 0; j < index.length; j++) {
					var selectedRowData = aTableData[index[j]];
					var selectedPONum, selectedItemNum;
					selectedPONum = selectedRowData.PONUMBER;
					selectedItemNum = selectedRowData.ITEMNO;
					/// Start the loop..
					var rowsLength = oEvent.getSource().getParent().getTable().getRows().length;
					var tableRowPONumber, tableRowItemNumber;
					var lv_recordFound;
					for (var i = 0; i < rowsLength; i++) {
						lv_recordFound = '';
						//var tableRowObject = oEvent.getSource().getParent().getTable().getRows()[index[j]];
						var tableRowObject = oEvent.getSource().getParent().getTable().getRows()[i];
						if (tableRowObject !== undefined) {
							if (sTableID === "MatTableBThrs") {
								for (var k = 0; k < colsMaterial.length; k++) {
									if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("poMatHBoxId2") >= 0) {
										tableRowPONumber = tableRowObject.getCells()[k].mAggregations.items[0].getText();
									} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("itemMatNos") >= 0) {
										tableRowItemNumber = tableRowObject.getCells()[k].getText();
									}
									if (tableRowPONumber === selectedPONum && tableRowItemNumber === selectedItemNum) {
										lv_recordFound = 'X';
										break;
									}
								}
							} else {
								for (var k = 0; k < cols.length; k++) {
									if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("threHbox") >= 0) {
										tableRowPONumber = tableRowObject.getCells()[k].mAggregations.items[0].getText();
									} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("itemNum") >= 0) {
										tableRowItemNumber = tableRowObject.getCells()[k].getText();
									}
									if (tableRowPONumber === selectedPONum && tableRowItemNumber === selectedItemNum) {
										lv_recordFound = 'X';
										break;
									}
								}
							}
						}
						if (tableRowPONumber === selectedPONum && tableRowItemNumber === selectedItemNum) {
							lv_recordFound = 'X';
							break;
						}
					}

					if (lv_recordFound === '') {
						tableRowObject = undefined;
					}

					// Map it to the array
					if (selectedRowData.PSTYPE === "9") {
						oController.markAllasReviewed2(selectedRowData, tableRowObject, 'Service');
					} else {
						oController.markAllasReviewed2(selectedRowData, tableRowObject, 'Material');
					}
				}
			} else {
				jsonArrayfinal2 = [];
			}
		},
		//gree end

		onMarkAsReviewedSelect: function (oEvent, str) {

			// Get the Selected Row Data
			var index = oEvent.getSource().getSelectedIndices();
			var sTableID = oEvent.getParameters().id.split("--").pop(),
				aTableData = [];
			if (sTableID === "actUponB1") {
				aTableData = allDataAct1;
			} else if (sTableID === "MatTableB") {
				aTableData = allDataAct2;
			}
			if (index.length > 0) {
				for (var j = 0; j < index.length; j++) {
					var selectedRowData = aTableData[index[j]];
					var selectedPONum, selectedItemNum;
					selectedPONum = selectedRowData.PONUMBER;
					selectedItemNum = selectedRowData.ITEMNO;
					/// Start the loop..
					var rowsLength = oEvent.getSource().getParent().getTable().getRows().length;
					var tableRowPONumber, tableRowItemNumber;
					var lv_recordFound;
					for (var i = 0; i < rowsLength; i++) {
						lv_recordFound = '';
						//var tableRowObject = oEvent.getSource().getParent().getTable().getRows()[index[j]];
						var tableRowObject = oEvent.getSource().getParent().getTable().getRows()[i];

						if (tableRowObject !== undefined) {

							if (sTableID === "MatTableB") {
								for (var k = 0; k < colsMaterial.length; k++) {
									if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("poMatHBoxId") >= 0) {
										tableRowPONumber = tableRowObject.getCells()[k].mAggregations.items[0].getText();
									} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("itemMatNo") >= 0) {
										tableRowItemNumber = tableRowObject.getCells()[k].getText();
									}
									if (tableRowPONumber === selectedPONum && tableRowItemNumber === selectedItemNum) {
										lv_recordFound = 'X';
										break;
									}
								}
							} else {
								for (var k = 0; k < cols.length; k++) {
									if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("poHBoxId") >= 0) {
										tableRowPONumber = tableRowObject.getCells()[k].mAggregations.items[0].getText();
									} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("itemNo") >= 0) {
										tableRowItemNumber = tableRowObject.getCells()[k].getText();
									}
									if (tableRowPONumber === selectedPONum && tableRowItemNumber === selectedItemNum) {
										lv_recordFound = 'X';
										break;
									}
								}
							}
						}
						if (tableRowPONumber === selectedPONum && tableRowItemNumber === selectedItemNum) {
							lv_recordFound = 'X';
							break;
						}
					}

					if (lv_recordFound === '') {
						tableRowObject = undefined;
					}

					// Map it to the array
					if (selectedRowData.PSTYPE === "9") {
						//	oController.markAllasReviewed(selectedRowData, tableRowObject, 'Service');
					} else {
						//	oController.markAllasReviewed(selectedRowData, tableRowObject, 'Material');
					}

					// Get the PO number and Item Number 
					// for (var k = 0; k < cols.length; k++) {
					// 	if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("poHBoxId") >= 0) {
					// 		var tableRowPONumber = tableRowObject.getCells()[k].mAggregations.items[0].getText();
					// 	} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("itemNo") >= 0) {
					// 		var tableRowItemNumber = tableRowObject.getCells()[k].getText();
					// 	}
					// }

					// // Map it to the array
					// if (selectedRowData[0].PSTYPE === "9") {
					// 	oController.markAllasReviewed(selectedRowData[0], tableRowObject, 'Service');
					// } else {
					// 	oController.markAllasReviewed(selectedRowData, tableRowObject, 'Material');
					// }
				}
			} else {
				jsonArray = [];
			}

		},

		getDeSelectedIndex: function (oEvent, aTableData, deSelectIndex) {
			var sPONumber, sItemNumber, oContext;
			if (!oEvent.getParameters().rowContext) {
				return -1;
			}
			// var selectedIndices = oEvent.getParameters().rowIndices[0];
			var sTableID = oEvent.getParameters().id.split("--").pop();
			oContext = oController.getView().byId(sTableID).getContextByIndex(deSelectIndex).getObject();

			sPONumber = oContext.PONUMBER;
			sItemNumber = oContext.ITEMNO;

			// sPONumber = oEvent.getParameters().rowContext.sPath.split("'")[1];
			// sItemNumber = oEvent.getParameters().rowContext.sPath.split("'")[3];
			for (var i in aTableData) {
				if (aTableData[i].PONUMBER === sPONumber && aTableData[i].ITEMNO === sItemNumber) {
					return parseInt(i);
				}
			}
		},
		getAllServiceTableRecords: function (oEvent) {
			oController.defActS = $.Deferred();
			sap.ui.core.BusyIndicator.show(0);
			var oModelID = oController.getOwnerComponent().getModel("allPO");
			var skip = 0;
			var totalRecords = oEvent.getSource().getSelectedIndices().length;
			var allDataAct1_markAll = [];
			for (var i = 0; i <= totalRecords / 1000; i++) {
				skip = i * 1000;
				oModelID.read("/openPOParameters(IP_PSTYPE='9',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results", {
					async: false,
					urlParameters: {
						"$inlinecount": "allpages",
						"$skip": skip,
						"$top": 1000
					},
					success: function (oData, Response) {
						var aReceivedData = oData;
						if (aReceivedData.results !== undefined) {
							allDataAct1_markAll = allDataAct1_markAll.concat(aReceivedData.results);
							allDataAct1_markAll = allDataAct1_markAll.filter((arr, index, self) => index === self.findIndex((t) =>
								(t.PONUMBER === arr.PONUMBER && t.ITEMNO === arr.ITEMNO)));
							// Below loop is required for marking the PSTYPE as Service
							for (var j = 0; j < allDataAct1_markAll.length; j++) {
								allDataAct1_markAll[j].PSTYPE = '9';
							}
						}
						if (allDataAct1_markAll.length == totalRecords) {
							allDataAct1 = allDataAct1_markAll;
							oController.defActS.resolve();
						}
					},
					error: function (response) {
						common.displayErrorMessage(oController);
						oController.defActS.resolve();

					}
				});
			}

		},
		getAllMaterialTableRecords: function (oEvent) {
			sap.ui.core.BusyIndicator.show(0);
			oController.defActM = $.Deferred();
			var oModelID = oController.getOwnerComponent().getModel("allPO");
			var skip = 0;
			var totalRecords = oEvent.getSource().getSelectedIndices().length;
			var allDataAct2_markAll = [];
			for (var i = 0; i <= totalRecords / 1000; i++) {
				skip = i * 1000;
				oModelID.read("/openPOParameters(IP_PSTYPE='0',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results", {
					async: false,
					urlParameters: {
						"$inlinecount": "allpages",
						"$skip": skip,
						"$top": 1000
					},
					success: function (oData, Response) {
						var aReceivedData = oData;
						if (aReceivedData.results !== undefined) {
							allDataAct2_markAll = allDataAct2_markAll.concat(aReceivedData.results);
							allDataAct2_markAll = allDataAct2_markAll.filter((arr, index, self) => index === self.findIndex((t) =>
								(t.PONUMBER === arr.PONUMBER && t.ITEMNO === arr.ITEMNO)));
							// Below loop is required for marking the PSTYPE as Service
							for (var j = 0; j < allDataAct2_markAll.length; j++) {
								allDataAct2_markAll[j].PSTYPE = '0';
							}
						}
						if (allDataAct2_markAll.length == totalRecords) {
							allDataAct2 = allDataAct2_markAll;
							oController.defActM.resolve();
						}
					},
					error: function (response) {
						common.displayErrorMessage(oController);
						oController.defActM.resolve();
					}
				});
			}

		},

		//gree start
		onSelection: function (oEvent) {
			var str = {};
			var selectAll = oEvent.getParameter("selectAll");
			var sTableID = oEvent.getParameters().id.split("--").pop(),
				aTableData = [];

			// Added SUZ9125
			var matTableFlag = false;
			// End SUZ9125

			if (sTableID === "thrTab") {
				aTableData = allDataThre1; //ta allDataAct1;
			} else if (sTableID === "MatTableBThrs") {
				aTableData = allDataThre2;
				matTableFlag = true; // Added SUZ9125
			}
			// Begin of SUZ9125
			var deselectFlag = false;

			if (matTableFlag === true) {
				// matTable deselect check

				if (rowSelectionMaterial.length === 0) {

					if (sTableID === "thrTab") {
						var selectIndices = oEvent.getSource().getParent().getItems()[1].getSelectedIndices();
					} else if (sTableID === "MatTableBThrs") {
						var selectIndices = oEvent.getSource().getParent().getItems()[1].getSelectedIndices();
					}

					let esCopy = JSON.parse(JSON.stringify(selectIndices));
					rowSelectionMaterial = esCopy;
				} else {
					if (sTableID === "thrTab") {
						var selectIndices = oEvent.getSource().getParent().getItems()[1].getSelectedIndices();
					} else if (sTableID === "MatTableBThrs") {
						var selectIndices = oEvent.getSource().getParent().getItems()[1].getSelectedIndices();
					}

					if (rowSelectionMaterial.length > selectIndices.length) {
						// Deselect the rows
						deselectFlag = true;
						var rowSelectionFlag = false;
						var deSelectIndex;
						for (var i = 0; i < rowSelectionMaterial.length; i++) {

							for (var j = 0; j < selectIndices.length; j++) {

								if (rowSelectionMaterial[i] === selectIndices[j]) {
									rowSelectionFlag = true;
									break;
								}
							}

							if (rowSelectionFlag === false) {
								deSelectIndex = rowSelectionMaterial[i];
								break;
							} else {
								rowSelectionFlag = false;
							}
						}

						let esCopy = JSON.parse(JSON.stringify(selectIndices));
						rowSelectionMaterial = esCopy;

					} else {
						let esCopy = JSON.parse(JSON.stringify(selectIndices));
						rowSelectionMaterial = esCopy;
					}

				}

			} else {
				// thrTab table deselect check

				if (rowSelection.length === 0) {

					if (sTableID === "thrTab") {
						var selectIndices = oEvent.getSource().getParent().getItems()[0].getSelectedIndices();
					} else if (sTableID === "MatTableBThrs") {
						var selectIndices = oEvent.getSource().getParent().getItems()[1].getSelectedIndices();
					}

					let esCopy = JSON.parse(JSON.stringify(selectIndices));
					rowSelection = esCopy;
				} else {
					if (sTableID === "thrTab") {
						var selectIndices = oEvent.getSource().getParent().getItems()[0].getSelectedIndices();
					} else if (sTableID === "MatTableBThrs") {
						var selectIndices = oEvent.getSource().getParent().getItems()[1].getSelectedIndices();
					}

					if (rowSelection.length > selectIndices.length) {
						// Deselect the rows
						deselectFlag = true;
						var rowSelectionFlag = false;
						var deSelectIndex;
						for (var i = 0; i < rowSelection.length; i++) {

							for (var j = 0; j < selectIndices.length; j++) {

								if (rowSelection[i] === selectIndices[j]) {
									rowSelectionFlag = true;
									break;
								}
							}

							if (rowSelectionFlag === false) {
								deSelectIndex = rowSelection[i];
								break;
							} else {
								rowSelectionFlag = false;
							}
						}

						let esCopy = JSON.parse(JSON.stringify(selectIndices));
						rowSelection = esCopy;

					} else {
						let esCopy = JSON.parse(JSON.stringify(selectIndices));
						rowSelection = esCopy;
					}

				}
			}
			oController.Event = oEvent;
			oController.str = str;

			// END of SUZ9125

			// if (selectAll === true || oEvent.getSource().getSelectedIndices().length === aTableData.length) {
			// this.onMarkAsReviewedSelect2(oEvent, str);
			// Below code will be called during deselect
			// }else if (oEvent.getSource().mProperties.selectedIndex === -1) { // Commented SUZ9125
			if (selectAll === true) {
				// jsonArrayfinal2 = [];
				// if (oEvent.getSource().getSelectedIndices().length === aTableData.length) {
				// this.onMarkAsReviewedSelect2(oEvent, str);
				// } else {
				// Logic to get all the records
				if (sTableID === "thrTab") {
					allDataThre1 = this.getAllServiceTableRecordsThr(oEvent);
				} else {
					allDataThre2 = this.getAllMaterialTableRecordsThr(oEvent);
				}
				if (sTableID === "thrTab") {
					$.when(oController.defThhIS).done(function () {
						var ThreCount = 0;
						for (i = 0; i < allDataThre1.length; i++) {
							if (allDataThre1[i].POCLOSURE_FLAG == 1) {
								ThreCount = ThreCount + 1;
							}
						}
						if (ThreCount == allDataThre1.length) {
							var sMessage = oController.geti18nText("CheckBoxNotSelected");
							MessageBox.information(sMessage);
							selectAll = false;
							oController.getView().byId("saveBtn").setEnabled(false);
							var oHistoryTable3 = oController.getView().byId("SmartTableBthreshold");
							oHistoryTable3.rebindTable(true);
							var oHistoryTable4 = oController.getView().byId("SmartTableThres2");
							oHistoryTable4.rebindTable(true);
							sap.ui.core.BusyIndicator.hide();
							return;
						}
						// ********Select All Bug Fix************
						// var jsonArrayThreTemp = [];
						// var allDataAct1ThreTemp = [],
						// 	iPONumberIndex;
						// for (var i in allDataThre1) {
						// 	allDataAct1ThreTemp.push(allDataThre1[i]);
						// }
						// for (i = 0; i < allDataThre1.length; i++) {
						// 	for (j = 0; j < jsonArrayfinal2.length; j++) {
						// 		if (allDataThre1[i].PONUMBER === jsonArrayfinal2[j].PONUMBER && allDataThre1[i].ITEMNO === jsonArrayfinal2[j].LINEITEM) {
						// 			iPONumberIndex = allDataAct1ThreTemp.indexOf(allDataThre1[i]);
						// 			allDataAct1ThreTemp.splice(iPONumberIndex, 1);

						// 		}
						// 	}
						// }
						// for (i = 0; i < allDataAct1ThreTemp.length; i++) {

						// 	if (allDataAct1ThreTemp[i].POCLOSURE_FLAG == 0) {
						// 		var obj = {};
						// 		if (allDataAct1ThreTemp[i].ACCRUALMETHOD == "Straight Line") {
						// 			obj.allDataAct1ThreTemp = "STL"
						// 		} else if (allDataThre1[i].ACCRUALMETHOD == "Work To Date") {
						// 			obj.ACCRUALMETHOD = "WTD"
						// 		}

						// 		obj.AMOUNT_ACCURED = allDataAct1ThreTemp[i].AMOUNTACCRUED;
						// 		obj.EMAILID = allDataAct1ThreTemp[i].PO_PREPARER;
						// 		obj.LINEITEM = allDataAct1ThreTemp[i].ITEMNO;
						// 		obj.MARKASREVIEWED = "X";
						// 		obj.PONUMBER = allDataAct1ThreTemp[i].PONUMBER;
						// 		obj.PO_CLOSURE = allDataAct1ThreTemp[i].PO_CLOSURE;
						// 		obj.REVIWED_BY = emailId;
						// 		obj.STATUS = "Reviewed";
						// 		if (allDataAct1ThreTemp[i].STRAIGHTLINEMTHD == "false") {
						// 			obj.STRAIGHTLINEMTHD = "";
						// 		} else if (allDataAct1ThreTemp[i].STRAIGHTLINEMTHD == "true") {
						// 			obj.STRAIGHTLINEMTHD = "X";
						// 		}
						// 		obj.TOTALWORKCOMPLPERCENT = allDataAct1ThreTemp[i].TOTWRKCOMPPER;
						// 		obj.TOTALWORKCOMPLTODATE = allDataAct1ThreTemp[i].TOTWRKCOMPAMT;
						// 		obj.WORKCOMPLASTMONTHAMT = allDataAct1ThreTemp[i].TOTWRKCOMPAMT_COCDECURR;
						// 		obj.WORKCOMPLASTMONTHCURR = allDataAct1ThreTemp[i].POCURRENCY;
						// 		obj.WORK_ENDDATE = allDataAct1ThreTemp[i].WRKENDDATE;
						// 		obj.WORK_STARTDATE = allDataAct1ThreTemp[i].WRKSTRTDATE;
						// 		jsonArrayThreTemp.push(obj);
						// 	}
						// }
						// for (var i in jsonArrayThreTemp) {
						// 	jsonArrayfinal2.push(jsonArrayThreTemp[i]);
						// }
						// ************************
						for (i = 0; i < allDataThre1.length; i++) {

							if (allDataThre1[i].POCLOSURE_FLAG == 0) {
								var obj = {};
								if (allDataThre1[i].ACCRUALMETHOD == "Straight Line") {
									obj.ACCRUALMETHOD = "STL"
								} else if (allDataThre1[i].ACCRUALMETHOD == "Work To Date") {
									obj.ACCRUALMETHOD = "WTD"
								}

								obj.AMOUNT_ACCURED = allDataThre1[i].AMOUNTACCRUED;
								obj.EMAILID = allDataThre1[i].PO_PREPARER;
								obj.LINEITEM = allDataThre1[i].ITEMNO;
								obj.MARKASREVIEWED = "X";
								obj.PONUMBER = allDataThre1[i].PONUMBER;
								obj.PO_CLOSURE = allDataThre1[i].PO_CLOSURE;
								obj.REVIWED_BY = emailId;
								obj.STATUS = "Reviewed";
								if (allDataThre1[i].STRAIGHTLINEMTHD == "false") {
									obj.STRAIGHTLINEMTHD = "";
								} else if (allDataThre1[i].STRAIGHTLINEMTHD == "true") {
									obj.STRAIGHTLINEMTHD = "X";
								}
								obj.TOTALWORKCOMPLPERCENT = allDataThre1[i].TOTWRKCOMPPER;
								obj.TOTALWORKCOMPLTODATE = allDataThre1[i].TOTWRKCOMPAMT;
								obj.WORKCOMPLASTMONTHAMT = allDataThre1[i].TOTWRKCOMPAMT_COCDECURR;
								obj.WORKCOMPLASTMONTHCURR = allDataThre1[i].POCURRENCY;
								obj.WORK_ENDDATE = allDataThre1[i].WRKENDDATE;
								obj.WORK_STARTDATE = allDataThre1[i].WRKSTRTDATE;
								jsonArrayfinal2.push(obj);
							}
						}
						if (jsonArrayfinal2.length > 0) {
							oController.getView().byId("saveBtnThre").setEnabled(true);
						} else {
							oController.getView().byId("saveBtnThre").setEnabled(false);
						}
						sap.ui.core.BusyIndicator.hide();
					});
				} else if (sTableID === "MatTableBThrs") {
					$.when(oController.defThhM).done(function () {
						var Thre2Count = 0;
						for (i = 0; i < allDataThre2.length; i++) {
							if (allDataThre2[i].POCLOSURE_FLAG == 1) {
								Thre2Count = Thre2Count + 1;
							}
						}
						if (Thre2Count == allDataThre2.length) {
							var sMessage = oController.geti18nText("CheckBoxNotSelected");
							MessageBox.information(sMessage);
							selectAll = false;
							oController.getView().byId("saveBtn").setEnabled(false);
							var oHistoryTable3 = oController.getView().byId("SmartTableBthreshold");
							oHistoryTable3.rebindTable(true);
							var oHistoryTable4 = oController.getView().byId("SmartTableThres2");
							oHistoryTable4.rebindTable(true);
							sap.ui.core.BusyIndicator.hide();
							return;
						}
						for (i = 0; i < allDataThre2.length; i++) {
							/* var oContext = oController.getView().byId("SmartTableBactUpon2").getTable().getContextByIndex(
							selectedIndices1[i]).getObject();*/
							if (allDataThre2[i].POCLOSURE_FLAG == 0) {
								var obj = {};
								if (allDataThre2[i].ACCRUALMETHOD == "Straight Line") {
									obj.ACCRUALMETHOD = "STL"
								} else if (allDataThre2[i].ACCRUALMETHOD == "Work To Date") {
									obj.ACCRUALMETHOD = "WTD"
								} else {
									obj.ACCRUALMETHOD = "WTD";
								}
								obj.AMOUNT_ACCURED = allDataThre2[i].AMOUNTACCRUED;
								obj.EMAILID = allDataThre2[i].PO_PREPARER;
								//obj.INVVALUE = allDataAct2[i].INVVALUE;
								obj.LINEITEM = allDataThre2[i].ITEMNO;
								obj.MARKASREVIEWED = "X"
								obj.PONUMBER = allDataThre2[i].PONUMBER;
								obj.PO_CLOSURE = allDataThre2[i].PO_CLOSURE;
								obj.REVIWED_BY = emailId;
								obj.STATUS = "Reviewed";
								if (allDataThre2[i].STRAIGHTLINEMTHD == "false") {
									obj.STRAIGHTLINEMTHD = "";
								} else if (allDataThre2[i].STRAIGHTLINEMTHD == "true") {
									obj.STRAIGHTLINEMTHD = "X";
								} else {
									obj.STRAIGHTLINEMTHD = "";
								}
								obj.TOTALWORKCOMPLPERCENT = allDataThre2[i].TOTWRKCOMPPER;
								// obj.TOTALWORKCOMPLTODATE = allDataAct2[i].GRVALUE;
								//obj.WORKCOMPLASTMONTHAMT = allDataAct2[i].TOTWRKCOMPAMT_COCDECURR;
								obj.WORKCOMPLASTMONTHCURR = allDataThre2[i].POCURRENCY;
								//obj.WORK_ENDDATE = allDataAct2[i].WRKENDDATE;
								//obj.WORK_STARTDATE = allDataAct2[i].WRKSTRTDATE;
								jsonArrayfinal2.push(obj);
							}
						}
						/*	var oEvent = oController.Event;
							var str = oController.str;*/
						//	oController.onMarkAsReviewedSelect2(oEvent, str);
						// }
						// Below code will be called during deselect
						// } else if (oEvent.mParameters.rowIndex === -1) {
						// }else if (oEvent.getSource().mProperties.selectedIndex === -1) { // Commented SUZ9125
						if (jsonArrayfinal2.length > 0) {
							oController.getView().byId("saveBtnThre").setEnabled(true);
						} else {
							oController.getView().byId("saveBtnThre").setEnabled(false);
						}
						sap.ui.core.BusyIndicator.hide();

					});
				}

			} else if (deselectFlag === true) { // Added SUZ9125
				// for(var i in oEvent.mParameters.rowIndices){
				// var removeIndex = oEvent.mParameters.rowIndices[i];
				if (oEvent.mParameters.rowIndices.length === 1) {
					// var removeIndex = this.getSelectedIndex(oEvent, aTableData); // Comented SUZ9125
					var removeIndex = this.getDeSelectedIndex(oEvent, aTableData, deSelectIndex); // Added SUZ9125
					if (removeIndex === -1) {
						return;
					}
					var remSelectedRowData = aTableData[removeIndex];
					jsonArrayfinal2 = jsonArrayfinal2.filter(function (jsonArrayfinal2) {
						return jsonArrayfinal2.PONUMBER !== remSelectedRowData.PONUMBER ||
							jsonArrayfinal2.LINEITEM !== remSelectedRowData.ITEMNO;
					});
				}
				// Mark as Reviwed button will be disabled when there are no selected records
				if (!jsonArrayfinal2.length || oEvent.mParameters.rowIndices.length > 1) {
					jsonArrayfinal2 = []
					oController.getView().byId("saveBtnThre").setEnabled(false);
					// oController.getView().byId("notifyBtnTBS").setEnabled(false);
				}

			} else {
				if (sTableID === "thrTab") {
					for (var i = 0; i < oEvent.getSource().mAggregations.rows[0].mAggregations.cells.length; i++) {
						if (oEvent.getSource().mAggregations.rows[0].mAggregations.cells[i].sId.split("-")[2] === "threPOClosureCheckBox") {
							var Index1 = i;
						}
					}
					var rowsLength = oEvent.getSource().getParent().getTable().getRows().length;
					var gettingInternalTable = oEvent.getSource().getParent().getTable("thrTab"),
						//gettingAllRows = gettingInternalTable.getRows(),
						oSelIndices = gettingInternalTable.getSelectedIndices(),
						selIndex = oEvent.getSource().getSelectedIndex();
					//oSelIndices will have index of the rows
					for (var i = 0; i < oSelIndices.length; i++) {
						if (selIndex == oSelIndices[i]) {
							var lv_selIndex = oSelIndices[i];
						}
					}
					if (typeof lv_selIndex !== 'undefined') { // NOD6247 -19/01/23
						var tableRowPONumber = gettingInternalTable.getContextByIndex(lv_selIndex).getProperty("PONUMBER");
						var tableRowItemNumber = gettingInternalTable.getContextByIndex(lv_selIndex).getProperty("ITEMNO");
						var POClosure = gettingInternalTable.getContextByIndex(lv_selIndex).getProperty("POCLOSURE_FLAG")
						var POClosureLoc = gettingInternalTable.getContextByIndex(lv_selIndex).getProperty("POCLOSURE_FLAG_LOCAL");
						if (POClosure == 1) {
							if (POClosureLoc == true) {
								oController.getView().byId("saveBtnThre").setEnabled(true);
								oController.getSelectedData2(oEvent, str, aTableData);
								oController.populateGlobalArrayThre(str, 1);
								return;
							}
							var sMessage = oController.geti18nText("CheckBoxNotSelected");
							MessageBox.information(sMessage);
							this.getView().byId('SmartTableBthreshold').getTable().removeSelectionInterval(selIndex, selIndex);
							return;
						}
					}
				} else if (sTableID === "MatTableBThrs") {
					for (var i = 0; i < oEvent.getSource().mAggregations.rows[0].mAggregations.cells.length; i++) {
						if (oEvent.getSource().mAggregations.rows[0].mAggregations.cells[i].sId.split("-")[2] === "totalPOClosureMater") {
							var Index1 = i;
						}
					}
					var rowsLength = oEvent.getSource().getParent().getTable().getRows().length;
					var gettingInternalTable = oEvent.getSource().getParent().getTable("MatTableBThrs"),
						//gettingAllRows = gettingInternalTable.getRows(),
						oSelIndices = gettingInternalTable.getSelectedIndices(),
						selIndex = oEvent.getSource().getSelectedIndex();
					//oSelIndices will have index of the rows
					for (var i = 0; i < oSelIndices.length; i++) {
						if (selIndex == oSelIndices[i]) {
							var lv_selIndex = oSelIndices[i];
						}
					}
					if (typeof lv_selIndex !== 'undefined') { // NOD6247 -19/01/23
						var tableRowPONumber = gettingInternalTable.getContextByIndex(lv_selIndex).getProperty("PONUMBER");
						var tableRowItemNumber = gettingInternalTable.getContextByIndex(lv_selIndex).getProperty("ITEMNO");
						var POClosure = gettingInternalTable.getContextByIndex(lv_selIndex).getProperty("POCLOSURE_FLAG")
						var POClosureLoc = gettingInternalTable.getContextByIndex(lv_selIndex).getProperty("POCLOSURE_FLAG_LOCAL");
						if (POClosure == 1) {
							if (POClosureLoc == true) {
								oController.getView().byId("saveBtnThre").setEnabled(true);
								oController.getSelectedData2(oEvent, str, aTableData);
								oController.populateGlobalArrayThre(str, 1);
								return;
							}
							var sMessage = oController.geti18nText("CheckBoxNotSelected");
							MessageBox.information(sMessage);
							this.getView().byId('SmartTableThres2').getTable().removeSelectionInterval(selIndex, selIndex);
							return;
						}
					}
				}
				count++;
				oController.getView().byId("saveBtnThre").setEnabled(true);
				// oController.getView().byId("notifyBtnTBS").setEnabled(true);
				oController.getSelectedData2(oEvent, str, aTableData); //greesh
				// Push to the Global Variable JSONARRAY
				oController.populateGlobalArrayThre(str, 1);
				// if (oEvent.getSource().mProperties.selectedIndex === -1) { // Commented SUZ9125
				if (deselectFlag === true) { // Added SUZ9125
					// var removeIndex = this.getSelectedIndex(oEvent, aTableData); // Commented SUZ9125
					var removeIndex = this.getDeSelectedIndex(oEvent, aTableData, deSelectIndex); // Added SUZ9125

					var remSelectedRowData = aTableData[removeIndex];
					jsonArrayfinal2 = jsonArrayfinal2.filter(function (jsonArrayfinal2) {
						return jsonArrayfinal2.PONUMBER !== remSelectedRowData.PONUMBER ||
							jsonArrayfinal2.LINEITEM !== remSelectedRowData.ITEMNO;
					});
				}
			}
			// MVP2 changes Start of Code
			if (jsonArrayfinal2.length > 0) {
				oController.getView().byId("recordThre").setVisible(true);
				oController.getView().byId("recordMater").setVisible(true);
			} else {
				oController.getView().byId("recordThre").setVisible(false);
				oController.getView().byId("recordMater").setVisible(false);
			}
			// MVP2 changes End of Code
			//console.log(jsonArrayfinal2);
		},
		//gree end

		// Method will trigger on Selection of a row
		onSelectReview: function (oEvent) {

			var str = {};
			var selectAll = oEvent.getParameter("selectAll");
			var sTableID = oEvent.getParameters().id.split("--").pop(),
				aTableData = [];

			// Added SUZ9125
			var matTableFlag = false;
			// End SUZ9125
			if (sTableID === "actUponB1") {
				aTableData = allDataAct1;
			} else if (sTableID === "MatTableB") {
				aTableData = allDataAct2;
				matTableFlag = true; // Added SUZ9125
			};

			// Begin of SUZ9125
			var deselectFlag = false;

			if (matTableFlag === true) {
				// matTable deselect check

				if (rowSelectionMaterial.length === 0) {

					if (sTableID === "actUponB1") {
						var selectIndices = oEvent.getSource().getParent().getItems()[0].getSelectedIndices();
					} else if (sTableID === "MatTableB") {
						var selectIndices = oEvent.getSource().getParent().getItems()[1].getSelectedIndices();
					}

					let esCopy = JSON.parse(JSON.stringify(selectIndices));
					rowSelectionMaterial = esCopy;
				} else {
					if (sTableID === "actUponB1") {
						var selectIndices = oEvent.getSource().getParent().getItems()[0].getSelectedIndices();
					} else if (sTableID === "MatTableB") {
						var selectIndices = oEvent.getSource().getParent().getItems()[1].getSelectedIndices();
					}

					if (rowSelectionMaterial.length > selectIndices.length) {
						// Deselect the rows
						deselectFlag = true;
						var rowSelectionFlag = false;
						var deSelectIndex;
						for (var i = 0; i < rowSelectionMaterial.length; i++) {

							for (var j = 0; j < selectIndices.length; j++) {

								if (rowSelectionMaterial[i] === selectIndices[j]) {
									rowSelectionFlag = true;
									break;
								}
							}

							if (rowSelectionFlag === false) {
								deSelectIndex = rowSelectionMaterial[i];
								break;
							} else {
								rowSelectionFlag = false;
							}
						}

						let esCopy = JSON.parse(JSON.stringify(selectIndices));
						rowSelectionMaterial = esCopy;

					} else {
						let esCopy = JSON.parse(JSON.stringify(selectIndices));
						rowSelectionMaterial = esCopy;
					}

				}

			} else {
				// actUponB1 table deselect check

				if (rowSelection.length === 0) {

					if (sTableID === "actUponB1") {
						var selectIndices = oEvent.getSource().getParent().getItems()[0].getSelectedIndices();
					} else if (sTableID === "MatTableB") {
						var selectIndices = oEvent.getSource().getParent().getItems()[1].getSelectedIndices();
					}

					let esCopy = JSON.parse(JSON.stringify(selectIndices));
					rowSelection = esCopy;
				} else {
					if (sTableID === "actUponB1") {
						var selectIndices = oEvent.getSource().getParent().getItems()[0].getSelectedIndices();
					} else if (sTableID === "MatTableB") {
						var selectIndices = oEvent.getSource().getParent().getItems()[1].getSelectedIndices();
					}

					if (rowSelection.length > selectIndices.length) {
						// Deselect the rows
						deselectFlag = true;
						var rowSelectionFlag = false;
						var deSelectIndex;
						for (var i = 0; i < rowSelection.length; i++) {

							for (var j = 0; j < selectIndices.length; j++) {

								if (rowSelection[i] === selectIndices[j]) {
									rowSelectionFlag = true;
									break;
								}
							}

							if (rowSelectionFlag === false) {
								deSelectIndex = rowSelection[i];
								break;
							} else {
								rowSelectionFlag = false;
							}
						}

						let esCopy = JSON.parse(JSON.stringify(selectIndices));
						rowSelection = esCopy;

					} else {
						let esCopy = JSON.parse(JSON.stringify(selectIndices));
						rowSelection = esCopy;
					}

				}
			}

			// END of SUZ9125
			/*if (selectAll == true) {
																					var SelArr = [];
																					sap.ui.core.BusyIndicator.show(0);
			

																					if (jsonArray.length > 0) {
																						oController.getView().byId("saveBtn").setEnabled(true);
																					}
																					sap.ui.core.BusyIndicator.hide();
																				}*/
			if (selectAll === true) {
				// jsonArray = [];
				//sap.ui.core.BusyIndicator.show(0);
				/*	if (oEvent.getSource().getSelectedIndices().length === aTableData.length) {
						this.onMarkAsReviewedSelect(oEvent, str);
					} else {*/
				// Logic to get all the records 
				if (sTableID === "actUponB1") {
					oController.getAllServiceTableRecords(oEvent);
				} else {
					oController.getAllMaterialTableRecords(oEvent);
				}
				if (sTableID === "actUponB1") {
					$.when(oController.defActS).done(function () {
						var Act1Count = 0;
						for (i = 0; i < allDataAct1.length; i++) {

							if (allDataAct1[i].POCLOSURE_FLAG == 1) {
								Act1Count = Act1Count + 1;
							}
						}
						if (Act1Count == allDataAct1.length) {
							var sMessage = oController.geti18nText("CheckBoxNotSelected");
							MessageBox.information(sMessage);
							selectAll = false;
							oController.getView().byId("saveBtn").setEnabled(false);
							var oHistoryTable = oController.getView().byId("SmartTableBactUpon1");
							oHistoryTable.rebindTable(true);
							var oHistoryTable2 = oController.getView().byId("SmartTableBactUpon2");
							oHistoryTable2.rebindTable(true);
							sap.ui.core.BusyIndicator.hide();
							return;
						}
						// ********Select All Bug Fix************
						// var jsonArrayTemp = [];
						// var allDataAct1Temp = [],
						// 	iPONumberIndex;
						// for (var i in allDataAct1) {
						// 	allDataAct1Temp.push(allDataAct1[i]);
						// }
						// for (i = 0; i < allDataAct1.length; i++) {
						// 	for (j = 0; j < jsonArray.length; j++) {
						// 		if (allDataAct1[i].PONUMBER === jsonArray[j].PONUMBER && allDataAct1[i].ITEMNO === jsonArray[j].LINEITEM) {
						// 			iPONumberIndex = allDataAct1Temp.indexOf(allDataAct1[i]);
						// 			allDataAct1Temp.splice(iPONumberIndex, 1);

						// 		}
						// 	}
						// }
						// for (i = 0; i < allDataAct1Temp.length; i++) {

						// 	if (allDataAct1Temp[i].POCLOSURE_FLAG == 0) {
						// 		var obj = {};
						// 		if (allDataAct1Temp[i].ACCRUALMETHOD == "Straight Line") {
						// 			obj.ACCRUALMETHOD = "STL"
						// 		} else if (allDataAct1Temp[i].ACCRUALMETHOD == "Work To Date") {
						// 			obj.ACCRUALMETHOD = "WTD"
						// 		}

						// 		obj.AMOUNT_ACCURED = allDataAct1Temp[i].AMOUNTACCRUED;
						// 		allDataAct1Temp
						// 		obj.EMAILID = allDataAct1Temp[i].PO_PREPARER;
						// 		obj.LINEITEM = allDataAct1Temp[i].ITEMNO;
						// 		obj.MARKASREVIEWED = "X";
						// 		obj.PONUMBER = allDataAct1Temp[i].PONUMBER;
						// 		obj.PO_CLOSURE = allDataAct1Temp[i].PO_CLOSURE;
						// 		obj.REVIWED_BY = emailId;
						// 		obj.STATUS = "Reviewed";
						// 		if (allDataAct1Temp[i].STRAIGHTLINEMTHD == "false") {
						// 			obj.STRAIGHTLINEMTHD = "";
						// 		} else if (allDataAct1Temp[i].STRAIGHTLINEMTHD == "true") {
						// 			obj.STRAIGHTLINEMTHD = "X";
						// 		}
						// 		obj.TOTALWORKCOMPLPERCENT = allDataAct1Temp[i].TOTWRKCOMPPER;
						// 		obj.TOTALWORKCOMPLTODATE = allDataAct1Temp[i].TOTWRKCOMPAMT;
						// 		obj.WORKCOMPLASTMONTHAMT = allDataAct1Temp[i].TOTWRKCOMPAMT_COCDECURR;
						// 		obj.WORKCOMPLASTMONTHCURR = allDataAct1Temp[i].POCURRENCY;
						// 		obj.WORK_ENDDATE = allDataAct1Temp[i].WRKENDDATE;
						// 		obj.WORK_STARTDATE = allDataAct1Temp[i].WRKSTRTDATE;
						// 		jsonArrayTemp.push(obj);
						// 	}
						// }
						// for (var i in jsonArrayTemp) {
						// 	jsonArray.push(jsonArrayTemp[i]);
						// }
						// ******************************************
						for (i = 0; i < allDataAct1.length; i++) {

							if (allDataAct1[i].POCLOSURE_FLAG == 0) {
								var obj = {};
								if (allDataAct1[i].ACCRUALMETHOD == "Straight Line") {
									obj.ACCRUALMETHOD = "STL"
								} else if (allDataAct1[i].ACCRUALMETHOD == "Work To Date") {
									obj.ACCRUALMETHOD = "WTD"
								}

								obj.AMOUNT_ACCURED = allDataAct1[i].AMOUNTACCRUED;
								obj.EMAILID = allDataAct1[i].PO_PREPARER;
								obj.LINEITEM = allDataAct1[i].ITEMNO;
								obj.MARKASREVIEWED = "X";
								obj.PONUMBER = allDataAct1[i].PONUMBER;
								obj.PO_CLOSURE = allDataAct1[i].PO_CLOSURE;
								obj.REVIWED_BY = emailId;
								obj.STATUS = "Reviewed";
								if (allDataAct1[i].STRAIGHTLINEMTHD == "false") {
									obj.STRAIGHTLINEMTHD = "";
								} else if (allDataAct1[i].STRAIGHTLINEMTHD == "true") {
									obj.STRAIGHTLINEMTHD = "X";
								}
								obj.TOTALWORKCOMPLPERCENT = allDataAct1[i].TOTWRKCOMPPER;
								obj.TOTALWORKCOMPLTODATE = allDataAct1[i].TOTWRKCOMPAMT;
								obj.WORKCOMPLASTMONTHAMT = allDataAct1[i].TOTWRKCOMPAMT_COCDECURR;
								obj.WORKCOMPLASTMONTHCURR = allDataAct1[i].POCURRENCY;
								obj.WORK_ENDDATE = allDataAct1[i].WRKENDDATE;
								obj.WORK_STARTDATE = allDataAct1[i].WRKSTRTDATE;
								jsonArray.push(obj);
							}
						}
						// *********************************************
						if (jsonArray.length > 0) {
							oController.getView().byId("saveBtn").setEnabled(true);
						} else {
							oController.getView().byId("saveBtn").setEnabled(false);
						}
						sap.ui.core.BusyIndicator.hide();

					});

				} else if (sTableID === "MatTableB") {
					$.when(oController.defActM).done(function () {
						/*	for (var i = 0; i < oEvent.getSource().mAggregations.rows[0].mAggregations.cells.length; i++) {
								if (oEvent.getSource().mAggregations.rows[0].mAggregations.cells[i].sId.split("-")[2] === "totalPOClosureMat") {
									var Index1 = i;
								}
							}
							var rowsLength = oEvent.getSource().getParent().getTable().getRows().length;
							var gettingInternalTable = oEvent.getSource().getParent().getTable("actUponB2"),
									oSelIndices = gettingInternalTable.getSelectedIndices();
							for (var i = 0; i < oSelIndices.length; i++) {
								var lv_selIndex = oSelIndices[i];
								var POClosure = gettingInternalTable.getContextByIndex(lv_selIndex).getProperty("POCLOSURE_FLAG");
								if (POClosure == 1) {
									lv_selIndex = parseInt(lv_selIndex);
									SelArr.push(lv_selIndex);

								}
							}
							var selectedIndices1 = oController.getView().byId("SmartTableBactUpon2").getTable().getSelectedIndices();
							*/
						var Act2Count = 0;
						for (i = 0; i < allDataAct2.length; i++) {

							if (allDataAct2[i].POCLOSURE_FLAG == 1) {
								Act2Count = Act2Count + 1;
							}
						}
						if (Act2Count == allDataAct2.length) {
							var sMessage = oController.geti18nText("CheckBoxNotSelected");
							MessageBox.information(sMessage);
							selectAll = false;
							oController.getView().byId("saveBtn").setEnabled(false);
							var oHistoryTable = oController.getView().byId("SmartTableBactUpon1");
							oHistoryTable.rebindTable(true);
							var oHistoryTable2 = oController.getView().byId("SmartTableBactUpon2");
							oHistoryTable2.rebindTable(true);
							sap.ui.core.BusyIndicator.hide();
							return;
						}
						for (i = 0; i < allDataAct2.length; i++) {
							/*	var oContext = oController.getView().byId("SmartTableBactUpon2").getTable().getContextByIndex(
									selectedIndices1[i]).getObject();*/
							if (allDataAct2[i].POCLOSURE_FLAG == 0) {
								var obj = {};
								if (allDataAct2[i].ACCRUALMETHOD == "Straight Line") {
									obj.ACCRUALMETHOD = "STL"
								} else if (allDataAct2[i].ACCRUALMETHOD == "Work To Date") {
									obj.ACCRUALMETHOD = "WTD"
								} else {
									obj.ACCRUALMETHOD = "WTD";
								}
								obj.AMOUNT_ACCURED = allDataAct2[i].AMOUNTACCRUED;
								obj.EMAILID = allDataAct2[i].PO_PREPARER;
								//obj.INVVALUE = allDataAct2[i].INVVALUE;
								obj.LINEITEM = allDataAct2[i].ITEMNO;
								obj.MARKASREVIEWED = "X"
								obj.PONUMBER = allDataAct2[i].PONUMBER;
								obj.PO_CLOSURE = allDataAct2[i].PO_CLOSURE;
								obj.REVIWED_BY = emailId;
								obj.STATUS = "Reviewed";
								if (allDataAct2[i].STRAIGHTLINEMTHD == "false") {
									obj.STRAIGHTLINEMTHD = "";
								} else if (allDataAct2[i].STRAIGHTLINEMTHD == "true") {
									obj.STRAIGHTLINEMTHD = "X";
								} else {
									obj.STRAIGHTLINEMTHD = "";
								}
								obj.TOTALWORKCOMPLPERCENT = allDataAct2[i].TOTWRKCOMPPER;
								//	obj.TOTALWORKCOMPLTODATE = allDataAct2[i].GRVALUE;
								//obj.WORKCOMPLASTMONTHAMT = allDataAct2[i].TOTWRKCOMPAMT_COCDECURR;
								obj.WORKCOMPLASTMONTHCURR = allDataAct2[i].POCURRENCY;
								//obj.WORK_ENDDATE = allDataAct2[i].WRKENDDATE;
								//obj.WORK_STARTDATE = allDataAct2[i].WRKSTRTDATE;
								jsonArray.push(obj);
							}
						}
						if (jsonArray.length > 0) {
							oController.getView().byId("saveBtn").setEnabled(true);
						} else {
							oController.getView().byId("saveBtn").setEnabled(false);
						}
						sap.ui.core.BusyIndicator.hide();
					});
				}

				/*	}*/
				// Below code will be called during deselect
				// } else if (oEvent.mParameters.rowIndex === -1) {
				// }else if (oEvent.getSource().mProperties.selectedIndex === -1) { // Commented SUZ9125
				//this.onMarkAsReviewedSelect(oEvent, str);

				//	sap.ui.core.BusyIndicator.hide();
			} else if (deselectFlag === true) { // Added SUZ9125
				// for(var i in oEvent.mParameters.rowIndices){
				// var removeIndex = oEvent.mParameters.rowIndices[i];

				if (oEvent.mParameters.rowIndices.length === 1) {
					// var removeIndex = this.getSelectedIndex(oEvent, aTableData); // Comented SUZ9125
					var removeIndex = this.getDeSelectedIndex(oEvent, aTableData, deSelectIndex); // Added SUZ9125
					if (removeIndex === -1) {
						return;
					}
					var remSelectedRowData = aTableData[removeIndex];
					jsonArray = jsonArray.filter(function (jsonArray) {
						return jsonArray.PONUMBER !== remSelectedRowData.PONUMBER ||
							jsonArray.LINEITEM !== remSelectedRowData.ITEMNO;
					});
				}
				// Mark as Reviwed button will be disabled when there are no selected records
				if (!jsonArray.length || oEvent.mParameters.rowIndices.length > 1) {
					jsonArray = []
					oController.getView().byId("saveBtn").setEnabled(false);
				}

			} else {

				if (sTableID === "actUponB1") {
					for (var i = 0; i < oEvent.getSource().mAggregations.rows[0].mAggregations.cells.length; i++) {
						if (oEvent.getSource().mAggregations.rows[0].mAggregations.cells[i].sId.split("-")[2] === "totalPOClosure") {
							var Index1 = i;
						}
					}
					var rowsLength = oEvent.getSource().getParent().getTable().getRows().length;
					var gettingInternalTable = oEvent.getSource().getParent().getTable("actUponB1"),
						//gettingAllRows = gettingInternalTable.getRows(),
						oSelIndices = gettingInternalTable.getSelectedIndices(),
						selIndex = oEvent.getSource().getSelectedIndex();
					//oSelIndices will have index of the rows
					for (var i = 0; i < oSelIndices.length; i++) {
						if (selIndex == oSelIndices[i]) {
							var lv_selIndex = oSelIndices[i];
						}
					}
					if (typeof lv_selIndex !== 'undefined') { // NOD6247 -19/01/23
						var tableRowPONumber = gettingInternalTable.getContextByIndex(lv_selIndex).getProperty("PONUMBER");
						var tableRowItemNumber = gettingInternalTable.getContextByIndex(lv_selIndex).getProperty("ITEMNO");
						var POClosure = gettingInternalTable.getContextByIndex(lv_selIndex).getProperty("POCLOSURE_FLAG")
						var POClosureLoc = gettingInternalTable.getContextByIndex(lv_selIndex).getProperty("POCLOSURE_FLAG_LOCAL");
						if (POClosure == 1) {
							if (POClosureLoc == true) {
								oController.getView().byId("saveBtn").setEnabled(true);
								oController.getSelectedData(oEvent, str, aTableData);
								oController.populateGlobalArray(str, 1);
								return;
							}
							var sMessage = oController.geti18nText("CheckBoxNotSelected");
							MessageBox.information(sMessage);
							this.getView().byId('SmartTableBactUpon1').getTable().removeSelectionInterval(selIndex, selIndex);
							return;
						}
					}
				} else if (sTableID === "MatTableB") {
					for (var i = 0; i < oEvent.getSource().mAggregations.rows[0].mAggregations.cells.length; i++) {
						if (oEvent.getSource().mAggregations.rows[0].mAggregations.cells[i].sId.split("-")[2] === "totalPOClosureMat") {
							var Index1 = i;
						}
					}
					var rowsLength = oEvent.getSource().getParent().getTable().getRows().length;
					var gettingInternalTable = oEvent.getSource().getParent().getTable("actUponB2"),
						//gettingAllRows = gettingInternalTable.getRows(),
						oSelIndices = gettingInternalTable.getSelectedIndices(),
						selIndex = oEvent.getSource().getSelectedIndex();
					//oSelIndices will have index of the rows
					for (var i = 0; i < oSelIndices.length; i++) {
						if (selIndex == oSelIndices[i]) {
							var lv_selIndex = oSelIndices[i];
						}
					}
					if (typeof lv_selIndex !== 'undefined') { // NOD6247 -19/01/23
						var tableRowPONumber = gettingInternalTable.getContextByIndex(lv_selIndex).getProperty("PONUMBER");
						var tableRowItemNumber = gettingInternalTable.getContextByIndex(lv_selIndex).getProperty("ITEMNO");
						var POClosure = gettingInternalTable.getContextByIndex(lv_selIndex).getProperty("POCLOSURE_FLAG")
						var POClosureLoc = gettingInternalTable.getContextByIndex(lv_selIndex).getProperty("POCLOSURE_FLAG_LOCAL");
						if (POClosure == 1) {
							if (POClosureLoc == true) {
								oController.getView().byId("saveBtn").setEnabled(true);
								oController.getSelectedData(oEvent, str, aTableData);
								oController.populateGlobalArray(str, 1);
								return;
							}
							var sMessage = oController.geti18nText("CheckBoxNotSelected");
							MessageBox.information(sMessage);
							this.getView().byId('SmartTableBactUpon2').getTable().removeSelectionInterval(selIndex, selIndex);
							return;
						}
					}
				}

				count++;
				oController.getView().byId("saveBtn").setEnabled(true);
				oController.getSelectedData(oEvent, str, aTableData);
				// Push to the Global Variable JSONARRAY
				oController.populateGlobalArray(str, 1);
				// if (oEvent.getSource().mProperties.selectedIndex === -1) { // Commented SUZ9125
				if (deselectFlag === true) { // Added SUZ9125
					// var removeIndex = oEvent.mParameters.rowIndex;
					// var removeIndex = this.getSelectedIndex(oEvent, aTableData); // Commented SUZ9125
					var removeIndex = this.getDeSelectedIndex(oEvent, aTableData, deSelectIndex); // Added SUZ9125
					var remSelectedRowData = aTableData[removeIndex];
					jsonArray = jsonArray.filter(function (jsonArray) {
						return jsonArray.PONUMBER !== remSelectedRowData.PONUMBER ||
							jsonArray.LINEITEM !== remSelectedRowData.ITEMNO;
					});
				}
			}
			// MVP2 changes Start of Code
			if (jsonArray.length > 0) {
				oController.getView().byId("record").setVisible(true);
				oController.getView().byId("recordMat").setVisible(true);
			} else {
				oController.getView().byId("record").setVisible(false);
				oController.getView().byId("recordMat").setVisible(false);
			}
			// MVP2 changes End of Code
			//console.log(jsonArray);
		},
		// Method to rebind tables
		rebindTables: function () {
			var oHistoryTable = oController.getView().byId("SmartTableBactUpon1");
			oHistoryTable.rebindTable(true);
			var oHistoryTable2 = oController.getView().byId("SmartTableBactUpon2");
			oHistoryTable2.rebindTable(true);
			var oHistoryTable3 = oController.getView().byId("SmartTableBthreshold");
			oHistoryTable3.rebindTable(true);
			var oHistoryTable4 = oController.getView().byId("SmartTableThres2");
			oHistoryTable4.rebindTable(true);

			// oController.getOwnerComponent().getModel().refresh(true);
			// oController.getView().byId("SmartTableBactUpon1").getModel().refresh(true);

		},
		// Calling the Edge Service
		saveData: function (oData, oResponse) {
				var j;
				//let iTotalAboveCount = oController.totalAbove50KCount - oController.reviewedCount; 
				let iTotalAboveCount = (iTotalServicePOAbove50KCount + iTotalMaterialPOAbove50KCount) - oController.reviewedCount;
				let sMessage = oController.geti18nText('message.submitted') + "\n\n" +
								oController.geti18nText('message.submitted.details') + iTotalAboveCount;
			
			// Filter out the warning messages, as it comes along with Success
			if (oData != "") { //-Added
				oData.ReturnSet.results = oData.ReturnSet.results.filter(e => e.Type !== "W");
			}
			var jsonArray_message = {};
			// Copy without reference
			jsonArray_message = jsonArray.slice();
			if (oData != "") { //-Added
				for (var i in oData.ReturnSet.results) {
					// Remove it from the list of Arrays to be displayed 
					jsonArray_message = jsonArray_message.filter(function (jsonArray_message) {
						return jsonArray_message.PONUMBER !== oData.ReturnSet.results[i].MessageV3 ||
							jsonArray_message.LINEITEM !== oData.ReturnSet.results[i].MessageV4;
					});

					// If the PO # and Item # is not updated in SAP, Do not update in EDGE as well. 
					// Remove from the JSON Array. 
					if (oData.ReturnSet.results[i].Type === "A" || oData.ReturnSet.results[i].Type === "E") {
						jsonArray = jsonArray.filter(function (jsonArray) {
							return jsonArray.PONUMBER !== oData.ReturnSet.results[i].MessageV3 ||
								jsonArray.LINEITEM !== oData.ReturnSet.results[i].MessageV4;
						});
					}
				}
			}

			//Start of change - Added 
			if (GlobalError != "") {
				for (var i in GlobalError) {
					// Remove it from the list of Arrays to be displayed 
					jsonArray_message = jsonArray_message.filter(function (jsonArray_message) {
						return jsonArray_message.PONUMBER !== GlobalError[i].MessageV3 ||
							jsonArray_message.LINEITEM !== GlobalError[i].MessageV4;
					});
				}
			}
			//End of change

			// Remove the INVVALUE
			for (var j in jsonArray_message) {
				delete jsonArray_message[j].INVVALUE;
			}

			//Start of change - Added 
			if (GlobalError != "") {
				sMessage = sMessage + "\n\n" + "The status of the orders failed \n\n" + "PO Number - Item Number - Message \n"
				for (var i in GlobalError) {

					// Message V3 : PO Number :  Messagev V4 : Item Number
					sMessage = sMessage + (GlobalError[i].MessageV3) + "   - " +
						(GlobalError[i].MessageV4) + "   - " +
						(GlobalError[i].Message) + "\n";

					// If the PO # and Item # is not updated in SAP, Do not update in EDGE as well. 
					// Remove from the JSON Array
					jsonArray = jsonArray.filter(function (jsonArray) {
						return jsonArray.PONUMBER !== GlobalError[i].MessageV3 ||
							jsonArray.LINEITEM !== GlobalError[i].MessageV4;
					});
				}
			}
			// End of Change -Added

			// Remove the INVVALUE
			for (var j in jsonArray) {
				delete jsonArray[j].INVVALUE;
				if (jsonArray[j].TOTALWORKCOMPLTODATE !== undefined) {
					jsonArray[j].TOTALWORKCOMPLTODATE = jsonArray[j].TOTALWORKCOMPLTODATE.toString();
				}
			}
			var k;
			for (k = 0; k < jsonArray.length; k++) {
				jsonArray[k].TOTALWORKCOMPLPERCENT = jsonArray[k].TOTALWORKCOMPLPERCENT.toString();
				if (jsonArray[k].AMOUNT_ACCURED !== undefined || jsonArray[k].AMOUNT_ACCURED !== null) {
					jsonArray[k].AMOUNT_ACCURED = parseFloat(jsonArray[k].AMOUNT_ACCURED);
					if (jsonArray[k].PO_CLOSURE == "true") {
						jsonArray[k].AMOUNT_ACCURED = 0.00;
						jsonArray[k].ACCRUALMETHOD = "WTD";
						jsonArray[k].STRAIGHTLINEMTHD = "";
					}
					if (jsonArray[k].AMOUNT_ACCURED < 0) {
						jsonArray[k].AMOUNT_ACCURED = 0.00;
					}
					jsonArray[k].AMOUNT_ACCURED = jsonArray[k].AMOUNT_ACCURED.toString();
				}
				if (jsonArray[k].AMOUNT_ACCURED === "NaN") {
					jsonArray[k].AMOUNT_ACCURED = null;
				}
			}
			// MessageBox.information(sMessage);

			var jsonData = {
				"statuspo": jsonArray
			};

			$.ajax({
				type: "POST",
				url: sPostURI + "updateServPOStatus.xsjs",
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify(jsonData),
				success: function (data, Response) {
					if (data.EX_CODE === 1) {
						oController.dashboardData();
						oController.getView().byId("saveBtn").setEnabled(false);
						oController.rebindTables();
						jsonArray = [];
						MessageBox.information(sMessage);
						// MVP2 changes Start of Code
						oController.getView().byId("record").setVisible(false);
						oController.getView().byId("recordMat").setVisible(false);
						// MVP2 changes End of Code
					} else {
						// MessageBox.error("Error while updating in EDGE. Please try after some time");
						common.displayErrorMessage(oController);
						oController.rebindTables();
						jsonArray = [];
					}

				},
				error: function (error) {
					// MessageBox.error("Error while updating in EDGE. Please try after some time");
					common.displayErrorMessage(oController);
					oController.rebindTables();
					jsonArray = [];
				}
			});

		},
		// Get the count of pending and reviewed POs
		// populateReviewedCount: function (oData) {
		// 	var mjsonArray = {},
		// 		data;
		// 	var reviewedCount = oController.reviewedCount;
		// 	var pendingCount = oController.pendingCount;
		// 	if (oData.results === undefined) {
		// 		data = oData;
		// 	} else {
		// 		data = oData.results;
		// 	}
		// 	for (var i in data) {
		// 		mjsonArray = jsonArray.filter(function (jsonArray) {
		// 			return jsonArray.PONUMBER === data[i].PONUMBER &&
		// 				jsonArray.LINEITEM === data[i].ITEMNO;
		// 		})[0];
		// 		if (mjsonArray) {
		// 			if (mjsonArray.STATUS === "Reviewed") {
		// 				reviewedCount = reviewedCount + 1;
		// 			} else {
		// 				pendingCount = pendingCount + 1;
		// 			}
		// 		} else {
		// 			if (data[i].STATUS === "Reviewed") {
		// 				reviewedCount = reviewedCount + 1;
		// 			} else {
		// 				pendingCount = pendingCount + 1;
		// 			}
		// 		}

		// 	}
		// 	oController.reviewedCount = reviewedCount;
		// 	oController.pendingCount = pendingCount;
		// },
		// gree start
		saveData2: function (oData, oResponse) {
			var i, j;
			//	let iTotalUnderCount = oController.totalUnder50KCount - oController.reviewedCount;
			let iTotalUnderCount = (iTotalServicePOUnder50KCount + iTotalMaterialPOUnder50KCount) - oController.reviewedCount;		
			let sMessage = oController.geti18nText('message.submitted') + "\n\n" +
						oController.geti18nText('message.submitted.details') + iTotalUnderCount;
			
			// Filter out the warning messages, as it comes along with Success
			if (oData != "") { //-Added
				oData.ReturnSet.results = oData.ReturnSet.results.filter(e => e.Type !== "W");
			}
			var jsonArray_message = {};
			jsonArray_message = jsonArrayfinal2.slice(); // Copy without reference
			if (oData != "") { //-Added 
				for (var i in oData.ReturnSet.results) {
					// Remove it from the list of Arrays to be displayed 
					jsonArray_message = jsonArray_message.filter(function (jsonArray_message) {
						return jsonArray_message.PONUMBER !== oData.ReturnSet.results[i].MessageV3 ||
							jsonArray_message.LINEITEM !== oData.ReturnSet.results[i].MessageV4;
					});

					// If the PO # and Item # is not updated in SAP, Do not update in EDGE as well. 
					// Remove from the JSON Array. 
					if (oData.ReturnSet.results[i].Type === "A" || oData.ReturnSet.results[i].Type === "E") {
						jsonArrayfinal2 = jsonArrayfinal2.filter(function (jsonArrayfinal2) {
							return jsonArrayfinal2.PONUMBER !== oData.ReturnSet.results[i].MessageV3 ||
								jsonArrayfinal2.LINEITEM !== oData.ReturnSet.results[i].MessageV4;
						});
					}
				}
			}

			//Start of change - Added by Gagan on 9-Nov-2021
			if (GlobalError != "") {
				for (var i in GlobalError) {
					// Remove it from the list of Arrays to be displayed 
					jsonArray_message = jsonArray_message.filter(function (jsonArray_message) {
						return jsonArray_message.PONUMBER !== GlobalError[i].MessageV3 ||
							jsonArray_message.LINEITEM !== GlobalError[i].MessageV4;
					});
				}
			}
			//End of change - Added 

			// Remove the INVVALUE from error message
			for (var j in jsonArray_message) {
				delete jsonArray_message[j].INVVALUE;
			}
			//Start of change - Added 
			if (GlobalError != "") {
				sMessage = sMessage + "\n\n" + "The status of the orders failed \n\n" + "PO Number - Item Number - Message \n"
				for (var i in GlobalError) {

					// Message V3 : PO Number :  Messagev V4 : Item Number
					sMessage = sMessage + (GlobalError[i].MessageV3) + "   - " +
						(GlobalError[i].MessageV4) + "   - " +
						(GlobalError[i].Message) + "\n";

					// If the PO # and Item # is not updated in SAP, Do not update in EDGE as well. 
					// Remove from the JSON Array

					jsonArrayfinal2 = jsonArrayfinal2.filter(function (jsonArrayfinal2) {
						return jsonArrayfinal2.PONUMBER !== GlobalError[i].MessageV3 ||
							jsonArrayfinal2.LINEITEM !== GlobalError[i].MessageV4;
					});
				}
			}
			// End of Change -Added

			// Remove the INVVALUE from json array
			for (var j in jsonArrayfinal2) {
				delete jsonArrayfinal2[j].INVVALUE;
				if (jsonArrayfinal2[j].TOTALWORKCOMPLTODATE !== undefined) {
					jsonArrayfinal2[j].TOTALWORKCOMPLTODATE = jsonArrayfinal2[j].TOTALWORKCOMPLTODATE.toString();
				}
			}

			// MessageBox.success(sMessage);
			var k;
			for (k = 0; k < jsonArrayfinal2.length; k++) {
				jsonArrayfinal2[k].TOTALWORKCOMPLPERCENT = jsonArrayfinal2[k].TOTALWORKCOMPLPERCENT.toString();
				if (jsonArrayfinal2[k].AMOUNT_ACCURED !== undefined || jsonArrayfinal2[k].AMOUNT_ACCURED !== null) {
					jsonArrayfinal2[k].AMOUNT_ACCURED = parseFloat(jsonArrayfinal2[k].AMOUNT_ACCURED);
					if (jsonArrayfinal2[k].PO_CLOSURE == "true") {
						jsonArrayfinal2[k].AMOUNT_ACCURED = 0.00;
						jsonArrayfinal2[k].ACCRUALMETHOD = "WTD";
						jsonArrayfinal2[k].STRAIGHTLINEMTHD = "";
					}
					if (jsonArrayfinal2[k].AMOUNT_ACCURED < 0) {
						jsonArrayfinal2[k].AMOUNT_ACCURED = 0.00;
					}
					jsonArrayfinal2[k].AMOUNT_ACCURED = jsonArrayfinal2[k].AMOUNT_ACCURED.toString();
				}
				if (jsonArrayfinal2[k].AMOUNT_ACCURED === "NaN") {
					jsonArrayfinal2[k].AMOUNT_ACCURED = null;
				}
			}
			var jsonData = {
				"statuspo": jsonArrayfinal2
			};
			$.ajax({
				type: "POST",
				url: sPostURI + "updateServPOStatus.xsjs",
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify(jsonData),
				success: function (data, Response) {
					var selIndices = oController.getView().byId('SmartTableBthreshold').getTable().getSelectedIndices();
					var selIndices1 = oController.getView().byId('SmartTableThres2').getTable().getSelectedIndices();
					if (data.EX_CODE === 1) {
						oController.dashboardData();
						oController.getView().byId("saveBtnThre").setEnabled(false);
						for (var i = 0; i < selIndices.length; i++) {
							//debugger;
							oController.getView().byId('SmartTableBthreshold').getTable().removeSelectionInterval(selIndices[i], selIndices[i]);
						}

						oController.rebindTables();
						jsonArrayfinal2 = [];

						//var oHistoryTable = oController.getView().byId("SmartTableBthreshold"); //march
						//	oHistoryTable.rebindTable(true);

						//	oController.getView().byId("recordThre").setVisible(false);
						MessageBox.information(sMessage);
						// MVP2 changes Start of Code
						oController.getView().byId("recordThre").setVisible(false);
						oController.getView().byId("recordMater").setVisible(false);
						// MVP2 changes End of Code
					} else {
						// MessageBox.error("Error while updating in EDGE. Please try after some time");
						common.displayErrorMessage(oController);
						for (var i = 0; i < selIndices.length; i++) {
							oController.getView().byId('SmartTableThres2').getTable().removeSelectionInterval(selIndices[i], selIndices[i]);
						}
						oController.rebindTables();
						jsonArrayfinal2 = [];

						//var oHistoryTable = oController.getView().byId("SmartTableBthreshold"); //march
						//	oHistoryTable.rebindTable(true);
					}
				},
				error: function (error) {
					var selIndices = oController.getView().byId('SmartTableBthreshold').getTable().getSelectedIndices();
					// MessageBox.error("Error while updating in EDGE. Please try after some time");
					common.displayErrorMessage(oController);
					for (var i = 0; i < selIndices.length; i++) {
						oController.getView().byId('SmartTableThres2').getTable().removeSelectionInterval(selIndices[i], selIndices[i]);
					}
					oController.rebindTables();
					jsonArrayfinal2 = [];
				}
			});
		},
		//gree end
		populateReviewedCount: function (oData) {
			var mjsonArray = {};
			var reviewedCount = oController.reviewedCount;
			var pendingCount = oController.pendingCount;
			for (var i in oData.results) {
				mjsonArray = jsonArray.filter(function (jsonArray) {
					return jsonArray.PONUMBER === oData.results[i].PONUMBER &&
						jsonArray.LINEITEM === oData.results[i].ITEMNO;
				})[0];
				if (mjsonArray) {
					if (mjsonArray.STATUS === "Reviewed") {
						reviewedCount = reviewedCount + 1;
					} else {
						pendingCount = pendingCount + 1;
					}
				} else {
					if (oData.results[i].STATUS === "Reviewed") {
						reviewedCount = reviewedCount + 1;
					} else {
						pendingCount = pendingCount + 1;
					}
				}

			}
			oController.reviewedCount = reviewedCount;
			oController.pendingCount = pendingCount;
		},

		populateReviewedCountThre: function (oData) {
			var mjsonArray = {};
			var reviewedCount = oController.reviewedCount;
			var pendingCount = oController.pendingCount;
			for (var i in oData.results) {
				mjsonArray = jsonArrayfinal2.filter(function (jsonArrayfinal2) {
					return jsonArrayfinal2.PONUMBER === oData.results[i].PONUMBER &&
						jsonArrayfinal2.LINEITEM === oData.results[i].ITEMNO;
				})[0];
				if (mjsonArray) {
					if (mjsonArray.STATUS === "Reviewed") {
						reviewedCount = reviewedCount + 1;
					} else {
						pendingCount = pendingCount + 1;
					}
				} else {
					if (oData.results[i].STATUS === "Reviewed") {
						reviewedCount = reviewedCount + 1;
					} else {
						pendingCount = pendingCount + 1;
					}
				}

			}
			oController.reviewedCount = reviewedCount;
			oController.pendingCount = pendingCount;
		},
		onApproveMarkAsReviewedPressThre: function (oEvent) {
			sap.ui.core.BusyIndicator.show(0);
			DialogFlagThre = 0;
			for (var i = 0; i < jsonArrayfinal2.length; i++) {
				if (jsonArrayfinal2[i].PO_CLOSURE == "true") {
					DialogFlagThre = 1;
				}
				break;
			}
			if (DialogFlagThre == 1) {
				sap.ui.core.BusyIndicator.hide();
				var sMessage = oController.geti18nText('POtitleWarning');
				MessageBox.warning(sMessage, {
					actions: [oController.geti18nText('cancel'), oController.geti18nText('ProceedforReview')],
					emphasizedAction: MessageBox.Action.YES,
					onClose: function (sAction) {
						if (sAction === oController.geti18nText('ProceedforReview')) {
							sap.ui.core.BusyIndicator.show(0);
							oController.onApproveDialogPressThre();
						} else {
							jsonArrayfinal2 = [];
							oController.rebindTables();
						}
					}
				});
			} else {
				oController.onApproveDialogPressThre();
			}
		},
		onApproveMarkAsReviewedPress: function (oEvent) {
			sap.ui.core.BusyIndicator.show(0);
			DialogFlag = 0;
			for (var i = 0; i < jsonArray.length; i++) {
				if (jsonArray[i].PO_CLOSURE == "true") {
					DialogFlag = 1;
				}
				break;
			}
			if (DialogFlag == 1) {
				sap.ui.core.BusyIndicator.hide();
				var sMessage = oController.geti18nText('POtitleWarning');
				MessageBox.warning(sMessage, {
					actions: [oController.geti18nText('cancel'), oController.geti18nText('ProceedforReview')],
					emphasizedAction: MessageBox.Action.YES,
					onClose: function (sAction) {
						if (sAction === oController.geti18nText('ProceedforReview')) {
							sap.ui.core.BusyIndicator.show(0);
							oController.onApproveDialogPress();
						} else {
							jsonArray = [];
							oController.rebindTables();
						}
					}
				});
			} else {
				oController.onApproveDialogPress();
			}
		},
		// Method will trigger on press of mark as reviewed
		onApproveDialogPress: function (oEvent) {
			// var oModelcutOff = this.getOwnerComponent().getModel("cutOffModel");
			// oModelcutOff.read("/cutoff", {
			// 	urlParameters: {
			// 		"$top": 1000
			// 	},
			sap.ui.core.BusyIndicator.show(0);
			$.ajax({
				type: "POST",
				url: sPostURI + "cutOffCheck.xsjs",
				dataType: "json",
				async: true,
				cache: false,
				contentType: "application/json; charset=utf-8",
				success: function (oData, oResponse) {
					// var flag = oData.results[0].FLAG;
					var flag = oData[0].FLAG;
					// if (flag === "false") {
					if (flag === "true") {
						var errorMessage = oController.geti18nText("following") + " \n\n";
						var errorCount = 0;
						for (var i in jsonArray) {
							if ((jsonArray[i].TOTALWORKCOMPLPERCENT === "") || (jsonArray[i].TOTALWORKCOMPLTODATE === "")) {
								errorMessage = errorMessage + (jsonArray[i].PONUMBER) + "   - " + (jsonArray[i].LINEITEM) +  "   - " + oController.geti18nText("AribaPurchase") + "\n";
								errorCount = errorCount + 1;
							}
						}
						if (errorCount > 0) {
							MessageBox.error(errorMessage);
							sap.ui.core.BusyIndicator.hide();
							return;
						}
						// Show Busy Indicator
						sap.ui.core.BusyIndicator.show(0);
						var oModeld = oController.getOwnerComponent().getModel();
						var oModeldMaterial = oController.getOwnerComponent().getModel(),
							jsonArrayfin = [],
							jsonArrayfinal = [];
						oController.reviewedCount = 0;
						oController.pendingCount = 0;
						var sURI = "/openPOParameters(IP_PSTYPE='9',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results",
							sMessage;
						oModeld.read(sURI, {
							async: false,
							urlParameters: {
								"$inlinecount": "allpages",
								"$top": 1000
							},
							success: function (oData, oResponse) {
								oController.populateReviewedCount(oData);
								var amount;
								for (var i in allDataAct1) {
									jsonArrayfinal = jsonArray.filter(function (jsonArray) {
										return jsonArray.PONUMBER === allDataAct1[i].PONUMBER &&
											jsonArray.LINEITEM === allDataAct1[i].ITEMNO;
									});
									// to convert it to decimal and string
									if (jsonArrayfinal.length > 0) {
										if ((!isNaN(jsonArrayfinal[0].TOTALWORKCOMPLTODATE)) && typeof jsonArrayfinal[0].TOTALWORKCOMPLTODATE !==
											'string') {
											amount = jsonArrayfinal[0].TOTALWORKCOMPLTODATE.toFixed(2);
										} else {
											amount = jsonArrayfinal[0].TOTALWORKCOMPLTODATE;
										}
									}
									if (jsonArrayfinal.length > 0) {
										if (jsonArrayfinal[0].PONUMBER === allDataAct1[i].PONUMBER &&
											jsonArrayfinal[0].LINEITEM === allDataAct1[i].ITEMNO) {

											if (allDataAct1[i].POCLOSURE_FLAG == 0) {
												closurFlagActUpon = "false"
											}
											if (allDataAct1[i].POCLOSURE_FLAG == 1) {
												closurFlagActUpon = "true"
											}
										}
									}
									if ((jsonArrayfinal.length > 0) && ((amount !== allDataAct1[i].TOTWRKCOMPAMT.toString()) ||
											(jsonArrayfinal[0].TOTALWORKCOMPLPERCENT.toString() !== allDataAct1[i].TOTWRKCOMPPER.toString()) || (
												jsonArrayfinal[
													0]
												.ACCRUALMETHOD === 'WTD' && allDataAct1[i].ACCRUALMETHOD === 'Straight Line' || closurFlagActUpon !== jsonArrayfinal[
													0].PO_CLOSURE)
										)) {

										// if ((jsonArrayfinal.length > 0) && ((amount !== allDataAct1[i].TOTWRKCOMPAMT.toString()) ||
										// 		(jsonArrayfinal[0].TOTALWORKCOMPLPERCENT.toString() !== allDataAct1[i].TOTWRKCOMPPER.toString()))) {

										//if ((jsonArrayfinal.length > 0) && ((jsonArrayfinal[0].TOTALWORKCOMPLTODATE !== parseFloat(allDataAct1[i].TOTWRKCOMPAMT)) ||
										// if ((jsonArrayfinal.length > 0) && ((jsonArrayfinal[0].TOTALWORKCOMPLTODATE.toString() !== allDataAct1[i].TOTWRKCOMPAMT.toString()) ||
										// 		(jsonArrayfinal[0].TOTALWORKCOMPLPERCENT.toString() !== allDataAct1[i].TOTWRKCOMPPER.toString()))) {
										sapPOStr = {};
										sCETDateTime = new Date().toLocaleString("en-US", {
											timeZone: "Europe/Berlin"
										});
										sCETDateTime = sap.ui.core.format.DateFormat.getDateInstance({
											pattern: "yyyyMMddhhmmss"
										}).format(new Date(sCETDateTime));
										sapPOStr.GUID = sCETDateTime;
										sapPOStr.PoNumber = jsonArrayfinal[0].PONUMBER;
										sapPOStr.ItemNo = jsonArrayfinal[0].LINEITEM;
										sapPOStr.WtdAmount = jsonArrayfinal[0].TOTALWORKCOMPLTODATE.toString();
										sapPOStr.WtdPerc = jsonArrayfinal[0].TOTALWORKCOMPLPERCENT;
										/*var oFloatFormatPerc = NumberFormat.getFloatInstance(),
											WtdPerc = oFloatFormatPerc.parse(sapPOStr.WtdPerc);*/
										var WtdPerc = parseFloat(sapPOStr.WtdPerc);
										sapPOStr.WtdPerc = WtdPerc.toFixed(1);
										//  If percentage is 100.00, then pass only 100 as the ECC has the length of 5 
										if (sapPOStr.WtdPerc === '100.0' || sapPOStr.WtdPerc === '100.00') {
											sapPOStr.WtdPerc = '100';
										}
										sapPOArr.push(sapPOStr);
									}
								}
								var sURIMaterial = "/openPOParameters(IP_PSTYPE='0',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole +
									"')/Results";

								oModeldMaterial.read(sURIMaterial, {
									async: false,
									urlParameters: {
										"$inlinecount": "allpages",
										"$top": 1000
									},
									success: function (oData, oResponse) {
										oController.populateReviewedCount(oData);
										sap.ui.core.BusyIndicator.hide();

										if (oController.pendingCount) {
											sap.ui.core.BusyIndicator.hide();

											sMessage = oController.geti18nText('message.confirm')
											MessageBox.confirm(sMessage, {
												actions: [oController.geti18nText('confirm'), oController.geti18nText('cancel')],
												emphasizedAction: MessageBox.Action.YES,
												onClose: function (sAction) {
													if (sAction === oController.geti18nText('markAll')) {

													} else if (sAction === oController.geti18nText('confirm')) {
														oController.confirmaskConfirmation();
													} else if (sAction === oController.geti18nText('cancel')) {
														jsonArray = [];
														oController.rebindTables();
													}
												}
											});
										} else {
											oController.confirmaskConfirmation();
										}
										jsonArray = jsonArray.concat(jsonArrayfin);
									},
									error: function (e) {
										this._errorMessageClosingPOs();
										// common.displayErrorMessage(oController);
										sap.ui.core.BusyIndicator.hide();
									}
								});

							},
							error: function (e) {
								this._errorMessageClosingPOs();
								// common.displayErrorMessage(oController);
								sap.ui.core.BusyIndicator.hide();
							}
						});

					} else {
						MessageBox.error(oController.geti18nText("exceed"));
						return;
					}
				},
				error: function (e) {}
			});
		},

		//gree start
		onApproveDialogPressThre: function (oEvent) {
			// var oModelcutOff = this.getOwnerComponent().getModel("cutOffModel");
			// oModelcutOff.read("/cutoff", {
			// 	urlParameters: {
			// 		"$top": 1000
			// 	},
			sap.ui.core.BusyIndicator.show(0);
			$.ajax({
				type: "POST",
				url: sPostURI + "cutOffCheck.xsjs",
				dataType: "json",
				async: true,
				cache: false,
				contentType: "application/json; charset=utf-8",
				success: function (oData, oResponse) {
					// var flag = oData.results[0].FLAG;
					var flag = oData[0].FLAG;
					// if (flag === "false") {
					if (flag === "true") {
						var errorMessage = oController.geti18nText("following") + " \n\n";
						var errorCount = 0;
						for (var i in jsonArrayfinal2) {
							if ((jsonArrayfinal2[i].TOTALWORKCOMPLPERCENT === "") || (jsonArrayfinal2[i].TOTALWORKCOMPLTODATE === "")) {
								errorMessage = errorMessage + (jsonArrayfinal2[i].PONUMBER) + "   - " + (jsonArrayfinal2[i].LINEITEM) +  "   - " + oController.geti18nText("AribaPurchase") + "\n";
								errorCount = errorCount + 1;
							}
						}
						if (errorCount > 0) {
							MessageBox.error(errorMessage);
							sap.ui.core.BusyIndicator.hide();
							return;
						}
						// Show Busy Indicator
						sap.ui.core.BusyIndicator.show(0);
						var oModeld = oController.getOwnerComponent().getModel("thresholdModel");
						var oModeldMaterial = oController.getOwnerComponent().getModel("thresholdModel");
						var jsonArrayfin = [];
						var jsonArrayfi = [];
						oController.reviewedCount = 0;
						oController.pendingCount = 0;
						var sURI = "/thresholdParameters(IP_PSTYPE='9',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results",
							sMessage;
						oModeld.read(sURI, {
							async: false,
							urlParameters: {
								"$inlinecount": "allpages",
								"$top": 1000
							},
							success: function (oData, oResponse) {
								oController.populateReviewedCountThre(oData);
								var amount;
								for (var i in allDataThre1) {
									jsonArrayfin = jsonArrayfinal2.filter(function (jsonArrayfinal2) {
										return jsonArrayfinal2.PONUMBER === allDataThre1[i].PONUMBER &&
											jsonArrayfinal2.LINEITEM === allDataThre1[i].ITEMNO;
									});
									// to convert it to decimal and string
									if (jsonArrayfin.length > 0) {
										if ((!isNaN(jsonArrayfin[0].TOTALWORKCOMPLTODATE)) && typeof jsonArrayfin[0].TOTALWORKCOMPLTODATE !== 'string') {
											amount = jsonArrayfin[0].TOTALWORKCOMPLTODATE.toFixed(2);
										} else {
											amount = jsonArrayfin[0].TOTALWORKCOMPLTODATE;
										}
									}

									if (allDataThre1[i].TOTWRKCOMPAMT !== undefined) {
										allDataThre1[i].TOTWRKCOMPAMT = allDataThre1[i].TOTWRKCOMPAMT.toString();
									}
									if (jsonArrayfin.length > 0) {
										if (jsonArrayfin[0].PONUMBER === allDataThre1[i].PONUMBER &&
											jsonArrayfin[0].LINEITEM === allDataThre1[i].ITEMNO) {

											if (allDataThre1[i].POCLOSURE_FLAG == 0) {
												closurFlagThre = "false"
											}
											if (allDataThre1[i].POCLOSURE_FLAG == 1) {
												closurFlagThre = "true"
											}
										}
									}
									if ((jsonArrayfin.length > 0) && ((amount !== allDataThre1[i].TOTWRKCOMPAMT) ||
											(jsonArrayfin[0].TOTALWORKCOMPLPERCENT.toString() !== allDataThre1[i].TOTWRKCOMPPER.toString()) || (
												jsonArrayfin[0]
												.ACCRUALMETHOD === 'WTD' && allDataThre1[i].ACCRUALMETHOD === 'Straight Line' || closurFlagThre !== jsonArrayfin[
													0].PO_CLOSURE
											)
										)) {

										// if ((jsonArrayfinal.length > 0) && ((amount !== allDataAct1[i].TOTWRKCOMPAMT.toString()) ||
										// 		(jsonArrayfinal[0].TOTALWORKCOMPLPERCENT.toString() !== allDataAct1[i].TOTWRKCOMPPER.toString()))) {

										//if ((jsonArrayfinal.length > 0) && ((jsonArrayfinal[0].TOTALWORKCOMPLTODATE !== parseFloat(allDataAct1[i].TOTWRKCOMPAMT)) ||
										// if ((jsonArrayfinal.length > 0) && ((jsonArrayfinal[0].TOTALWORKCOMPLTODATE.toString() !== allDataAct1[i].TOTWRKCOMPAMT.toString()) ||
										// 		(jsonArrayfinal[0].TOTALWORKCOMPLPERCENT.toString() !== allDataAct1[i].TOTWRKCOMPPER.toString()))) {
										sapPOStr = {};
										sCETDateTime = new Date().toLocaleString("en-US", {
											timeZone: "Europe/Berlin"
										});
										sCETDateTime = sap.ui.core.format.DateFormat.getDateInstance({
											pattern: "yyyyMMddhhmmss"
										}).format(new Date(sCETDateTime));
										sapPOStr.GUID = sCETDateTime;
										sapPOStr.PoNumber = jsonArrayfin[0].PONUMBER;
										sapPOStr.ItemNo = jsonArrayfin[0].LINEITEM;
										sapPOStr.WtdAmount = jsonArrayfin[0].TOTALWORKCOMPLTODATE.toString();
										sapPOStr.WtdPerc = jsonArrayfin[0].TOTALWORKCOMPLPERCENT;
										/*var oFloatFormatPerc1 = NumberFormat.getFloatInstance(),
											WtdPerc = oFloatFormatPerc1.parse(sapPOStr.WtdPerc);*/
										var WtdPerc = parseFloat(sapPOStr.WtdPerc);
										sapPOStr.WtdPerc = WtdPerc.toFixed(1);
										//  If percentage is 100.00, then pass only 100 as the ECC has the length of 5 
										if (sapPOStr.WtdPerc === '100.0' || sapPOStr.WtdPerc === '100.00') {
											sapPOStr.WtdPerc = '100';
										}
										sapPOArr.push(sapPOStr);
									}
								}
								var sURIMaterial = "/thresholdParameters(IP_PSTYPE='0',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole +
									"')/Results";
								oModeldMaterial.read(sURIMaterial, {
									async: false,
									urlParameters: {
										"$inlinecount": "allpages",
										"$top": 1000
									},
									success: function (oData, oResponse) {
										oController.populateReviewedCountThre(oData);
										sap.ui.core.BusyIndicator.hide();

										if (oController.pendingCount) {
											
											sMessage = oController.geti18nText('message.confirm')
											MessageBox.confirm(sMessage, {
												actions: [oController.geti18nText('confirm'), oController.geti18nText('cancel')],
												emphasizedAction: MessageBox.Action.YES,
												onClose: function (sAction) {
													/*if (sAction === oController.geti18nText('markAll')) {
														oController.getView().byId('SmartTableBthreshold').getTable().addSelectionInterval(0, allDataAct1.length -
															1);
														oController.getView().byId('SmartTableThres2').getTable().addSelectionInterval(0, allDataAct2.length -
															1);
														oController.askConfirmation();
													} else */
													if (sAction === oController.geti18nText('confirm')) {
														oController.confirmaskConfirmation();
													} else if (sAction === oController.geti18nText('cancel')) {
														jsonArrayfinal2 = [];
														oController.rebindTables();
													}
												}
											});
										} else {
											oController.confirmaskConfirmation();
										}
										jsonArrayfinal2 = jsonArrayfinal2.concat(jsonArrayfi);
									},
									error: function (e) {
										this._errorMessageClosingPOs();
										// common.displayErrorMessage(oController);
										sap.ui.core.BusyIndicator.hide();
									}
								});
							},
							error: function (e) {
								this._errorMessageClosingPOs();
								// common.displayErrorMessage(oController);
								sap.ui.core.BusyIndicator.hide();
							}
						});

					} else {
						MessageBox.error(oController.geti18nText("exceed"));
						return;
					}
				},
				error: function (e) {}
			});
		},
		//gree end
		// Calling the ECC Service
		savePOChange: function () {
			var mECCData = {},
				oECCModel = this.getOwnerComponent().getModel("oECCIDocCreateModel");

			// Show Busy Indicator
			sap.ui.core.BusyIndicator.show(0);

			//Start of Change- 
			var j = 0,
				k = 0,
				sapPOArrBatch = [];
			var POCount = sapPOArr.length;
			GlobalData = [];
			GlobalResponse = [];
			asyncCallCounter = 0;
			GlobalError = [];
			//	this.getView().byId("dialogTotalRecord").setText("Update Progress");
			for (j = 0; j < sapPOArr.length; j++) {
				var PercStr = sapPOArr[j].WtdPerc.toString();
				if (PercStr == "NaN") {
					common.displayErrorMessage(oController);
					sap.ui.core.BusyIndicator.hide();
					oController.rebindTables();
					jsonArray = [];
					return;
				}
			}

			for (var i = 0; i < POCount; i = i + 40) {

				if ((POCount - k) >= 40) {
					k = k + 40;
				} else {
					k = POCount;
				}
				POArrMin = i;
				POArrMax = k;
				sapPOArrBatch = sapPOArr.slice(POArrMin, POArrMax);
				asyncCallCounter = asyncCallCounter + 1;
				//End of Change- 

				mECCData = {
					"GUID": sCETDateTime,
					"POCHANGESet": sapPOArrBatch, // sapPOArr,
					"ReturnSet": [{ // ReturnSet will be filled by ECC service after IDoc creation 
						"GUID": "",
						"Type": "",
						"Id": "",
						"Number": "",
						"Message": "",
						"LogNo": "",
						"LogMsgNo": "",
						"MessageV1": "",
						"MessageV2": "",
						"MessageV3": "",
						"MessageV4": "",
						"Parameter": "",
						"Row": 0
					}]
				};
				// Append /OData_VBO for Service URL when application is running in FLP
				if (oECCModel.sServiceUrl.includes("/comtakedaAccrual_UI5") && !oECCModel.sServiceUrl.includes("/ODATA_ACCRUALS")) {
					oECCModel.sServiceUrl = oECCModel.sServiceUrl.replace("/sap/opu/odata", "/ODATA_ACCRUALS/sap/opu/odata");
				}

				// Call service to create IDocs in ECC
				oECCModel.create('/PODataSet', mECCData, {
					async: true, //	async: true,
					success: function (oData, oResponse) {
						// Start of the change 
						asyncCallCounter = asyncCallCounter - 1;
						if (GlobalData == "") {
							GlobalData = oData;
							GlobalResponse = oResponse;
						} else {
							GlobalData.ReturnSet.results = GlobalData.ReturnSet.results.concat(oData.ReturnSet.results);
							// GlobalResponse.data.ReturnSet.results = GlobalResponse.data.ReturnSet.results.concat(oResponse.data.ReturnSet.results);
						}
						//End of the Change -
						if (sapPOArr.length == POArrMax && asyncCallCounter === 0) { // Added 
							oController.saveData(GlobalData, GlobalResponse); //(oData, oResponse);//Added 
							oController.rebindTables();
							sapPOArr = [];
							// Hide Busy Indicator
							sap.ui.core.BusyIndicator.hide();
						}

					},
					error: function (err, oResponse) {
						// Start of change -Added 
						asyncCallCounter = asyncCallCounter - 1;
						var aError = [];
						for (var i in sapPOArrBatch) {
							aError = {
								"Type": "E",
								"Message": "Error occured while updating the record",
								"MessageV3": sapPOArrBatch[i].PoNumber,
								"MessageV4": sapPOArrBatch[i].ItemNo,

							}
							GlobalError.push(aError);
						}

						if (sapPOArr.length == POArrMax && asyncCallCounter === 0) { // Added 
							oController.saveData(GlobalData, GlobalResponse); //(oData, oResponse);//Added
							oController.rebindTables();
							sapPOArr = [];
							// Hide Busy Indicator
							sap.ui.core.BusyIndicator.hide();
						}

					}

				});
			}
		},
		//gree start
		savePOChange2: function () {
			var mECCData = {},
				oECCModel = this.getOwnerComponent().getModel("oECCIDocCreateModel");

			// Show Busy Indicator
			sap.ui.core.BusyIndicator.show(0);

			//Start of Change- 
			var j = 0,
				k = 0,
				sapPOArrBatch = [];
			var POCount = sapPOArr.length;
			GlobalData = [];
			GlobalResponse = [];
			asyncCallCounter = 0;
			GlobalError = [];
			for (j = 0; j < sapPOArr.length; j++) {
				var PercStr = sapPOArr[j].WtdPerc.toString();
				if (PercStr == "NaN") {
					common.displayErrorMessage(oController);
					sap.ui.core.BusyIndicator.hide();
					oController.rebindTables();
					jsonArrayfinal2 = [];
					return;
				}
			}
			//	this.getView().byId("dialogTotalRecord").setText("Update Progress");
			for (var i = 0; i < POCount; i = i + 40) {

				if ((POCount - k) >= 40) {
					k = k + 40;
				} else {
					k = POCount;
				}
				POArrMin = i;
				POArrMax = k;
				sapPOArrBatch = sapPOArr.slice(POArrMin, POArrMax);
				asyncCallCounter = asyncCallCounter + 1;
				//End of Change- 

				mECCData = {
					"GUID": sCETDateTime,
					"POCHANGESet": sapPOArrBatch, // sapPOArr,
					"ReturnSet": [{ // ReturnSet will be filled by ECC service after IDoc creation 
						"GUID": "",
						"Type": "",
						"Id": "",
						"Number": "",
						"Message": "",
						"LogNo": "",
						"LogMsgNo": "",
						"MessageV1": "",
						"MessageV2": "",
						"MessageV3": "",
						"MessageV4": "",
						"Parameter": "",
						"Row": 0
					}]
				};
				// Append /OData_VBO for Service URL when application is running in FLP
				if (oECCModel.sServiceUrl.includes("/comtakedaAccrual_UI5") && !oECCModel.sServiceUrl.includes("/ODATA_ACCRUALS")) {
					oECCModel.sServiceUrl = oECCModel.sServiceUrl.replace("/sap/opu/odata", "/ODATA_ACCRUALS/sap/opu/odata");
				}

				// Call service to create IDocs in ECC
				oECCModel.create('/PODataSet', mECCData, {
					async: true, //	async: true,
					success: function (oData, oResponse) {
						// Start of the change 
						asyncCallCounter = asyncCallCounter - 1;
						if (GlobalData == "") {
							GlobalData = oData;
							GlobalResponse = oResponse;
						} else {
							GlobalData.ReturnSet.results = GlobalData.ReturnSet.results.concat(oData.ReturnSet.results);
							// GlobalResponse.data.ReturnSet.results = GlobalResponse.data.ReturnSet.results.concat(oResponse.data.ReturnSet.results);
						}
						//End of the Change -
						if (sapPOArr.length == POArrMax && asyncCallCounter === 0) { // Added 
							oController.saveData2(GlobalData, GlobalResponse); //(oData, oResponse);//Added 
							oController.rebindTables();
							sapPOArr = [];
							// Hide Busy Indicator
							sap.ui.core.BusyIndicator.hide();
						}

					},
					error: function (err, oResponse) {
						// Start of change -Added 
						asyncCallCounter = asyncCallCounter - 1;
						var aError = [];
						for (var i in sapPOArrBatch) {
							aError = {
								"Type": "E",
								"Message": "Error occured while updating the record",
								"MessageV3": sapPOArrBatch[i].PoNumber,
								"MessageV4": sapPOArrBatch[i].ItemNo,

							}
							GlobalError.push(aError);
						}

						if (sapPOArr.length == POArrMax && asyncCallCounter === 0) { // Added 
							oController.saveData2(GlobalData, GlobalResponse); //(oData, oResponse);//Added
							oController.rebindTables();
							sapPOArr = [];
							// Hide Busy Indicator
							sap.ui.core.BusyIndicator.hide();
						}

					}

				});
			}
		},
		confirmaskConfirmation: function () {
			if (oController.SelSubKey == "actUponTab") {
				if (sapPOArr.length > 0) {
					this.savePOChange();
				} else {
					this.edgeSave();
				}
			} else if (oController.SelSubKey== "thresholdTab") {
				if (sapPOArr.length > 0) {
					this.savePOChange2();
				} else {
					this.edgeSave2();
				}
			}
		},
		
		askConfirmation2: function () {
			sap.ui.core.BusyIndicator.hide();
			if (!this.oApproveDialogThre) {
				this.oApproveDialogThre = new Dialog({
					type: DialogType.Message,
					title: oController.geti18nText("confirm"),
					content: new Text({
						text: oController.geti18nText("saveConfMessage")
					}),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: oController.geti18nText("Submit"),
						press: function () {

							if (sapPOArr.length > 0) {
								this.savePOChange2();
							} else {
								this.edgeSave2();
							}
							this.oApproveDialogThre.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: oController.geti18nText("cancel"),
						press: function () {
							// sapThreArr = [];
							oController.rebindTables();
							jsonArrayfinal2 = [];
							this.oApproveDialogThre.close();
						}.bind(this)
					})
				});
			}
			this.oApproveDialogThre.open();
		},
		//gree end
		askConfirmation: function () {
			sap.ui.core.BusyIndicator.hide();
			if (!this.oApproveDialog) {
				this.oApproveDialog = new Dialog({
					type: DialogType.Message,
					title: oController.geti18nText("confirm"),
					content: new Text({
						text: oController.geti18nText("saveConfMessage")
					}),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: oController.geti18nText("Submit"),
						press: function () {
							if (sapPOArr.length > 0) {
								this.savePOChange();
							} else {
								this.edgeSave();
							}
							this.oApproveDialog.close();

						}.bind(this)
					}),
					endButton: new Button({
						text: oController.geti18nText("cancel"),
						press: function () {
							// sapPOArr = [];
							oController.rebindTables();
							jsonArray = [];
							this.oApproveDialog.close();
						}.bind(this)
					})
				});
			}
			this.oApproveDialog.open();
		},
		edgeSave: function () {
			//let iTotalAboveCount = oController.totalAbove50KCount - oController.reviewedCount; 
			let iTotalAboveCount = (iTotalServicePOAbove50KCount + iTotalMaterialPOAbove50KCount) - oController.reviewedCount;
			let sMessage = oController.geti18nText('message.submitted') + "\n\n" +
							oController.geti18nText('message.submitted.details') + iTotalAboveCount;
							
			for (var j in jsonArray) {
				delete jsonArray[j].INVVALUE;
				if (jsonArray[j].TOTALWORKCOMPLTODATE !== undefined) {
					jsonArray[j].TOTALWORKCOMPLTODATE = jsonArray[j].TOTALWORKCOMPLTODATE.toString();
				}
			}
			var k;
			for (k = 0; k < jsonArray.length; k++) {
				jsonArray[k].TOTALWORKCOMPLPERCENT = jsonArray[k].TOTALWORKCOMPLPERCENT.toString();
				if (jsonArray[k].AMOUNT_ACCURED !== undefined || jsonArray[k].AMOUNT_ACCURED !== null) {
					jsonArray[k].AMOUNT_ACCURED = parseFloat(jsonArray[k].AMOUNT_ACCURED);
					if (jsonArray[k].PO_CLOSURE == "true") {
						jsonArray[k].AMOUNT_ACCURED = 0.00;
						jsonArray[k].ACCRUALMETHOD = "WTD";
						jsonArray[k].STRAIGHTLINEMTHD = "";
					}
					//jsonArray[k].AMOUNT_ACCURED = jsonArray[k].AMOUNT_ACCURED.toString();
				}

			}
			var jsonData = {
				"statuspo": jsonArray
			};
			$.ajax({
				type: "POST",
				url: sPostURI + "updateServPOStatus.xsjs",
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify(jsonData),
				success: function (data, Response) {

					/*	var SerCheckedIndex = oController.SerCheckedIndex,
							MatCheckedIndex = oController.MatCheckedIndex;
						for (var j = 0; j < 10; j++) {
							oController.SerCheckedPath.mAggregations.rows[j].mAggregations.cells[SerCheckedIndex].setSelected(false);
						}
						for (var j in allDataAct2) {
							oController.MatCheckedPath.mAggregations.rows[j].mAggregations.cells[MatCheckedIndex].setSelected(false);
						}*/
					if (data.EX_CODE === 1) {
						oController.dashboardData();
						oController.getView().byId("saveBtn").setEnabled(false);
						oController.rebindTables();
						jsonArray = [];
						MessageBox.success(sMessage);
						// MVP2 changes Start of Code
						oController.getView().byId("record").setVisible(false);
						oController.getView().byId("recordMat").setVisible(false);
						// MVP2 changes End of Code
					} else {
						this._errorMessageClosingPOs();
						// common.displayErrorMessage(oController);
						oController.rebindTables();
						jsonArray = [];
					}

				},
				error: function (error) {
					this._errorMessageClosingPOs();
					// common.displayErrorMessage(oController);
					oController.rebindTables();
					jsonArray = [];
				}
			});
		},
		//gree start
		edgeSave2: function () {
			//	let iTotalUnderCount = oController.totalUnder50KCount - oController.reviewedCount;
			let iTotalUnderCount = (iTotalServicePOUnder50KCount + iTotalMaterialPOUnder50KCount) - oController.reviewedCount;		
			let sMessage = oController.geti18nText('message.submitted') + "\n\n" +
						oController.geti18nText('message.submitted.details') + iTotalUnderCount;
							
			jsonArrayfinal2 = jsonArrayfinal2.filter((arr, index, self) => index === self.findIndex((t) =>
				(t.PONUMBER === arr.PONUMBER && t.LINEITEM === arr.LINEITEM)));
			thresholdArray = jsonArrayfinal2; //allDataThre1;
			
			for (var j in thresholdArray) {
				delete thresholdArray[j].INVVALUE;
				if (thresholdArray[j].TOTALWORKCOMPLTODATE !== undefined) {
					thresholdArray[j].TOTALWORKCOMPLTODATE = thresholdArray[j].TOTALWORKCOMPLTODATE.toString();
				}
			}
			var k;
			for (k = 0; k < thresholdArray.length; k++) {
				thresholdArray[k].TOTALWORKCOMPLPERCENT = thresholdArray[k].TOTALWORKCOMPLPERCENT.toString();

				if (thresholdArray[k].AMOUNT_ACCURED !== undefined || thresholdArray[k].AMOUNT_ACCURED !== null) {
					thresholdArray[k].AMOUNT_ACCURED = parseFloat(thresholdArray[k].AMOUNT_ACCURED);
					if (thresholdArray[k].PO_CLOSURE == "true") {
						thresholdArray[k].AMOUNT_ACCURED = 0.00;
						thresholdArray[k].ACCRUALMETHOD = "WTD";
						thresholdArray[k].STRAIGHTLINEMTHD = "";
					}
					//	thresholdArray[k].AMOUNT_ACCURED = thresholdArray[k].AMOUNT_ACCURED.toString();
				}

			}
			var jsonData = {
				"statuspo": thresholdArray
			};
			$.ajax({
				type: "POST",
				url: sPostURI + "updateServPOStatus.xsjs",
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify(jsonData),
				success: function (data, Response) {
						if (data.EX_CODE === 1) {
							for (var j in thresholdArray) {
								// delete jsonArray[j].INVVALUE;
								let iTotalUnderCount = (iTotalServicePOUnder50KCount + iTotalMaterialPOUnder50KCount) - oController.reviewedCount;		
								let	sMessage = oController.geti18nText('message.submitted') + "\n\n" +
								oController.geti18nText('message.submitted.details')  + iTotalUnderCount;
							}
							oController.dashboardData();
							oController.getView().byId("saveBtnThre").setEnabled(false);
							oController.rebindTables();
							var oHistoryTable = oController.getView().byId("SmartTableBthreshold"); //march
							var oHistoryTable2 = oController.getView().byId("SmartTableThres2");
							oHistoryTable.rebindTable(true);
							oController.getView().byId("recordThre").setVisible(false);
							oHistoryTable2.rebindTable(true);
							oController.getView().byId("recordMater").setVisible(false);
							thresholdArray = [];
							jsonArrayfinal2 = [];
							MessageBox.information(sMessage);
							// MVP2 changes Start of Code
							oController.getView().byId("recordThre").setVisible(false);
							oController.getView().byId("recordMater").setVisible(false);
							// MVP2 changes End of Code
					} else {
						this._errorMessageClosingPOs();
						// common.displayErrorMessage(oController);
						oController.rebindTables();
						thresholdArray = [];
						jsonArrayfinal2 = [];
					}

				},
				error: function (error) {
					this._errorMessageClosingPOs();
					// common.displayErrorMessage(oController);
					oController.rebindTables();
					thresholdArray = [];
					jsonArrayfinal2 = [];
				}
			});
		},
		//gree end
		// Create Columns for Export of Audit table 
		createColumnConfig: function () {
			var aCols = [];

			aCols.push({
				label: 'PO Number',
				property: 'PONUMBER',
				type: EdmType.String
			});

			aCols.push({
				label: 'Item No',
				property: 'LINEITEM',
				type: EdmType.String
			});

			aCols.push({
				label: 'Field name',
				property: 'FNAME',
				type: EdmType.String
			});

			aCols.push({
				label: 'Changed By',
				type: EdmType.String,
				property: 'CHANGEDBY',
			});

			aCols.push({
				label: 'Changed On (CET)',
				property: 'CHANGEDON_CET',
				type: EdmType.String,
			});

			aCols.push({
				label: 'Old Value',
				property: 'OLDVALUE',
				type: EdmType.String
			});

			aCols.push({
				label: 'New Value',
				property: 'NEWVALUE',
				type: EdmType.String
			});

			return aCols;

		},
		// Handle the Export of CSV
		auditExportxls: function (oEvent) {
			var aCols, oRowBinding, oSettings, oSheet;
			var tableModel = this.getView().byId("displayAuditHistoryTable");
			oRowBinding = tableModel.getBinding("rows");
			aCols = this.createColumnConfig();
			// Get the PO # and the Item #
			var ponumber = oRowBinding.getModel().getData()[0].PONUMBER;
			var itemnumber = oRowBinding.getModel().getData()[0].LINEITEM;
			// Generate the file name 
			var filename = "Audit_Log_" + ponumber + "_" + itemnumber;
			oSettings = {
				workbook: {
					columns: aCols,
					hierarchyLevel: 'Level'
				},
				dataSource: oRowBinding,
				fileName: filename

			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build().finally(function () {
				oSheet.destroy();
			});

		},

		onPressEmailExcelButton: function (oEvent) {

			var mEmailExcelData = {
				"EMAIL": emailId,
				"POOWNER": loginUserRole
			};

			$.ajax({
				type: "POST",
				url: sPostURI + "getAllOpenPOs.xsjs",
				dataType: "json",
				async: true,
				cache: false,
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify(mEmailExcelData),
				success: function (data, Response) {
					//	MessageBox.success(oController.geti18nText("anemail") + " " + emailId + " " + oController.geti18nText("anemails"));
				},
				error: function (error) {
					//	MessageBox.error("Error while sending Email. Please try after some time");
				}
			});
			MessageBox.information(oController.geti18nText("anemail") + " " + emailId + " " + oController.geti18nText("anemails"));
		},
		onVideoPress: function (url, newTab) {
			// oController.getView().byId("videoId").setVisible(true);
			// oController.getView().byId("videoTabId").setVisible(false);
			var videoDialog = oController.getView().byId("vDialog");
			// var URL = "";
			if (!videoDialog) {
				videoDialog = sap.ui.xmlfragment(oController.getView().getId(), "com.takeda.Accrual_UI5.fragment.videoPopup", oController);
				oController.getView().addDependent(videoDialog);
			}
			videoDialog.open();
			var sIframeId = this.getView().byId(this.createId("srclink")).getId();
			$("#" + sIframeId).attr("src", url);

		},
		onCloseRef: function () {
			// oController.getView().byId("videoId").setVisible(false);
			// oController.getView().byId("videoTabId").setVisible(true);
			oController.getView().byId("vDialog").close();
		},
		/**
		 * Retrieves threshold percentage
		 * 
		 */
		_getThresholdValue: function(){
			sap.ui.core.BusyIndicator.show(0);
			const constantsModel = this.getView().getModel("constantsModel");
			const thresholdModel = this.getView().getModel("thresholdModel");
			thresholdModel.read("/RoundingThreshold", {
				success: function (oData) {
					if (oData.results){
					constantsModel.setProperty("/thresholdPercentage", oData.results[0].THRESHOLDVALUE)
					}
					BusyIndicator.hide();
				}.bind(this),
				error: function (error) {
					common.displayErrorMessage(oController);
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		/**
		 * Counts the decimal places of a float amount
		 * @param {float} fVal Float amount
		 * @return {int} decimal places
		 */
		_countDecimal: function (fVal){
			let arrVal = String(fVal).split(".");
			return arrVal[1]?arrVal[1].length:0;
		},
		/**
		 * Returns the precision multiplier that will be used for variance calculation
		 * @param {int} cVal decimal places
		 * @return {int} precision multiplier
		 */
		 _finalMultiplier(cVal){
			let iMultiplier=1;
			for(let i = 0;i<cVal; i++ ){
		    	iMultiplier = iMultiplier * 10;
		    }
		
			return iMultiplier;
		},
		/**
		 * Displays an error message when closing the POs
		 * @param 
		 * @return 
		 */
		_errorMessageClosingPOs: function () {
			let sErrorMessage = oController.geti18nText("message.submit.error") + " \n\n" +
				oController.geti18nText("PoNum") + " - " + oController.geti18nText("lineItem") + " \n";
			let iErrorCount = 0;
			
			for (var i in jsonArray) {
				if ((jsonArray[i].TOTALWORKCOMPLPERCENT === "") || (jsonArray[i].TOTALWORKCOMPLTODATE === "")) {
					sErrorMessage = sErrorMessage + (jsonArray[i].PONUMBER) + "   - " + (jsonArray[i].LINEITEM) + "\n";
					iErrorCount = iErrorCount + 1;
				}
			}
			MessageBox.error(sErrorMessage);
		}
	});
});