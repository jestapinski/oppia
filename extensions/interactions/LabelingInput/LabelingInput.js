// Copyright 2014 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Directive for the LabelingInput interaction.
 *
 * IMPORTANT NOTE: The naming convention for customization args that are passed
 * into the directive is: the name of the parameter, followed by 'With',
 * followed by the name of the arg.
 */

oppia.directive('oppiaInteractiveLabelingInput', [
  '$sce', 'oppiaHtmlEscaper', 'explorationContextService',
  'labelingInputRulesService',
  function($sce, oppiaHtmlEscaper, explorationContextService,
           labelingInputRulesService) {
    return {
      restrict: 'E',
      scope: {
        onSubmit: '&'
      },
      templateUrl: 'interaction/LabelingInput',
      controller: [
        '$scope', '$element', '$attrs', function($scope, $element, $attrs) {
          var imageAndLabels = oppiaHtmlEscaper.escapedJsonToObj(
            $attrs.imageAndLabelsWithValue);
          $scope.imageTitle = $attrs.imageTitleWithValue;
          var unicodeStripCount = 6;
          $scope.bonusWords = $attrs.bonusWordsWithValue.slice(unicodeStripCount)
          $scope.bonusWords = $scope.bonusWords.slice(0, -unicodeStripCount);
          $scope.bonusWords = $scope.bonusWords.split(',');
          //Remove white spaces
          $scope.bonusWords.map(function(word){word.trim();});
          console.log($scope.bonusWords);
          $scope.drawLines = ($attrs.showLinesWithValue == 'true');
          //Need to strip unicode
          $scope.imageTitle = $scope.imageTitle.slice(unicodeStripCount)
          $scope.imageTitle = $scope.imageTitle.slice(0, -unicodeStripCount);
          $scope.alwaysShowRegions = 'true';
          if ($scope.alwaysShowRegions) {
            $scope.highlightRegionsOnHover = false;
          }
          $scope.filepath = imageAndLabels.imagePath;
          $scope.imageUrl = (
            $scope.filepath ?
            $sce.trustAsResourceUrl(
              '/imagehandler/' + explorationContextService.getExplorationId() +
              '/' + encodeURIComponent($scope.filepath)) : null);
          $scope.mouseX = 0;
          $scope.mouseY = 0;
          $scope.submitted = 0;
          $scope.maxRGBValue = 255;
          $scope.correctElements = [];
          $scope.incorrectElements = [];
          $scope.incorrectBoxes = [];
          $scope.currentDraggedElement = "";
          $scope.currentlyHoveredRegions = [];
          /* Shuffle function to shuffle array to ensure random word bank
          Borrowed from:
          stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array */
          $scope.shuffle = function(a) {
              var j, x, i;
              for (i = a.length; i; i--) {
                  j = Math.floor(Math.random() * i);
                  x = a[i - 1];
                  a[i - 1] = a[j];
                  a[j] = x;
              }
          }
          $scope.allRegions = imageAndLabels.labeledRegions;
          $scope.regionsAndBonus = $scope.allRegions.map(function (x){return x.label;}).concat($scope.bonusWords);
          $scope.regionsAndBonus = $scope.regionsAndBonus.filter(function (x){return x != "";});
          $scope.shuffle($scope.allRegions);
          $scope.shuffle($scope.regionsAndBonus);
          $scope.numRegions = $scope.allRegions.length;
          //Ensure no duplicates of elements in our element tracking arrays
          $scope.checkAndRemoveElement = function(name){
            var index = $scope.correctElements.indexOf(name);
            if (index > -1){
              $scope.correctElements.splice(index, 1);
            }
            index = $scope.incorrectElements.indexOf(name);
            if (index > -1){
              $scope.incorrectElements.splice(index, 1);
              $scope.incorrectBoxes.splice(index, 1);
            }
            return;
          }
          $scope.getButtonColor = function(name){
            if (!$scope.submitted){
              return 'primary';
            }
            if ($scope.incorrectElements.indexOf(name) > -1){
              return 'danger';              
            }
            return 'primary';
          }
          //Get the current element label
          $scope.getThisName = function(event, ui, name){
            $scope.checkAndRemoveElement(name);
            $scope.currentDraggedElement = name;
            return;
          }
          //If all labels have been placed, run a correctness check
          $scope.runSubmitCheck = function(){
            $scope.submitted = 1;
            console.log($scope.numRegions);
            if ($scope.numRegions == 0){
              $scope.numRegions = $scope.incorrectElements.length;
              $scope.onSubmit({
                answer: {
                  clickPosition: [$scope.mouseX, $scope.mouseY],
                  clickedRegions: $scope.currentlyHoveredRegions,
                  incorrectElements: $scope.incorrectElements
                },
                rulesService: labelingInputRulesService
              });
            }
          }
          //Check if our value is the one of the region, and handle acccordingly
          $scope.checkTheValues = function(event, ui, correctName){
            $scope.numRegions--;
            if ($scope.numRegions < 0){
              $scope.numRegions = 0;
            }
            if (correctName == $scope.currentDraggedElement){
              $scope.correctElements.push($scope.currentDraggedElement);
            } else {
              $scope.incorrectElements.push($scope.currentDraggedElement);
              $scope.incorrectBoxes.push(correctName);
            }
            var correctLen = $scope.correctElements.length;
            var incorrectLen = $scope.incorrectElements.length;
            if ((correctLen + incorrectLen) === $scope.allRegions.length){
              $scope.runSubmitCheck();
            }
          }
          $scope.getRegionDimensions = function(index) {
            var image = $($element).find('.oppia-image-click-img');
            var labeledRegion = imageAndLabels.labeledRegions[index];
            var regionArea = labeledRegion.region.area;
            var leftDelta = image.offset().left - image.parent().offset().left;
            var topDelta = image.offset().top - image.parent().offset().top;
            return {
              left: regionArea[0][0] * image.width() + leftDelta,
              top: regionArea[0][1] * image.height() + topDelta,
              width: (regionArea[1][0] - regionArea[0][0]) * image.width(),
              height: (regionArea[1][1] - regionArea[0][1]) * image.height()
            };
          };
          $scope.getRegionDisplay = function(label) {
            if ($scope.currentlyHoveredRegions.indexOf(label) === -1) {
              return 'none';
            } else {
              return 'inline';
            }
          };
          $scope.inlineRegionDisplay = function(){
            return 'inline';
          }
          $scope.getImageWidth = function(){
            var image = $($element).find('.oppia-image-click-img');
            return image.width();
          }
          $scope.getImageHeight = function(){
            var image = $($element).find('.oppia-image-click-img');
            return image.height();
          }
          //Get offset to draw image lines
          $scope.getLeftDelta = function(){
            var image = $($element).find('.oppia-image-click-img');
            return image.offset().left - image.parent().offset().left;
          }
          $scope.getTopDelta = function(){
            var image = $($element).find('.oppia-image-click-img');
            return image.offset().top - image.parent().offset().top;
          }
          //Draw line on canvas, no line HTML class is available due to div
          $scope.getLineDistance = function(x1, x2, y1, y2){
            var xDiff = Math.pow((x2 - x1), 2);
            var yDiff = Math.pow((y2 - y1), 2);
            return Math.sqrt(xDiff + yDiff);
          }
          $scope.convertArctan = function(x1, x2, y1, y2){
            if (x2 < x1) {
              return Math.atan((y2 - y1) / (x2 - x1)) + Math.PI;
            }
            return Math.atan((y2 - y1) / (x2 - x1));
          }
          $scope.onMousemoveImage = function(event) {
            var image = $($element).find('.oppia-image-click-img');
            $scope.mouseX = (event.pageX - image.offset().left) / image.width();
            $scope.mouseY = (event.pageY - image.offset().top) / image.height();
            $scope.currentlyHoveredRegions = [];
            for (var i = 0; i < imageAndLabels.labeledRegions.length; i++) {
              var labeledRegion = imageAndLabels.labeledRegions[i];
              var regionArea = labeledRegion.region.area;
              if (regionArea[0][0] <= $scope.mouseX &&
                  $scope.mouseX <= regionArea[1][0] &&
                  regionArea[0][1] <= $scope.mouseY &&
                  $scope.mouseY <= regionArea[1][1]) {
                $scope.currentlyHoveredRegions.push(labeledRegion.label);
              }
            }
          };
          //Change to red if the input is not correct
          $scope.getRValue = function(region){
            //Get the region it is in and not the label
            if (!$scope.submitted){
              return 0;
            }
            return $scope.maxRGBValue * 
                        ($scope.incorrectBoxes.indexOf(region.label) !== -1);
          }
          //Change to blue if the input is correct
          $scope.getBValue = function(region){
            if (!$scope.submitted){
              return $scope.maxRGBValue;
            }
            return $scope.maxRGBValue * 
                        ($scope.incorrectBoxes.indexOf(region.label) === -1);
          };
        
        }
      ]
    };
  }
]);

oppia.directive('oppiaResponseLabelingInput', [function() {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: 'response/LabelingInput',
    controller: [
        '$scope', '$attrs', 'oppiaHtmlEscaper',
        function($scope, $attrs, oppiaHtmlEscaper) {
      var _answer = oppiaHtmlEscaper.escapedJsonToObj($attrs.answer);

      $scope.clickRegionLabel = '(Clicks on ' + (
        _answer.clickedRegions.length > 0 ?
        '\'' + _answer.clickedRegions[0] + '\'' : 'image') + ')';
    }]
  };
}]);

oppia.directive('oppiaShortResponseLabelingInput', [
  'oppiaHtmlEscaper', function(oppiaHtmlEscaper) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'shortResponse/LabelingInput',
      controller: ['$scope', '$attrs', function($scope, $attrs) {
        var _answer = oppiaHtmlEscaper.escapedJsonToObj($attrs.answer);
        $scope.clickRegionLabel = (
          _answer.clickedRegions.length > 0 ? _answer.clickedRegions[0] :
          'Clicked on image');
      }]
    };
  }
]);

oppia.factory('labelingInputRulesService', [function() {
  return {
    /*
    Answer has clicked regions, check that the label of the clicked
    region matches that of the dropped label
    */
    GetsAllCorrect: function(answer, inputs){
      return answer.incorrectElements.length === 0;
    },
    HasMultipleMisses: function(answer, inputs){
      if (!(inputs.x)){
        //Backwards compatability, consider removing
        return answer.incorrectElements.length >= 2;
      }
      return answer.incorrectElements.length >= (inputs.x);
    },
    Misses: function(answer, inputs){
      return answer.incorrectElements.indexOf(inputs.x) !== -1;
    }

  };
}]);
