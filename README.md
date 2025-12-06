# Web checklists

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

This is a page which can generate checklist based on source data in json. 
This source contains content and formatting.
Generated checklist can be printed (as html page).

This page was developed mainly for flight (simulation) checklists, but can be used for any sequences.

# Demo
Sample checklists can be loaded directly via URL:
- `index.html?example=minimal` - Basic example
- `index.html?example=styled` - Example with styling features
- `index.html?example=rich` - Complex multi-section checklist

# API
Complete json format is described at API page.

# Tutorial
Json file contains metadata (about formatting, colors, styles) and content.
Checklist is basically sequence of elements.
Basic checklist element is sequence of steps with some (optional) title.

## Hello world checklist
Super simple checklist with one sequence would be
```json
{
    "elements": [
        {
            "type": "sequence",
            "title": "Enter a car",
            "steps": [
                {
                    "item": "Car door",
                    "state": "OPENED"
                },
                {
                    "item": "Driver",
                    "state": "SEATED"
                }
            ]
        }
    ]
}
```
Renders into

## Checklist properties
Checklist can have some properties, like title and number of columns (on page)
```json
{
    "title": "Car checklist",
    "columns": 2,
    "elements": [
        ...
    ]
}
```
Renders into

## Custom text
Custom text can be entered as an element. If it is followed by steps with no title it looks like custom line between steps.
```json
{
    "elements": [
        {
            "type": "sequence",
            "title": "Enter a car",
            "steps": [
                {
                    "item": "Car door",
                    "state": "OPENED"
                }
            ]
        },
        {
            "type": "text",
            "text": "Make sure you can fit in"
        },
        {
            "type": "sequence",
            "steps": [
                {
                    "item": "Driver",
                    "state": "SEATED"
                }
            ]
        }
    ]
}
```
Renders into

## Styling

## Predefined styles

## Default styles
When you predefine some style you may want to apply it to all items and states in step all sequences. Or in one sequence.
To not repeat this for every step in sequence, you can use fields `defaultItemStyle` and `defaultStateStyle` to apply styles
in the sequence. Those fields can be used even
* at top level to be applied at whole checklist
* at sequence level to be applied at all steps in the sequence

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Petr Medek

You are free to use, modify, and distribute this software, provided that the original copyright notice and license are included in all copies or substantial portions of the software.