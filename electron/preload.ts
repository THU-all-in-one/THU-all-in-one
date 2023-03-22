import { ipcRenderer, contextBridge } from 'electron';
import thu from './thu';

const infoHelper = new thu.InfoHelper();

contextBridge.exposeInMainWorld('debug', (name: string, value: number) => {
    ipcRenderer.send('debug', name, value);
});

contextBridge.exposeInMainWorld('credential', {
    username: process.env.THU_USERNAME!,
    password: process.env.THU_PASSWORD!
});
contextBridge.exposeInMainWorld('info', {
    login: infoHelper.login,
    getPublicNotification: infoHelper.getPublicNotification
});
