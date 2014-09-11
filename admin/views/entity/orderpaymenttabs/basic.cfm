<cfparam name="rc.orderPayment" type="any" />
<cfparam name="rc.edit" type="boolean" />

<cfoutput>
	<cf_HibachiPropertyRow>
		<cf_HibachiPropertyList divClass="col-md-6">
			<cfif rc.orderPayment.getPaymentMethodType() eq "creditCard">
				<cf_HibachiPropertyDisplay object="#rc.orderPayment#" property="nameOnCreditCard" edit="#rc.edit#" />
				<cf_HibachiPropertyDisplay object="#rc.orderPayment#" property="creditCardType" />
				<cf_HibachiPropertyDisplay object="#rc.orderPayment#" property="expirationMonth" edit="#rc.edit#" />
				<cf_HibachiPropertyDisplay object="#rc.orderPayment#" property="expirationYear" edit="#rc.edit#" />
			<cfelseif rc.orderPayment.getPaymentMethodType() eq "termPayment">
				<cf_HibachiPropertyDisplay object="#rc.orderPayment#" property="termPaymentAccount" edit="false" />
				<cf_HibachiPropertyDisplay object="#rc.orderPayment#" property="paymentTerm" edit="false" />
			</cfif>
			
			<cfif listFindNoCase("creditCard,termPayment", rc.orderPayment.getPaymentMethodType()) or not isNull(rc.orderPayment.getBillingAddress())>
				<hr />
				<cf_HibachiPropertyDisplay object="#rc.orderPayment.getBillingAddress()#" property="name" edit="#rc.edit#" title="Address nickname"/>
				<cf_HibachiPropertyDisplay object="#rc.orderPayment.getBillingAddress()#" property="company" edit="#rc.edit#" />
				<cf_HibachiPropertyDisplay object="#rc.orderPayment.getBillingAddress()#" property="streetAddress" edit="#rc.edit#" />
				<cf_HibachiPropertyDisplay object="#rc.orderPayment.getBillingAddress()#" property="street2Address" edit="#rc.edit#" />
				<cf_HibachiPropertyDisplay object="#rc.orderPayment.getBillingAddress()#" property="city" edit="#rc.edit#" />
				<cf_HibachiPropertyDisplay object="#rc.orderPayment.getBillingAddress()#" property="stateCode" edit="#rc.edit#" />
				<cf_HibachiPropertyDisplay object="#rc.orderPayment.getBillingAddress()#" property="postalCode" edit="#rc.edit#" />
				<cf_HibachiPropertyDisplay object="#rc.orderPayment.getBillingAddress()#" property="countryCode" edit="#rc.edit#" />
			</cfif>
		</cf_HibachiPropertyList>
		<cf_HibachiPropertyList divClass="col-md-6">
			<cf_HibachiPropertyDisplay object="#rc.orderPayment#" property="dynamicAmountFlag" edit="false" />
			<cf_HibachiPropertyDisplay object="#rc.orderPayment#" property="orderPaymentType" />
			<cf_HibachiPropertyDisplay object="#rc.orderPayment#" property="amount" edit="#rc.edit and not rc.orderPayment.getDynamicAmountFlag()#" />
			<hr />
			<cf_HibachiPropertyDisplay object="#rc.orderPayment#" property="amountAuthorized" />
			<cf_HibachiPropertyDisplay object="#rc.orderPayment#" property="amountReceived" />
			<cf_HibachiPropertyDisplay object="#rc.orderPayment#" property="amountCredited" />
		</cf_HibachiPropertyList>
	</cf_HibachiPropertyRow>
</cfoutput>