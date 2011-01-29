component displayname="Attribute Option" entityname="SlatwallAttributeOption" table="SlatwallAttributeOption" persistent="true" accessors="true" output="false" extends="slatwall.com.entity.BaseEntity" {
	
	// Persistant Properties
	property name="attributeOptionID" type="numeric" ormtype="integer" fieldtype="id" generator="identity" unsavedvalue="0" default="0";
	property name="attributeOptionValue" type="string";
	
	// Related Object Properties
	property name="attribute" cfc="Vendor" fieldtype="many-to-one" fkcolumn="attributeID";	
}