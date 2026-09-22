sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/m/MessageToast"
], function (UIComponent, MessageToast) {
	"use strict";
	var _paq;
	return UIComponent.extend("com.takeda.ACCRUAL_ShellPlugin.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {

			//************************IMPORTANT NOTE:***********************************************************
			// CODE FOR SAP Web Analytics. Enable it before deploying in Production environment. Add Publick Key

			var usr = sap.ushell.Container.getUser().getFirstName();

		/*	if (usr) {

				usr = usr.split(".")[0];

			} else {

				usr = null;

			}*/

		//	var host = window.location.hostname;

			/*if (host) {

				var QA_URL = "edge-accruals-qty-accrual-approuter.cfapps.eu10.hana.ondemand.com";

				var PRD_URL = "edge-accruals-prd-accrual-approuter.cfapps.eu10.hana.ondemand.com";

				if (host.toLowerCase() == QA_URL) {

					window.swa = {

						pubToken: "002ce46f-82b8-436e-a6ae-da6435202e49",

						baseUrl: "https://events.wa.cfapps.eu10.hana.ondemand.com/tracker/",

						loggingEnabled: true,

						owner: usr

					};

					this.loadTracker();

				} else if (host.toLowerCase() == PRD_URL) {

					window.swa = {

						pubToken: "0ee7e8d3-d04a-41a3-ab3e-28bd9af8a16d",

						baseUrl: "https://events.wa.cfapps.eu10.hana.ondemand.com/tracker/",

						loggingEnabled: true,

						owner: usr

					};

					this.loadTracker();

				} else {

					console.log("Tracking not enabled");

				}

			}*/
			_paq = window._paq = window._paq || [];
			var currentUrl = location.href;
			
			this.loadTagManager();   
		},
		
		loadTagManager: function () {

			var _mtm = window._mtm = window._mtm || [];
			_mtm.push({
				'mtm.startTime': (new Date().getTime()),
				'event': 'mtm.Start'
			});
			var d = document,
				g = d.createElement('script'),
				s = d.getElementsByTagName('script')[0];
			g.async = true;
			g.src = 'https://cdn.matomo.cloud/takeda.matomo.cloud/container_FT5xfvWW.js';
			s.parentNode.insertBefore(g, s);

		},
		
		
	/*	loadTracker: function () {
			(
				function () {
					var d = document,
						g = d.createElement('script'),
						s = d.getElementsByTagName('script')[0];
					g.type = 'text/javascript';
					g.defer = true;
					g.async = true;
					g.src = window.swa.baseUrl + 'js/track.js';

					s.parentNode.insertBefore(g, s);

				})();
		},*/

		_getRenderer: function () {
			var that = this,
				oDeferred = new jQuery.Deferred(),
				oRenderer;

			that._oShellContainer = jQuery.sap.getObject("sap.ushell.Container");
			if (!that._oShellContainer) {
				oDeferred.reject(
					"Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");
			} else {
				oRenderer = that._oShellContainer.getRenderer();
				if (oRenderer) {
					oDeferred.resolve(oRenderer);
				} else {
					// renderer not initialized yet, listen to rendererCreated event
					that._onRendererCreated = function (oEvent) {
						oRenderer = oEvent.getParameter("renderer");
						if (oRenderer) {
							oDeferred.resolve(oRenderer);
						} else {
							oDeferred.reject("Illegal state: shell renderer not available after recieving 'rendererLoaded' event.");
						}
					};
					that._oShellContainer.attachRendererCreatedEvent(that._onRendererCreated);
				}
			}
			return oDeferred.promise();
		}
	});
});
