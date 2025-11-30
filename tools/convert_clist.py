"""
XChecklist to Web-Checklist JSON Converter

This script converts XChecklist format files (used in X-Plane) to the web-checklist JSON format.

Usage:
    python convert_clist.py <input_file> [> output.json]

Arguments:
    input_file    Path to the XChecklist (.txt) file to convert

Output:
    JSON formatted checklist is written to stdout

Conversion Rules:
    1. sw_checklist: lines
       - Converted to sequence elements with title
       - Format: sw_checklist:TITLE
       - Example: "sw_checklist:PREFLIGHT" -> sequence with title "PREFLIGHT"

    2. sw_itemvoid: lines (with wrapping colons)
       - Converted to text steps within sequences
       - Format: sw_itemvoid:::::TEXT:::::
       - Colons are stripped, text content is preserved
       - Lines without wrapping colons are ignored
       - Example: "sw_itemvoid::::: SECTION 1 :::::" -> {"text": "SECTION 1"}

    3. sw_item_c: lines
       - Converted to item/state steps
       - Format: sw_item_c:\color\ITEM\color\, STATE|COMMAND
       - Color codes (e.g., \white\, \grey\) are removed
       - Content after pipe (|) is ignored (commands)
       - Split by first comma into item and state
       - Example: "sw_item_c:\white\APU\grey\, STARTED|CMD" -> {"item": "APU", "state": "STARTED"}

Example:
    python convert_clist.py checklist.txt > output.json
    python convert_clist.py path/to/xchecklist.txt | jq .
"""

import sys
import re
import json


def parse_clist(file_path):
    elements = []
    current_sequence = None
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                    
                if line.startswith('sw_checklist:'):
                    title = line[len('sw_checklist:'):].strip()
                    current_sequence = {
                        "type": "sequence",
                        "title": title,
                        "steps": []
                    }
                    elements.append(current_sequence)
                    
                elif line.startswith('sw_itemvoid:'):
                    # Check for wrapping colons
                    # Pattern: sw_itemvoid: followed by at least one :, then content, then at least one :
                    content = line[len('sw_itemvoid:'):]
                    if content.startswith(':') and content.endswith(':'):
                        # Remove all leading/trailing colons and whitespace
                        text = content.strip(':').strip()
                        if text and current_sequence:
                             current_sequence['steps'].append({"text": text})
                    
                elif line.startswith('sw_item_c:'):
                    if not current_sequence:
                        continue
                        
                    content = line[len('sw_item_c:'):]
                    
                    # Remove command part (after |)
                    if '|' in content:
                        content = content.split('|')[0]
                    
                    # Remove colors
                    content = re.sub(r'\\[a-zA-Z]+\\', '', content)
                    
                    # Split item and state
                    # Find the first comma that separates item and state
                    parts = content.split(',', 1)
                    item = parts[0].strip()
                    state = parts[1].strip() if len(parts) > 1 else ""
                    
                    current_sequence['steps'].append({
                        "item": item,
                        "state": state
                    })
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error parsing file: {e}", file=sys.stderr)
        sys.exit(1)

    return {"elements": elements}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python convert_clist.py <input_file>")
        sys.exit(1)
        
    result = parse_clist(sys.argv[1])
    
    # Dump with indentation
    json_str = json.dumps(result, indent=4)
    
    # Post-process to collapse steps into one-liners
    
    # Collapse {"item": "...", "state": "..."}
    # We match the multiline pattern produced by json.dumps(indent=4)
    # Pattern matches:
    # {
    #     "item": "...",
    #     "state": "..."
    # }
    
    def collapse_item_state(match):
        return f'{{"item": {match.group(1)}, "state": {match.group(2)}}}'
        
    json_str = re.sub(
        r'\{\s*"item":\s*("(?:[^"\\]|\\.)*"),\s*"state":\s*("(?:[^"\\]|\\.)*")\s*\}', 
        collapse_item_state, 
        json_str
    )
    
    # Collapse {"text": "..."}
    def collapse_text(match):
        return f'{{"text": {match.group(1)}}}'
        
    json_str = re.sub(
        r'\{\s*"text":\s*("(?:[^"\\]|\\.)*")\s*\}', 
        collapse_text, 
        json_str
    )
    
    print(json_str)
