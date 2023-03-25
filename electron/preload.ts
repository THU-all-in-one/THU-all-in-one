import { ipcRenderer, contextBridge } from 'electron';
import thu from './thu';

const infoHelper = new thu.InfoHelper(),
    zhjwHelper = new thu.ZhjwHelper();

contextBridge.exposeInMainWorld('debug', (name: string, value: number) => {
    ipcRenderer.send('debug', name, value);
});

contextBridge.exposeInMainWorld('credential', {
    username: process.env.THU_USERNAME!,
    password: process.env.THU_PASSWORD!
});
contextBridge.exposeInMainWorld('info', {
    login: infoHelper.login,
    getPublicNotification: infoHelper.getPublicNotification,
    zhjwRoam: () => infoHelper.zhjwRoam
});
contextBridge.exposeInMainWorld('zhjw', {
    login: zhjwHelper.login,
    getStudentInfo: zhjwHelper.getStudentInfo,
    getWeekIndex: zhjwHelper.getWeekIndex,
    getRegisterImage: zhjwHelper.getRegisterImage,
    getClassCalender: zhjwHelper.getClassCalender,
    getCountDown: zhjwHelper.getCountDown,
    getAllGrade: zhjwHelper.getAllGrade,
    getTranscript: zhjwHelper.getTranscript,
    getUgMajorProgramCode: zhjwHelper.getUgMajorProgramCode,
    getUgMajorProgramCourseGroup: zhjwHelper.getUgMajorProgramCourseGroup,
    getUgMajorProgramCourse: zhjwHelper.getUgMajorProgramCourse,
    getExamSchedule: zhjwHelper.getExamSchedule
});
