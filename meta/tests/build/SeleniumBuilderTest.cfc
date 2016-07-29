/*
    Slatwall - An Open Source eCommerce Platform
    Copyright (C) ten24, LLC
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
    Linking this program statically or dynamically with other modules is
    making a combined work based on this program.  Thus, the terms and
    conditions of the GNU General Public License cover the whole
    combination.
    As a special exception, the copyright holders of this program give you
    permission to combine this program with independent modules and your
    custom code, regardless of the license terms of these independent
    modules, and to copy and distribute the resulting program under terms
    of your choice, provided that you follow these specific guidelines:
	- You also meet the terms and conditions of the license of each
	  independent module
	- You must not alter the default display of the Slatwall name or logo from
	  any part of the application
	- Your custom code must not alter or create any files inside Slatwall,
	  except in the following directories:
		/integrationServices/
	You may copy and distribute the modified version of this program that meets
	the above guidelines as a combined work under the terms of GPL for this program,
	provided that you include the source code of that other code when and as the
	GNU GPL requires distribution of source code.
    If you modify this program, you may extend this exception to your version
    of the program, but you are not obligated to do so.
Notes:
*/
component extends="Slatwall.meta.tests.unit.SlatwallUnitTestBase" {

	public void function verify_json_wait_for_eval() {
		var adminIntegrationTestFiles = directoryList("#expandPath('/Slatwall')#/meta/tests/integration/admin");

		// Loop over all test files in the admin directory
		for(var f=1; f<=arrayLen(adminIntegrationTestFiles); f++) {

			// find the file, and read its contents
			var testFilePath = adminIntegrationTestFiles[f];
			var testContent = fileRead(testFilePath);

			// Make sure that the file content is json
			if(isJSON(testContent)) {

				var testData = deserializeJSON(testContent);

				//writeDump(testData);
				//abort;

				// Loop over each step in the json
				for(var s=1; s<=arrayLen(testData["steps"]); s++) {

					// Setup a variable for this step
					var thisStep = testData["steps"][s];
					var thisStepType = thisStep["type"];

					// Create a last step variable if one exists
					var lastStep = javaCast("null","");
					var lastStepType = "";
					if(s>1) {
						lastStep = testData["steps"][s-1];
						lastStepType = lastStep["type"];
					}

					// Setup a next step variable if one exists
					var nextStep = javaCast("null","");
					var nextStepType = "";
					if(s<arrayLen(testData["steps"])) {
						nextStep = testData["steps"][s+1];
						nextStepType = nextStep["type"];
					}

					// If this step is a click event
					if(
							(structKeyExists(thisStep, "type") && thisStep["type"] == 'clickElement')
							&&
							(
								(!len(lastStepType) || lastStepType != "waitForEval")
								||
								(!len(nextStepType) || nextStepType != "waitForEval")
							)
					) {

						var newStep = {};
						newStep["type"] = "pause";
						//newStep["script"] = "return document.readyState";
						newStep["value"] = "500";

						if(!len(nextStepType) || nextStepType != "pause") {
								arrayInsertAt(testData["steps"], s+1, newStep);
						}
						if(!len(lastStepType) || lastStepType != "pause") {
								arrayInsertAt(testData["steps"], s, newStep);
						}

					}

				} // End of steps loop

				var newFilePath = replace(testFilePath, "admin", "admin_runnable");

				fileWrite(newFilePath, serializeJSON(testData));

			} // End json check

		} // End directory loop

	}

}
