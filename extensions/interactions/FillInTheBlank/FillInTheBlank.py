# coding: utf-8
#
# Copyright 2014 The Oppia Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, softwar
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from extensions.interactions import base


class FillInTheBlank(base.BaseInteraction):

    name = 'Fill In The Blank'
    description = 'Allows learners to complete incomplete phrases.'
    display_mode = base.DISPLAY_MODE_SUPPLEMENTAL
    is_trainable = False
    _dependency_ids = []
    instructions = 'Fill in the blanks.'
    narrow_instructions = 'Complete the phrase'
    needs_summary = True

    _customization_arg_specs = [{
        'name': 'fillInTheBlank',
        'description': 'Initial Phrase',
        'schema': {
            'type': 'unicode'
        },
        'default_value': ''},

        {
        'name': 'numWordsInBank',
        'description': 'Number of Words in Bank',
        'schema': {
            'type': 'int',
            'validators': [{
                'id': 'is_at_least',
                'min_value': 2,
            }, {
                'id': 'is_at_most',
                'max_value': 200,
            }]
        },
        'default_value': 2,
    }]