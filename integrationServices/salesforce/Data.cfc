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

component accessors="true" output="false" displayname="Salesforce" extends="Slatwall.org.Hibachi.HibachiObject" {
	// Variables Saved in this application scope, but not set by end user

	public any function init() {
		super.init();
		
		
		return this;
	}
	
	
	
	public any function testIntegration() {
		var requestBean = new Slatwall.model.transient.data.DataRequestBean();
	
		return getData(requestBean);
	}
	
	// @hint helper function to return a Setting
	public any function setting(required string settingName, array filterEntities=[], formatValue=false) {
		if(structKeyExists(getIntegration().getSettings(), arguments.settingName)) {
			return getService("settingService").getSettingValue(settingName="integration#getPackageName()##arguments.settingName#", object=this, filterEntities=arguments.filterEntities, formatValue=arguments.formatValue);	
		}
		return getService("settingService").getSettingValue(settingName=arguments.settingName, object=this, filterEntities=arguments.filterEntities, formatValue=arguments.formatValue);
	}
	
	// @hint helper function to return the integration entity that this belongs to
	public any function getIntegration() {
		return getService("integrationService").getIntegrationByIntegrationPackage(getPackageName());
	}
	
	// @hint helper function to return the packagename of this integration
	public any function getPackageName() {
		return lcase(listGetAt(getClassFullname(), listLen(getClassFullname(), '.') - 1, '.'));
	}
	
	public any function getData(required any requestBean){
		variables.authDetails = getService('salesForceService').getAccessTokenByAuthentication(
			instanceID=setting('instanceId'),
			clientID=setting('clientid'),
			clientSecret=setting('clientsecret'),
			username=setting('userName'),
			password=setting('password'),
			securityToken=setting('securitytoken')
		);
		
		var JsonResponse = getJsonResponse(jsonPacket);
		var responseBean = getDataResponseBean(jsonResponse);
		
		return responseBean;
	}
	
	//convert form data to SF format
	private struct function serializeData(required struct data, required string type){
		var mapping = variables.mappings[arguments.type];
		var serializedData = {};
		
		for(var i=1; i <= listlen(structKeyList(arguments.data)); i++){
			//if column isnt in the config then it will error
			if(structKeyExists(mapping.fields,listgetAt(structKeyList(arguments.data),i))){
				serializedData[mapping.fields[listgetAt(structKeyList(arguments.data),i)].field] = arguments.data[listgetAt(structKeyList(arguments.data),i)];
			//}else{
			//	serializedData[listgetAt(structKeyList(arguments.data),i)] = arguments.data[listgetAt(structKeyList(arguments.data),i)];
			}
		}
		return serializedData;
	}
	
	//convert from SF Format to form format
	private struct function deserializeData(required struct data, required string type){
		var mapping = variables.mappings[arguments.type];
		var deserializedData = {};
		
		for(var i=1; i <= listlen(structKeyList(arguments.data)); i++){
			key='';
			for(var j=1; j <= listlen(structKeyList(mapping.fields)); j++){
				if(mapping.fields[listgetat(structKeyList(mapping.fields),j)].field eq listgetAt(structKeyList(arguments.data),i)){
					key=listgetat(structKeyList(mapping.fields),j);
				}
			}
			if(len(key)){
				deserializedData[key] = arguments.data[listgetAt(structKeyList(arguments.data),i)];
			}else{
				deserializedData[listgetAt(structKeyList(arguments.data),i)] = arguments.data[listgetAt(structKeyList(arguments.data),i)];
			}
			key='';
		}
		
		return deserializedData;
	}
	
	private array function getRequiredFields(required struct mapping){
		var requiredFields=[];
			
			for(var i = 1; i <= listlen(structKeyList(arguments.mapping)); i++){
				if(arguments.mapping[listgetat(structKeyList(arguments.mapping),i)].required eq true){
					arrayAppend(requiredFields,arguments.mapping[listgetat(structKeyList(arguments.mapping),i)].field);
				}
			}
		return requiredFields;
	}
	
	private array function getIdentifierFields(required struct mapping){
		var identifierFields=[];
			
			for(var i = 1; i <= listLen(structKeyList(arguments.mapping)); i++){
				if(arguments.mapping[listgetat(structKeyList(arguments.mapping),i)].identifier eq true){
					arrayAppend(identifierFields,listgetat(structKeyList(arguments.mapping),i));
				}
			}
		return identifierFields;
	}
	
	
}

