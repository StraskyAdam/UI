sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/takeda/Accrual_UI5/model/formatter",
	"com/takeda/Accrual_UI5/model/common",
	"sap/m/MessageBox",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Label",
	"sap/m/Text",
	"sap/ui/core/format/NumberFormat",
	"sap/m/TextArea",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/export/library",
	"sap/ui/export/Spreadsheet",
	"com/takeda/Accrual_UI5/model/poValueHelp",
	"com/takeda/Accrual_UI5/model/lineItemValueHelp",
	"com/takeda/Accrual_UI5/model/supplierValueHelp",
	"sap/ui/core/BusyIndicator",
	"../utils/Constants"
], function (Controller, Filter, FilterOperator, formatter, common, MessageBox, Dialog, DialogType, Button, ButtonType, Label, Text,
	NumberFormat,
	TextArea, JSONModel, ResourceModel, exportLibrary, Spreadsheet, poValueHelp, lineItemValueHelp, supplierValueHelp, BusyIndicator, Constants) {
	"use strict";
	var oController, loginUserRole = '',
		spathg,
		sCETDateTime, globalEvent,
		allDataAct1 = [],
		allDataThre1 = [],
		arrayAct1 = [],
		allDataThre2 = [],
		iBThre1 = 0,
		iBThre2 = 0,
		jsonArrayfinal2 = [], //gree
		tWork, amountCal,
		totalArrayAct1 = [],
		thresholdArray = [],
		allDataAct2 = [],
		materialPOClosureTBS, servicePOClosureTBS,
		serPOTBS = 0,
		tableRowObject,
		closurFlagTBSActUpon, closurFlagTBSThre,
		DialogFlag = 0,
		DialogFlagThre = 0,
		matPOTBS = 0,
		aribaLink, sapTBSArr = [],
		sapTBSStr, emailId, sPostURI,
		poValue, cols, aRows, oTableBatch, cols1, aRows1, oTableBatch1,
		percentCal, tAmount, jsonArray = [],
		count = 0,
		iTBSactUpon1 = 0,
		iTBSactUpon2 = 0;
	var month = [];
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

	// Variables for Service PO Value Helps
	var selectedPOValueHelp;
	var selectedItemValueHelp;
	var selectedSuppValueHelp;

	var POListJson = new sap.ui.model.json.JSONModel();
	var LIListJson = new sap.ui.model.json.JSONModel();
	var SNListJson = new sap.ui.model.json.JSONModel();

	var PONumSearchToken;
	var ItemNumSearchToken;
	var SupNameSearchToken;

	// Variables for Material PO Value Helps
	var POMatListJson = new sap.ui.model.json.JSONModel();
	var LIMatListJson = new sap.ui.model.json.JSONModel();
	var SNMatListJson = new sap.ui.model.json.JSONModel();
	var POThreMatListJson = new sap.ui.model.json.JSONModel(); //gree

	var POMatNumSearchToken;
	var ItemMatNumSearchToken;
	var SupMatNameSearchToken;

	// Variables for Supplier Name Value Helps
	var POThreListJson = new sap.ui.model.json.JSONModel();
	var LIThreListJson = new sap.ui.model.json.JSONModel();
	var SNThreMatListJson = new sap.ui.model.json.JSONModel(); //gree
	var SNThreListJson = new sap.ui.model.json.JSONModel();

	var POThreNumSearchToken;
	var POThreMatNumSearchToken; //gree
	var ItemThreMatNumSearchToken //gree
	var ItemThreNumSearchToken;
	var SupThreNameSearchToken;
	var SupThreMatNameSearchToken; //gree

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

	return Controller.extend("com.takeda.Accrual_UI5.controller.TBS", {
		formatter: formatter,
		common: common,
		/**
         * initiates the page with the data coming from previous page and creates a local model for external links
         */
		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			// Route to Current Stock View    
			oRouter.getRoute("TBSPage").attachPatternMatched(this.onObjectMatched, this);
			
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
			
			let oTable1 = this.byId("actUponTBS1");
		    let oTable2 = this.byId("MatTable");
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
			sap.ui.core.BusyIndicator.show(0);
			oEvent.getSource()._oRouter._oRoutes.TBSPage.mEventRegistry.patternMatched[0].oListener.oView.mAggregations.content[0].mAggregations
				.pages[0].mAggregations.content[0].mAggregations._header.setSelectedKey("DashboardTabTBS");
			oEvent.getSource()._oRouter._oRoutes.TBSPage.mEventRegistry.patternMatched[0].oListener.oView.mAggregations.content[0].mAggregations
				.pages[0].mAggregations.content[0].mAggregations._header.mAggregations.items[0].mAggregations.content[5].mAggregations.items[0].mAggregations
				._header.setSelectedKey("actUponTabTBS");
			oController.SelSubKeyTBS = "actUponTabTBS";
			// Show Busy Indicator

			if (window.location.hostname.substr(0, 6) === "webide") {
				// If application is running from WebIDE	
				emailId = "abhishek.ks@takeda.com";

				sPostURI = "/XSA_HTTP_ACCRUAL/xsjs/";
			} else {
				// If application is running from FLP	
				emailId = new sap.ushell.services.UserInfo().getUser().getEmail().toLowerCase();
				sPostURI = "/comtakedaAccrual_UI5/XSA_HTTP_ACCRUAL/xsjs/";
			}
			var oModel = new JSONModel();
			oModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
			oController.getView().setModel(oModel, "selection");
			var oModel2 = new JSONModel();
			oModel2.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
			oController.getView().setModel(oModel2, "selection2");
			this.getMatTable();
			this._getThresholdValue();
			//Get Help PDF
			common.getPDF(oController);
			// Get User Role
			common.getUserRole(oController, emailId);
			// Get the Users Details 
			common.getUserDetails(oController, emailId);
			// Get the Configuration Values from Backend
			common.getConfigValues(oController);
			// Get the TBS Dashboard Data
			this.dashboardTBSData();
			// Change Cell Colour
			this.changeCellColor();
			this.changeCellColorThr();
			this.getTimelineData();

			this.rebindTables();
			// MVP2 changes Start of Code
			this.getView().byId("recordTBS").setVisible(false);
			this.getView().byId("recordMatTBS").setVisible(false);
			this.getView().byId("recordThre").setVisible(false);
			this.getView().byId("recordMater").setVisible(false);
			// MVP2 changes End of Code
			if (oController._oPopUpDialog4) {
				oController._oPopUpDialog4 = [];
			}
			if (oController._oPopUpDialog5) {
				oController._oPopUpDialog5 = [];
			}
			if (oController._oPopUpDialog6) {
				oController._oPopUpDialog6 = [];
			}
			if (oController._oPopUpDialog7) {
				oController._oPopUpDialog7 = [];
			}
			// mvp2 changes start of code
			var d = new Date();
			d = new Date(d.toLocaleString("en-US", {
				timeZone: "Europe/Berlin"
			}));
			if (d.getDate() < 7) {
				oController.getView().byId("threPOClosureCheckBox").setEditable(false);
				oController.getView().byId("totalPOClosureMater").setEditable(false);
				//oController.getView().byId("threPOClosureCheckBox").setEditable(true);
				//oController.getView().byId("totalPOClosureMater").setEditable(true);
				oController.getView().byId("saveBtnThre").setVisible(false);
				//oController.getView().byId("saveBtnThre").setVisible(true);
			} else {
				var userRoleModel = oController.getOwnerComponent().getModel("userRoleModel");
				var userRoleDataModel = new sap.ui.model.json.JSONModel();
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
						// Get the User Access
						if (userRoleDataModel.oData.results.length > 0) {
							var access = userRoleDataModel.oData.results[0].USER_ACCESS;
							if (access === "Write") {
								oController.getView().byId("threPOClosureCheckBox").setEditable(true);
								oController.getView().byId("totalPOClosureMater").setEditable(true); //gree
								oController.getView().byId("saveBtnThre").setVisible(true);
							} else {
								oController.getView().byId("threPOClosureCheckBox").setEditable(false);
								oController.getView().byId("totalPOClosureMater").setEditable(false); //gree
								oController.getView().byId("saveBtnThre").setVisible(false);
							}
						}
					},
					error: function (error) {}
				});
			}

			// mvp2 changes end of code

			//common.getLinksData(oController);
			this.getView().byId("saveBtnTBS").setEnabled(false);
			this.getView().byId("saveBtnThre").setEnabled(false); //gree
			this.getView().byId("notifyBtnTBS").setEnabled(false);

			// Show Busy indicator for 2 seconds to 
			setTimeout(() => {
				sap.ui.core.BusyIndicator.hide();
			}, 2000);
		
		},
		onSelectDashTabsTBS: function (oEvent) {
			oController.SelSubKeyTBS = oEvent.getSource().getSelectedKey();
		},
		/**
		 * Selects the Main Tabs
		 * @param {oEvent} Event instance of upon press of the Icon Tab Bar
		 */
		onSelectMainTabs: function (oEvent) {
			const oSource = oEvent.getSource();
			const oView = oController.getView();
			const oLinkTable = oView.byId("linkTable");
			oLinkTable.setVisible(false);
			const keyid = oSource.getSelectedKey();
			let arr = [];
			//Transfer to Constant
			//Change to if("linkTabTBS" === keyid)
			if (keyid == "linkTabTBS") {
				sap.ui.core.BusyIndicator.show(0);
				oController.LinksPathTBS = oSource;
				oController.RoleDef = $.Deferred();
				common.getUserRole(oController, emailId);
				$.when(oController.RoleDef).done(function () {
					common.getLinksData(oController);

					$.when(oController.LinkDefTBS).done(function () {
						const len = oLinkTable.getItems().length;
						let oRefLinkModel = oView.getModel("refLinkModel");
						arr = oRefLinkModel.getData();

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
							} else if (arr[i].HELP_ID === "ALL_ILT_PRES") {
								arr[i].HELP_DESC = oController.geti18nText("ILT");
							} else if (arr[i].HELP_ID === "PO_MAINT_ACC_EXC") {
								arr[i].HELP_DESC = oController.geti18nText("Main");
							} else if (arr[i].HELP_ID === "DISP_POS_ACC") {
								arr[i].HELP_DESC = oController.geti18nText("Disp");
							} else if (arr[i].HELP_ID === "CRE_CHG_USR_GRP") {
								arr[i].HELP_DESC = oController.geti18nText("Create");
							}
						}
						oRefLinkModel.setData([]);
						oRefLinkModel.setData(arr);
						oRefLinkModel.refresh();
						oLinkTable.setVisible(true);
						sap.ui.core.BusyIndicator.hide();
					});
				});
			//Transfer to Constant
			//Change to if("VideoTabTBS" === keyid)
			} else if (keyid === "VideoTabTBS") {
				BusyIndicator.show(0);
				oController.getVideoLinksData();
			}
		},
	
		 /**
		  * Retrieves Video Links from the videolinks xsodata
		  */ 
		 
		getVideoLinksData: function () {
			//This will be transferred to BaseController during code re-engineering
			let oVideolinkODataModel = this.getOwnerComponent().getModel("videolinkModel");
			let oVideolinkJSONModel = new JSONModel();
			const sLangConfig = sap.ui.getCore().getConfiguration().getLanguage().toUpperCase();
			//hardcoded transfer to constant
			let sLang = "EN";
			if (sLangConfig !== sLang) {
				sLang = sLangConfig.slice(0,2);
			} 
			//Why do we need to call an explicit oData model read and set the result to a local JSON Model
			//Can't we do a direct binding to the XML ?
			oVideolinkODataModel.read("/videoLinksParameters(IP_LANG='" + sLang + "')/Results", {

				success: function (oData, oResponse) {
					oVideolinkJSONModel.setData(oData.results);
					oController.getView().setModel(oVideolinkJSONModel, "refVideoLinkModel");
					BusyIndicator.hide();
				},
				error: function (error) {
					common.displayErrorMessage(oController);
					BusyIndicator.hide();
				}
			});
		},
		
		getTimelineData: function () {
			var d = new Date();
			// Converts the Date to CET time zone
			d = new Date(d.toLocaleString("en-US", {
				timeZone: "Europe/Berlin"
			}));

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
			oController.getView().byId("presentMonTBS").setText(yearMon);
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
			oController.getView().byId("bulletMicroTimelineTBS").setMaxValue(lastDay.getDate());
			oController.getView().byId("bulletMicroTimelineTBS").setScale(" " + month[lastDay.getMonth()]);
			oController.getView().byId("bulletMicroTimelineTBS").setForecastValue(lastDay.getDate());
			oController.getView().byId("bulletMicroTimelineTBS").setTargetValue(date.getDate());
			oController.getView().byId("startDateTBS").setText(DateFormat.format(firstDay));
			oController.getView().byId("endDateTBS").setText(DateFormat.format(lastDay));
			oController.getView().byId("bulletValueTBS").setValue(date.getDate());
			date.setDate(7);
			var date7 = DateFormat.format(date);
			oController.getView().byId("cutOffDateTBS").setText(date7);
		},
		getMatTable: function () {

			// Fetching the Table Id
			oTableMaterial = oController.getView().byId("MatTable");
			oTableMaterial.addEventDelegate({
				onAfterRendering: function () {
					rowsMaterial = oTableMaterial.getRows();
					if (oTableMaterial.getRows().length > 0) {
						colsMaterial = oTableMaterial.getRows()[1].getCells();
					}
				}
			}, oTableMaterial);

		},

		geti18nText: function (name) {
			spathg = oController.getView().getModel('i18n').getResourceBundle();
			return oController.getView().getModel('i18n').getResourceBundle().getText(name);
		},

		// Change the cell color ( editable ) gree start

		// // Change the cell color ( editable )

		changeCellColor: function () {
			// Fetching the Table Id
			oTableBatch = oController.getView().byId("actUponTBS1");
			oTableBatch.addEventDelegate({
				onAfterRendering: function () {
					aRows = oTableBatch.getRows();
					if (oTableBatch.getRows().length > 0) {
						cols = oTableBatch.getRows()[1].getCells()

						// cols = oTableBatch.getColumns();
						for (var j = 0; j < cols.length; j++) {
							if ((aRows[1].getCells()[j].getId().split("-")[2] == "totalAmountTBS") ||
								(aRows[1].getCells()[j].getId().split("-")[2] == "totalPercentTBS")) {
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
		// gree end

		onBeforeExport: function (oEvent) {
			var mExcelSettings = oEvent.getParameter("exportSettings");
			mExcelSettings.workbook.columns.forEach((column) => {
				if (column.type === "Date") {
					column.type = sap.ui.export.EdmType.Date;
					column.format = "dd mmm yyyy"
				}
			});
			var iRowCount = oEvent.mParameters.exportSettings.dataSource.count;
			if (iRowCount > 6000) {
				var errorText = oController.geti18nText("excelerror");
			    setTimeout(function() {
			        MessageBox.error(errorText);
			    }, 500);
				return;
			}

			var sSmartTableID = oEvent.getParameters().id.split("--").pop(),
				sDateTimeFormatDisplay = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "yyyyMMddHHmmss"
				});

			switch (sSmartTableID) {
			case 'SmartTableTBSactUpon1':
				mExcelSettings.fileName = "Digital PO Accruals Dashboard Indirect Service_" + sDateTimeFormatDisplay.format(new Date());
				break;
			case 'SmartTableTBSactUpon2':
				mExcelSettings.fileName = "Digital PO Accruals Dashboard Indirect Material_" + sDateTimeFormatDisplay.format(new Date());
				break;
			case 'SmartTableTBSinfo':
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

		dashboardTBSData: function () {
			/*
			var dasbModel = this.getOwnerComponent().getModel("dashboardModel");
			this.getView().byId("dashboardBoxTBS").setModel(dasbModel);
			var tradeModel = new sap.ui.model.json.JSONModel();

			var tradeId = oController.getView().byId("dashboardBoxTBS");

			var tradeArr = [];
			dasbModel.read("/dashboardPOParameters(IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results", {
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

						tradeArr.push(dashArray);
					}
					tradeModel.setData(tradeArr);
					tradeModel.setSizeLimit(50000);
					tradeId.setModel(tradeModel, "tradeJsn");
				},
				error: function (e) {
					common.displayErrorMessage(oController);
				}
			}); */
		},

		getMonthData: function () {
			// month = new Array();
			var d = new Date();
			// Converts the Date to CET time zone
			d = new Date(d.toLocaleString("en-US", {
				timeZone: "Europe/Berlin"
			}));

			// var mont = month[d.getMonth()];
			// var year = d.getFullYear();
			// var yearMon = mont + " " + year;
			if (d.getDate() < 7) {
				var yearMon = month[(d.getMonth(d.setMonth(d.getMonth() - 1)))] + " " + d.getFullYear();
			} else {
				var yearMon = month[d.getMonth()] + " " + d.getFullYear();
			}
			oController.getView().byId("presentMonTBS").setText(yearMon);
		},
		getAuditLogData: function (auditPo, lineItem) {

			var auditModel = this.getOwnerComponent().getModel("auditModel");
			this.getView().byId("displayAuditHistoryTable").setModel(auditModel);
			var auditJsonModel = new sap.ui.model.json.JSONModel();

			var auditTableId = oController.getView().byId("displayAuditHistoryTable");

			var auditArr = [];
			var auditTitle = oController.geti18nText("PoNum") + ": " + auditPo + ", " + oController.geti18nText("lineItem") + ": " + lineItem;

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
		onDetCancel1: function () {
			oController.getView().byId("cdialog1").close();
		},
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
		onPressAribaLink: function (oEvent) {
			oController.getAribaLink(oEvent);
			window.open(aribaLink);
		},
		detDialog: function () {
			var detDialog = oController.getView().byId("cdialog");
			if (!detDialog) {
				detDialog = sap.ui.xmlfragment(oController.getView().getId(), "com.takeda.Accrual_UI5.fragment.details", oController);
				oController.getView().addDependent(detDialog);
			}
			detDialog.open();
		},
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
				// var budget = 30;

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
		onDetCancel: function () {
			oController.getView().byId("cdialog").close();
		},
		onBeforeRebindAct1Table: function (oEvent) {
			// Added SUZ9125
			rowSelection = [];

			// end SUZ9125
			var mBindingParams = oEvent.getParameter("bindingParams");
			var oSmtFilter = this.getView().byId("smartFilterBarTBSact");
			// oSmtFilter._aFields.splice(3,3);
			var oComboBox0 = oSmtFilter.getControlByKey("MyOwnTBSFilterField0");
			var aCountKeys0 = oComboBox0.getTokens();

			if (aCountKeys0.length > 0) {

				for (var i = 0; i <= aCountKeys0.length - 1; i++) {
					var newFilter0 = new Filter("PONUMBER", FilterOperator.EQ, aCountKeys0[i].mProperties.key);
					mBindingParams.filters.push(newFilter0);
				}
			}
			var oComboBox1 = oSmtFilter.getControlByKey("MyOwnTBSFilterField1");
			var aCountKeys1 = oComboBox1.getTokens();

			if (aCountKeys1.length > 0) {

				for (var j = 0; j <= aCountKeys1.length - 1; j++) {
					var newFilter1 = new Filter("ITEMNO", FilterOperator.EQ, aCountKeys1[j].mProperties.key);
					mBindingParams.filters.push(newFilter1);
				}
			}
			var oComboBox2 = oSmtFilter.getControlByKey("MyOwnTBSFilterField2");
			var aCountKeys2 = oComboBox2.getTokens();

			if (aCountKeys2.length > 0) {

				for (var k = 0; k <= aCountKeys2.length - 1; k++) {
					var newFilter2 = new Filter("SUPPLIERNAME", FilterOperator.Contains, aCountKeys2[k].mProperties.key);
					mBindingParams.filters.push(newFilter2);
				}
			}

			var sPath = "/openPOParameters(IP_PSTYPE='9',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results";
			var SmartTableTBSactUpon1 = this.getView().byId("SmartTableTBSactUpon1");
			SmartTableTBSactUpon1.setTableBindingPath(sPath);
			SmartTableTBSactUpon1.getModel().setSizeLimit(50000);

			// get the array of columns
			var aColumns = SmartTableTBSactUpon1._oPersController.getColumnKeys();
			// remove your property from that array
			if (aColumns.indexOf("TOTWRKCOMPAMT_CHAR") > -1) {
				aColumns.splice(aColumns.indexOf("TOTWRKCOMPAMT_CHAR"), 1);
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
			SmartTableTBSactUpon1._oPersController.mProperties.columnKeys = aColumns;

			mBindingParams.events = {
				"dataReceived": function (oEvent) {
					//oController.totalAbove50KCount = 0;
					var iCount = oEvent.getSource().getLength();
					//oController.totalAbove50KCount += iCount;
					iTotalServicePOAbove50KCount= iCount;
					// common.updateTableCountModel.call(this, "/PoOver50", iCount);
					common.updateTableCountModel.call(this, "/PoOver50Services", iCount);

					var aReceivedData = oEvent.getParameter('data');
					//	iTBSactUpon1 = aReceivedData.results.length;
					// mvp2 changes start
					if (iTBSactUpon1 < 0) {
						MessageBox.error(oController.geti18nText("nodata"));
						return;
					}
					// mvp2 changes end
					// arrayAct1 = aReceivedData;
					// allDataAct1 = aReceivedData.results;
					// concatinating the previous allDataAct1 Array with current received data 
					allDataAct1 = allDataAct1.concat(aReceivedData.results); // changed on 25 Oct
					// to delete the duplicate values
					allDataAct1 = allDataAct1.filter((arr, index, self) => index === self.findIndex((t) =>
						(t.PONUMBER === arr.PONUMBER && t.ITEMNO === arr.ITEMNO)));
					// to get the length of the whole records after scrolling
					iTBSactUpon1 = allDataAct1.length; // Added by Rakesh
					for (var i = 0; i < iTBSactUpon1; i++) {
						allDataAct1[i].PSTYPE = '9';
					}
					totalArrayAct1 = totalArrayAct1.concat(arrayAct1);
					totalArrayAct1 = aReceivedData.results;
					for (var i = 0; i < totalArrayAct1.length; i++) {
						totalArrayAct1[i].PSTYPE = '9';
					}

					// If the Newly created PO ( created this month ) count > 0, then enable the icon below the table
					common.setNewPOIconVisibility(oController, aReceivedData.results, "hboxNewPOServTBSPOOwner");
					// If PO Owner was notified within last 24 hrs, Legend
					common.setNotifIconVisibility(oController, aReceivedData.results, "hboxNotifServTBSPOOwner");
					// sap.ui.core.BusyIndicator.hide();
				}.bind(this)
			};
		},
		onBeforeRebindAct2Table: function (oEvent) {
			rowSelectionMaterial = [];
			var mBindingParams = oEvent.getParameter("bindingParams");
			var oSmtFilter = this.getView().byId("smartFilterBarTBS2");
			// oSmtFilter._aFields.splice(3,3);
			var oComboBox0 = oSmtFilter.getControlByKey("MyOwnFilterFieldTBS0");
			var aCountKeys0 = oComboBox0.getTokens();

			if (aCountKeys0.length > 0) {
				for (var i = 0; i <= aCountKeys0.length - 1; i++) {
					var newFilter0 = new Filter("PONUMBER", FilterOperator.EQ, aCountKeys0[i].mProperties.key);
					mBindingParams.filters.push(newFilter0);
				}
			}
			var oComboBox1 = oSmtFilter.getControlByKey("MyOwnFilterFieldTBS1");
			var aCountKeys1 = oComboBox1.getTokens();

			if (aCountKeys1.length > 0) {
				for (var j = 0; j <= aCountKeys1.length - 1; j++) {
					var newFilter1 = new Filter("ITEMNO", FilterOperator.EQ, aCountKeys1[j].mProperties.key);
					mBindingParams.filters.push(newFilter1);
				}
			}
			var oComboBox2 = oSmtFilter.getControlByKey("MyOwnFilterFieldTBS2");
			var aCountKeys2 = oComboBox2.getTokens();

			if (aCountKeys2.length > 0) {
				for (var k = 0; k <= aCountKeys2.length - 1; k++) {
					var newFilter2 = new Filter("SUPPLIERNAME", FilterOperator.Contains, aCountKeys2[k].mProperties.key);
					mBindingParams.filters.push(newFilter2);
				}
			}

			var sPath = "/openPOParameters(IP_PSTYPE='0',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole + "')/Results";
			var SmartTableTBSactUpon1 = this.getView().byId("SmartTableTBSactUpon2");
			SmartTableTBSactUpon1.setTableBindingPath(sPath);
			var aColumns = SmartTableTBSactUpon1._oPersController.getColumnKeys();
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
			SmartTableTBSactUpon1._oPersController.mProperties.columnKeys = aColumns;
			mBindingParams.events = {
				"dataReceived": function (oEvent) {
					var iCount = oEvent.getSource().getLength();
					//oController.totalAbove50KCount += iCount;
					iTotalMaterialPOAbove50KCount = iCount;
					// common.updateTableCountModel.call(this, "/PoOver50", iCount);
					common.updateTableCountModel.call(this, "/PoOver50Materials", iCount);

					var aReceivedData = oEvent.getParameter('data');
					//	iTBSactUpon2 = aReceivedData.results.length;
					// allDataAct2 = aReceivedData.results;
					// concatinating the previous allDataAct2 Array with current received data 
					allDataAct2 = allDataAct2.concat(aReceivedData.results); // changed on 25 Oct

					// to delete the duplicate values
					allDataAct2 = allDataAct2.filter((arr, index, self) => index === self.findIndex((t) =>
						(t.PONUMBER === arr.PONUMBER && t.ITEMNO === arr.ITEMNO)));
					iTBSactUpon2 = allDataAct2.length; // Added by Rakesh
					for (var i = 0; i < iTBSactUpon2; i++) {
						allDataAct2[i].PSTYPE = '0';
					}
					// mvp2 changes start
					if (iTBSactUpon2 < 0) {
						MessageBox.error(oController.geti18nText("nodata"));
						return;
					}
					// mvp2 changes end
					// If the Newly created PO ( created this month ) count > 0, then enable the icon below the table
					common.setNewPOIconVisibility(oController, aReceivedData.results, "hboxNewPOMatTBSPOOwner");
					// If PO Owner was notified within last 24 hrs, Legend
					common.setNotifIconVisibility(oController, aReceivedData.results, "hboxNotifMatTBSPOOwner");
					// sap.ui.core.BusyIndicator.hide();
				}.bind(this)
			};

		},
		// For PO NUMBER Filters
		onValueHelpDialogPONum: function (oEvent) {
			selectedPOValueHelp = '';
			// Get the calling fragment, Service or Material 
			if (oEvent.mParameters.id.split('--')[1] === 'ownerServTBSPoNum') {
				poValueHelp.valueHelpDialogPONum(oEvent, oController, POListJson, PONumSearchToken, this);
				selectedPOValueHelp = 'S';
			} else if (oEvent.mParameters.id.split('--')[1] === 'matServTBSPoNum') {
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

		onTokenUpdate: function (oEvent) {
			var tokenAction = oEvent.getParameter('type');
			if (tokenAction === 'removed') {
				var removedTokens = oEvent.getParameter('removedTokens');
				var poNum = removedTokens[0].getProperty("key");
				if (oEvent.mParameters.id.split('--')[1] === 'ownerServTBSPoNum') {
					oController.poList.splice(oController.poList.findIndex((t) => (t.getProperty('key') === poNum)));
					PONumSearchToken = oController.poList;
					// var oHistoryTable = oController.getView().byId("SmartTableTBSactUpon1");
					// oHistoryTable.rebindTable(true);

				} else if (oEvent.mParameters.id.split('--')[1] === 'matServTBSPoNum') {
					oController.poMatList.splice(oController.poMatList.findIndex((t) => (t.getProperty('key') === poNum)));
					POMatNumSearchToken = oController.poMatList;
					// var oHistoryTable = oController.getView().byId("SmartTableTBSactUpon2");
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
			if (oEvent.mParameters.id.split('--')[1] === 'ownerServTBSPoNum') {
				PONumSearchToken = poValueHelp.poFilterEnter(oEvent, oController);
				var oHistoryTable = oController.getView().byId("SmartTableTBSactUpon1");
				oHistoryTable.rebindTable(true);

			} else if (oEvent.mParameters.id.split('--')[1] === 'matServTBSPoNum') {
				POMatNumSearchToken = poValueHelp.poFilterEnter(oEvent, oController);
				var oHistoryTable = oController.getView().byId("SmartTableTBSactUpon2");
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

		onPressOkPONum: function (oEvent) {
			if (selectedPOValueHelp === 'S') {
				PONumSearchToken = poValueHelp.pressOkPONum(oEvent, oController, PONumSearchToken, this, "ownerServTBSPoNum");
			} else if (selectedPOValueHelp === 'M') {
				POMatNumSearchToken = poValueHelp.pressOkPONum(oEvent, oController, POMatNumSearchToken, this, "matServTBSPoNum");
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
				poValueHelp._poNumFilterSelectionChange(oEvent, oController, "ownerServTBSPoNum");
			} else if (selectedPOValueHelp === 'M') {
				poValueHelp._poNumFilterSelectionChange(oEvent, oController, "matServTBSPoNum");
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
			if (oEvent.mParameters.id.split('--')[1] === 'ownerServTBSItemNo') {
				lineItemValueHelp.valueHelpDialogItemNum(oEvent, oController, LIListJson, ItemNumSearchToken, this, 'S');
				selectedItemValueHelp = 'S';
			} else if (oEvent.mParameters.id.split('--')[1] === 'matServTBSItemNo') {
				lineItemValueHelp.valueHelpDialogItemNum(oEvent, oController, LIMatListJson, ItemMatNumSearchToken, this, 'M');
				selectedItemValueHelp = 'M';
			} else if (oEvent.mParameters.id.split('--')[1] === 'threServItemNo') {
				lineItemValueHelp.valueHelpDialogItemNum(oEvent, oController, LIThreListJson, ItemThreNumSearchToken, this, 'M');
				selectedItemValueHelp = 'T';
			} else if (oEvent.mParameters.id.split('--')[1] === 'matThreItemNos') { //gree
				lineItemValueHelp.valueHelpDialogItemNum(oEvent, oController, LIThreMatListJson, ItemThreMatNumSearchToken, this, 'M');
				selectedItemValueHelp = 'H';
			} else if (oEvent.mParameters.id.split('--')[1] === 'exclServItemNo') {
				lineItemValueHelp.valueHelpDialogItemNum(oEvent, oController, LIExclListJson, ItemExclNumSearchToken, this, 'M');
				selectedItemValueHelp = 'E';
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
			if (oEvent.mParameters.id.split('--')[1] === 'ownerServTBSItemNo') {
				ItemNumSearchToken = lineItemValueHelp.itemFilterEnter(oEvent, oController, pId);
			} else if (oEvent.mParameters.id.split('--')[1] === 'matServTBSItemNo') {
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
				if (pID === 'ownerServTBSItemNo') {
					oController.lineitem.splice(oController.lineitem.findIndex((t) => (t.getProperty('key') === itemNum)));
					ItemNumSearchToken = oController.lineitem;

				} else if (oEvent.mParameters.id.split('--')[1] === 'matServTBSItemNo') {
					oController.lineMatItem.splice(oController.lineMatItem.findIndex((t) => (t.getProperty('key') === itemNum)));
					ItemNumSearchToken = oController.lineitem;

				} else if (oEvent.mParameters.id.split('--')[1] === 'threServItemNo') {
					oController.lineThreItem.splice(oController.lineThreItem.findIndex((t) => (t.getProperty('key') === itemNum)));
					ItemThreNumSearchToken = oController.lineThreItem;

				} else if (oEvent.mParameters.id.split('--')[1] === 'matThreItemNos') { //gree
					oController.lineitem.splice(oController.lineitem.findIndex((t) => (t.getProperty('key') === itemNum)));
					ItemThreMatNumSearchToken = oController.lineitem;

				} else if (oEvent.mParameters.id.split('--')[1] === 'exclServItemNo') {
					oController.lineExclItem.splice(oController.lineExclItem.findIndex((t) => (t.getProperty('key') === itemNum)));
					ItemExclNumSearchToken = oController.lineExclItem;

				}

			}

		},

		onPressOkLineItem: function (oEvent) {
			if (selectedItemValueHelp === 'S') {
				ItemNumSearchToken = lineItemValueHelp.pressOkLineItem(oEvent, oController, ItemNumSearchToken, this, "ownerServTBSItemNo");
			} else if (selectedItemValueHelp === 'M') {
				ItemMatNumSearchToken = lineItemValueHelp.pressOkLineItem(oEvent, oController, ItemMatNumSearchToken, this, "matServTBSItemNo");
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
				lineItemValueHelp._itemNumFilterSelectionChange(oEvent, oController, "ownerServTBSItemNo");
			} else if (selectedItemValueHelp === 'M') {
				lineItemValueHelp._itemNumFilterSelectionChange(oEvent, oController, "matServTBSItemNo");
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
			// Get the calling fragment, ServTBSice or Material 
			if (oEvent.mParameters.id.split('--')[1] === 'ownerServTBSSuppName') {
				supplierValueHelp.valueHelpDialogSupName(oEvent, oController, SNListJson, SupNameSearchToken, this);
				selectedSuppValueHelp = 'S';
			} else if (oEvent.mParameters.id.split('--')[1] === 'matServTBSSuppName') {
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

		onTokenSuppIDUpdate: function (oEvent) {
			var tokenAction = oEvent.getParameter('type');
			if (tokenAction === 'removed') {
				var removedTokens = oEvent.getParameter('removedTokens');
				var suppID = removedTokens[0].getProperty("key");

				if (oEvent.mParameters.id.split('--')[1] === 'ownerServTBSSuppName') {
					oController.supplierID.splice(oController.supplierID.findIndex((t) => (t.getProperty('key') === suppID)));
					SupNameSearchToken = oController.supplierID;
					// var oHistoryTable = oController.getView().byId("SmartTableTBSactUpon1");
					// oHistoryTable.rebindTable(true);

				} else if (oEvent.mParameters.id.split('--')[1] === 'matServTBSSuppName') {
					oController.supplierMatID.splice(oController.supplierMatID.findIndex((t) => (t.getProperty('key') === suppID)));
					SupMatNameSearchToken = oController.supplierMatID;
					// var oHistoryTable = oController.getView().byId("SmartTableTBSactUpon2");
					// oHistoryTable.rebindTable(true);

				} else if (oEvent.mParameters.id.split('--')[1] === 'threServSuppName') {
					oController.supplierThreID.splice(oController.supplierThreID.findIndex((t) => (t.getProperty('key') === suppID)));
					SupThreNameSearchToken = oController.supplierThreID;
					// var oHistoryTable = oController.getView().byId("SmartTableBthreshold");
					// oHistoryTable.rebindTable(true);

				} else if (oEvent.mParameters.id.split('--')[1] === 'matThreSuppNames') { //gree
					oController.supplierID.splice(oController.supplierID.findIndex((t) => (t.getProperty('key') === suppID)));
					SupThreMatNameSearchToken = oController.supplierID;
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
			if (oEvent.mParameters.id.split('--')[1] === 'ownerServTBSSuppName') {
				SupNameSearchToken = supplierValueHelp.suppIDFilterEnter(oEvent, oController);
				var oHistoryTable = oController.getView().byId("SmartTableTBSactUpon1");
				oHistoryTable.rebindTable(true);

			} else if (oEvent.mParameters.id.split('--')[1] === 'matServTBSSuppName') {
				SupMatNameSearchToken = supplierValueHelp.suppIDFilterEnter(oEvent, oController);
				var oHistoryTable = oController.getView().byId("SmartTableTBSactUpon2");
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

		onPressOkSupName: function (oEvent) {
			if (selectedSuppValueHelp === 'S') {
				SupNameSearchToken = supplierValueHelp.pressOkSupName(oEvent, oController, SupNameSearchToken, this, "ownerServTBSSuppName");
			} else if (selectedSuppValueHelp === 'M') {
				SupMatNameSearchToken = supplierValueHelp.pressOkSupName(oEvent, oController, SupMatNameSearchToken, this, "matServTBSSuppName");
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
				supplierValueHelp._supNameFilterSelectionChange(oEvent, oController, "ownerServTBSSuppName");
			} else if (selectedSuppValueHelp === 'M') {
				supplierValueHelp._supNameFilterSelectionChange(oEvent, oController, "matServTBSSuppName");
			} else if (selectedSuppValueHelp === 'T') {
				supplierValueHelp._supNameFilterSelectionChange(oEvent, oController, "threServSuppName");
			} else if (selectedSuppValueHelp === 'H') { //gree
				supplierValueHelp._supNameFilterSelectionChange(oEvent, oController, "matThreSuppNames");
			} else if (selectedSuppValueHelp === 'E') {
				supplierValueHelp._supNameFilterSelectionChange(oEvent, oController, "exclServSuppName");
			}
		},

		onClearTBSFilters: function (oEvent) {
			oController.getView().byId("ownerServTBSPoNum").removeAllTokens();
			oController.getView().byId("ownerServTBSItemNo").removeAllTokens();
			oController.getView().byId("ownerServTBSSuppName").removeAllTokens();
			// Re populate the table
			var oHistoryTable = oController.getView().byId("SmartTableTBSactUpon1");
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

		onclearMatTBSFilter: function (oEvent) {
			oController.getView().byId("matServTBSPoNum").removeAllTokens();
			oController.getView().byId("matServTBSItemNo").removeAllTokens();
			oController.getView().byId("matServTBSSuppName").removeAllTokens();
			// Re populate the table
			var oHistoryTable = oController.getView().byId("SmartTableTBSactUpon2");
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
			}

			//	var obrandModel = this.getOwnerComponent().getModel("excludedPOModel");
			//	SmartTableBinfo.setModel(obrandModel);
		},
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
			/*	if (aColumns.indexOf("PONUMBER") > -1) {
					aColumns.splice(aColumns.indexOf("PONUMBER"), 1);
				}*/
			if (aColumns.indexOf("ACCRUALMETHOD") > -1) {
				aColumns.splice(aColumns.indexOf("ACCRUALMETHOD"), 1);
			}
			SmartTableBthre._oPersController.mProperties.columnKeys = aColumns;

			mBindingParams.events = {
					"dataReceived": function (oEvent) {
						//oController.totalUnder50KCount = 0;
						var iCount = oEvent.getSource().getLength();
						//oController.totalUnder50KCount += iCount;
						iTotalServicePOUnder50KCount = iCount;
						// common.updateTableCountModel.call(this, "/PoUnder50", iCount);
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
				}
				//	var oThreshModel = this.getOwnerComponent().getModel("thresholdModel");
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

			//	var oThreshModel = this.getOwnerComponent().getModel("thresholdModel");
			//	SmartTableBthre1.setModel(oThreshModel);
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
			/*	if (aColumns.indexOf("PONUMBER") > -1) {
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
			mBindingParams.events = {
				"dataReceived": function (oEvent) {
					var iCount = oEvent.getSource().getLength();
					//oController.totalUnder50KCount += iCount;
					iTotalMaterialPOUnder50KCount = iCount;
					// common.updateTableCountModel.call(this, "/PoUnder50", iCount);
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

		// <!--MVP2 changes Start of Code-->
		onPressCancelS: function () {
			if (oController.selectedTableID === "actUponTBS1") {
				oController.onPressCancelPopUpDialogTBS();
			} else if (oController.selectedTableID === "MatTable") {
				oController.onSelectCancelPOClosureMatTBS();
			} else if (oController.selectedTableID === "thrTab") {
				oController.onSelectCancelPOClsSthreTBS();
			} else if (oController.selectedTableID === "MatTableBThrs") {
				oController.onSelctCancelPOMatrThreTBS();
			}
		},
		onPressContPressPO: function (oEvent) {
			oController.TabPat = oEvent.getSource();
			if (oController.selectedTableID === "actUponTBS1") {
				oController.onPressMarkPOClosureDialogTBS();
				//oController.PoPath.setEnabled(true); //fix for scrollbar issue  aod405 checkbox dissable 
				//oController.PoPath.getParent().mAggregations.cells[14].setEnabled(true);
				//oController.PoPath.getParent().mAggregations.cells[15].setEnabled(true);
				//oController.PoPath.getParent().mAggregations.cells[21].setEnabled(true);

			} else if (oController.selectedTableID === "MatTable") {
				oController.onSelectContinuePOClosureMatTBS();
				//oController.PoPath.setEnabled(true); //fix for scrollbar issue  aod405 checkbox dissable 
				// oController.PoPath.getParent().mAggregations.cells[14].setEnabled(true);
				//oController.PoPath.getParent().mAggregations.cells[15].setEnabled(true);
				//oController.PoPath.getParent().mAggregations.cells[21].setEnabled(true);

			} else if (oController.selectedTableID === "thrTab") {
				oController.onSelectPOClosureSThreTBS();
				//oController.PoPath.setEnabled(true); //fix for scrollbar issue  aod405 checkbox dissable 
				//oController.PoPath.getParent().mAggregations.cells[14].setEnabled(true);
				//oController.PoPath.getParent().mAggregations.cells[15].setEnabled(true);
				//oController.PoPath.getParent().mAggregations.cells[21].setEnabled(true);

			} else if (oController.selectedTableID === "MatTableBThrs") {
				oController.onSelectContinePOClosureMaterThreTBS();
				//oController.PoPath.setEnabled(true); //fix for scrollbar issue  aod405 checkbox dissable 
				//oController.PoPath.getParent().mAggregations.cells[14].setEnabled(true);
				//oController.PoPath.getParent().mAggregations.cells[15].setEnabled(true);
				//oController.PoPath.getParent().mAggregations.cells[21].setEnabled(true);

			}
		},
		onPressCancelPopUpDialogTBS: function () {
			serPOTBS = 0;
			var selIndex = oController.POSselIndex;
			oController.PoPath.setEnabled(true);
			oController.PoPath.setSelected(false);
			//oController.getView().byId('SmartTableTBSactUpon1').getTable().removeSelectionInterval(selIndex, selIndex);
			oController._oPopUpDialog4.close();
			oController._oPopUpDialog4 = [];

		},
		onPressMarkPOClosureDialogTBS: function (oEvent) {
			var selIndex = oController.POSselIndex;
			oController.cols = oController.PoPath.getParent().getParent().getColumns();
			cols = oController.cols;
			/*	oController.tableRowObjectSel1 = oController.TabPat.getParent().getParent().mAggregations.content[0].mAggregations.pages[0].mAggregations
					.content[0]
					.mAggregations._header.mAggregations.items[0].mAggregations.content[5].mAggregations.items[0].mAggregations._header.mAggregations.items[
						0].mAggregations.content[0].mAggregations.items[2].getTable()._getFirstRenderedRowIndex();
				var diff1 = selIndex - oController.tableRowObjectSel1;
				oController.tableRowObject1 = oController.TabPat.getParent().getParent().mAggregations.content[0].mAggregations.pages[0].mAggregations
					.content[0]
					.mAggregations._header.mAggregations.items[0].mAggregations.content[5].mAggregations.items[0].mAggregations._header.mAggregations.items[
						0].mAggregations.content[0].mAggregations.items[2].getTable().mAggregations.rows[diff1];*/
			// for (var i = 0; i < oController.PoPath.getParent().mAggregations.cells.length; i++) {
			// 	if (oController.PoPath.getParent().mAggregations.cells[i].sId.split("-")[2] === "totalAmountTBS") {
			// 		var Index1 = i;
			// 	}
			// 	if (oController.PoPath.getParent().mAggregations.cells[i].sId.split("-")[2] === "totalPercentTBS") {
			// 		var Index2 = i;
			// 	}
			// 	if (oController.PoPath.getParent().mAggregations.cells[i].sId.split("-")[2] === "totalStLineTBS") {
			// 		var Index3 = i;
			// 	}
			// }
			// oController.PoPath.setEnabled(false);
			// oController.PoPath.getParent().mAggregations.cells[Index1].setEnabled(false);
			// oController.PoPath.getParent().mAggregations.cells[Index2].setEnabled(false);
			// oController.PoPath.getParent().mAggregations.cells[Index3].setEnabled(false);
			var decimalFormat = oController.userDecimalFormat;
			if (allDataAct1.length > 0) {
				// Get the PO# and Line Item # 
				for (var k = 0; k < cols.length; k++) {
					if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search("poHBoxIdTBS") >=
						0) {
						var tableRowPONumber = oController.PoPath.getParent().getCells()[k].mAggregations.items[0].getText();
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"itemNoTBS") >=
						0) {
						var tableRowItemNumber = oController.PoPath.getParent().getCells()[k].getText();
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"idInvoiceAmounttoDateTBS") >= 0) {
						if ( decimalFormat == "Y") {
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
							"idPOValueTBS") >=
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
						}
						else if (decimalFormat == "X") {
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

				if (decimalFormat == " "|| decimalFormat == "" ) {
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

				if (decimalFormat == " "|| decimalFormat == "") {
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
							"totalPercentTBS") >=
						0) {
						oController.PoPath.getParent().getCells()[k].setValue(tempTotalPercent);
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"totalUSDAmountTBS") >= 0) {
						oController.PoPath.getParent().getCells()[k].setText(tempTotalUSDAmount);
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"totalAmtAccruTBS") >= 0) {
						oController.PoPath.getParent().getCells()[k].setText(tempAmountAccurred);
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"totalUSDAmtAccruTBS") >= 0) {
						oController.PoPath.getParent().getCells()[k].setText(tempAmountAccurredUSD);
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"totalAccMetTBS") >= 0) {
						oController.PoPath.getParent().getCells()[k].setText(tempAccuralMethod);
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"totalStLineTBS") >= 0) {
						if (tempAccuralMethod == "Work To Date") {
							oController.PoPath.getParent().getCells()[k].setSelected(false);
						}
					}
				}
				if (jsonArray[jsonIndex] !== undefined) {
					jsonArray[jsonIndex].PO_CLOSURE = servicePOClosureTBS;
					oController.getView().byId('SmartTableTBSactUpon1').getTable().removeSelectionInterval(selIndex, selIndex);
					oController.getView().byId('SmartTableTBSactUpon1').getTable().addSelectionInterval(selIndex, selIndex);
				} else {
					oController.getView().byId('SmartTableTBSactUpon1').getTable().removeSelectionInterval(selIndex, selIndex);
					oController.getView().byId('SmartTableTBSactUpon1').getTable().addSelectionInterval(selIndex, selIndex);
				}
			} else {
				oController.getView().byId('SmartTableTBSactUpon1').getTable().removeSelectionInterval(selIndex, selIndex);
				oController.getView().byId('SmartTableTBSactUpon1').getTable().addSelectionInterval(selIndex, selIndex);
			}
			oController.getOwnerComponent().getModel().setProperty(oController.getView().byId("actUponTBS1").getContextByIndex(selIndex).getPath() +
				"/POCLOSURE_FLAG", "1");
			oController.getOwnerComponent().getModel().setProperty(oController.getView().byId("actUponTBS1").getContextByIndex(selIndex).getPath() +
				"/POCLOSURE_FLAG_LOCAL", true);
			oController._oPopUpDialog4.close();
			oController._oPopUpDialog4 = [];

		},
		// On click of PO Closure Check box
		onSelectPOClosure: function (oEvent) {
			serPOTBS = 1;
			servicePOClosureTBS = oEvent.mParameters.selected.toString();
			oController.PoPath = oEvent.getSource();

			oController.selectedTableID = oEvent.getSource().getParent().getId().split("--")[1].split("-")[0];
			var selIndex = oController.PoPath.getParent().getIndex();
			oController.POSselIndex = selIndex;
			oController.tableRowObject3 = oController.PoPath.getParent();
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
			if (oController._oPopUpDialog4) {
				oController._oPopUpDialog4 = [];
			}
			if (!oController._oPopUpDialog4 || oController._oPopUpDialog4.length == 0) {
				oController._oPopUpDialog4 = sap.ui.xmlfragment("com.takeda.Accrual_UI5.fragment.POClosurePopUp", oController);
				oController.getView().addDependent(oController._oPopUpDialog4);
				oController._oPopUpDialog4.setModel(oController.FormattedtextoModel);
			}
			oController._oPopUpDialog4.open();
		},
		onSelectCancelPOClosureMatTBS: function () {
			matPOTBS = 0;
			var selIndex = oController.POSselIndex;
			oController.PoPath.setEnabled(true);
			oController.PoPath.setSelected(false);
			//oController.getView().byId('SmartTableTBSactUpon2').getTable().removeSelectionInterval(selIndex, selIndex);
			oController._oPopUpDialog5.close();
			oController._oPopUpDialog5 = [];
		},
		onSelectContinuePOClosureMatTBS: function () {
			var selIndex = oController.POSselIndex;
			oController.colsMaterial = oController.PoPath.getParent().getParent().getColumns();
			colsMaterial = oController.colsMaterial;
			var decimalFormat = oController.userDecimalFormat;
			/*oController.tableRowObjectSel1 = oController.TabPat.getParent().getParent().mAggregations.content[0].mAggregations.pages[0].mAggregations
				.content[0]
				.mAggregations._header.mAggregations.items[0].mAggregations.content[5].mAggregations.items[0].mAggregations._header.mAggregations.items[
					0].mAggregations.content[0].mAggreSgations.items[2].getTable()._getFirstRenderedRowIndex();
			var diff1 = selIndex - oController.tableRowObjectSel1;
			oController.tableRowObject1 = oController.TabPat.getParent().getParent().mAggregations.content[0].mAggregations.pages[0].mAggregations
				.content[0]
				.mAggregations._header.mAggregations.items[0].mAggregations.content[5].mAggregations.items[0].mAggregations._header.mAggregations.items[
					0].mAggregations.content[0].mAggregations.items[2].getTable().mAggregations.rows[diff1];*/
			for (var k = 0; k < colsMaterial.length; k++) {
				if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search("poMatHBoxId") >=
					0) {
					var tableRowPONumber = oController.PoPath.getParent().getCells()[k].mAggregations.items[0].getText();
				} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
						"itemMatNo") >=
					0) {
					var tableRowItemNumber = oController.PoPath.getParent().getCells()[k].getText();
				} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
						"idGoodsReceivedToDateTBS") >=
					0) {

					if (decimalFormat == "Y") {
						var GoodsReceivedAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							GoodsReceivedAmtArr1 = GoodsReceivedAmtArr[1].split(" ")[0],
							GoodsReceivedAmtCurr = GoodsReceivedAmtArr[1].split(" ")[1],
							GoodsReceivedAmtArr2 = GoodsReceivedAmtArr[0],
							GoodsReceivedAmt = GoodsReceivedAmtArr2 + "," + GoodsReceivedAmtArr1;
					} else if (decimalFormat == " " || decimalFormat == "") {
						var GoodsReceivedAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							GoodsReceivedAmtArr1 = GoodsReceivedAmtArr[1].split(" ")[0]
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
						"idInvoiceValueTBS") >=
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
			if ((parseFloat(GoodsReceivedAmt)) > (parseFloat(InvoiceValueAmt))) {
				ErrorAmtFlag = 1;
			}
			/*	if (ErrorAmtFlag == 1) {
					MessageBox.error(
						"Material PO’s cannot be closed when the Goods Receipted amount is greater than the invoiced amount. Please adjust the good receipted amount to equal the invoiced amount prior to closing the PO in Ariba."
					)
					sap.ui.core.BusyIndicator.hide();
					oController.getView().byId('SmartTableTBSactUpon2').getTable().removeSelectionInterval(selIndex, selIndex);
					oController.PoPath.setEnabled(true);
					oController.PoPath.setSelected(false);
					oController._oPopUpDialog5.close();
					oController._oPopUpDialog5 = [];
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
					if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"poMatHBoxIdTBS") >=
						0) {
						var tableRowPONumber = oController.PoPath.getParent().getCells()[k].mAggregations.items[0].getText();
					} else if (oController.PoPath.getParent().getCells()[k] && oController.PoPath.getParent().getCells()[k].sId.search(
							"itemMatNoTBS") >=
						0) {
						var tableRowItemNumber = oController.PoPath.getParent().getCells()[k].getText();
					}
				}

				var jsonIndex = jsonArray.findIndex(t => t.PONUMBER === tableRowPONumber && t.LINEITEM === tableRowItemNumber);

				if (jsonArray[jsonIndex] !== undefined) {
					jsonArray[jsonIndex].PO_CLOSURE = materialPOClosureTBS;
					oController.getView().byId('SmartTableTBSactUpon2').getTable().removeSelectionInterval(selIndex, selIndex);
					oController.getView().byId('SmartTableTBSactUpon2').getTable().addSelectionInterval(selIndex, selIndex);
				} else {
					oController.getView().byId('SmartTableTBSactUpon2').getTable().removeSelectionInterval(selIndex, selIndex);
					oController.getView().byId('SmartTableTBSactUpon2').getTable().addSelectionInterval(selIndex, selIndex);
				}
			} else {
				oController.getView().byId('SmartTableTBSactUpon2').getTable().removeSelectionInterval(selIndex, selIndex);
				oController.getView().byId('SmartTableTBSactUpon2').getTable().addSelectionInterval(selIndex, selIndex);
			}
			oController.getOwnerComponent().getModel().setProperty(oController.getView().byId("MatTable").getContextByIndex(selIndex).getPath() +
				"/POCLOSURE_FLAG", "1");
			oController.getOwnerComponent().getModel().setProperty(oController.getView().byId("MatTable").getContextByIndex(selIndex).getPath() +
				"/POCLOSURE_FLAG_LOCAL", true);
			oController._oPopUpDialog5.close();
			oController._oPopUpDialog5 = [];
		},
		onSelectPOClosureMat: function (oEvent) {
			matPOTBS = 1;
			materialPOClosureTBS = oEvent.mParameters.selected.toString();
			oController.PoPath = oEvent.getSource();
			oController.selectedTableID = oEvent.getSource().getParent().getId().split("--")[1].split("-")[0];
			var selIndex = oController.PoPath.getParent().getIndex();
			oController.colsMaterial = oController.PoPath.getParent().getParent().getColumns();
			colsMaterial = oController.colsMaterial;
			oController.tableRowObject3 = oController.PoPath.getParent();
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
			if (oController._oPopUpDialog5) {
				oController._oPopUpDialog5 = [];
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
						"idGoodsReceivedToDateTBS") >=
					0) {

					if (decimalFormat == "Y") {
						var GoodsReceivedAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							GoodsReceivedAmtArr1 = GoodsReceivedAmtArr[1].split(" ")[0],
							GoodsReceivedAmtCurr = GoodsReceivedAmtArr[1].split(" ")[1],
							GoodsReceivedAmtArr2 = GoodsReceivedAmtArr[0],
							GoodsReceivedAmt = GoodsReceivedAmtArr2 + "," + GoodsReceivedAmtArr1;
					} else if (decimalFormat == " " || decimalFormat == "") {
						var GoodsReceivedAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							GoodsReceivedAmtArr1 = GoodsReceivedAmtArr[1].split(" ")[0]
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
						"idInvoiceValueTBS") >=
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
				//oController.getView().byId('SmartTableTBSactUpon2').getTable().removeSelectionInterval(selIndex, selIndex);
				oController.PoPath.setEnabled(true);
				oController.PoPath.setSelected(false);
				return;
			}
			if (!oController._oPopUpDialog5 || oController._oPopUpDialog5.length == 0) {
				oController._oPopUpDialog5 = sap.ui.xmlfragment("com.takeda.Accrual_UI5.fragment.POClosurePopUp", oController);
				oController.getView().addDependent(oController._oPopUpDialog5);
				oController._oPopUpDialog5.setModel(oController.FormattedtextoModel);
			}
			oController._oPopUpDialog5.open();
		},
		onSelectCancelPOClsSthreTBS: function () {
			serPOTBS = 0;
			var selIndex = oController.POSselIndex;
			oController.PoPath.setEnabled(true);
			oController.PoPath.setSelected(false);
			//oController.getView().byId('SmartTableBthreshold').getTable().removeSelectionInterval(selIndex, selIndex);
			oController._oPopUpDialog6.close();
			oController._oPopUpDialog6 = [];
		},
		onSelectPOClosureSThreTBS: function () {
			var selIndex = oController.POSselIndex;
			oController.cols = oController.PoPath.getParent().getParent().getColumns();
			cols = oController.cols;
			/*	oController.tableRowObjectSel2 = oController.TabPat.getParent().getParent().mAggregations.content[0].mAggregations.pages[0].mAggregations
					.content[0]
					.mAggregations._header.mAggregations.items[0].mAggregations.content[5].mAggregations.items[0].mAggregations._header.mAggregations.items[
						0].mAggregations.content[0].mAggregations.items[2].getTable()._getFirstRenderedRowIndex();
				var diff2 = selIndex - oController.tableRowObjectSel2;
				oController.tableRowObject4 = oController.TabPat.getParent().getParent().mAggregations.content[0].mAggregations.pages[0].mAggregations
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
				if (percentCal == 0) {
					percentCal = "0.0";
				} else {
					percentCal = percentCal.toFixed(1);
					percentCal = percentCal.toString();
				}
				if (percentCal == "0") {
					percentCal = "0.0";
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
					jsonArrayfinal2[jsonIndex].PO_CLOSURE = servicePOClosureTBS;
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
			oController._oPopUpDialog6.close();
			oController._oPopUpDialog6 = [];
		},
		threPOClosureSelect: function (oEvent) {
			serPOTBS = 1;
			servicePOClosureTBS = oEvent.mParameters.selected.toString();
			oController.PoPath = oEvent.getSource();
			oController.selectedTableID = oEvent.getSource().getParent().getId().split("--")[1].split("-")[0];
			var selIndex = oController.PoPath.getParent().getIndex();
			oController.POSselIndex = selIndex;
			oController.tableRowObject4 = oController.PoPath.getParent();
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
			if (oController._oPopUpDialog6) {
				oController._oPopUpDialog6 = [];
			}
			if (!oController._oPopUpDialog6 || oController._oPopUpDialog6.length == 0) {

				oController._oPopUpDialog6 = sap.ui.xmlfragment("com.takeda.Accrual_UI5.fragment.POClosurePopUp", oController);
				oController.getView().addDependent(oController._oPopUpDialog6);
				oController._oPopUpDialog6.setModel(oController.FormattedtextoModel);

			}
			oController._oPopUpDialog6.open();
		},
		//gree start
		onSelctCancelPOMatrThreTBS: function () {
			matPOTBS = 0;
			var selIndex = oController.POSselIndex;
			oController.PoPath.setEnabled(true);
			oController.PoPath.setSelected(false);
			//oController.getView().byId('SmartTableThres2').getTable().removeSelectionInterval(selIndex, selIndex);
			oController._oPopUpDialog7.close();
			oController._oPopUpDialog7 = [];
		},
		onSelectContinePOClosureMaterThreTBS: function () {
			var selIndex = oController.POSselIndex;
			oController.colsMaterial = oController.PoPath.getParent().getParent().getColumns();
			colsMaterial = oController.colsMaterial;
			/*	oController.tableRowObjectSel2 = oController.TabPat.getParent().getParent().mAggregations.content[0].mAggregations.pages[0].mAggregations
				.content[0]
				.mAggregations._header.mAggregations.items[0].mAggregations.content[5].mAggregations.items[0].mAggregations._header.mAggregations.items[
					0].mAggregations.content[0].mAggregations.items[2].getTable()._getFirstRenderedRowIndex();
			var diff2 = selIndex - oController.tableRowObjectSel2;
			oController.tableRowObject4 = oController.TabPat.getParent().getParent().mAggregations.content[0].mAggregations.pages[0].mAggregations
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
						"idGoodsReceivedToDateThre") >=
					0) {

					if (decimalFormat == "Y") {
						var GoodsReceivedAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							GoodsReceivedAmtArr1 = GoodsReceivedAmtArr[1].split(" ")[0],
							GoodsReceivedAmtCurr = GoodsReceivedAmtArr[1].split(" ")[1],
							GoodsReceivedAmtArr2 = GoodsReceivedAmtArr[0],
							GoodsReceivedAmt = GoodsReceivedAmtArr2 + "," + GoodsReceivedAmtArr1;
					} else if (decimalFormat == " " || decimalFormat == "") {
						var GoodsReceivedAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							GoodsReceivedAmtArr1 = GoodsReceivedAmtArr[1].split(" ")[0]
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
				oFloatFormat,
				decimalFormat;
			decimalFormat = oController.userDecimalFormat;
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
			if ((parseFloat(GoodsReceivedAmt)) > (parseFloat(InvoiceValueAmt))) {
				ErrorAmtFlag = 1;
			}
			/*	if (ErrorAmtFlag == 1) {
					MessageBox.error(
						"Material PO’s cannot be closed when the Goods Receipted amount is greater than the invoiced amount. Please adjust the good receipted amount to equal the invoiced amount prior to closing the PO in Ariba."
					)
					sap.ui.core.BusyIndicator.hide();
					oController.getView().byId('SmartTableThres2').getTable().removeSelectionInterval(selIndex, selIndex);
					oController.PoPath.setEnabled(true);
					oController.PoPath.setSelected(false);
					oController._oPopUpDialog7.close();
					oController._oPopUpDialog7 = [];
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
					jsonArrayfinal2[jsonIndex].PO_CLOSURE = materialPOClosureTBS;
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
			oController._oPopUpDialog7.close();
			oController._oPopUpDialog7 = [];
		},
		onSelectthrePOClosureMater: function (oEvent) {
			matPOTBS = 1;
			materialPOClosureTBS = oEvent.mParameters.selected.toString();
			oController.PoPath = oEvent.getSource();
			oController.selectedTableID = oEvent.getSource().getParent().getId().split("--")[1].split("-")[0];
			var selIndex = oController.PoPath.getParent().getIndex();
			oController.colsMaterial = oController.PoPath.getParent().getParent().getColumns();
			colsMaterial = oController.colsMaterial;
			oController.tableRowObject4 = oController.PoPath.getParent();
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
			if (oController._oPopUpDialog7) {
				oController._oPopUpDialog7 = [];
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
						"idGoodsReceivedToDateThre") >=
					0) {

					if (decimalFormat == "Y") {
						var GoodsReceivedAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							GoodsReceivedAmtArr1 = GoodsReceivedAmtArr[1].split(" ")[0],
							GoodsReceivedAmtCurr = GoodsReceivedAmtArr[1].split(" ")[1],
							GoodsReceivedAmtArr2 = GoodsReceivedAmtArr[0],
							GoodsReceivedAmt = GoodsReceivedAmtArr2 + "," + GoodsReceivedAmtArr1;
					} else if (decimalFormat == " " || decimalFormat == "") {
						var GoodsReceivedAmtArr = oController.PoPath.getParent().getCells()[k].getText().split(","),
							GoodsReceivedAmtArr1 = GoodsReceivedAmtArr[1].split(" ")[0]
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
			if (!oController._oPopUpDialog7 || oController._oPopUpDialog7.length == 0) {
				oController._oPopUpDialog7 = sap.ui.xmlfragment("com.takeda.Accrual_UI5.fragment.POClosurePopUp", oController);
				oController.getView().addDependent(oController._oPopUpDialog7);
				oController._oPopUpDialog7.setModel(oController.FormattedtextoModel);
			}
			oController._oPopUpDialog7.open();
		},

		//gree end
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
						tableRowObject = oController.tableRowObject4;
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
							/*	else if (serPOTBS === 1) {
									str.PO_CLOSURE = servicePOClosureTBS;
								} */
							else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("threPOClosureCheckBox") >= 0) {
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
							if (serPOTBS === 1) {
								str.PO_CLOSURE = servicePOClosureTBS;
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
						if (serPOTBS === 1) {
							str.PO_CLOSURE = servicePOClosureTBS;
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
						tableRowObject = oController.tableRowObject4;
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
							if (matPOTBS === 1) {
								str.PO_CLOSURE = materialPOClosureTBS;
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
						if (matPOTBS === 1) {
							str.PO_CLOSURE = materialPOClosureTBS;
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
			serPOTBS = 0;
			matPOTBS = 0;
		},
		// MVP2 changes End of Code
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
					MessageBox.success(oController.geti18nText("SuccessfullySaved"));
					var oHistoryTable = oController.getView().byId("SmartTableBthreshold");
					oHistoryTable.rebindTable(true);
					oController.getView().byId("recordThre").setVisible(false);
				},
				error: function (error) {
					// MessageBox.error("Error while updating in EDGE. Please try after some time");
					common.displayErrorMessage(oController);
					var oHistoryTable = oController.getView().byId("SmartTableBthreshold");
					oHistoryTable.rebindTable(true);
					thresholdArray = [];
					oController.getView().byId("recordThre").setVisible(false);
				}
			});
		},
		// <!--MVP2 changes End of Code-->

		totalAmount: function (oEvent) {
			globalEvent = oEvent;
			oController.PoPath = oEvent.getSource();
			oController.tableRowObject3 = oController.PoPath.getParent();
			var selIndex = oEvent.getSource().getParent().getIndex();
			oController.getView().byId('SmartTableTBSactUpon1').getTable().removeSelectionInterval(selIndex, selIndex);

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
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalAmountTBS") >=
					0) {

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
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalPercentTBS") >=
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
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalAmountTBS") >=
					0) {
					oEvent.getSource().getParent().getCells()[k].setValue(tAmount);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalPercentTBS") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setValue(parseFloat(percentCal).toFixed(1));
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalAccMetTBS") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setText(oController.geti18nText("wtd"));
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalStLineTBS") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setSelected(false);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalAmtAccruTBS") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setText(amtTAccrued);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalUSDAmountTBS") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setText(tAmountUSD);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalUSDAmtAccruTBS") >= 0) {
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
			oController.getView().byId('SmartTableTBSactUpon1').getTable().addSelectionInterval(selIndex, selIndex);
			// }
		},

		//gree start
		totalAmountThres: function (oEvent) {
			globalEvent = oEvent;
			oController.PoPath = oEvent.getSource();
			oController.tableRowObject4 = oController.PoPath.getParent();
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
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalAmountThr") >=
					0) {

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
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalPercentThr") >=
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
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalAmountThr") >=
					0) {
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

		totalPercent: function (oEvent) {
			globalEvent = oEvent;
			oController.PoPath = oEvent.getSource();
			oController.tableRowObject3 = oController.PoPath.getParent();
			var selIndex = oEvent.getSource().getParent().getIndex();
			oController.getView().byId('SmartTableTBSactUpon1').getTable().removeSelectionInterval(selIndex, selIndex);

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

			var amountCal = oNumberFormat.format((tWork1 * poValue) / 100);
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
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalAmountTBS") >=
					0) {

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
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalPercentTBS") >=
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
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalAmountTBS") >=
					0) {
					oEvent.getSource().getParent().getCells()[k].setValue(amountCal);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalAccMetTBS") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setText(oController.geti18nText("wtd"));
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalStLineTBS") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setSelected(false);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalAmtAccruTBS") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setText(amtTAccrued);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalUSDAmountTBS") >= 0) {
					oEvent.getSource().getParent().getCells()[k].setText(amountCalUSD);
				} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalUSDAmtAccruTBS") >= 0) {
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
			oController.getView().byId('SmartTableTBSactUpon1').getTable().addSelectionInterval(selIndex, selIndex);
			// }
		},

		//gree start
		totalPercentThres: function (oEvent) {
			globalEvent = oEvent;
			oController.PoPath = oEvent.getSource();
			oController.tableRowObject4 = oController.PoPath.getParent();
			var selIndex = oEvent.getSource().getParent().getIndex();
			oController.getView().byId('SmartTableBthreshold').getTable().removeSelectionInterval(selIndex, selIndex);

			var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
				maxFractionDigits: 2,
				groupingEnabled: true,
				groupingSeparator: "",
				decimalSeparator: "."
			});
			tWork = oEvent.getParameter('newValue').trim();
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
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalAmountThr") >=
					0) {

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
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalPercentThr") >=
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
				if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
						"totalAmountThr") >=
					0) {
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
			oController.tableRowObject4 = oController.PoPath.getParent();
			var selected = oEvent.getParameter("selected");
			if (selected === true) {
				sap.ui.core.BusyIndicator.show(0);
				for (var k = 0; k < cols.length; k++) {
					if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
							"totalAccMetThr") >=
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
					if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
							"totalAmountThr") >=
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
				this.getView().byId("dashTBS").setModel(accMetModel);

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
								oEvent.getSource().getParent().getCells()[k].setValue(formatter.formatCurrency(oController.userDecimalFormat,
									oData.results[
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
					if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
							"totalAccMetThr") >=
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
		onClickCheckBox: function (oEvent) {
			globalEvent = oEvent;
			oController.PoPath = oEvent.getSource();
			oController.tableRowObject3 = oController.PoPath.getParent();
			var selected = oEvent.getParameter("selected");
			if (selected === true) {
				sap.ui.core.BusyIndicator.show(0);
				for (var k = 0; k < cols.length; k++) {
					if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
							"totalAccMetTBS") >=
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
					if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
							"totalAmountTBS") >=
						0) {
						var twc = oEvent.getSource().getParent().getCells()[k].getValue();
						twc = formatter.formatAccAmount(oController.userDecimalFormat, twc);
					} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
							"totalPercentTBS") >= 0) {
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
				this.getView().byId("dashTBS").setModel(accMetModel);

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
									"totalAmountTBS") >=
								0) {
								oEvent.getSource().getParent().getCells()[k].setValue(formatter.formatCurrency(oController.userDecimalFormat,
									oData.results[
										0].TOTWRKCOMPAMT));
							} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
									"totalPercentTBS") >= 0) {
								oEvent.getSource().getParent().getCells()[k].setValue(WTDperc);
							} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
									"totalAmtAccruTBS") >= 0) {
								oEvent.getSource().getParent().getCells()[k].setText(amtTAccrued);
							}
						}
						var selIndex = oEvent.getSource().getParent().getIndex();
						// Get the selected Indexes ( Remove if it is already in the selected list)
						var selectedIndexes = oController.getView().byId('SmartTableTBSactUpon1').getTable().getSelectedIndices();
						if (selectedIndexes.includes(selIndex)) {
							oController.getView().byId('SmartTableTBSactUpon1').getTable().removeSelectionInterval(selIndex, selIndex);
						}
						oController.getView().byId('SmartTableTBSactUpon1').getTable().addSelectionInterval(selIndex, selIndex);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function (e) {
						common.displayErrorMessage(oController);
						sap.ui.core.BusyIndicator.hide();
					}
				});

			} else {

				for (var k = 0; k < cols.length; k++) {
					if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
							"totalAccMetTBS") >=
						0) {
						oEvent.getSource().getParent().getCells()[k].setText(oController.geti18nText("wtd"));
					}
					// else if (oTableBatch.getColumns()[k].getId().split("-")[2] === "markAsReviewedTabTBS") {
					// 	oEvent.getSource().getParent().getCells()[k].setSelected(false);
					// }
					// Start of change on 11 nov
					var selIndex = oEvent.getSource().getParent().getIndex();
					// Get the selected Indexes ( Remove if it is already in the selected list)
					var selectedIndexes = oController.getView().byId('SmartTableTBSactUpon1').getTable().getSelectedIndices();
					if (selectedIndexes.includes(selIndex)) {
						oController.getView().byId('SmartTableTBSactUpon1').getTable().removeSelectionInterval(selIndex, selIndex);
					}
					oController.getView().byId('SmartTableTBSactUpon1').getTable().addSelectionInterval(selIndex, selIndex);
					// End of change on 11 nov

				}
			}
		},
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
						tableRowObject = oController.tableRowObject3;
					}
				}
				if (tableRowObject) {

					// Get the PO# and Line Item # 
					for (var k = 0; k < cols.length; k++) {
						if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("poHBoxIdTBS") >= 0) {
							var tableRowPONumber = tableRowObject.getCells()[k].mAggregations.items[0].getText();
						} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("itemNoTBS") >= 0) {
							var tableRowItemNumber = tableRowObject.getCells()[k].getText();
						}
					}

					if (tableRowPONumber === str.PONUMBER && tableRowItemNumber === str.LINEITEM) {
						// Populate the WTD Amount and Percentage   
						for (var k = 0; k < cols.length; k++) {
							if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("totalAmountTBS") >= 0) {
								str.TOTALWORKCOMPLTODATE = tableRowObject.getCells()[k].getValue();
							} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("totalPercentTBS") >= 0) {
								str.TOTALWORKCOMPLPERCENT = tableRowObject.getCells()[k].getValue();
							} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("totalAccMetTBS") >= 0) {
								var accMet = tableRowObject.getCells()[k].getText();
							} else if (serPOTBS === 1) {
								str.PO_CLOSURE = servicePOClosureTBS;
							} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("totalPOClosureTBS") >= 0) {
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
							// str.TOTALWORKCOMPLTODATE = jsonArrayLocal[0].TOTALWORKCOMPLTODATE;
							str.TOTALWORKCOMPLPERCENT = jsonArrayLocal[0].TOTALWORKCOMPLPERCENT;
							var accMet = tableRow.ACCRUALMETHOD;
							if (serPOTBS === 1) {
								str.PO_CLOSURE = servicePOClosureTBS;
							} else {
								str.PO_CLOSURE = tableRow.PO_CLOSURE;
							}
							// MVP2 changes End of Code
						} else {
							// str.TOTALWORKCOMPLTODATE = tableRow.TOTWRKCOMPAMT;
							str.TOTALWORKCOMPLTODATE = tableRow.TOTWRKCOMPAMT_CHAR;
							str.TOTALWORKCOMPLPERCENT = tableRow.TOTWRKCOMPPER;
							var accMet = tableRow.ACCRUALMETHOD;
							// MVP2 changes Start of Code
							if (serPOTBS === 1) {
								str.PO_CLOSURE = servicePOClosureTBS;
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
						// str.TOTALWORKCOMPLTODATE = jsonArrayLocal[0].TOTALWORKCOMPLTODATE;
						str.TOTALWORKCOMPLPERCENT = jsonArrayLocal[0].TOTALWORKCOMPLPERCENT;
						var accMet = tableRow.ACCRUALMETHOD;
						if (serPOTBS === 1) {
							str.PO_CLOSURE = servicePOClosureTBS;
						} else {
							str.PO_CLOSURE = tableRow.PO_CLOSURE;
						}

					} else {

						str.TOTALWORKCOMPLTODATE = tableRow.TOTWRKCOMPAMT_CHAR;
						str.TOTALWORKCOMPLPERCENT = tableRow.TOTWRKCOMPPER;
						var accMet = tableRow.ACCRUALMETHOD;

						if (serPOTBS === 1) {
							str.PO_CLOSURE = servicePOClosureTBS;
						} else {
							str.PO_CLOSURE = tableRow.PO_CLOSURE;
						}

					}
				}

			} else {
				if (colsMaterial == undefined) {
					colsMaterial = oController.colsMaterial;
				}
				if (tableRowObject != undefined) {
					if (tableRowObject.getCells() == undefined) {
						tableRowObject = oController.tableRowObject3;
					}
				}
				// Material
				if (tableRowObject) {
					// Get the PO# and Line Item # 
					for (var k = 0; k < cols.length; k++) {
						if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("poMatHBoxIdTBS") >= 0) {
							var tableRowPONumber = tableRowObject.getCells()[k].mAggregations.items[0].getText();
						} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("itemMatNoTBS") >= 0) {
							var tableRowItemNumber = tableRowObject.getCells()[k].getText();
						}
					}

					if (tableRowPONumber === str.PONUMBER && tableRowItemNumber === str.LINEITEM) {
						// Populate the WTD Amount and Percentage   
						for (var k = 0; k < cols.length; k++) {
							if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("totalPOClosureMatTBS") >= 0) {
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
							if (matPOTBS === 1) {
								str.PO_CLOSURE = materialPOClosureTBS;
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
						if (matPOTBS === 1) {
							str.PO_CLOSURE = materialPOClosureTBS;
						} else {
							str.PO_CLOSURE = tableRow.PO_CLOSURE;
						}
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
			if (str.TOTALWORKCOMPLTODATE !== "" && str.TOTALWORKCOMPLTODATE !== undefined &&
				isNaN(str.TOTALWORKCOMPLTODATE)) {

				// Convert the currency to decimal
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
			serPOTBS = 0;
			matPOTBS = 0;
			// MVP2 changes End of Code
		},
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
				if (oController.tableRowObject3 != undefined) {
					tableRowObject = oController.tableRowObject3;
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
				if (oController.tableRowObject4 != undefined) {
					tableRowObject = oController.tableRowObject4;
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
						for (var k in jsonArray) {
							jsonArray = jsonArray.filter(item => {
								for (let key in filter) {
									if (item[key] === undefined || item[key] != filter[key])
										return true;
								}
								return false;
							});
						}
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
		markAllasReviewed: function (tableRow, tableRowObject, tableType) {
			var str = {};
			// Map the Table Row to str
			this.mapStr(tableRow, tableRowObject, str, tableType);
			// Push to the Global Array
			oController.populateGlobalArray(str, 1);
			oController.getView().byId("saveBtnTBS").setEnabled(true);
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
				aTableData = allDataThre1; // ta allDataAct1;
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
									if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("poHBoxId1") >= 0) {
										tableRowPONumber = tableRowObject.getCells()[k].mAggregations.items[0].getText();
									} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("itemNo1") >= 0) {
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
					if (selectedRowData.PSTYPE === "0") {
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

			if (sTableID === "actUponTBS1") {
				aTableData = allDataAct1;
			} else if (sTableID === "MatTable") {
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

						if (sTableID === "MatTable") {
							for (var k = 0; k < colsMaterial.length; k++) {
								if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("poMatHBoxIdTBS") >= 0) {
									tableRowPONumber = tableRowObject.getCells()[k].mAggregations.items[0].getText();
								} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("itemMatNoTBS") >= 0) {
									tableRowItemNumber = tableRowObject.getCells()[k].getText();
								}
								if (tableRowPONumber === selectedPONum && tableRowItemNumber === selectedItemNum) {
									lv_recordFound = 'X';
									break;
								}
							}
						} else {
							for (var k = 0; k < cols.length; k++) {
								if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("poHBoxIdTBS") >= 0) {
									tableRowPONumber = tableRowObject.getCells()[k].mAggregations.items[0].getText();
								} else if (tableRowObject.getCells()[k] && tableRowObject.getCells()[k].sId.search("itemNoTBS") >= 0) {
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
					oController.markAllasReviewed(selectedRowData, tableRowObject, 'Service');
				} else {
					oController.markAllasReviewed(selectedRowData, tableRowObject, 'Material');
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

		onSelectReview: function (oEvent) {
			var str = {};
			var selectAll = oEvent.getParameter("selectAll");
			var sTableID = oEvent.getParameters().id.split("--").pop(),
				aTableData = [];
			//	var deselectFlag = false;

			// Added SUZ9125
			var matTableFlag = false;
			// End SUZ9125
			if (sTableID === "actUponTBS1") {
				aTableData = allDataAct1;
			} else if (sTableID === "MatTable") {
				aTableData = allDataAct2;
				matTableFlag = true; // Added SUZ9125
			}
			// Begin of SUZ9125

			var deselectFlag = false;
			if (matTableFlag === true) {
				// matTable deselect check

				if (rowSelectionMaterial.length === 0) {

					if (sTableID === "actUponTBS1") {
						var selectIndices = oEvent.getSource().getParent().getItems()[1].getSelectedIndices();
					} else if (sTableID === "MatTable") {
						var selectIndices = oEvent.getSource().getParent().getItems()[1].getSelectedIndices();
					}

					let esCopy = JSON.parse(JSON.stringify(selectIndices));
					rowSelectionMaterial = esCopy;
				} else {
					if (sTableID === "actUponTBS1") {
						var selectIndices = oEvent.getSource().getParent().getItems()[1].getSelectedIndices();
					} else if (sTableID === "MatTable") {
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
				// actUponTBS1 table deselect check

				if (rowSelection.length === 0) {

					if (sTableID === "actUponTBS1") {
						var selectIndices = oEvent.getSource().getParent().getItems()[1].getSelectedIndices();
					} else if (sTableID === "MatTable") {
						var selectIndices = oEvent.getSource().getParent().getItems()[1].getSelectedIndices();
					}

					let esCopy = JSON.parse(JSON.stringify(selectIndices));
					rowSelection = esCopy;
				} else {
					if (sTableID === "actUponTBS1") {
						var selectIndices = oEvent.getSource().getParent().getItems()[1].getSelectedIndices();
					} else if (sTableID === "MatTable") {
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
			if (selectAll === true || oEvent.getSource().getSelectedIndices().length === aTableData.length) {
				this.onMarkAsReviewedSelect(oEvent, str);
				// Below code will be called during deselect	
				// }else if (oEvent.getSource().mProperties.selectedIndex === -1) { // Commented SUZ9125
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
					oController.getView().byId("saveBtnTBS").setEnabled(false);
					oController.getView().byId("notifyBtnTBS").setEnabled(false);
				}

			} else {
				if (sTableID === "actUponTBS1") {
					for (var i = 0; i < oEvent.getSource().mAggregations.rows[0].mAggregations.cells.length; i++) {
						if (oEvent.getSource().mAggregations.rows[0].mAggregations.cells[i].sId.split("-")[2] === "totalPOClosureTBS") {
							var Index1 = i;
						}
					}
					var rowsLength = oEvent.getSource().getParent().getTable().getRows().length;
					var gettingInternalTable = oEvent.getSource().getParent().getTable("actUponTBS1"),
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
						var POClosure = gettingInternalTable.getContextByIndex(lv_selIndex).getProperty("POCLOSURE_FLAG");
						var POClosureLoc = gettingInternalTable.getContextByIndex(lv_selIndex).getProperty("POCLOSURE_FLAG_LOCAL");
						if (POClosure == 1) {
							if (POClosureLoc == true) {
								oController.getView().byId("saveBtnTBS").setEnabled(true);
								oController.getView().byId("notifyBtnTBS").setEnabled(true);
								oController.getSelectedData(oEvent, str, aTableData);
								oController.populateGlobalArray(str, 1);
								return;
							} else {
								var sMessage = oController.geti18nText("CheckBoxNotSelected");
								MessageBox.information(sMessage);
								this.getView().byId('SmartTableTBSactUpon1').getTable().removeSelectionInterval(selIndex, selIndex);
								return;
							}
						}
					}

				} else if (sTableID === "MatTable") {
					for (var i = 0; i < oEvent.getSource().mAggregations.rows[0].mAggregations.cells.length; i++) {
						if (oEvent.getSource().mAggregations.rows[0].mAggregations.cells[i].sId.split("-")[2] === "totalPOClosureMatTBS") {
							var Index1 = i;
						}
					}
					var rowsLength = oEvent.getSource().getParent().getTable().getRows().length;
					var gettingInternalTable = oEvent.getSource().getParent().getTable("MatTable"),
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
								oController.getView().byId("saveBtnTBS").setEnabled(true);
								oController.getView().byId("notifyBtnTBS").setEnabled(true);
								oController.getSelectedData(oEvent, str, aTableData);
								oController.populateGlobalArray(str, 1);
								return;
							}
							var sMessage = oController.geti18nText("CheckBoxNotSelected");
							MessageBox.information(sMessage);
							this.getView().byId('SmartTableTBSactUpon2').getTable().removeSelectionInterval(selIndex, selIndex);
							return;
						}
					}
				}

				count++;
				oController.getView().byId("saveBtnTBS").setEnabled(true);
				oController.getView().byId("notifyBtnTBS").setEnabled(true);
				oController.getSelectedData(oEvent, str, aTableData);
				// Push to the Global Variable JSONARRAY
				oController.populateGlobalArray(str, 1);
				// if (oEvent.getSource().mProperties.selectedIndex === -1) { // Commented SUZ9125
				if (deselectFlag === true) { // Added SUZ9125		
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
				oController.getView().byId("recordTBS").setVisible(true);
				oController.getView().byId("recordMatTBS").setVisible(true);
			} else {
				oController.getView().byId("recordTBS").setVisible(false);
				oController.getView().byId("recordMatTBS").setVisible(false);
			}
			// MVP2 changes End of Code
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

			// END of SUZ9125

			if (selectAll === true || oEvent.getSource().getSelectedIndices().length === aTableData.length) {
				this.onMarkAsReviewedSelect2(oEvent, str);
				// Below code will be called during deselect	
				// }else if (oEvent.getSource().mProperties.selectedIndex === -1) { // Commented SUZ9125
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
					if (typeof lv_selIndex !== 'undefined') {
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
		},
		//gree end

		rebindTables: function () {
			var oHistoryTable = oController.getView().byId("SmartTableTBSactUpon1");
			oHistoryTable.rebindTable(true);
			var oHistoryTable2 = oController.getView().byId("SmartTableTBSactUpon2");
			oHistoryTable2.rebindTable(true);
			var oHistoryTable3 = oController.getView().byId("SmartTableBthreshold");
			oHistoryTable3.rebindTable(true);
			var oHistoryTable4 = oController.getView().byId("SmartTableThres2");
			oHistoryTable4.rebindTable(true);
			// oController.getOwnerComponent().getModel().refresh(true);
		},
		saveData: function (oData, oResponse) {
			//let iTotalAboveCount = oController.totalAbove50KCount - oController.reviewedCount;
			let iTotalAboveCount = (iTotalServicePOAbove50KCount + iTotalMaterialPOAbove50KCount) - oController.reviewedCount;
			let sMessage = oController.geti18nText('message.submitted') + "\n\n" +
							oController.geti18nText('message.submitted.details') + iTotalAboveCount;
			
			// Filter out the warning messages, as it comes along with Success
			if (oData != "") { //-Added
				oData.ReturnSet.results = oData.ReturnSet.results.filter(e => e.Type !== "W");
			}
			var jsonArray_message = {};
			jsonArray_message = jsonArray.slice(); // Copy without reference
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
				sMessage = sMessage + "\n\n" + oController.geti18nText("failed") + "\n\n" + oController.geti18nText("PoNum") + "-" +
					oController
					.geti18nText(
						"lineItem") + "-" + oController.geti18nText("message") + "\n";
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

			// Remove the INVVALUE from json array
			for (var j in jsonArray) {
				delete jsonArray[j].INVVALUE;
				if (jsonArray[j].TOTALWORKCOMPLTODATE !== undefined) {
					jsonArray[j].TOTALWORKCOMPLTODATE = jsonArray[j].TOTALWORKCOMPLTODATE.toString();
				}
			}

			// MessageBox.success(sMessage);
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
						oController.dashboardTBSData();
						oController.getView().byId("saveBtnTBS").setEnabled(false);
						oController.rebindTables();
						jsonArray = [];
						MessageBox.success(sMessage);
						// MVP2 changes Start of Code
						oController.getView().byId("recordTBS").setVisible(false);
						oController.getView().byId("recordMatTBS").setVisible(false);
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
					// MessageBox.error("Error while updating in EDGE. Please try after some time");
					// common.displayErrorMessage(oController);
					oController.rebindTables();
					jsonArray = [];
				}
			});
		},

		// gree start
		saveData2: function (oData, oResponse) {
			//let iTotalUnderCount = oController.totalUnder50KCount - oController.reviewedCount;
			let iTotalUnderCount = (iTotalServicePOUnder50KCount + iTotalMaterialPOUnder50KCount) - oController.reviewedCount;
			let sMessage = oController.geti18nText('message.submitted') + "\n\n" +
							oController.geti18nText('message.submitted.details')  + iTotalUnderCount;
			
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
				sMessage = sMessage + "\n\n" + oController.geti18nText("failed") + "\n\n" + oController.geti18nText("PoNum") + "-" +
					oController
					.geti18nText(
						"lineItem") + "-" + oController.geti18nText("message") + "\n";
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
					if (data.EX_CODE === 1) {
						oController.dashboardTBSData();
						oController.getView().byId("saveBtnThre").setEnabled(false);
						for (var i = 0; i < selIndices.length; i++) {

							oController.getView().byId('SmartTableBthreshold').getTable().removeSelectionInterval(selIndices[i], selIndices[
								i]);
						}
						oController.rebindTables();
						jsonArrayfinal2 = [];

						//var oHistoryTable = oController.getView().byId("SmartTableBthreshold"); //march
						//	oHistoryTable.rebindTable(true);

						//	oController.getView().byId("recordThre").setVisible(false);
						MessageBox.success(sMessage);
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

		onNotifyPress: function () {
			var notifyArray = [];
			var nstr = {};
			for (var i in jsonArray) {
				nstr.PONUMBER = jsonArray[i].PONUMBER;
				nstr.ITEMNO = jsonArray[i].LINEITEM;
				notifyArray.push(nstr);
				nstr = {};
			}
			var jsonData = {
				"user": emailId,
				"statuspo": notifyArray
			};
			// Show Busy Indicator
			sap.ui.core.BusyIndicator.show(0);
			$.ajax({
				type: "POST",
				url: sPostURI + "reviewPOLine.xsjs",
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify(jsonData),
				success: function (data, Response) {
					oController.rebindTables();
					notifyArray = [];
					jsonArray = [];
					// Show Busy Indicator
					sap.ui.core.BusyIndicator.hide(0);
				},
				error: function (error) {
					if (error.status === 200) {
						MessageBox.success(error.responseText);
						notifyArray = [];
						jsonArray = [];
					} else {
						// MessageBox.error("Error while sending Email. Please try after some time");
						common.displayErrorMessage(oController);
						notifyArray = [];
						jsonArray = [];
					}
					oController.rebindTables();
					// Show Busy Indicator
					sap.ui.core.BusyIndicator.hide(0);
				}
			});
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
							oController.rebindTables();
							jsonArrayfinal2 = [];
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
							oController.rebindTables();
							jsonArray = [];
						}
					}
				});
			} else {
				oController.onApproveDialogPress();
			}
		},
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
						var oModeldMaterial = oController.getOwnerComponent().getModel();
						var jsonArrayfin = [];
						var jsonArrayfinal = [];
						oController.reviewedCount = 0;
						oController.pendingCount = 0;
						var sURI = "/openPOParameters(IP_PSTYPE='9',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole +
							"')/Results",
							sMessage;
						oModeld.read(sURI, {
							async: false,
							urlParameters: {

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
												closurFlagTBSActUpon = "false"
											}
											if (allDataAct1[i].POCLOSURE_FLAG == 1) {
												closurFlagTBSActUpon = "true"
											}

										}
									}
									if ((jsonArrayfinal.length > 0) && ((amount !== allDataAct1[i].TOTWRKCOMPAMT.toString()) ||
											(jsonArrayfinal[0].TOTALWORKCOMPLPERCENT.toString() !== allDataAct1[i].TOTWRKCOMPPER.toString()) || (
												jsonArrayfinal[
													0]
												.ACCRUALMETHOD === 'WTD' && allDataAct1[i].ACCRUALMETHOD === 'Straight Line' || closurFlagTBSActUpon !==
												jsonArrayfinal[0].PO_CLOSURE)
										)) {

										// if ((jsonArrayfinal.length > 0) && ((amount !== allDataAct1[i].TOTWRKCOMPAMT.toString()) ||
										// 		(jsonArrayfinal[0].TOTALWORKCOMPLPERCENT.toString() !== allDataAct1[i].TOTWRKCOMPPER.toString()))) {

										// if ((jsonArrayfinal.length > 0) && ((jsonArrayfinal[0].TOTALWORKCOMPLTODATE !== parseFloat(allDataAct1[i].TOTWRKCOMPAMT)) ||
										// 		(jsonArrayfinal[0].TOTALWORKCOMPLPERCENT !== allDataAct1[i].TOTWRKCOMPPER))) {	
										// if ((jsonArrayfinal.length > 0) && ((jsonArrayfinal[0].TOTALWORKCOMPLTODATE.toString() !== allDataAct1[i].TOTWRKCOMPAMT.toString()) ||
										// 		(jsonArrayfinal[0].TOTALWORKCOMPLPERCENT.toString() !== allDataAct1[i].TOTWRKCOMPPER.toString()))) {
										sapTBSStr = {};
										sCETDateTime = new Date().toLocaleString("en-US", {
											timeZone: "Europe/Berlin"
										});
										sCETDateTime = sap.ui.core.format.DateFormat.getDateInstance({
											pattern: "yyyyMMddhhmmss"
										}).format(new Date(sCETDateTime));
										sapTBSStr.GUID = sCETDateTime;
										sapTBSStr.PoNumber = jsonArrayfinal[0].PONUMBER;
										sapTBSStr.ItemNo = jsonArrayfinal[0].LINEITEM;
										sapTBSStr.WtdAmount = jsonArrayfinal[0].TOTALWORKCOMPLTODATE.toString();
										sapTBSStr.WtdPerc = jsonArrayfinal[0].TOTALWORKCOMPLPERCENT;
										/*	var oFloatFormatPerc2 = NumberFormat.getFloatInstance(),
												WtdPerc = oFloatFormatPerc2.parse(sapTBSStr.WtdPerc);*/
										var WtdPerc = parseFloat(sapTBSStr.WtdPerc);
										sapTBSStr.WtdPerc = WtdPerc.toFixed(1);

										//  If percentage is 100.00, then pass only 100 as the ECC has the length of 5 
										if (sapTBSStr.WtdPerc === '100.0' || sapTBSStr.WtdPerc === '100.00') {
											sapTBSStr.WtdPerc = '100';
										}
										sapTBSArr.push(sapTBSStr);
									}
								}

								var sURIMaterial = "/openPOParameters(IP_PSTYPE='0',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole +
									"')/Results";

								oModeldMaterial.read(sURIMaterial, {
									async: false,
									urlParameters: {

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
														/*
															oController.getView().byId('SmartTableTBSactUpon1').getTable().addSelectionInterval(0, allDataAct1.length -
																1);
															oController.getView().byId('SmartTableTBSactUpon2').getTable().addSelectionInterval(0, allDataAct2.length -
																1);
															oController.askConfirmation();
														*/
													} else if (sAction === oController.geti18nText('confirm')) {
														oController.confirmaskConfirmationTBS();
													} else if (sAction === oController.geti18nText('cancel')) {
														jsonArray = [];
														oController.rebindTables();
													}
												}
											});
										} else {
											oController.confirmaskConfirmationTBS();
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
				error: function (e) {
					this._errorMessageClosingPOs();
					// common.displayErrorMessage(oController);
				}
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
						var sURI = "/thresholdParameters(IP_PSTYPE='9',IP_EMAIL='" + emailId + "',IP_POOWNER='" + loginUserRole +
							"')/Results",
							sMessage;
						oModeld.read(sURI, {
							async: false,
							urlParameters: {

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
												closurFlagTBSThre = "false"
											}
											if (allDataThre1[i].POCLOSURE_FLAG == 1) {
												closurFlagTBSThre = "true"
											}
										}
									}
									if ((jsonArrayfin.length > 0) && ((amount !== allDataThre1[i].TOTWRKCOMPAMT) ||
											(jsonArrayfin[0].TOTALWORKCOMPLPERCENT.toString() !== allDataThre1[i].TOTWRKCOMPPER.toString()) || (
												jsonArrayfin[0]
												.ACCRUALMETHOD === 'WTD' && allDataThre1[i].ACCRUALMETHOD === 'Straight Line' || closurFlagTBSThre !== jsonArrayfin[
													0].PO_CLOSURE
											)
										)) {

										// if ((jsonArrayfinal.length > 0) && ((amount !== allDataAct1[i].TOTWRKCOMPAMT.toString()) ||
										// 		(jsonArrayfinal[0].TOTALWORKCOMPLPERCENT.toString() !== allDataAct1[i].TOTWRKCOMPPER.toString()))) {

										//if ((jsonArrayfinal.length > 0) && ((jsonArrayfinal[0].TOTALWORKCOMPLTODATE !== parseFloat(allDataAct1[i].TOTWRKCOMPAMT)) ||
										// if ((jsonArrayfinal.length > 0) && ((jsonArrayfinal[0].TOTALWORKCOMPLTODATE.toString() !== allDataAct1[i].TOTWRKCOMPAMT.toString()) ||
										// 		(jsonArrayfinal[0].TOTALWORKCOMPLPERCENT.toString() !== allDataAct1[i].TOTWRKCOMPPER.toString()))) {
										sapTBSStr = {};
										sCETDateTime = new Date().toLocaleString("en-US", {
											timeZone: "Europe/Berlin"
										});
										sCETDateTime = sap.ui.core.format.DateFormat.getDateInstance({
											pattern: "yyyyMMddhhmmss"
										}).format(new Date(sCETDateTime));
										sapTBSStr.GUID = sCETDateTime;
										sapTBSStr.PoNumber = jsonArrayfin[0].PONUMBER;
										sapTBSStr.ItemNo = jsonArrayfin[0].LINEITEM;
										sapTBSStr.WtdAmount = jsonArrayfin[0].TOTALWORKCOMPLTODATE.toString();
										sapTBSStr.WtdPerc = jsonArrayfin[0].TOTALWORKCOMPLPERCENT;
										/*	var oFloatFormatPerc1 = NumberFormat.getFloatInstance(),
												WtdPerc = oFloatFormatPerc1.parse(sapTBSStr.WtdPerc);*/
										var WtdPerc = parseFloat(sapTBSStr.WtdPerc);
										sapTBSStr.WtdPerc = WtdPerc.toFixed(1);
										//  If percentage is 100.00, then pass only 100 as the ECC has the length of 5 
										if (sapTBSStr.WtdPerc === '100.0' || sapTBSStr.WtdPerc === '100.00') {
											sapTBSStr.WtdPerc = '100';
										}
										sapTBSArr.push(sapTBSStr);
									}
								}
								var sURIMaterial = "/thresholdParameters(IP_PSTYPE='0',IP_EMAIL='" + emailId + "',IP_POOWNER='" +
									loginUserRole +
									"')/Results";

								oModeldMaterial.read(sURIMaterial, {
									async: false,
									urlParameters: {

										"$top": 1000
									},
									success: function (oData, oResponse) {
										oController.populateReviewedCountThre(oData);
										sap.ui.core.BusyIndicator.hide();

										if (oController.pendingCount) {
											sap.ui.core.BusyIndicator.hide();
												
											sMessage = oController.geti18nText('message.confirm')
											MessageBox.confirm(sMessage, {
												actions: [oController.geti18nText('confirm'), oController.geti18nText('cancel')],
												emphasizedAction: MessageBox.Action.YES,

												onClose: function (sAction) {
													if (sAction === oController.geti18nText('markAll')) {
														/*
															oController.getView().byId('SmartTableBthreshold').getTable().addSelectionInterval(0, allDataAct1.length -
																1);
															oController.getView().byId('SmartTableThres2').getTable().addSelectionInterval(0, allDataAct2.length -
																1);
															oController.askConfirmation2();
														*/
													} else if (sAction === oController.geti18nText('confirm')) {
														oController.confirmaskConfirmationTBS();
													} else if (sAction === oController.geti18nText('cancel')) {
														jsonArrayfinal2 = [];
														oController.rebindTables();
													}
												}
											});
										} else {
											oController.confirmaskConfirmationTBS();
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
				error: function (e) {
					this._errorMessageClosingPOs();
					// common.displayErrorMessage(oController);
				}
			});
		},
		//gree end
		savePOChange: function () {
			var mECCData = {},
				oECCModel = this.getOwnerComponent().getModel("oECCIDocCreateModel");

			// Show Busy Indicator
			sap.ui.core.BusyIndicator.show(0);

			//Start of Change-
			var j = 0,
				k = 0,
				sapPOArrBatch = [];
			var POCount = sapTBSArr.length;
			GlobalData = [];
			GlobalResponse = [];
			asyncCallCounter = 0;
			GlobalError = [];
			for (j = 0; j < sapTBSArr.length; j++) {
				var PercStrTBS = sapTBSArr[j].WtdPerc.toString();
				if (PercStrTBS == "NaN") {
					common.displayErrorMessage(oController);
					sap.ui.core.BusyIndicator.hide();
					oController.rebindTables();
					jsonArray = [];
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
				sapPOArrBatch = sapTBSArr.slice(POArrMin, POArrMax);
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
						// MessageBox.error("POs are successfully updated in ECC");
						//End of the Change
						if (sapTBSArr.length == POArrMax && asyncCallCounter === 0) { // Added 
							oController.saveData(GlobalData, GlobalResponse); //(oData, oResponse);//Added 
							oController.rebindTables();
							sapTBSArr = [];
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
								"Message": oController.geti18nText("record"),
								"MessageV3": sapPOArrBatch[i].PoNumber,
								"MessageV4": sapPOArrBatch[i].ItemNo,

							}
							GlobalError.push(aError);
						}

						if (sapTBSArr.length == POArrMax && asyncCallCounter === 0) { // Added 
							oController.saveData(GlobalData, GlobalResponse); //(oData, oResponse);//Added
							oController.rebindTables();
							sapTBSArr = [];
							// Hide Busy Indicator
							sap.ui.core.BusyIndicator.hide();
						}
					}
				});
			}

		},

		//gree  start
		savePOChange2: function () {
			var mECCData = {},
				oECCModel = this.getOwnerComponent().getModel("oECCIDocCreateModel");

			// Show Busy Indicator
			sap.ui.core.BusyIndicator.show(0);

			//Start of Change-
			var j = 0,
				k = 0,
				sapPOArrBatch = [];
			var POCount = sapTBSArr.length;
			GlobalData = [];
			GlobalResponse = [];
			asyncCallCounter = 0;
			GlobalError = [];
			for (j = 0; j < sapTBSArr.length; j++) {
				var PercStrTBS = sapTBSArr[j].WtdPerc.toString();
				if (PercStrTBS == "NaN") {
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
				sapPOArrBatch = sapTBSArr.slice(POArrMin, POArrMax);
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
						// MessageBox.error("POs are successfully updated in ECC");
						//End of the Change
						if (sapTBSArr.length == POArrMax && asyncCallCounter === 0) { // Added 
							oController.saveData2(GlobalData, GlobalResponse); //(oData, oResponse);//Added 
							oController.rebindTables();
							sapTBSArr = [];
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
								"Message": oController.geti18nText("record"),
								"MessageV3": sapPOArrBatch[i].PoNumber,
								"MessageV4": sapPOArrBatch[i].ItemNo,

							}
							GlobalError.push(aError);
						}

						if (sapTBSArr.length == POArrMax && asyncCallCounter === 0) { // Added 
							oController.saveData2(GlobalData, GlobalResponse); //(oData, oResponse);//Added
							oController.rebindTables();
							sapTBSArr = [];
							// Hide Busy Indicator
							sap.ui.core.BusyIndicator.hide();
						}
					}
				});
			}

		},
		confirmaskConfirmationTBS: function () {
			if (oController.SelSubKeyTBS == "actUponTabTBS") {
				if (sapTBSArr.length > 0) {
					this.savePOChange();
				} else {
					this.edgeSave();
				}
			} else if (oController.SelSubKeyTBS == "thresholdTabTBS") {
				if (sapTBSArr.length > 0) {
					this.savePOChange2();
				} else {
					this.edgeSave2();
				}
			}
		},
		askConfirmation2: function () {
			sap.ui.core.BusyIndicator.hide();
			if (!this.oApproveDialogTBSThreTBS) {
				this.oApproveDialogTBSThreTBS = new Dialog({
					type: DialogType.Message,
					title: oController.geti18nText("confirm"),
					content: new Text({
						text: oController.geti18nText("saveConfMessage")
					}),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: oController.geti18nText("Submit"),
						press: function () {
							if (sapTBSArr.length > 0) {
								this.savePOChange2();
							} else {
								this.edgeSave2();
							}
							this.oApproveDialogTBSThreTBS.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: oController.geti18nText("cancel"),
						press: function () {
							// sapTBSArr = [];
							oController.rebindTables();
							jsonArrayfinal2 = [];
							this.oApproveDialogTBSThreTBS.close();
						}.bind(this)
					})
				});
			}
			this.oApproveDialogTBSThreTBS.open();
		},
		//gree end
		askConfirmation: function () {
			sap.ui.core.BusyIndicator.hide();
			if (!this.oApproveDialogTBS) {
				this.oApproveDialogTBS = new Dialog({
					type: DialogType.Message,
					title: oController.geti18nText("confirm"),
					content: new Text({
						text: oController.geti18nText("saveConfMessage")
					}),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: oController.geti18nText("Submit"),
						press: function () {
							if (sapTBSArr.length > 0) {
								this.savePOChange();
							} else {
								this.edgeSave();
							}
							this.oApproveDialogTBS.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: oController.geti18nText("cancel"),
						press: function () {
							// sapTBSArr = [];
							oController.rebindTables();
							jsonArray = [];
							this.oApproveDialogTBS.close();
						}.bind(this)
					})
				});
			}
			this.oApproveDialogTBS.open();
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
					//	jsonArray[k].AMOUNT_ACCURED = jsonArray[k].AMOUNT_ACCURED.toString();
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
					if (data.EX_CODE === 1) {
						oController.dashboardTBSData();
						oController.getView().byId("saveBtnTBS").setEnabled(false);
						oController.rebindTables();
						jsonArray = [];
						MessageBox.success(sMessage);
						// MVP2 changes Start of Code
						oController.getView().byId("recordTBS").setVisible(false);
						oController.getView().byId("recordMatTBS").setVisible(false);
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
			thresholdArray = jsonArrayfinal2;
			
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
				url: sPostURI + "updateServPOStatus.xsjs", //ta_url
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify(jsonData),
				success: function (data, Response) {
					if (data.EX_CODE === 1) {

			//			sMessage = oController.geti18nText('message.submitted') + "\n" +
			//						oController.geti18nText('message.submitted.details') + oController.pendingCount;
							let iTotalUnderCount = (iTotalServicePOUnder50KCount + iTotalMaterialPOUnder50KCount) - oController.reviewedCount;		
							let	sMessage = oController.geti18nText('message.submitted') + "\n\n" +
							oController.geti18nText('message.submitted.details')  + iTotalUnderCount;

							jsonArrayfinal2 = jsonArrayfinal2.filter((arr, index, self) => index === self.findIndex((t) =>
							(t.PONUMBER === arr.PONUMBER && t.LINEITEM === arr.LINEITEM)));
							thresholdArray = jsonArrayfinal2;	
							
						oController.dashboardTBSData();
						oController.getView().byId("saveBtnThre").setEnabled(false);
						oController.rebindTables();
						thresholdArray = [];
						jsonArrayfinal2 = [];
						MessageBox.success(sMessage);
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
		}, //gree end
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

				},
				error: function (error) {
					//	MessageBox.error("Error while sending Email. Please try after some time");
				}
			});
			MessageBox.information(oController.geti18nText("anemail") + " " + emailId + " " + oController.geti18nText("anemails"));
		},
		
		/**
		 * Opens a pop up dialog for the selected video link
		 * @param {url} link instance of upon press of the reference link in the table
		 */
		onVideoPress: function (url) {
			const oView = oController.getView();
			let oVideoDialog = oView.byId("vDialog");
			if (!oVideoDialog) {
				oVideoDialog = sap.ui.xmlfragment(oView.getId(), "com.takeda.Accrual_UI5.fragment.videoPopup", oController);
				oController.getView().addDependent(oVideoDialog);
			}
			oVideoDialog.open();
			var sIframeId = this.getView().byId(this.createId("srclink")).getId();
			$("#" + sIframeId).attr("src", url);
		},
		/**
		 * Closes the pop up dialog for the selected video link
		 * 
		 */
		onCloseRef: function () {
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