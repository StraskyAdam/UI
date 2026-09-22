function initModel() {
	var sUrl = "/XSA_HTTP_ACCRUAL/xsodata/videolinks.xsodata/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}