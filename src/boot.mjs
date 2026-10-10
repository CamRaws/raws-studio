import * as maplibregl from '../node_modules/maplibre-gl/dist/maplibre-gl.mjs';
maplibregl.setWorkerUrl(new URL('../node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs',import.meta.url).href);
globalThis.maplibregl=maplibregl;
await globalThis.StudioStatesReady;
await import('./app.js');
