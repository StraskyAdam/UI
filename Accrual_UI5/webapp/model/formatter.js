sap.ui.define([
	"sap/ui/core/format/NumberFormat",
], function (NumberFormat, ResourceModel) {
	"use strict";
	var oController;
	
	return {
		formatCurrencySelect: function (decimalFormat, allDataAct1, j) {
			var amount = allDataAct1[j].TOTWRKCOMPAMT_CHAR;
			if (amount === null) {
				amount = 0.00;
			}
			if (allDataAct1.length > 0) {
				amount = this.formatCurrency(decimalFormat, amount);
			} else {
				amount = this.formatCurrency(decimalFormat, amount);

			}
			allDataAct1[j].TOTWRKCOMPAMT_CHAR = amount;
		},
		formatCurrencySelectcompAmtUSD: function (decimalFormat, allDataAct1, j) {
			var amount = allDataAct1[j].TOTWRKCOMPAMT_USD;
			if (amount === null) {
				amount = 0.00;
			}
			if (allDataAct1.length > 0) {
				amount = this.formatCurrency(decimalFormat, amount);
			} else {
				amount = this.formatCurrency(decimalFormat, amount);

			}
			allDataAct1[j].TOTWRKCOMPAMT_USD = amount;
		},
		formatCurrencySelectAccAmt: function (decimalFormat, allDataAct1, j, AmountAccured1) {
			var amount = AmountAccured1;
			if (amount === null) {
				amount = 0.00;
			}
			if (allDataAct1.length > 0) {
				amount = this.formatCurrency(decimalFormat, amount);
			} else {
				amount = this.formatCurrency(decimalFormat, amount);

			}
			allDataAct1[j].AMOUNTACCRUED = amount;
		},
		formatCurrencySelectAccAmtUSD: function (decimalFormat, allDataAct1, j, AmountAccured1) {
			var amount = AmountAccured1;
			if (amount === null) {
				amount = 0.00;
			}
			if (allDataAct1.length > 0) {
				amount = this.formatCurrency(decimalFormat, amount);
			} else {
				amount = this.formatCurrency(decimalFormat, amount);

			}
			allDataAct1[j].AMOUNTACCRUED_USD = amount;
		},
		FlagCheck: function (value) {
			if (value == 0) {
				value = true;
			} else if (value == 1) {
				value = false;
			} else {
				value = true;
			}
			return value;
		},
		checkValidAmount: function (oTableBatch, oEvent, cols, decimalFormat, amount, spathg) {
			var formattedmount;
			var invalid = false;
			var message;
			switch (decimalFormat) {
			case " ":
				var regex = /^[0-9]{0,3}(.{0,1})(\d{3}.)*(\d{3})*(?:\,\d{0,2})$/;
				var regex2 = /^[0-9]{0,3}(.{0,1})(\d{3}.)*(\d{3})*$/;
				if (regex.test(amount)) {
					formattedmount = amount;
				} else if (regex2.test(amount)) {
					formattedmount = amount + ",00";
				} else {
					message = spathg.getText("enters") + "xxx.xxx,xx" + spathg.getText("format");
					invalid = true;
				}
				break;
			case "":
				var regex = /^[0-9]{0,3}(.{0,1})(\d{3}.)*(\d{3})*(?:\,\d{0,2})$/;
				var regex2 = /^[0-9]{0,3}(.{0,1})(\d{3}.)*(\d{3})*$/;
				if (regex.test(amount)) {
					formattedmount = amount;
				} else if (regex2.test(amount)) {
					formattedmount = amount + ",00";
				} else {
					message = spathg.getText("enters") + "xxx.xxx,xx" + spathg.getText("format");
					invalid = true;
				}
				break;				
			case "X":
				var regex3 = /^[0-9]{0,3}(,{0,1})(\d{3},)*(\d{3})*(?:\.\d{0,2})$/;
				// var regex4 = /^[1-9]{0,3}(,{0,1})(\d{3},)*(\d{3})*$/;
				var regex4 = /^[0-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/;
				if (regex3.test(amount)) {
					formattedmount = amount;
				} else if (regex4.test(amount)) {
					formattedmount = amount + ".00";
				} else {
					message = spathg.getText("enters") + "xxx.xxx,xx" + spathg.getText("format");
					invalid = true;
				}
				break;
			case "Y":
				var regex5 = /^([-]?)[0-9]{0,3}( {0,1})(\d{3}.)*(\d{3})*(?:\,\d{0,2})$/;
				var regex6 = /^([-]?)[0-9]\d*((( \d{3}){1})?(\,\d{0,2})?)$/;
				if (regex5.test(amount)) {
					formattedmount = amount;
				} else if (regex6.test(amount)) {
					formattedmount = amount + ",00";
				} else {
					message = spathg.getText("enters") + "xxx xxx,xx" + spathg.getText("format");
					invalid = true;
				}
			}
			if (invalid) {
				for (var k = 0; k < cols.length; k++) {
					// Set the Amount Value State and Error 
					if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmount") >= 0) {
						oEvent.getSource().getParent().getCells()[k].setValueState("Error");
						oEvent.getSource().getParent().getCells()[k].setValueStateText(message);
						oEvent.getSource().getParent().getCells()[k].setValue("");
					} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmountTBS") >=
						0) {
						oEvent.getSource().getParent().getCells()[k].setValueState("Error");
						oEvent.getSource().getParent().getCells()[k].setValueStateText(message);
						oEvent.getSource().getParent().getCells()[k].setValue("");
					} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalPercent") >=
						0) {
						oEvent.getSource().getParent().getCells()[k].setValue("");
					} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
							"totalPercentTBS") >= 0) {
						oEvent.getSource().getParent().getCells()[k].setValue("");
					}
				}
			} else {
				for (var k = 0; k < cols.length; k++) {
					// Set the Amount Value State and Error 
					if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmount") >= 0) {
						oEvent.getSource().getParent().getCells()[k].setValueState("None");
						oEvent.getSource().getParent().getCells()[k].setValueStateText("");
					} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmountTBS") >=
						0) {
						oEvent.getSource().getParent().getCells()[k].setValueState("None");
						oEvent.getSource().getParent().getCells()[k].setValueStateText("");
					}
				}
			}
			return formattedmount;

		},
		//gree start
		// statusFormat: function(value) {
		// 	if(value == "Reviewed")
		// 	{
		// 		value =	this.geti18nText("reviewed");
		// 	} else {
		// 		value = this.geti18nText("pending");
		// 	} return value;
		// },

		checkValidAmountThr: function (oTableBatch, oEvent, cols, decimalFormat, tAmount, spathg) {
			var formattedmount,
				amount = tAmount;
			var invalid = false;
			var message;
			switch (decimalFormat) {
			case " ":
				var regex = /^[0-9]{0,3}(.{0,1})(\d{3}.)*(\d{3})*(?:\,\d{0,2})$/;
				var regex2 = /^[0-9]{0,3}(.{0,1})(\d{3}.)*(\d{3})*$/;
				if (regex.test(amount)) {
					formattedmount = amount;
				} else if (regex2.test(amount)) {
					formattedmount = amount + ",00";
				} else {
					message = spathg.getText("enters") + "xxx.xxx,xx" + spathg.getText("format");
					invalid = true;
				}
				break;
			case "":
				var regex = /^[0-9]{0,3}(.{0,1})(\d{3}.)*(\d{3})*(?:\,\d{0,2})$/;
				var regex2 = /^[0-9]{0,3}(.{0,1})(\d{3}.)*(\d{3})*$/;
				if (regex.test(amount)) {
					formattedmount = amount;
				} else if (regex2.test(amount)) {
					formattedmount = amount + ",00";
				} else {
					message = spathg.getText("enters") + "xxx.xxx,xx" + spathg.getText("format");
					invalid = true;
				}
				break;
			case "Y":
				var regex5 = /^([-]?)[0-9]{0,3}( {0,1})(\d{3}.)*(\d{3})*(?:\,\d{0,2})$/;
				var regex6 = /^([-]?)[0-9]\d*((( \d{3}){1})?(\,\d{0,2})?)$/;
				if (regex5.test(amount)) {
					formattedmount = amount;
				} else if (regex6.test(amount)) {
					formattedmount = amount + ",00";
				} else {
					message = spathg.getText("enters") + "xxx xxx,xx" + spathg.getText("format");
					invalid = true;
				}
				break;
			case "X":
				var regex3 = /^[0-9]{0,3}(,{0,1})(\d{3},)*(\d{3})*(?:\.\d{0,2})$/;
				// var regex4 = /^[1-9]{0,3}(,{0,1})(\d{3},)*(\d{3})*$/;
				var regex4 = /^[0-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/;
				if (regex3.test(amount)) {
					formattedmount = amount;
				} else if (regex4.test(amount)) {
					formattedmount = amount + ".00";
				} else {
					message = spathg.getText("enters") + "xxx.xxx,xx" + spathg.getText("format");
					invalid = true;
				}
			}
			if (invalid) {
				for (var k = 0; k < cols.length; k++) {
					// Set the Amount Value State and Error 
					if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmountThres") >=
						0) {
						oEvent.getSource().getParent().getCells()[k].setValueState("Error");
						oEvent.getSource().getParent().getCells()[k].setValueStateText(message);
						oEvent.getSource().getParent().getCells()[k].setValue("");
					} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmountThr") >=
						0) {
						oEvent.getSource().getParent().getCells()[k].setValueState("Error");
						oEvent.getSource().getParent().getCells()[k].setValueStateText(message);
						oEvent.getSource().getParent().getCells()[k].setValue("");
					} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
							"totalPercentThres") >=
						0) {
						oEvent.getSource().getParent().getCells()[k].setValue("");
					} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
							"totalPercentThr") >= 0) {
						oEvent.getSource().getParent().getCells()[k].setValue("");
					}
				}
			} else {
				for (var k = 0; k < cols.length; k++) {
					// Set the Amount Value State and Error 
					if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmountThres") >=
						0) {
						oEvent.getSource().getParent().getCells()[k].setValueState("None");
						oEvent.getSource().getParent().getCells()[k].setValueStateText("");
					} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmountThr") >=
						0) {
						oEvent.getSource().getParent().getCells()[k].setValueState("None");
						oEvent.getSource().getParent().getCells()[k].setValueStateText("");
					}
				}
			}
			return formattedmount;

		},
		priceToDecimalThr: function (decimalFormat, amount, oTableBatch, cols, oEvent, spathg) {
			var priceInDecimal;
			if (amount == undefined) {
				return amount;
			}
			switch (decimalFormat) {
			case " ":
				priceInDecimal = amount.split('.').join('');
				priceInDecimal = priceInDecimal.split(',').join('.');
				priceInDecimal = Number(priceInDecimal.replace(/[^0-9.]/g, ""));
				break;
			case "":
				priceInDecimal = amount.split('.').join('');
				priceInDecimal = priceInDecimal.split(',').join('.');
				priceInDecimal = Number(priceInDecimal.replace(/[^0-9.]/g, ""));
				break;
			case "Y":
				priceInDecimal = amount.split(' ').join('');
				priceInDecimal = priceInDecimal.split(',').join('.');
				priceInDecimal = Number(priceInDecimal.replace(/[^0-9.]/g, ""));
				break;
			case "X":
				priceInDecimal = Number(amount.replace(/[^0-9.-]+/g, ""));
				break;
			}

			if (isNaN(priceInDecimal)) {
				if (oTableBatch !== undefined) {
					var message = spathg.getText("enter");
					for (var k = 0; k < cols.length; k++) {
						// Set the Amount Value State and Error 
						if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmountThr") >= 0) {
							oEvent.getSource().getParent().getCells()[k].setValueState("Error");
							oEvent.getSource().getParent().getCells()[k].setValueStateText(message);
							oEvent.getSource().getParent().getCells()[k].setValue("");
						} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
								"totalAmountThr") >= 0) {
							oEvent.getSource().getParent().getCells()[k].setValueState("Error");
							oEvent.getSource().getParent().getCells()[k].setValueStateText(message);
							oEvent.getSource().getParent().getCells()[k].setValue("");
						} else {
							// for (var k = 0; k < cols.length; k++) {
							// Set the Amount Value State and Error 
							if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmountThr") >=
								0) {
								oEvent.getSource().getParent().getCells()[k].setValueState("None");
								oEvent.getSource().getParent().getCells()[k].setValueStateText("");
							}
							// }
						}
					}
				}
			}
			return priceInDecimal;
		},

		formatCurrencySelectThre: function (decimalFormat, allDataThre1, j) {
			var amount = allDataThre1[j].TOTWRKCOMPAMT_CHAR;
			if (amount === null) {
				amount = 0.00;
			}
			if (allDataThre1.length > 0) {
				amount = this.formatCurrency(decimalFormat, amount);
			} else {
				amount = this.formatCurrency(decimalFormat, amount);

			}
			allDataThre1[j].TOTWRKCOMPAMT_CHAR = amount;
		},
		formatCurrencySelectcompAmtUSDThre: function (decimalFormat, allDataThre1, j) {
			var amount = allDataThre1[j].TOTWRKCOMPAMT_USD;
			if (amount === null) {
				amount = 0.00;
			}
			if (allDataThre1.length > 0) {
				amount = this.formatCurrency(decimalFormat, amount);
			} else {

				amount = this.formatCurrency(decimalFormat, amount);
			}
			allDataThre1[j].TOTWRKCOMPAMT_USD = amount;
		},
		formatCurrencySelectAccAmtThre: function (decimalFormat, allDataThre1, j, AmountAccured2) {
			var amount = AmountAccured2;
			if (amount === null) {
				amount = 0.00;
			}
			if (allDataThre1.length > 0) {
				amount = this.formatCurrency(decimalFormat, amount);
			} else {
				amount = this.formatCurrency(decimalFormat, amount);

			}
			allDataThre1[j].AMOUNTACCRUED = amount;
		},
		formatCurrencySelectAccAmtUSDThre: function (decimalFormat, allDataThre1, j, AmountAccured2) {
			var amount = AmountAccured2;
			if (amount === null) {
				amount = 0.00;
			}
			if (allDataThre1.length > 0) {
				amount = this.formatCurrency(decimalFormat, amount);
			} else {
				amount = this.formatCurrency(decimalFormat, amount);

			}
			allDataThre1[j].AMOUNTACCRUED_USD = amount;
		},
		//gree end
		formatAccAmount: function (decimalFormat, amount) {
			var AmountInDecimal;
			switch (decimalFormat) {
			case " ":
				AmountInDecimal = amount.split('.').join('');
				AmountInDecimal = AmountInDecimal.split(',').join('.');
				AmountInDecimal = Number(AmountInDecimal.replace(/[^0-9.]/g, ""));
				break;
			case "":
				AmountInDecimal = amount.split('.').join('');
				AmountInDecimal = AmountInDecimal.split(',').join('.');
				AmountInDecimal = Number(AmountInDecimal.replace(/[^0-9.]/g, ""));
				break;				
			case "Y":
				AmountInDecimal = amount.split(' ').join('');
				AmountInDecimal = AmountInDecimal.split(',').join('.');
				AmountInDecimal = Number(AmountInDecimal.replace(/[^0-9.]/g, ""));
				break;
			case "X":
				AmountInDecimal = Number(amount.replace(/[^0-9.-]+/g, ""));
				break;
			}
			return AmountInDecimal;
		},
		percentagetoDecimal: function (decimalFormat, percentage, str) {
			var percentageInDecimal;
			if (percentage == undefined) {
				return percentage;
			}
			switch (decimalFormat) {
			case " ":
				percentageInDecimal = percentage.split(',').join('.');
				percentageInDecimal = Number(percentageInDecimal.replace(/[^0-9.]/g, ""));
				break;
			case "":
				percentageInDecimal = percentage.split(',').join('.');
				percentageInDecimal = Number(percentageInDecimal.replace(/[^0-9.]/g, ""));
				break;				
			case "Y":
				percentageInDecimal = percentage.split(',').join('.');
				percentageInDecimal = Number(percentageInDecimal.replace(/[^0-9.]/g, ""));
				break;
			case "X":
				percentageInDecimal = Number(percentage.replace(/[^0-9.-]+/g, ""));
				break;
			}
			str.TOTALWORKCOMPLPERCENT = percentageInDecimal;
			return percentageInDecimal;
		},
		priceToDecimal: function (decimalFormat, amount, oTableBatch, cols, oEvent, spathg) {
			var priceInDecimal;
			if (amount == undefined) {
				return amount;
			}
			switch (decimalFormat) {
			case " ":
				priceInDecimal = amount.split('.').join('');
				priceInDecimal = priceInDecimal.split(',').join('.');
				priceInDecimal = Number(priceInDecimal.replace(/[^0-9.]/g, ""));
				break;
			case "":
				priceInDecimal = amount.split('.').join('');
				priceInDecimal = priceInDecimal.split(',').join('.');
				priceInDecimal = Number(priceInDecimal.replace(/[^0-9.]/g, ""));
				break;				
			case "Y":
				priceInDecimal = amount.split(' ').join('');
				priceInDecimal = priceInDecimal.split(',').join('.');
				priceInDecimal = Number(priceInDecimal.replace(/[^0-9.]/g, ""));
				break;
			case "X":
				priceInDecimal = Number(amount.replace(/[^0-9.-]+/g, ""));
				break;
			}

			if (isNaN(priceInDecimal)) {
				if (oTableBatch !== undefined) {
					var message = spathg.getText("enter");
					for (var k = 0; k < cols.length; k++) {
						// Set the Amount Value State and Error 
						if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmount") >= 0) {
							oEvent.getSource().getParent().getCells()[k].setValueState("Error");
							oEvent.getSource().getParent().getCells()[k].setValueStateText(message);
							oEvent.getSource().getParent().getCells()[k].setValue("");
						} else if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search(
								"totalAmountTBS") >= 0) {
							oEvent.getSource().getParent().getCells()[k].setValueState("Error");
							oEvent.getSource().getParent().getCells()[k].setValueStateText(message);
							oEvent.getSource().getParent().getCells()[k].setValue("");
						} else {
							// for (var k = 0; k < cols.length; k++) {
							// Set the Amount Value State and Error 
							if (oEvent.getSource().getParent().getCells()[k] && oEvent.getSource().getParent().getCells()[k].sId.search("totalAmount") >= 0) {
								oEvent.getSource().getParent().getCells()[k].setValueState("None");
								oEvent.getSource().getParent().getCells()[k].setValueStateText("");
							}
							// }
						}
					}
				}
			}
			return priceInDecimal;
		},
		// Format Currency
		formatCurrency: function (decimalFormat, amount) {
			var oFormatOptions;
			switch (decimalFormat) {
			case " ":
				oFormatOptions = {
					decimalSeparator: ",",
					groupingSeparator: "."
				};
				break;
			case "":
				oFormatOptions = {
					decimalSeparator: ",",
					groupingSeparator: "."
				};
				break;				
			case "X":
				oFormatOptions = {
					decimalSeparator: ".",
					groupingSeparator: ","
				};
				break;
			case "Y":
				oFormatOptions = {
					decimalSeparator: ",",
					groupingSeparator: " "
				};
				break;
			}
			var oFloatFormat = NumberFormat.getCurrencyInstance(oFormatOptions);
			var amountFormatted = oFloatFormat.format(amount);
			return amountFormatted;

		},
		formatCurrencyUSD: function (decimalFormatModel, amount) {
			if (amount === null) {
				amount = 0.00;
			}
			var decimalFormat;
			if (decimalFormatModel !== null && decimalFormatModel !== undefined) {
				if (decimalFormatModel.results.length > 0) {
					decimalFormat = decimalFormatModel.results[0].DECIMAL_FORMAT;
					amount = this.formatter.formatCurrency(decimalFormat, amount);

				} else {
					amount = this.formatter.formatCurrency(decimalFormat, amount);
				}

			}

			return amount;
		},
		// Format Currency for dashboard data
		formatCurrencyDashboard: function (decimalFormat, amount) {
			var oFormatOptions;
			switch (decimalFormat) {
			case " ":
				oFormatOptions = {
					decimalSeparator: ",",
					groupingSeparator: "."
				};
				var oFloatFormat = NumberFormat.getCurrencyInstance(oFormatOptions);
				var amountFormatted = oFloatFormat.format(amount);
				amountFormatted = amountFormatted.split(",")[0];
				break;
			case "":
				oFormatOptions = {
					decimalSeparator: ",",
					groupingSeparator: "."
				};
				var oFloatFormat = NumberFormat.getCurrencyInstance(oFormatOptions);
				var amountFormatted = oFloatFormat.format(amount);
				amountFormatted = amountFormatted.split(",")[0];
				break;
			case "X":
				oFormatOptions = {
					decimalSeparator: ".",
					groupingSeparator: ","
				};
				var oFloatFormat = NumberFormat.getCurrencyInstance(oFormatOptions);
				var amountFormatted = oFloatFormat.format(amount);
				amountFormatted = amountFormatted.split(".")[0];
				break;
			case "Y":
				oFormatOptions = {
					decimalSeparator: ",",
					groupingSeparator: " "
				};
				var oFloatFormat = NumberFormat.getCurrencyInstance(oFormatOptions);
				var amountFormatted = oFloatFormat.format(amount);
				amountFormatted = amountFormatted.split(",")[0];
				break;
			}

			return amountFormatted;

		},
		
		// Format Currency  with currency Code
		formatCurrencyWithCode: function (decimalFormatModel, amount, code) {
			var decimalFormat = "X";
			var amountWithCode = 0.00;
			if (amount < 0) {
				amount = 0.00;
			}
			if (code === null || code === undefined) {
				code = "";
			}
			if (decimalFormatModel !== null && decimalFormatModel !== undefined) {
				if (decimalFormatModel.results.length > 0) {
					decimalFormat = decimalFormatModel.results[0].DECIMAL_FORMAT;
					amountWithCode = this.formatter.formatCurrency(decimalFormat, amount) + " " + code;

				} else {
					amountWithCode = this.formatter.formatCurrency(decimalFormat, amount) + " " + code;
				}

			}

			return amountWithCode;
		},
		// Format Currency  with currency Code for WTD Amount
		formatCurrencyWithOCode: function (decimalFormatModel, amount) {
			var decimalFormat = "X";
			var amountWithCode = 0.00;
			if (amount < 0) {
				amount = 0.00;
			}
			if (decimalFormatModel !== null && decimalFormatModel !== undefined) {
				if (decimalFormatModel.results.length > 0) {
					decimalFormat = decimalFormatModel.results[0].DECIMAL_FORMAT;
					amountWithCode = this.formatter.formatCurrency(decimalFormat, amount);
				} else {
					amountWithCode = this.formatter.formatCurrency(decimalFormat, amount);
				}

			}

			return amountWithCode;
		},
		// Format type for exclusion PO(info) table
		typeFormat: function (value) {
			if (value === "9") {
				return "Service";
			} else if (value === "0") {
				return "Material";
			} else {
				return value;
			}
		},
		// Format method for service table
		methodFormat: function (value) {
			if (value === "STL") {
				return "Straight Line";
			} else if (value === "WTD") {
				return "Work To Date";
			} else {
				return value;
			}
		},
		// Format method for date
		workDateFormat: function (dDate) {

			var sDateFormatDisplayE = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd MMM yyyy"
			});
			if (dDate) {
				// Converts the Date to CET time zone
				dDate = new Date(dDate.toLocaleString("en-US", {
					timeZone: "Europe/Berlin"
				}));
				return sDateFormatDisplayE.format(new Date(dDate));
			}
		},

		// Format method for time
		methodFormatTime: function (dDate) {

			if (dDate) {
				// Convert Date to CET Date
				var sCETDateTime;
				sCETDateTime = dDate.toLocaleDateString("en-US", {
					timeZone: "GMT"
				});
				var sDateFormatDisplay = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "dd MMM yyyy"
				});
				// Convert Time to CET Time
				sCETDateTime = sDateFormatDisplay.format(new Date(sCETDateTime)) + " " +
					(dDate.toLocaleTimeString("en-US", {
						timeZone: "GMT"
					})).padStart(11, 0);

				return sCETDateTime;
			}
		},

		// Format method for WTD Percent
		formatPercent: function (decimal, percent) {
			var oFormatOptions = {
				decimalSeparator: ".",
				groupingSeparator: "",
				maxFractionDigits: 1,
				groupingEnabled: true
			};
			var oFloatFormat = NumberFormat.getCurrencyInstance(oFormatOptions);
			percent = oFloatFormat.format(percent);
			return percent;
		},
		// Format method for date and Time
		dateTimeFormat: function (dDate, tTime) {
			var sDateFormatDisplayE = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd MMM yyyy"
			});
			if (dDate) {
				// Converts the Date to CET time zone
				dDate = new Date(dDate.toLocaleString("en-US", {
					timeZone: "Europe/Berlin"
				}));
				var dateF = sDateFormatDisplayE.format(new Date(dDate));
			}
			var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
					pattern: "KK:mm:ss a"
				}),
				TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
			if (tTime) {
				var timeF = timeFormat.format(new Date(tTime.ms));
			} else {
				timeF = "";
			}
			if (dateF !== undefined) {
				return dateF + " " + timeF;
			} else {
				return null;
			}
		},
		formatMaterialStatus: function (status, curr) {
			return status;
		},
		// Format method for GL Account
		glAccountFormat: function (value) {
			if (value !== null) {
				var glValue = value.split(",");
				var LSP, array = [];
				for (var i = 0; i < glValue.length; i++) {
					if (LSP !== glValue[i]) {
						LSP = glValue[i];
						array.push(glValue[i]);
					}
				}
				return array;
			}
		},
		// Format method for new icon
		iconFormat: function (dDate) {
			if (dDate !== null) {

				// Converts the Date to CET time zone
				dDate = new Date(dDate.toLocaleString("en-US", {
					timeZone: "Europe/Berlin"
				}));

				var preDate = new Date();

				// Converts the Date to CET time zone
				preDate = new Date(preDate.toLocaleString("en-US", {
					timeZone: "Europe/Berlin"
				}));

				var preMonth = preDate.getMonth() + " " + preDate.getFullYear();
				var creDate = dDate;
				var creMonth = creDate.getMonth() + " " + creDate.getFullYear();
				if (preMonth === creMonth) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		},
		userAccessPOOwner: function (oUserAccessModel) {
			var editable = true;
			var d = new Date();
			d = new Date(d.toLocaleString("en-US", {
				timeZone: "Europe/Berlin"
			}));
			if (d.getDate() < 7) {

					editable = false; // TO BE ENABLED for PRODUCTION
				// editable = true; // ONLY FOR UAT 

			} else {
				editable = true;
			}
			return editable;
		},
		// Format method for user Access to edit the records
		userAccess: function (oUserAccessModel) {
			var editable = true;
			var d = new Date();
			d = new Date(d.toLocaleString("en-US", {
				timeZone: "Europe/Berlin"
			}));
			if (d.getDate() < 7) {

				editable = false; // TO BE ENABLED for PRODUCTION

				// editable = true; // ONLY FOR UAT 
			} else {
				// Get the User Access
				if (oUserAccessModel.results.length > 0) {
					var access = oUserAccessModel.results[0].USER_ACCESS;
					if (access === "Write") {
						editable = true;

					} else {
						editable = false;
					}

				}
			}
			return editable;
		},
		// Format method for user Access to visible the TBS tile
		userRoleVisibility: function (oUserAccessModel) {
			var editable = false;
			// Get the User Access
			if (oUserAccessModel.results.length > 0) {
				var access = oUserAccessModel.results[0].USER_ROLE;
				if (access === "TBS" || access === "Admin") {
					editable = true;

				} else {
					editable = false;
				}

			}
			return editable;
		},

	};
});
