# Slide 03 Interactive Breadboard Runtime

- `slot`: presentation slide 03 reusable runtime template
- `scope`: Fritzing-like breadboard scene inside the presentation app, with `.fzpz` asset loading, empty-board placement flow, fixed-angle rotation, wire creation, and probe readout
- `bottleneck`: we do not have a full electrical solver or freeform autorouter, so this runtime still stays on a simplified teaching model with explicit placement rules
- `baseline`: current repo already parses `.fzpz`, restores breadboard SVG, and maps connectors to board holes in `FritzingPartViewer`
- `hypothesis`: if slide 03 proves that an empty board + parts bin + inspector + fixed-angle placement can explain one regulator stage clearly, slides 04 to 10 can reuse the same runtime shell by swapping preset nodes, allowed parts, and teaching focus
- `gate`: slide 03 must load the breadboard asset, keep the board centered, let the user place parts from a parts bin, rotate only in `0/90/180/270`, create/delete wires, and show selected pin measurements without breaking presentation navigation
- `success`: `npm run build` passes and slide 03 works as an interactive teaching page inside the main presentation route
- `kill`: if `.fzpz` composition becomes too unstable for the presentation surface, fall back to breadboard-only SVG plus runtime overlays while keeping the same interaction model
- `artifact`: this file, the shared Fritzing runtime helper, and the dedicated slide 03 scene component

## Implementation Boundary

- Use `.fzpz` assets from `public/`
- Keep the breadboard fixed in the middle of the scene
- Start from an empty board; parts are selected from an external parts bin
- Keep part size fixed; allow rotation only in `0/90/180/270`
- Keep inspector and probe outside the board canvas
- Use a simplified regulator teaching model, not a SPICE-grade simulator
- Treat slide 03 as the first reusable template for slides 03 to 10
- Use corrected teaching parts: 2SC1384 front-view pin order is `E-C-B`; UA741 with the notch at the left has top row `8-7-6-5` and bottom row `1-2-3-4`

## Current UX Model

- `parts bin`: drag a part out of the side panel and drop it onto the breadboard; click-to-place remains as fallback
- `multi-instance parts`: the same palette part can be placed multiple times; selection, drag, rotate, and delete work per instance
- `meter part`: the simplified voltage meter is available as a placeable two-probe instrument; selecting it reads red probe voltage minus black probe voltage from the current net graph
- `meter readout`: the left-side meter display stays blank until a placed meter has both probes on board holes and the user clicks voltage or current mode
- `placement preview`: while a part is pending placement, show a ghost preview snapped to the nearest legal hole group
- `rotation`: rotate the pending or selected part by `90°` steps only
- `wiring`: toggle wire mode, drag from one hole to another to create a blue wire with a user-shaped bend point
- `selection`: blank-board click clears selection; `Esc` cancels pending placement / wiring / selection
- `delete`: keyboard `Delete` or inspector buttons remove the selected wire or part
- `continuity`: breadboard row groups, rail groups, and user wires are merged into a simple net graph for highlight feedback
- `probe`: click a measurement node to inspect voltage, current, and power in the external probe screen
