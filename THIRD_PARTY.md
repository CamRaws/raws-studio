# Third-party components

The app uses Electron, MapLibre GL JS, electron-builder, ffmpeg-static, and Hugging Face Transformers.js / ONNX Runtime, pinned in package-lock.json. Their respective licenses are included with their installed npm packages. FFmpeg's bundled binary licensing and corresponding-source requirements must be checked before distributing a compiled installer; the binary used here includes GPL components. No compiled third-party binaries are included in this source archive.

Map and data providers retain their own attribution and usage requirements. The composition draws Esri, OpenStreetMap, NASA, NWS, and USGS source information as applicable. Do not remove provider attribution from exported videos. Imported footage, music, photos, logos, and data retain their original ownership.

Automatic captions download the Xenova/whisper-tiny.en model, derived from OpenAI Whisper. Model and runtime licensing information is available in the model card and installed dependencies. Audio processing runs locally.
