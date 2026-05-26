# Slide 03 Interactive Breadboard Runtime

- `slot`: presentation slide 03 reusable runtime template
- `scope`: fixed-center breadboard scene inside the presentation app, with `.fzpz` asset loading, two teaching controls, and node measurement readout
- `bottleneck`: we do not have a full electrical solver or formal netlist engine, so this runtime uses a simplified teaching model with fixed node mapping
- `baseline`: current repo already parses `.fzpz`, restores breadboard SVG, and maps connectors to board holes in `FritzingPartViewer`
- `hypothesis`: if slide 03 proves that a fixed breadboard + small instrument screen + clickable measurement nodes can explain one regulator stage clearly, slides 04 to 10 can reuse the same runtime shell by swapping preset nodes, controls, and readout logic
- `gate`: slide 03 must load the breadboard asset, keep the board centered, let the user adjust voltage and current, and show selected pin measurements on a small screen without breaking presentation navigation
- `success`: `npm run build` passes and slide 03 works as an interactive teaching page inside the main presentation route
- `kill`: if `.fzpz` composition becomes too unstable for the presentation surface, fall back to breadboard-only SVG plus runtime overlays while keeping the same measurement model
- `artifact`: this file, the shared Fritzing runtime helper, and the dedicated slide 03 scene component

## Implementation Boundary

- Use `.fzpz` assets from `public/`
- Keep the breadboard fixed in the middle of the scene
- Use a simplified regulator teaching model, not a SPICE-grade simulator
- Treat slide 03 as the first reusable template for slides 03 to 10
