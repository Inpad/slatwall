/// <reference path='../../../typings/slatwallTypescript.d.ts' />
/// <reference path='../../../typings/tsd.d.ts' />
/**
 * Validates true if the model value matches a regex string.
 */
class SWValidationRegex{
    constructor(){
        return {
            restrict: "A",
            require: "^ngModel",
            link: function(scope, element, attributes, ngModel) {
                    ngModel.$validators.swvalidationregex =
                    function(modelValue) {
                        //Returns true if this user value (model value) does match the pattern
                        var pattern = attributes.swvalidationregex;
                        var regex = new RegExp(pattern);
                        if (regex.test(modelValue)){
                            return true;
                        }else {
                            return false;
                        }
                };
            }
        };
    }
    public static Factory(){
        var directive = ()=>new SWValidationRegex();
        directive.$inject = [];
        return directive;
    }
}
export{
    SWValidationRegex
}