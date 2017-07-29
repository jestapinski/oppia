// Copyright 2017 The Oppia Authors. All Rights Reserved.
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

describe('LabelingInputValidationService', function() {
  var WARNING_TYPES, validatorService;

  var currentState;
  var badOutcome, goodAnswerGroups, goodDefaultOutcome;
  var customizationArguments;

  beforeEach(function() {
    module('oppia');
  });

  beforeEach(inject(function($rootScope, $controller, $injector) {
    var filter = $injector.get('$filter');
    validatorService = $injector.get('LabelingInputValidationService');
    WARNING_TYPES = $injector.get('WARNING_TYPES');

    currentState = 'First State';
    goodDefaultOutcome = {
      dest: 'Second State',
      feedback: []
    };

    badOutcome = {
      dest: currentState,
      feedback: []
    };

    customizationArguments = {
      imageAndLabels: {
        value: {
          imagePath: '/path/to/image',
          labeledRegions: [{
            label: 'FirstLabel'
          }, {
            label: 'SecondLabel'
          }]
        }
      }
    };
    goodAnswerGroups = [{
      rules: [{
        type: 'Misses',
        inputs: {
          incorrectElements: [],
          x: 'FirstLabel'
        }
      }],
      outcome: goodDefaultOutcome,
      correct: true
    }];
  }));

  it('should expect a customization argument for image and regions',
    function() {
      goodAnswerGroups[0].rules = [];
      expect(function() {
        validatorService.getAllWarnings(currentState, {}, goodAnswerGroups, goodDefaultOutcome);
      }).toThrow(
        'Expected customization arguments to have property: imageAndLabels');
    });

  it('should expect an image path customization argument', function() {
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArguments, goodAnswerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([]);

    customizationArguments.imageAndLabels.value.imagePath = '';
    warnings = validatorService.getAllWarnings(
      currentState, customizationArguments, goodAnswerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.CRITICAL,
      message: 'Please add an image for the learner to click on.'
    }]);
  });

  it('should expect labeled regions with non-empty, unique, and ' +
    'alphanumeric labels',
    function() {
      var regions = customizationArguments.imageAndLabels.value.labeledRegions;
      regions[1].label = '';
      var warnings = validatorService.getAllWarnings(
        currentState, customizationArguments, goodAnswerGroups,
        goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.CRITICAL,
        message: 'Please ensure the image region strings are nonempty.'
      }]);

      regions[1].label = 'FirstLabel';
      warnings = validatorService.getAllWarnings(
        currentState, customizationArguments, goodAnswerGroups,
        goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.CRITICAL,
        message: 'Please ensure the image region strings are unique.'
      }]);

      regions[0].label = '@';
      warnings = validatorService.getAllWarnings(
        currentState, customizationArguments, goodAnswerGroups,
        goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.CRITICAL,
        message: 'The image region strings should consist of characters ' +
          'from [A-Za-z0-9] and spaces.'
      }]);

      customizationArguments.imageAndLabels.value.labeledRegions = [];
      goodAnswerGroups[0].rules = [];
      warnings = validatorService.getAllWarnings(
        currentState, customizationArguments, goodAnswerGroups,
        goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.ERROR,
        message: 'Please specify at least one image region to click on.'
      }]);
    });

  it('should expect rule types to reference valid region labels', function() {
    goodAnswerGroups[0].rules[0].inputs.x = 'FakeLabel';
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArguments, goodAnswerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.CRITICAL,
      message: 'The region label \'FakeLabel\' in rule 1 in group 1 is ' +
        'invalid.'
    }]);
  });

  it('should expect a non-confusing and non-null default outcome',
    function() {
      var warnings = validatorService.getAllWarnings(currentState, customizationArguments, [], null);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.ERROR,
        message: 'Please add a rule to cover what should happen if none of ' +
          'the given regions are clicked.'
      }]);
      warnings = validatorService.getAllWarnings(
        currentState, customizationArguments, [], badOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.ERROR,
        message: 'Please add a rule to cover what should happen if none of ' +
          'the given regions are clicked.'
      }]);
    });
});
