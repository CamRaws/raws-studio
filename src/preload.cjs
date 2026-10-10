const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('desktop',{fetchJSON:url=>ipcRenderer.invoke('fetch-json',url),saveProject:json=>ipcRenderer.invoke('save-project',json),openProject:()=>ipcRenderer.invoke('open-project'),saveVideo:(bytes,duration)=>ipcRenderer.invoke('save-video',bytes,duration)});
