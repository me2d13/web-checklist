# Web checklists

This project generates web page presenting data formatted as checklist (for example checklist used in aviation). The data is provided as json file. The web page supports editing (pasting) of the json data and also rendered checklist is part of the web page.


## Basic design
The setup part (edit box to paste json, generate button) is collapsible and when checklist is generated its hidden under cog wheel icon. In other words the web page has 2 parts
* edit part - where user can enter the json and has buttons to generate (render) the checklist
* checklist part - contains generated checklist

The edit part can be hidden for the scenario when checklist is going to be exported (printed). When it is hidden (collapsed) there's small cog wheel button which shows the edit part again.

Under the text area for json there are 2 buttons - `Render` and `Render and hide`. The first one re-renders checklist part by the json data, the second one does the same but also hides the editing area - so the page is ready to be printed.

## Code structure
The page is rendered via javascript code. It can be stored as static bundle without any publish or build phase. However it requires web server (can't be served from filesystem) as it is using es6 javascript imports. It doesn't support old browsers - only current (2025) modern ones.

Javascript files are in `src/js` folder, basic css in `src/css` folder, however most of styling is generated dynamically (driven by json content). 