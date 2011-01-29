component displayname="Address" entityname="SlatwallAddress" table="SlatwallAddress" persistent="true" output="false" accessors="true" extends="slatwall.com.entity.BaseEntity" {
	
	// Persistant Properties
	property name="addressID" type="numeric" ormtype="integer" fieldtype="id" generator="identity" unsavedvalue="0" default="0";
	property name="name" type="string" persistent="true";
	property name="company" type="string" persistent="true";
	property name="phone" type="string" persistent="true";
	property name="streetAddress" type="string" persistent="true";
	property name="street2Address" type="string" persistent="true";
	property name="locality" type="string" persistent="true";
	property name="city" type="string" persistent="true";
	property name="stateCode" type="string" persistent="true";
	property name="postalCode" type="string" persistent="true";
	property name="countryCode" type="string" persistent="true";
	
}