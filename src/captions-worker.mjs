import {pipeline,env} from '../node_modules/@huggingface/transformers/dist/transformers.js';
env.allowLocalModels=false;
env.backends.onnx.wasm.numThreads=1;
env.backends.onnx.wasm.wasmPaths=new URL('../node_modules/@huggingface/transformers/dist/',import.meta.url).href;
let transcriber;
self.onmessage=async e=>{try{
 if(!transcriber)transcriber=await pipeline('automatic-speech-recognition','Xenova/whisper-tiny.en',{device:'wasm',dtype:'q8',progress_callback:p=>self.postMessage({kind:'progress',message:p.status==='progress'?`Downloading speech model: ${Math.round(p.progress||0)}%`:'Preparing speech model…'})});
 self.postMessage({kind:'progress',message:'Transcribing English speech on this device…'});
 const output=await transcriber(e.data.audio,{return_timestamps:true,chunk_length_s:30,stride_length_s:5});
 self.postMessage({kind:'result',chunks:output.chunks||[]});
}catch(error){self.postMessage({kind:'error',message:error.message});}};
