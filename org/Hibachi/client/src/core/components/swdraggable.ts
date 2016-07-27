/// <reference path='../../../typings/hibachiTypescript.d.ts' />
/// <reference path='../../../typings/tsd.d.ts' />

class SWDraggableController{
    
    public draggable:boolean; 

    //@ngInject
    constructor(){
        if(angular.isUndefined(this.draggable)){
            this.draggable = false; 
        }
    }

}

class SWDraggable implements ng.IDirective{
    public restrict:string = 'EA';
    public scope={};
    public bindToController={
        draggable:"=?"
    };

    public static Factory(){
        var directive:ng.IDirectiveFactory=(
            corePartialsPath,
            utilityService,
            expandableService,
			hibachiPathBuilder
        ) => new SWDraggable(
            corePartialsPath,
            utilityService,
            expandableService,
			hibachiPathBuilder
        );
        directive.$inject = [
            'corePartialsPath',
            'utilityService',
            'expandableService',
			'hibachiPathBuilder'
        ];
        return directive;
    }

    public controller=SWDraggableController;
    public controllerAs="swDraggable";
    //@ngInject
    constructor(
        public corePartialsPath,
        public utilityService,
        public expandableService,
		public hibachiPathBuilder
     ){
    }

    public link:ng.IDirectiveLinkFn = (scope:any, element:any, attrs:any) =>{
        angular.element(element).attr("draggable", "true");
        console.log("draggable link");
        var id = angular.element(element).attr("id");
        if (!id) {
            id = this.utilityService.createID(32);  
        } 
        element.bind("dragstart", function(e) {
            console.log(
                "ondragstart",
                scope.swDraggable.draggable,
                e
            );
            if(!scope.swDraggable.draggable) return false; 
        });
        element.bind("dragend", function(e) {
            console.log(
                "ondragend",
                scope.swDraggable.draggable,
                e
            );
            
        });

        element.on('dragenter', function (e) {
            console.log(
                "dragenter",
                e
            );
        });

        element.on('dragover', function(e) {
            console.log(
                "dragover",
                e
            );
        }); 

        element.on('drop', function(e) {
            console.log(
                "drop",
                e
            );
        }); 

        element.on('dragleave', function(e) {
            console.log(
                "dragleave",
                e
            );
        }); 
    }
}
export{
    SWDraggable
}

