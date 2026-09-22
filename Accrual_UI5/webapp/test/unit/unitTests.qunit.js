/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/takeda/Accrual_UI5/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});