export class SkuPriceService { 

    private currencies = {}; 
    private skuPrices = {};
    private skuPriceCollectionConfigs = {}; 
    private skuPriceGetEntityPromises = {}; 
    private skuPriceHasEntityDeferred = {}; 
    private skuPriceHasEntityPromises = {}; 

    //@ngInject
    constructor(public $q, 
                public $hibachi,
                public collectionConfigService, 
                public observerService
    ){
         this.observerService.attach(this.updateSkuPrices,'skuPricesUpdate');
    }

    public getRelatedSkuPriceCollectionConfig = (skuID,currencyCode,minQuantity,maxQuantity) =>{
        var relatedSkuPriceCollectionConfig = this.collectionConfigService.newCollectionConfig("SkuPrice"); 
        relatedSkuPriceCollectionConfig.addDisplayProperty("skuPriceID,sku.skuID,minQuantity,maxQuantity,currencyCode,price");
        relatedSkuPriceCollectionConfig.addFilter("minQuantity",minQuantity,"=");
        relatedSkuPriceCollectionConfig.addFilter("maxQuantity",maxQuantity,"=");
        relatedSkuPriceCollectionConfig.addFilter("currencyCode",currencyCode,"!=");
        relatedSkuPriceCollectionConfig.addFilter("sku.skuID",skuID,"=");
        relatedSkuPriceCollectionConfig.addOrderBy("currencyCode|asc");
        relatedSkuPriceCollectionConfig.setAllRecords(true);
        return relatedSkuPriceCollectionConfig;
    }

    //wrapper function to split up args
    public updateSkuPrices = (args) =>{
        this.loadSkuPricesForSku(args.skuID, args.refresh); 
    }

    public loadSkuPricesForSku = (skuID, refresh?) =>{
        this.skuPriceHasEntityDeferred[skuID] = this.$q.defer();
        this.skuPriceHasEntityPromises[skuID] = this.skuPriceHasEntityDeferred[skuID].promise;
        if(angular.isUndefined(this.skuPriceCollectionConfigs[skuID])){
            this.skuPriceCollectionConfigs[skuID] = this.collectionConfigService.newCollectionConfig("SkuPrice"); 
            this.skuPriceCollectionConfigs[skuID].addDisplayProperty("skuPriceID,sku.skuID,minQuantity,maxQuantity,currencyCode,price");
            this.skuPriceCollectionConfigs[skuID].addFilter("sku.skuID",skuID,"=");
            this.skuPriceCollectionConfigs[skuID].addOrderBy("currencyCode|asc");
            this.skuPriceCollectionConfigs[skuID].setAllRecords(true);
        }
        if(angular.isUndefined(this.skuPriceGetEntityPromises[skuID]) || refresh){
            this.skuPriceGetEntityPromises[skuID] = this.skuPriceCollectionConfigs[skuID].getEntity(); 
            refresh = true; 
        }
        if(refresh){
            this.skuPriceGetEntityPromises[skuID].then( (response) => {
                angular.forEach(response.records,(value,key)=>{
                    this.setSkuPrices(skuID, [this.$hibachi.populateEntity("SkuPrice", value)]);
                }); 
            },
            (reason) => {
                this.skuPriceHasEntityPromises[skuID].reject(); 
                throw("skupriceservice failed to get sku prices" + reason);
            }).finally( () => {
                this.skuPriceHasEntityPromises[skuID].resolve(); 
            });
        }
        return this.skuPriceGetEntityPromises[skuID];
    }

    public setSkuPrices = (skuID, skuPrices) => { 
        if(angular.isDefined(this.skuPrices[skuID])){
            for(var i=0; i < skuPrices.length; i++){
                if(this.getKeyOfSkuPriceMatch(skuID, skuPrices[i]) != -1){
                    this.getSkuPrices(skuID)[this.getKeyOfSkuPriceMatch(skuID, skuPrices[i])].data.price = skuPrices[i].data.price; 
                    skuPrices.splice(i, 1);
                    i--;
                }
            }
            this.skuPrices[skuID] = this.skuPrices[skuID].concat(skuPrices);
        } else {
            this.skuPrices[skuID] = skuPrices; 
        }
    };

    public hasSkuPrices = (skuID) =>{
        if(angular.isDefined(this.skuPrices[skuID])){
            return true;
        }
        return false; 
    }

    public getSkuPrices = (skuID) =>{
        if(angular.isDefined(this.skuPrices[skuID])){
            return this.skuPrices[skuID];
        }
    }

    private loadCurrencies = (currenciesToLoad) =>{
        var currencyDeferred = this.$q.defer(); 
        var currencyPromise = currencyDeferred.promise; 
        var currencyRates = this.$hibachi.getConfig()["currencyRates"]; 
        var unloadedCurrencies = []; 
        for(var i = 0; i < currenciesToLoad.length; i++){
            if(angular.isUndefined(this.currencies[currenciesToLoad[i]])){
                unloadedCurrencies.push(currenciesToLoad[i]);
            }
        }
        if(unloadedCurrencies.length > 0){
            var currencyRateCollectionConfig = this.collectionConfigService.newCollectionConfig("CurrencyRate"); 
            currencyRateCollectionConfig.setAllRecords(true);
            currencyRateCollectionConfig.addDisplayProperty("currencyRateID,conversionRate,currency.currencyCode,conversionCurrency.currencyCode");
            for(var j = 0; j < unloadedCurrencies.length; j++){
                currencyRateCollectionConfig.addFilter("currency.currencyCode", unloadedCurrencies[j], "=", "OR"); 
            }
            currencyRateCollectionConfig.getEntity().then(
                (response)=>{
                    angular.forEach(response.records,(value,key)=>{
                        this.currencies[value.conversionCurrency_currencyCode] = { convertFrom : value.currency_currencyCode, rate : value.conversionRate }
                        for(var k = 0; k < unloadedCurrencies.length; k++){
                            if( unloadedCurrencies[k] == value.conversionCurrency_currencyCode){
                                unloadedCurrencies.splice(k,1); 
                                break; 
                            }                        
                        }
                    });
                },
                (reason)=>{
                    currencyDeferred.reject("Couldn't load currency rates"); 
                }
            ).finally(()=>{
                if(unloadedCurrencies.length > 0){
                    angular.forEach(currencyRates,(value,key)=>{
                        if(key != "RETREIVED" && angular.isUndefined(this.currencies[key])){
                            this.currencies[key] = { convertFrom : "EUR", rate : value }
                        }
                    });
                }
                currencyDeferred.resolve(); 
            }); 
        }
        return currencyPromise; 
    }

    public getBaseSkuPricesForSku = (skuID, eligibleCurrencyCodes?) =>{
        var deferred = this.$q.defer(); 
        var promise = deferred.promise; 
        var skuPriceSet = [];
        if(angular.isDefined(this.skuPriceHasEntityPromises[skuID])){
            this.skuPriceGetEntityPromises[skuID].then(()=>{
                var skuPrices = this.getSkuPrices(skuID) || [];
                for(var i=0; i < skuPrices.length; i++){
                    var skuPrice = skuPrices[i];
                    if( (angular.isUndefined(skuPrice.data.minQuantity) || !skuPrice.data.minQuantity.length) &&
                        (angular.isUndefined(skuPrice.data.maxQuantity) || !skuPrice.data.maxQuantity.length)
                    ){
                        skuPriceSet.push(skuPrice);
                    }
                }
                if(angular.isDefined(eligibleCurrencyCodes)){
                    this.loadCurrencies(eligibleCurrencyCodes).then(
                        ()=>{
                            for(var j=0; j < eligibleCurrencyCodes.length; j++){
                                for(var k=0; k < skuPriceSet.length; k++){
                                    var found = false; 
                                    if(eligibleCurrencyCodes[j] == skuPriceSet[k].data.currencyCode){
                                        found = true
                                        break; 
                                    }
                                    if(!found){ 
                                        //create a sku price from the data
                                    }
                                }
                            }
                        }
                    );

                }
            }).finally(()=>{
                deferred.resolve(skuPriceSet); 
            });
        }
        return promise; 
    }

    public getSkuPricesForQuantityRange = (skuID, minQuantity, maxQuantity, eligibleCurrencyCodes?) => {
        var deferred = this.$q.defer(); 
        var promise = deferred.promise; 
        var skuPriceSet = []; 
        if(angular.isDefined(this.skuPriceHasEntityPromises[skuID])){
            this.skuPriceGetEntityPromises[skuID].then(()=>{
                var skuPrices = this.getSkuPrices(skuID);
                for(var i=0; i < skuPrices.length; i++){
                    var skuPrice = skuPrices[i];
                    if( parseInt(skuPrice.data.minQuantity) == parseInt(minQuantity) &&
                        parseInt(skuPrice.data.maxQuantity) == parseInt(maxQuantity)
                    ){
                        skuPriceSet.push(skuPrice);
                    }
                }
                if(angular.isDefined(eligibleCurrencyCodes)){
                    this.loadCurrencies(eligibleCurrencyCodes);
                }
            }).finally(()=>{
                deferred.resolve(skuPriceSet); 
            });
        }
        return promise; 
    }

    public getKeyOfSkuPriceMatch = (skuID, skuPrice) =>{
        if(this.hasSkuPrices(skuID)){
            for(var i=0; i < this.getSkuPrices(skuID).length; i++){
                var savedSkuPriceData = this.getSkuPrices(skuID)[i].data;
                if(savedSkuPriceData.currencyCode == skuPrice.data.currencyCode &&
                   parseInt(savedSkuPriceData.minQuantity) == parseInt(skuPrice.data.minQuantity) &&
                   parseInt(savedSkuPriceData.maxQuantity) == parseInt(skuPrice.data.maxQuantity)
                ){
                    return i; 
                }
            }
        }
        return -1; 
    }
}