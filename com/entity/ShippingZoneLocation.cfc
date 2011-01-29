component displayname="Shipping Zone Location" entityname="SlatwallShippingZoneLocation" table="SlatwallShippingZoneLocation" persistent=true output=false accessors=true extends="slatwall.com.entity.BaseEntity" {
	
	// Persistant Properties
	property name="shippingZoneLocationID" type="numeric" ormtype="integer" fieldtype="id" generator="identity" unsavedvalue="0" default="0";

	// Related Object Properties
	property name="shippingZone" cfc="ShippingZone" fieldtype="many-to-one" fkcolumn="shippingZoneID";
	property name="country" cfc="Country" fieldtype="many-to-one" fkcolumn="countryCode";
	property name="state" cfc="State" filedtype="many-to-one" fkcolumn="stateCode";
	property name="postalCode" cfc="PostalCode" fieldtype="many-to-one" fkcolumn="postalCode";
	
}	

