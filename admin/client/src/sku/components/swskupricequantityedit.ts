/// <reference path='../../../typings/slatwallTypescript.d.ts' />
/// <reference path='../../../typings/tsd.d.ts' />
class SWSkuPriceQuantityEditController{
    
    public skuPriceId:string;
    public skuPrice:any; 
    public skuSkuId:any;
    public column:any; 
    public columnPropertyIdentifier:string; 
    public currencyCode:any;
    public filterOnCurrencyCode:string;
    public listingDisplayId:string; 
    public minQuantity:string; 
    public maxQuantity:string; 
    public price:string;
    public skuPrices=[]; 
    public pageRecord:any; 
    public pageRecordIndex;
    public relatedSkuPriceCollectionConfig:any;

    //@ngInject
    constructor(
        private $q, 
        private $hibachi,
        private collectionConfigService,
        private listingService, 
        private observerService,
        private skuPriceService
    ){ 
        if(angular.isDefined(this.pageRecord)){
            this.pageRecord.edited = false; 
        }
        if(angular.isDefined(this.skuSkuId) && angular.isUndefined(this.skuPrice)){
            var skuPriceData = {
                skuPriceID:this.skuPriceId, 
                minQuantity:this.minQuantity, 
                maxQuantity:this.maxQuantity,
                currencyCode:this.currencyCode,
                price:this.price
            }
            this.skuPrice = this.$hibachi.populateEntity("SkuPrice",skuPriceData);
            this.skuPriceService.setSkuPrices(this.skuSkuId,[this.skuPrice]);
            this.relatedSkuPriceCollectionConfig = this.skuPriceService.getRelatedSkuPriceCollectionConfig(this.skuSkuId,this.currencyCode,this.minQuantity,this.maxQuantity);
            this.refreshSkuPrices();
            this.observerService.attach(this.refreshSkuPrices, "skuPricesUpdate");
        }
    }    

    public refreshSkuPrices = () => {
         this.skuPriceService.loadSkuPricesForSku(this.skuSkuId).finally(()=>{
            this.getSkuPrices(); 
         });
    }

    public updateSkuPrices = () =>{ 
        this.listingService.markEdited( this.listingDisplayId, 
                                        this.pageRecordIndex, 
                                        this.columnPropertyIdentifier, 
                                        this.skuPrice.data[this.columnPropertyIdentifier]
                                      );
        angular.forEach(this.skuPrices,(value,key)=>{
            if(key > 0){
                value.forms["form" + value.data.skuPriceID].$setDirty(true);
                if(angular.isDefined( value.forms["form" + value.data.skuPriceID][this.columnPropertyIdentifier] ) &&
                   angular.isFunction( value.forms["form" + value.data.skuPriceID][this.columnPropertyIdentifier].$setDirty )
                ){
                    value.forms["form" + value.data.skuPriceID][this.columnPropertyIdentifier].$setDirty(true);
                }
                value.data[this.columnPropertyIdentifier] = this.skuPrice.data[this.columnPropertyIdentifier];
            }
        });
    }

    public saveSkuPrices = () =>{
        var savePromises = [];
        angular.forEach(this.skuPrices,(value,key)=>{
            if(key > 0){
                savePromises.push(value.$$save()); 
            }
        });
        this.$q.all(savePromises).then(
            (response)=>{
                this.pageRecord.edited = false; 
            },
            (reason)=>{
                //failure
            }
        );
    }

    public getSkuPrices = () =>{
        var promise = this.skuPriceService.getSkuPricesForQuantityRange(this.skuSkuId,this.minQuantity,this.maxQuantity)
        promise.then((data)=>{
            this.skuPrices = data;
        });
        return promise;
    }

}

class SWSkuPriceQuantityEdit implements ng.IDirective{
    public templateUrl;
    public restrict = 'EA';
    public scope = {}; 
    public bindToController = {
        skuPrice:"=?",
        skuPriceId:"@",
        currencyCode:"@",
        skuSkuId:"@",
        column:"=?",
        columnPropertyIdentifier:"@",
        minQuantity:"@",
        maxQuantity:"@",
        price:"@",
        listingDisplayId:"@?",
    };
    public controller = SWSkuPriceQuantityEditController;
    public controllerAs="swSkuPriceQuantityEdit";
   
    public static Factory(){
        var directive = (
            scopeService,
            skuPartialsPath,
			slatwallPathBuilder
        )=> new SWSkuPriceQuantityEdit(
            scopeService,
            skuPartialsPath,
			slatwallPathBuilder
        );
        directive.$inject = [
            'scopeService',
            'skuPartialsPath',
			'slatwallPathBuilder'
        ];
        return directive;
    }
    
    constructor(
        private scopeService,
		private skuPartialsPath,
	    private slatwallPathBuilder
    ){
        this.templateUrl = slatwallPathBuilder.buildPartialsPath(skuPartialsPath)+"skupricequantityedit.html";
    }

     public compile = (element: JQuery, attrs: angular.IAttributes) => {
        return {
            pre: ($scope: any, element: JQuery, attrs: angular.IAttributes) => {
                //have to do our setup here because there is no direct way to pass the pageRecord into this transcluded directive
                var currentScope = this.scopeService.locateParentScope($scope, "pageRecord");
                if(angular.isDefined(currentScope["pageRecord"])){
                    $scope.swSkuPriceQuantityEdit.pageRecord = currentScope["pageRecord"];
                    $scope.swSkuPriceQuantityEdit.pageRecordIndex = currentScope["$index"];
                }
            },
            post: ($scope: any, element: JQuery, attrs: angular.IAttributes) => {

            }
        };
    }
}
export{
    SWSkuPriceQuantityEdit,
    SWSkuPriceQuantityEditController
}