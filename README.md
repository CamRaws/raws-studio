# Raws Studio — Mac desktop editor preview

A working first desktop implementation for editing news, geography, and weather videos. This is version 0.3, delivered as source code. It is **not a signed, production-ready Mac application**. A Mac is required to run the desktop app and build the installer.

## Automatic updates

This project is maintained at https://github.com/CamRaws/raws-studio. Install version 0.3 once, then open **Launch Raws Studio.command** each time you want to use the editor. The launcher checks for updates published to your repository and applies them before opening. You do not need to download another ZIP for ordinary editor updates. Request changes here; after they are implemented, tested and published, the next launch can receive them. Updates do not happen simply because you send a chat message.

Keep saved `.raws.json` projects outside the app folder. This updater is for the command-launched preview, not an installed Mac `.app`. macOS signing and a native installer remain separate work.

## Start on your Mac

1. Unzip this project.
2. Install Node.js 24 LTS from https://nodejs.org.
3. Open Terminal in the `raws-studio` folder.
4. Run:

```sh
npm ci
npm start
```

Alternatively, double-click `Launch Raws Studio.command` after installing Node.js. It installs the pinned dependencies on first launch and refreshes them when this project is updated. macOS may require you to grant the script execute permission through Terminal: `chmod +x "Launch Raws Studio.command"`.

To create an unsigned `.app`, `.dmg`, and app ZIP on your Mac:

```sh
npm run build:mac
```

Find the results in `dist/`. Build on an Apple Silicon Mac for Apple Silicon, or an Intel Mac for Intel. The bundled FFmpeg binary is selected during dependency installation for that computer. Do not reuse `node_modules` from another architecture. Signing and notarization require your Apple Developer credentials and are not configured in this preview. Installer generation and native macOS behavior have not been tested here.

## Updating an earlier download

Save your current project as a `.raws.json` file outside the application folder. Extract this updated ZIP into a new folder, open `Launch Raws Studio.command` there, then open your saved project. Existing version-1 project files remain supported. This release uses a new app origin for reliable speech-worker loading; presets saved in version 0.1 must be recreated, while styles in saved project files remain intact. Version 0.3 checks the public CamRaws/raws-studio update feed when you open the command launcher. Published source updates download, verify, and install before opening the editor. You need this launcher-enabled download once. Updates are applied on launch, not during editing, and keep project files separate. Offline or unavailable feeds leave the current version usable. This does not update an installed `.app` or `.dmg`; those need a separately signed Mac release and native updater.

## What works

| Tool | Current behavior |
|---|---|
| Separate timeline layers | Every text item, caption, logo, clip, image, audio item, map, geographic feature, marker, and ring effect retains its own layer. Only the exported video is composited. |
| Layer editing | Rename, duplicate, delete, reorder by dragging, hide, lock, and assign group names. Shift-click selects several layers. Group names organize layers; selecting several layers moves them together. |
| Timing and transforms | Per-layer start, duration, position, size, opacity, entrance motion, and animation duration. Drag timeline clips; drag their ends to trim. Trimming a media clip's beginning advances the source offset. |
| Preview editing | Move and resize text, footage, images, banners, arrows, and screen-positioned effects. Center snapping and safe-area guides. Resizable preview/timeline plus Expand preview. |
| Media | Drag/drop or import videos, audio, still images, and logo images. Per-layer Fit, Fill, Stretch, four-sided source crop, crop reset, and rotation. Split at the playhead preserves the media source offset. Audio items and video audio have independent volume controls. |
| Captions | Manual caption layers or `.srt` import. Each imported caption has independent timing and styling. Automatic English transcription runs locally with Whisper Tiny; the speech model downloads when needed. Generated segments have separate editable caption layers. Review their text and timing. Each request handles up to five minutes; split longer footage first. |
| Reusable presets | Save/apply the selected layer's style and settings from the inspector. Presets stay on that Mac. Save a project to reuse a complete multi-layer template. |
| Project files | Save/open `.raws.json` project files with separate layers and embedded media. Project saving is manual. |
| Maps | Separate MapLibre map layers: flat or globe projection, real Esri satellite basemap, OSM street tiles, and dated NASA MODIS true-color imagery. Pan/zoom using Navigate map. |
| Location search | Manually submitted city, town, state, county, ZIP, or latitude/longitude search. Regional information appears in results. Center the map, then add a separate geographic marker or polygon highlight. |
| Geographic highlights | Search-supplied OpenStreetMap polygon boundaries or imported GeoJSON. Multiple highlights retain their own color, opacity, border width, timing, and visibility. Save them in the project. |
| Geography animation | Satellite zoom, country zoom, city locator, street locator, region shading and election-layout presets. Search retargets preset camera animations to the selected location. Editable captured camera keyframes; smooth easing; manually defined travel routes with animated reveals; standalone markers and labels. |
| Layout and motion | Single, inset, side-by-side, top-and-bottom, two-plus-main, four-up, and media-plus-details arrangements preserve independent layers. Editable background color. Fade, directional slide, scale reveal, wipe, pulse, and media slow-push animations. |
| Weather data | Fetch active NWS warning polygons. Select a USGS earthquake from the past day's magnitude 2.5+ feed. Sources and issue/event times appear in the rendered output. |
| Hurricane layout | Independent storm-name, category, wind, pressure, movement, and issue-time text layers over a panel and map. Enter verified advisory details; import sourced track and cone GeoJSON as separate layers. |
| Earthquake effects | Independent ring count, spacing, starting radius, outer reach, line thickness, speed, stagger delay, color, opacity, fading, pulse style, and looping. The epicenter marker has its own layer and size. |
| Export for X | Desktop export records the composition with mixed audio, then encodes MP4 with H.264, AAC, 30 FPS, and fast-start. Landscape, portrait, and square output sizes. Upload the exported file to X yourself. |

## Important details

**Satellite basemap versus weather satellite:** Esri imagery shows geographic surface detail and is not a current storm observation. NASA imagery is a date-selected MODIS Terra daily true-color composite with clouds; it is not a live GOES image or a time-resolved satellite loop. Keep its source and UTC composite date visible. Missing tiles or gaps do not indicate clear skies.

**Earthquake rings:** These are explicitly labeled illustrative animation. They do not depict measured earthquake distances, wave arrival times, or shaking intensity. A small epicenter marker is independent from the ring layer. For six wider rings, set count to 6, increase spacing and reach, and leave line thickness and marker size unchanged. Rings whose starting radius exceeds outer reach are clipped. Geographic measured-distance rings are not implemented.

**Warnings:** NWS alerts with direct geographic geometry become separate polygon layers. Some alerts only identify forecast zones; those are reported in the status bar and are not drawn. The import currently limits a fetch to 60 polygons. Data is a snapshot, not an automatically updating broadcast feed. The operator must check sources and times before publishing.

**Boundaries:** Search geometry comes from OpenStreetMap; it is not certified election precinct or emergency declaration data. For reporting that depends on an official boundary, import the appropriate sourced GeoJSON. Individual imported features become individual layers. Import is limited to 100 GeoJSON features per file. Imported polygon holes are preserved.

**Maps and graphics:** A geographic marker/feature is attached to a map layer. Coordinates, camera position, opacity, and timing remain editable. Camera keyframes are in seconds relative to the map layer's start. Capture keyframes with Navigate map enabled, then disable Navigate map for playback. Geographic graphics projected onto a globe currently lack horizon occlusion; use flat projection for boundary/route stories until that renderer is expanded. Automated state/county/city/highway label switches are not implemented; labels can be added as separate layers.

**Media and export:** This preview embeds source media in project JSON; it is suitable for short news sequences, not large footage libraries. Imports are capped at 150 MB per file and saved projects at 500 MB. Keep the app visible during real-time export. Offline frame-by-frame rendering, background jobs, proxy media, waveform editing, color grading, codecs such as ProRes, transition tools, and advanced keyframes for non-map transforms still need implementation. Maps require internet access; media and ordinary graphics can be edited locally.

**Source credits:** Credits are composited into the video. The preview displays up to eight unique source lines; a full editable source-card workflow remains to be built for complex stories.

## Still needed for the complete professional editor

- Automatic official NHC advisory ingestion, native SHP/KML/KMZ import, storm tracks, cones, wind fields, storm surge, rainfall products, forecast-time controls, and distance-to-city calculations. Presently import converted GeoJSON and edit the advisory text yourself.
- Real radar and GOES satellite loops with explicit observation times, legends, refresh controls, and frame synchronization.
- Full weather graphics library for flooding, tornado/severe warnings, evacuations, rainfall, and advisories. Current presets provide simple banners, text, arrows, and sourced polygons.
- Country/state/county selection browser using verified boundary datasets; configurable city/highway/border labels; flag and statistics presets; sequence/reveal orchestration; great-circle travel paths.
- Measured geographic earthquake rings, scale bars, shaking/impact products, and separate intensity legends.
- General transform keyframes, richer animation curves, transitions, snapping to other clips/layers, group transformations, audio waveforms, multilingual caption models, undo-aware asset management, autosave, and streaming/proxy assets.
- Deterministic offline rendering, missing-tile export blocking, complete source cards, long-form performance testing, and reliable recovery after interrupted export.
- Mac testing, app icons, keyboard/menu polish, signing, notarization, and an installer tested on both Mac architectures.

## Checks performed

- Nine automated model tests: crop bounds, layout bounds in all three formats, caption timestamps, ring independence, reach/loop behavior, camera date-line interpolation, timeline visibility, and project validation.
- Browser UI checks: initial layers, independent ring controls, duplicate/delete, text editing, separate preset layers, project save/open round-trip, camera keyframes, expanded preview, location search and selected marker, SRT caption timing, imported video, and canvas/audio recording. No JavaScript errors in that run.
- Version 0.2 checks passed for crop, Fit/Fill, duplicate, split source offsets, all seven layouts, map animation retargeting, high zoom, separate area colors, and map-group duplication. A real English speech recording generated two correctly timed editable caption segments.
- Real Esri satellite imagery rendered in the program monitor.
- Live endpoints returned valid Esri imagery, NASA imagery, NWS GeoJSON, USGS events, and a Pensacola location result. This verifies connectivity and response shapes, not every weather event or provider's continuous availability.
- A two-second recording converted to H.264/AAC MP4 at 1920×1080, 30 FPS; audio signal checked. Native Electron save dialogs and Mac packaging remain untested.

`editor-preview.png` shows the actual editor UI, map styles, separate timeline layers, editing toolbar, and layout shelf.

## Automatic captions

Select a video or audio layer containing English speech and click **Auto captions**. Audio is decoded and processed on this computer; only model files are downloaded from Hugging Face. First use needs internet access and may take several minutes. Cancel stops the speech worker. This is the lightweight Whisper Tiny English model, so transcription errors are possible, especially with names, noisy audio, and accents. Manually review every caption before publishing. Segment-level timestamps are editable; word-level karaoke captions and multilingual models are not provided in this version.

## Sources and technical references

- MapLibre: https://maplibre.org/maplibre-gl-js/docs/
- Esri World Imagery: https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer
- NASA GIBS access: https://nasa-gibs.github.io/gibs-api-docs/access-basics/
- NWS API: https://www.weather.gov/documentation/services-web-api
- NHC GIS products: https://www.nhc.noaa.gov/gis/
- USGS earthquake feed: https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
- Nominatim search: https://nominatim.org/release-docs/latest/api/Search/
- Nominatim usage policy: https://operations.osmfoundation.org/policies/nominatim/

Nominatim searches are manually submitted, cached, and throttled to at most one request per 1.1 seconds in the desktop app. The app supplies an identifying User-Agent. The public service is for light use; a production deployment should use a configured geocoder.

Run the model tests with `npm test`.

- Transformers.js speech recognition: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.AutomaticSpeechRecognitionPipeline
- Whisper Tiny English model: https://huggingface.co/Xenova/whisper-tiny.en

## Source-preview update maintenance

The GitHub workflow tests every published source change before writing `updates/latest.json`. The manifest pins the source commit and SHA-256 for every managed file. The launcher checks it, stages all verified files before writing, and retains one source backup. Project files, media, presets and dependencies are not downloaded from the update feed. Interrupted application of source files is recovered at next launch. A dependency installation failure restores the previous source files when a backup exists; a later launch will need internet to reinstall those dependencies.

For troubleshooting, `node scripts/update.cjs --check` checks without installing, `node scripts/update.cjs --rollback` restores the last source backup, and temporarily commenting out the launcher's update line opens the existing source version. Keep the application folder writable. Updates are trusted code from your public repository; keep repository write access limited to trusted maintainers.

### 0.3.1 — map and preview controls
Map + / − automatically selects an unlocked active map. Select states enables click-to-highlight US states using bundled Census boundaries: choose a color and click several states, then Done. Each highlight has its own layer; clicking an existing highlight recolors it unless locked. This is manual styling, not a live election results feed. Play exits navigation so camera animations run. Preview animation restarts at the selected layer’s start. The library has animated illustrative style thumbnails and the layout shelf has frame diagrams. Preview Fit / 150% / 200% controls monitor magnification independently of geographic zoom.

### 0.3.2 — dedicated map workspace and visible graphics
Edit map opens a separate large interactive map with direct drag, wheel zoom, search, imagery switching, and Done. Select states opens it at the full U.S. view; click states to create separate layers and recolor them with Blue/Red/custom colors. State hit testing uses geographic polygons directly rather than waiting for rendered selection features. Done applies the camera; Animate to this view creates an editable transition. New map presets sit beneath existing graphics, and newly added graphics restart playback so their entrance animations are immediately visible. Layer insertion resets a playhead at the end of a sequence into a visible time.

### 0.4.0 — visual graphics library and editing tools
44 new effects/templates in News packages, Arrows & drawing, Highlights, Weather graphics, Emergency & evacuation, and VFX categories. Effect cards animate using the same Canvas renderer used in the program monitor and export. Emergency banners, lower thirds, storm/arrival/distance panels, and five-day forecasts create separate panel/text tracks. Forecast values start blank; gauges show an entered value only when enabled. Water, wind, lightning, particles, smoke, and screen-space zones are illustrative graphics, not measured forecasts or official warning boundaries. Use existing NWS/USGS tools or sourced GeoJSON for real geographic data. Map cards show sourced Census boundary style previews; the satellite preview uses a loaded satellite map when available.
Select all / Select linked / Copy / Paste / Duplicate / Delete buttons are visible above the timeline. Cmd/Ctrl+A,C,V,X,D are supported outside text fields. Copies get new layer IDs, remap copied map links, and retain independent groups. Paste extends the sequence to fit rather than producing invalid timing. Locked layers survive delete. A map with unselected linked layers requires Select linked before deletion. Draw captures a freehand stroke in the monitor; Preview animation replays it. Effect controls include stroke width, timing, loop, glow, color, opacity, label, numeric values, and scale. Shapes and geographic boundary layers support flashing/breathing highlights. Preset drag-and-drop onto the monitor is supported.

Earthquake rings opens a dedicated maker with a live frame preview, ring presets, paired sliders/numeric fields, color, opacity, independent marker size, optional editable magnitude, start/duration, replay, still, continuous, and one-shot/hold modes. Done creates separate rings, epicenter marker, and magnitude tracks in one undo step. The ring inspector reopens the maker. Dragging its corner changes outer reach only; marker size, spacing, and stroke width remain unchanged. Saved earthquake styles are available in the maker. USGS event rings link to their sourced epicenter and headline so editing reuses those layers. Animation is explicitly illustrative.
MP4 export waits for recorder startup before advancing the timeline, explicitly captures rendered frames before encoding H.264. Graphics-only sequences export without an empty audio track. Empty recordings are reported as errors rather than saved as empty videos.

### 0.4.1 — simpler repeating earthquake rings
The maker opens with three looks and Rings / Spread / Speed / Color controls. Repeat is on by default; additional settings are collapsed under More options. Simple mode distributes rings evenly, including after changing their count or spread. Custom spacing remains available in More options. All looping rings share one period and briefly fade at both boundaries to avoid flashes when wrapping. Existing looping projects use the balanced loop automatically unless custom spacing was explicitly selected. Marker size and line width stay independent. The ring inspector opens the maker without the general transform controls.
