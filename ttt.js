var AggregateManager = webMI.callExtension("SYSTEM.LIBRARY.ATVISE.QUICKDYNAMICS.Aggregate Manager");
webMI.addOnunload(function unloadAggregateManager() {
	AggregateManager.destroy();
	AggregateManager = null;
});

var inputMode = webMI.query["validation"]; //implement if hasFeature html5 input types
var inputFO = webMI.dom.createElement("http://www.w3.org/1999/xhtml", "input");
document.getElementById("svg_input").appendChild(inputFO);
var isPasswordMode = (inputMode == "Password" || webMI.query["password"] == "Yes");
inputFO.type = isPasswordMode ? "password" : "text"; //implement e-mail when browsers support it
inputFO.id = "html_input_" + document.getElementById("svg_input").id;
inputFO.style.width = "100%";
inputFO.style.height = "100%";
inputFO.style.borderWidth = "0px";
inputFO.style.padding = "0px";
inputFO.style.textAlign = "right";
inputFO.style.color = webMI.query["fontColor"];
inputFO.style.fontFamily = webMI.query["fontFamily"];
inputFO.style.fontSize = parseFloat(webMI.query["fontSize"]) * 1.3 + "px";
var foreignObject = null;
var createdForeignObject = false;
var data = {};
var security = {};
var initialized = false;
var value = null;
var inputActive = false;
var isIOSDevice = /(iPod|iPhone|iPad)/.test(navigator.userAgent);
var nodeToSubscribe = (webMI.query["outputNode"] != "") ? webMI.query["outputNode"] : webMI.query["base"];
var decimalFraction = parseInt(webMI.query["decimalFraction"], 10);
var tabHandler = webMI.callExtension("SYSTEM.LIBRARY.ATVISE.QUICKDYNAMICS.Tab Handler");
var consistencyHandler = webMI.callExtension("SYSTEM.LIBRARY.ATVISE.QUICKDYNAMICS.Consistency Handler");
var consistencyGroup = webMI.query["consistencyGroup"];
var alarmToSubscribe = webMI.query["alarm"];
var alarmIndication = webMI.query["alarmIndication"];
var statusEnabled = webMI.query["statusEnabled"];
var statusTrigger = webMI.query["statusTrigger"];
var statusIndication = webMI.query["statusIndication"];
var activeIndicators = {};
var preventFirstConsistencyRead = true;
var storedEvent = { "keyCode": null, "shiftKey": false };
var backgroundColor = webMI.query["fill"];

data = {
	"min": { "value": null, "address": webMI.query["nodeMin"], "paramValue": webMI.query["min"] },
	"max": { "value": null, "address": webMI.query["nodeMax"], "paramValue": webMI.query["max"] },
	"limitLowLow": { "value": null, "address": webMI.query["nodeLowLow"], "paramValue": webMI.query["limitLowLow"] },
	"limitLow": { "value": null, "address": webMI.query["nodeLow"], "paramValue": webMI.query["limitLow"] },
	"limitHigh": { "value": null, "address": webMI.query["nodeHigh"], "paramValue": webMI.query["limitHigh"] },
	"limitHighHigh": { "value": null, "address": webMI.query["nodeHighHigh"], "paramValue": webMI.query["limitHighHigh"] },
	"activeNode": { "value": null, "address": webMI.query["activeNode"], "paramValue": "" },
	"activeValue": { "value": null, "address": "", "paramValue": webMI.query["activeValue"] },
	"base": { "value": null, "address": webMI.query["base"], "paramValue": "" }
};

webMI.addOnload(function (e) {
	var remaining = 8;

	function initVariables(value, address, id) {
		if (id == "base" && consistencyGroup != "" && address != "") {
			webMI.data.read(address, function (e) {
				data[id]["value"] = e.value;
				if (typeof e.status != "undefined")
					handleStatus(e.status);
			});
			consistencyHandler.register(consistencyGroup, address, handleInput);
			reduceRemaining();
		} else if (address != "") {

			AggregateManager.subscribeNodeOrAggregate(address, manageSubscriptionResult, manageSubscriptionResult, componentCode);

			function componentCode() {
				webMI.gfx.setText("input_label", "NaN");
				webMI.query["editable"] = "No";
			}

			function manageSubscriptionResult(subscriptionResult) {
				data[id]["value"] = subscriptionResult.value;
				if (typeof subscriptionResult.status != "undefined")
					handleStatus(subscriptionResult.status);
				reduceRemaining();
			}

		} else if (!isNaN(parseFloat(value))) {
			data[id]["value"] = parseFloat(value);
			reduceRemaining();
		} else if (typeof value == "string" && value != "off") {
			data[id]["value"] = value;
			reduceRemaining();
		} else {
			reduceRemaining();
		}

		function reduceRemaining() {
			if (!initialized)
				initialized = (--remaining == 0);
			else
				handleInput();
		}
	}

	function handleStatus(status) {
		if (statusEnabled != "Yes")
			return;

		if (statusTrigger != "") {
			webMI.trigger.fire(statusTrigger, status);
		} else {
			if (typeof statusIndication["ItemStatusBad"] == "undefined")
				statusIndication = { "ItemStatusBad": { color: "#ffff00", interval: "250" } };

			if (status == 0 || (status & 0xC0000000).toString(16) == 0)	//Good value state
				delete activeIndicators["status"];
			else if ((status & 0x80000000).toString(16) != 0)			//Bad value state
				activeIndicators["status"] = { color: statusIndication["ItemStatusBad"].color, interval: parseInt(statusIndication["ItemStatusBad"].interval) };
			else if ((status & 0xC0000000).toString(16) == 40000000)	//Uncertain value state
				activeIndicators["status"] = { color: statusIndication["ItemStatusBad"].color, interval: parseInt(statusIndication["ItemStatusBad"].interval) };
			else														//Unknown value state
				activeIndicators["status"] = { color: statusIndication["ItemStatusBad"].color, interval: parseInt(statusIndication["ItemStatusBad"].interval) };

			setIndicator();
		}
	}

	function initAlarm(address) {
		if (alarmIndication == "")
			alarmIndication = {};

		if (typeof alarmIndication["AlarmStatusOnUnacknowledged"] == "undefined")
			alarmIndication["AlarmStatusOnUnacknowledged"] = { color: "#ff0000", interval: "250" };

		if (typeof alarmIndication["AlarmStatusOnAcknowledged"] == "undefined")
			alarmIndication["AlarmStatusOnAcknowledged"] = { color: "#ff0000", interval: "500" };

		if (typeof alarmIndication["AlarmStatusOffUnacknowledged"] == "undefined")
			alarmIndication["AlarmStatusOffUnacknowledged"] = { color: "#ff0000", interval: "750" };

		if (typeof alarmIndication["AlarmStatusOnOffUnacknowledged"] == "undefined")
			alarmIndication["AlarmStatusOnOffUnacknowledged"] = { color: "#ff0000", interval: "1500" };

		webMI.alarm.subscribe(address, function (e) {
			if (e.state == 1) {
				activeIndicators["alarm"] = { color: alarmIndication["AlarmStatusOnUnacknowledged"].color, interval: parseInt(alarmIndication["AlarmStatusOnUnacknowledged"].interval) };
			} else if (e.state == 2) {
				activeIndicators["alarm"] = { color: alarmIndication["AlarmStatusOnAcknowledged"].color, interval: parseInt(alarmIndication["AlarmStatusOnAcknowledged"].interval) };
			} else if (e.state == 3) {
				activeIndicators["alarm"] = { color: alarmIndication["AlarmStatusOffUnacknowledged"].color, interval: parseInt(alarmIndication["AlarmStatusOffUnacknowledged"].interval) };
			} else if (e.state == 5) {
				activeIndicators["alarm"] = { color: alarmIndication["AlarmStatusOnOffUnacknowledged"].color, interval: parseInt(alarmIndication["AlarmStatusOnOffUnacknowledged"].interval) };
			} else {
				delete activeIndicators["alarm"];
			}
			setIndicator();

		});
	}

	if (alarmToSubscribe != "")
		initAlarm(alarmToSubscribe);

	for (var i in data)
		initVariables(data[i]["paramValue"], data[i]["address"], i);

	setColorization();

	var doc = document.getElementById("svg_input").ownerDocument;
	tabHandler.register(webMI.query["tabIndex"], keyHandler, doc);

	if (webMI.query["tooltip"] != undefined)
		webMI.callExtension("SYSTEM.LIBRARY.ATVISE.QUICKDYNAMICS.Tooltip", { "auto": "true", "id": "clickareaFO", "text": webMI.query["tooltip"] });
});

function setColorization() {
	function setBackground(color) {
		webMI.gfx.setFill("input_bg", color);
		inputFO.style.backgroundColor = color;
	}

	if (data["limitLowLow"]["value"] != null && value <= data["limitLowLow"]["value"])
		setBackground(webMI.query["limitLowLowFill"]);
	else if (data["limitLow"]["value"] != null && value <= data["limitLow"]["value"])
		setBackground(webMI.query["limitLowFill"]);
	else if (data["limitHighHigh"]["value"] != null && value >= data["limitHighHigh"]["value"])
		setBackground(webMI.query["limitHighHighFill"]);
	else if (data["limitHigh"]["value"] != null && value >= data["limitHigh"]["value"])
		setBackground(webMI.query["limitHighFill"]);
	else if (!security["hasRight"] || !security["activateInput"] || !security["activated"])
		setBackground(webMI.query["fillColorInactive"]);
	else if (security["outputModeOnly"])
		setBackground(webMI.query["fillNotEditable"]);
	else
		setBackground(webMI.query["fill"]);
}

function handleInput(consistencyValue) {
	//preventing first ConsistencyRead, as it would call handleInput without a consistencyValue
	if (consistencyGroup != "" && preventFirstConsistencyRead) {
		preventFirstConsistencyRead = false;
		return;
	}

	if (consistencyValue && consistencyGroup != "")
		consistencyHandler.set(consistencyGroup, data["base"]["address"], consistencyValue); //does not support alternative node

	value = (consistencyValue == undefined) ? data["base"]["value"] : consistencyValue;

	webMI.trigger.fire("valuechanged", (value == null) ? "" : value, "");

	var formattedOutput = null;
	var enumList = webMI.query["enumList"];

	if (isPasswordMode)
		formattedOutput = "*** T{Password} ***";
	else if (enumList != "") {
		formattedOutput = (enumList[value] != undefined) ? enumList[value].value : value + " not in enum list";
		value = (enumList[value] != undefined) ? enumList[value].value : value;
	} else if (inputMode == "Number") {
		var leadingZeros = parseInt(webMI.query["leadingZeros"], 10);
		var postDecimal = parseInt(webMI.query["postDecimal"], 10);
		var sign = webMI.query["sign"] == "true";
		var unit = webMI.query["unit"];
		var fieldWidth = 0;
		formattedOutput = (value != null) ? value : "";

		if (!isNaN(decimalFraction) && decimalFraction > 0)
			formattedOutput = formattedOutput / Math.pow(10, decimalFraction);

		if (!isNaN(leadingZeros) && leadingZeros > 0)
			fieldWidth += leadingZeros;

		if (!isNaN(postDecimal) && postDecimal > 0) {
			if (postDecimal > 9)
				postDecimal = 9;
			fieldWidth += (postDecimal + 1);
		}

		if (!isNaN(leadingZeros) && !isNaN(postDecimal)) {
			var formatString = ((sign) ? "%+" : "%") + "0" + fieldWidth + "." + postDecimal + "f";
			formattedOutput = webMI.sprintf(formatString, formattedOutput);
		}

		value = formattedOutput;

		if (unit != undefined)
			formattedOutput = formattedOutput + " " + unit;
	}

	webMI.gfx.setText("input_label", (formattedOutput != null) ? formattedOutput : value);

	security = {
		"outputModeOnly": (webMI.query["editable"] == "No"),
		"activateInput": (data["activeValue"]["value"] == null || data["activeNode"]["value"] == null) || data["activeValue"]["value"] == String(data["activeNode"]["value"]),
		"hasRight": true,
		"activated": (typeof security["activated"] === "boolean") ? security["activated"] : true
	};

	var requiredRight = webMI.query["right"];

	if (requiredRight != "") {
		if (requiredRight.search(/SYSTEM\.SECURITY\.RIGHTS\./) != -1)
			requiredRight = requiredRight.substring(23, requiredRight.length); //remove "prefix" SYSTEM.SECURITY.RIGHTS.

		webMI.addEvent(webMI.data, "clientvariableschange", function (e) {
			security["hasRight"] = webMI.hasRight(requiredRight);
			if (!security["hasRight"])
				switchToOutputMode();
			setColorization();
		});
	}

	if (!security["activateInput"])
		switchToOutputMode();

	//workaround until apple Bug ID 12900899 has been solved and the foreignobject clickarea is no longer required
	if (security["outputModeOnly"])
		webMI.gfx.setVisible("clickareaFO", false);

	if (inputMode == "Number")
		value = parseFloat(value);

	setColorization();
}

function switchToOutputMode() {
	inputActive = false;
	webMI.gfx.setVisible("svg_input", null);

	if (createdForeignObject) {
		webMI.gfx.removeForeignObject(foreignObject);
	}
}

var currentIndicator = "";
function setIndicator() {
	if (currentIndicator != "")
		return;

	if (activeIndicators["trigger"]) {
		currentIndicator = "trigger";
	} else if (activeIndicators["status"]) {
		currentIndicator = "status";
	} else if (activeIndicators["alarm"]) {
		currentIndicator = "alarm";
	} else {
		currentIndicator = "";
		return;
	}

	indicationActive = true;

	webMI.gfx.setStroke("blinking_frame", activeIndicators[currentIndicator].color);
	webMI.gfx.setVisible("blinking_frame", null);

	var interval = activeIndicators[currentIndicator].interval;
	setTimeout(function () {
		webMI.gfx.setVisible("blinking_frame", false);
		setTimeout(function () {
			currentIndicator = "";
			setIndicator();
		}, interval);
	}, interval);
}

function switchToInputMode() {
	if (security["hasRight"] && !security["outputModeOnly"] && security["activateInput"] && security["activated"]) {

		inputActive = true;
		var directKeyboardMode = webMI.query["allowDirectInput"] == "Yes";
		var useSVGKeyboard = webMI.callExtension("SYSTEM.LIBRARY.ATVISE.QUICKDYNAMICS.Configuration", { "action": "existsIndexParameter", "parameterName": "useSVGKeyboard" });
		if (useSVGKeyboard == "true")
			directKeyboardMode = false;

		function setFocus() {
			inputFO.focus();
			if (webMI.query["selectTextOnFocus"] == "true")
				inputFO.select();
		}

		if (directKeyboardMode) {
			tabHandler.setAcceptKeys(false);
			inputFO.value = value;
			webMI.gfx.setVisible("svg_input", false);

			var textboxGroup = document.getElementById("input_element");
			foreignObject = webMI.gfx.addForeignObject({ x: 0, y: 0, width: 160, height: 30, id: "input_fo", childNodes: [inputFO] }, textboxGroup);
			foreignObject.style.border = "black 2px solid";
			createdForeignObject = true;
			setFocus();
		} else { //SVG Mode
			function getDisplayParameters() {
				var communicationID = new Date().getTime().toString();
				webMI.trigger.connect(communicationID, function (e) {
					checkInput(e.value);
				});

				var passObj = {};
				for (var i in webMI.query)
					passObj[i] = webMI.query[i];
				passObj["minValue"] = data["min"]["value"];
				passObj["maxValue"] = data["max"]["value"];
				if (nodeToSubscribe != "" && consistencyGroup == "")
					passObj["target"] = nodeToSubscribe;
				if (nodeToSubscribe == "" || consistencyGroup != "")
					passObj["trigger"] = communicationID;
				if (isPasswordMode)
					passObj["password"] = "Yes";
				return passObj;
			}

			var keyboard = null;
			var size = (inputMode != undefined && inputMode == "Number") ? { w: 438, h: 378 } : { w: 550, h: 250 };

			if (inputMode != undefined && inputMode == "Number")
				keyboard = "SYSTEM.LIBRARY.ATVISE.OBJECTDISPLAYS.Standard.keyboard.number_keyboard";
			else
				keyboard = "SYSTEM.LIBRARY.ATVISE.OBJECTDISPLAYS.Standard.keyboard.keyboard";

			var keyboardParam = getDisplayParameters();
			webMI.display.openWindow({ display: keyboard, extern: false, height: size.h, menubar: false, modal: true, movable: true, resizable: false, scrollbars: false, status: false, title: "T{Keyboard}", toolbar: false, width: size.w, query: keyboardParam });
		}
	}
}

function keyHandler(keyTH, param2) {
	if (keyTH == "focus")
		webMI.gfx.setStroke("input_bg", webMI.query["focusStrokeColor"]);
	else if (keyTH == "blur")
		webMI.gfx.setStroke("input_bg", "none");
	else if (keyTH == "apply")
		switchToInputMode();
	else if (keyTH == "isActive")
		return (security["hasRight"] && !security["outputModeOnly"] && security["activateInput"] && security["activated"] && param2(document.getElementById("svg_input").parentNode));
}

webMI.addEvent("clickareaFO", "click", function (e) {
	tabHandler.setCurrentIndex(keyHandler);
	switchToInputMode();
});

function stopPropagation(event) {
	/*
	 * If the ALT key is pressed together with one or more other keys on
	 * Firefox (only Windows), there will be no keyup event when the ALT
	 * key gets released. Since the ALT key is being used for paning in
	 * atvise visualization, we have to make sure that key listeners in the
	 * global document do not get triggered if someone is currently entering
	 * something in the inputFO (like "someone@example.com").
	**/
	if (event.altKey) {
		if (event.stopPropagation)
			event.stopPropagation();
		else
			event.cancelBubble = true;
	}
}

webMI.addEvent(inputFO, "keyup", stopPropagation);
webMI.addEvent(inputFO, "keydown", function (e) {
	var keyCode = e.keyCode;
	if (/MSIE/.test(navigator.userAgent)) {
		storedEvent["keyCode"] = e.keyCode;
		storedEvent["shiftKey"] = e.shiftKey;
	}
	if (keyCode == "13" || keyCode == "9") {
		inputFO.blur();
		if (keyCode == "13") tabHandler.setAcceptKeysPrevent(true);
	} else if (keyCode == "27") {
		storedEvent["keyCode"] = "27";
		tabHandler.setAcceptKeysPrevent(true);
		inputFO.blur();
	}

	stopPropagation(e);
});

//mobile safari is not triggering blur event on a svg button click
if (isIOSDevice) {
	window.window.addEventListener("touchstart", touchstartHandler);
}


function touchstartHandler(e) {
	if (e.target !== inputFO && inputActive) {
		blurHandler();
	}
}

inputFO.onblur = blurHandler;

function blurHandler() {
	switchToOutputMode();
	tabHandler.setAcceptKeys(true);

	if (storedEvent["keyCode"] != null) {
		if (storedEvent["shiftKey"] && storedEvent["keyCode"] == "9")
			tabHandler.prevTab();
		else if (storedEvent["keyCode"] == "9")
			tabHandler.nextTab();
	}

	if (storedEvent["keyCode"] != "27") {
		//workaround: setTimeout for Chrome crash error (clicking out from the input field or clicking enter while holding a button pressed).
		setTimeout(function () {
			checkInput(inputFO.value);
		}, 0);
	}

	storedEvent["keyCode"] = null;
}

function checkInput(tempValue) {
	var tempValue = String(tempValue);
	var regexps = { "Boolean": "(true|false|0|1)", "Number": "[+-]*[0-9]+(\.[0-9]+)?", "String": ".*", "Password": ".*" };
	if (new RegExp("^" + regexps[inputMode] + "$", "i").test(tempValue)) {
		if (inputMode == "Boolean")
			tempValue = (tempValue.toLowerCase() == "true" || tempValue == "1") ? true : false;
		else if (inputMode == "Number")
			tempValue = tempValue = parseFloat(tempValue.replace(",", "."));
	} else {
		console.warn("Please enter a valid format according to the selected input mode.");
		return;
	}

	if (inputMode == "Number") {
		if (data["min"]["value"] != null && tempValue < data["min"]["value"]) {
			alert("T{Value too low}");
			return;
		} else if (data["max"]["value"] != null && tempValue > data["max"]["value"]) {
			alert("T{Value too high}");
			return;
		}

		if (!isNaN(decimalFraction) && decimalFraction > 0)
			tempValue = tempValue * Math.pow(10, decimalFraction);

		writeValue(tempValue);
	} else if (inputMode == "String" || inputMode == "Boolean" || inputMode == "Password")
		writeValue(tempValue);

	function writeValue(tempValue) {
		if (consistencyGroup == "" && nodeToSubscribe != "") {
			webMI.data.write(nodeToSubscribe, tempValue);
			webMI.trigger.fire("com.atvise.outputvaluechanged", tempValue, "");
		} else
			handleInput(tempValue);

	}
}

webMI.trigger.connect("setValue", function (e) {
	checkInput(e.value);
});

webMI.trigger.connect("com.atvise.setActive", function (e) {
	security["activated"] = e.value;

	setColorization();
	switchToOutputMode();
});

webMI.trigger.connect("com.atvise.setBlinking", function (e) {
	if (e.value == "none") {
		delete activeIndicators["trigger"];
		webMI.gfx.setStroke("blinking_frame", e.value);
		webMI.gfx.setVisible("blinking_frame", null);
	} else {
		activeIndicators["trigger"] = { color: e.value, interval: 500 };
		webMI.gfx.setStroke("blinking_frame", e.value);
		webMI.gfx.setVisible("blinking_frame", { 0: true, 2: false, 4: true, 6: false, 8: true, 10: false });
	}

	setIndicator();
});

webMI.trigger.connect("com.atvise.setBackground", function (e) {
	backgroundColor = (e.value == "") ? webMI.query["fill"] : e.value;
	setColorization();
});
