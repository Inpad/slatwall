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
component extends="Slatwall.model.service.HibachiService" persistent="false" accessors="true" output="false" {

	property name="settingService" type="any";
	
	variables.authenticationUrl = "${instanceID}/services/oauth2/token";	
	variables.dataUrl = "${instanceID}/services/data";
	variables.authDetails = {};
	
	// ===================== START: Logical Methods ===========================
	
	public any function getAccessTokenByAuthentication(
		required string instanceID,
		required string clientID,
		required string clientSecret,
		required string username,
		required string password,
		required string securityToken
	){
		
		var httpRequest = new http();
		httpRequest.setMethod("POST");
//		if( paymentMethod.getIntegration().setting('paypalAccountSandboxFlag') ) {
//			httpRequest.setUrl( variables.sandboxURL );
//		} else {
//			httpRequest.setUrl( variables.productionURL );
//		}

		httpRequest.setPort( 443 );
		httpRequest.setTimeout( 120 );
		httpRequest.setResolveurl(false);
		httpRequest.setUrl(getAuthenticationUrl(arguments.instanceID));
		
		//httpRequest.addParam(type="header",name="Content-Type", value="multipart/form-data");
		
		httpRequest.addParam(type="formfield", name="grant_type", value="password");
		httpRequest.addParam(type="formfield", name="client_id", value=arguments.clientID);
		httpRequest.addParam(type="formfield", name="client_secret", value=arguments.clientSecret);
		httpRequest.addParam(type="formfield", name="username", value=arguments.username);
		httpRequest.addParam(type="formfield", name="password", value=arguments.password&arguments.securityToken);
		
		var response = httpRequest.send().getPrefix();
		writedump(response);abort;
		return deserializejson(response.Filecontent);
	}
	
	public string function getAuthenticationUrl(required string instanceID){
		return getService('hibachiUtilityService').replaceStringTemplate(
			variables.authenticationUrl,{instanceID=arguments.instanceID}
		);
	}
	
	public string function getDataUrl(required string instanceID){
		return getService('hibachiUtilityService').replaceStringTemplate(
			variables.dataUrl,
			{instanceID=arguments.instanceID}
		);
	}
	/*
	*
	*@description asks salesforce for the available versions based on the instance id
	*/
	public any function getVersionOptions(required instanceID){
		var httpRequest = new http();
        httpRequest.setMethod("GET");
		httpRequest.setPort("443");
		httpRequest.setTimeout(45);
		httpRequest.setUrl(getDataUrl(arguments.instanceID));
		httpRequest.setResolveurl(false);
		
		var response = httpRequest.send().getPrefix();
		var versionOptions = [];
		if(FindNoCase(200,response.statusCode)){
			var data = deserializeJson(response.fileContent);
			for(var dataOption in data){
				versionOption = {};
				versionOption['name'] = dataOption['version'] & ' - ' & dataOption['label'];
				versionOption['value'] = dataOption['url'];
				arrayPrepend(versionOptions,versionOption);
			}
			
		}else{
			var option = {};
			option['name']=rbkey('setting.integrationsalesforceInstanceId') & ' incorrect. example: https://naXX.salesforce.com';
			option['value']="";
			arrayAppend(versionOptions,option);
		}
		return versionOptions;
	}
	
	
	
	// =====================  END: Logical Methods ============================
	
	// ===================== START: DAO Passthrough ===========================
	
	// ===================== START: DAO Passthrough ===========================
	
	// ===================== START: Process Methods ===========================
	
	// =====================  END: Process Methods ============================
	
	// ====================== START: Save Overrides ===========================
	
	// ======================  END: Save Overrides ============================
	
	// ==================== START: Smart List Overrides =======================
	
	// ====================  END: Smart List Overrides ========================
	
	// ====================== START: Get Overrides ============================
	
	// ======================  END: Get Overrides =============================
	
}
