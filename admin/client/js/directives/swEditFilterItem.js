angular.module('slatwalladmin')
.directive('swEditFilterItem', 
['$http',
'$compile',
'$templateCache',
'partialsPath',
'$log',
'slatwallService',
'$filter',
function($http,
$compile,
$templateCache,
partialsPath,
$log,
slatwallService,
$filter){
	return {
		restrict: 'A',
		scope:{
			filterItem:"=",
			filterPropertiesList:"=",
			saveCollection:"&"
		},
		link: function(scope, element,attrs){
			var filterGroupsPartial = partialsPath+"editFilterItem.html";
			var templateLoader = $http.get(filterGroupsPartial,{cache:$templateCache});
			var promise = templateLoader.success(function(html){
				element.html(html);
			}).then(function(response){
				element.replaceWith($compile(element.html())(scope));
			});
		},
		controller: function ($scope, $element, $attrs) {
			//initialize directive
			
			if(angular.isUndefined($scope.filterItem.isClosed)){
				$scope.filterItem.isClosed = true;
			}
			if(angular.isUndefined($scope.filterItem.breadCrumbs)){
				$scope.filterItem.$$breadCrumbs = "";
			}
			for(i in $scope.filterPropertiesList.data){
				var filterProperty = $scope.filterPropertiesList.data[i];
				if(filterProperty.propertyIdentifier === $scope.filterItem.propertyIdentifier){
					//selectItem from drop down
					$scope.selectedFilterProperty = filterProperty;
					//decorate with value and comparison Operator so we can use it in the Condition section
					$scope.selectedFilterProperty.value = $scope.filterItem.value;
					$scope.selectedFilterProperty.comparisonOperator = $scope.filterItem.comparisonOperator;
				}
			}
			
			//public functions
			$scope.selectedFilterPropertyChanged = function(selectedFilterProperty){
				$log.debug('selectedFilterProperty');
				$log.debug(selectedFilterProperty);
				//$scope.selectedFilterProperty.breadCrumbs += 
			};
			
			$scope.saveFilter = function(selectedFilterProperty,filterItem){
				if(angular.isDefined(selectedFilterProperty.selectedCriteriaType)){
					//populate filterItem with selectedFilterProperty values
					filterItem.propertyIdentifier = selectedFilterProperty.propertyIdentifier;
					filterItem.displayPropertyIdentifier = selectedFilterProperty.displayPropertyIdentifier; 
					
					switch(selectedFilterProperty.ormtype){
						case 'boolean':
		               		filterItem.comparisonOperator = selectedFilterProperty.selectedCriteriaType.comparisonOperator;
		               		filterItem.value = selectedFilterProperty.selectedCriteriaType.value;
		                break;
			            case 'string':
							filterItem.comparisonOperator = selectedFilterProperty.selectedCriteriaType.comparisonOperator;
							
							//retrieving implied value or user input | ex. implied:prop is null, user input:prop = "Name"
							if(angular.isDefined(selectedFilterProperty.selectedCriteriaType.value)){
							
								filterItem.value = selectedFilterProperty.selectedCriteriaType.value;
							}else{
								//if has a pattern then we need to evaluate where to add % for like statement
								if(angular.isDefined(selectedFilterProperty.selectedCriteriaType.pattern)){
									switch(selectedFilterProperty.selectedCriteriaType.pattern){
										case "%w%":
											filterItem.value = '%'+selectedFilterProperty.criteriaValue+'%';
											break;
										case "%w":
											filterItem.value = '%'+selectedFilterProperty.criteriaValue;
											break;
										case "w%":
											filterItem.value = selectedFilterProperty.criteriaValue+'%';
											break;
									}
								}else{
									filterItem.value = selectedFilterProperty.criteriaValue;
								}
							}
							
			                break;
			                //TODO:simplify timestamp and big decimal to leverage reusable function for null, range, and value
			            case 'timestamp':
			            	//retrieving implied value or user input | ex. implied:prop is null, user input:prop = "Name"
			            	filterItem.comparisonOperator = selectedFilterProperty.selectedCriteriaType.comparisonOperator;
			            	
							if(angular.isDefined(selectedFilterProperty.selectedCriteriaType.value)){
								filterItem.value = selectedFilterProperty.selectedCriteriaType.value;
								filterItem.displayValue = filterItem.value;
							}else{
								var dateValueString = selectedFilterProperty.criteriaRangeStart + '-' + selectedFilterProperty.criteriaRangeEnd;
								filterItem.value = dateValueString;
								var formattedDateValueString = $filter('date')(angular.copy(selectedFilterProperty.criteriaRangeStart),'MM/dd/yyyy @ h:mma') + '-' + $filter('date')(angular.copy(selectedFilterProperty.criteriaRangeEnd),'MM/dd/yyyy @ h:mma');
								filterItem.displayValue = formattedDateValueString;
							}
							
			                break;	
			            case 'big_decimal':
							filterItem.comparisonOperator = selectedFilterProperty.selectedCriteriaType.comparisonOperator;
							//is null, is not null
							if(angular.isDefined(selectedFilterProperty.selectedCriteriaType.value)){
								filterItem.value = selectedFilterProperty.selectedCriteriaType.value;
							}else{
								if(angular.isUndefined(selectedFilterProperty.selectedCriteriaType.type)){
									filterItem.value = selectedFilterProperty.criteriaValue;
								}else{
									var decimalValueString = selectedFilterProperty.criteriaRangeStart + '-' + selectedFilterProperty.criteriaRangeEnd;
									filterItem.value = decimalValueString;
								}
							}
							break;
						
						
					}
					
					if(angular.isUndefined(filterItem.displayValue)){
						filterItem.displayValue = filterItem.value;
					}
					
					if(angular.isDefined(selectedFilterProperty.ormtype)){
						filterItem.ormtype = selectedFilterProperty.ormtype;
					}
					if(angular.isDefined(selectedFilterProperty.fieldtype)){
						filterItem.fieldtype = selectedFilterProperty.fieldtype;
					}
					
					filterItem.conditionDisplay = selectedFilterProperty.selectedCriteriaType.display;
					//persist Config and 
					$scope.saveCollection();
					$log.debug(selectedFilterProperty);
					$log.debug(filterItem);
				}
			};
        } 
	};
}]);
	
