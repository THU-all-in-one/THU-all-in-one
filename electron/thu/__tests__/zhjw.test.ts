import { InfoHelper } from '../info';
import { ZhjwHelper } from '../zhjw';

const testCredential = {
    username: process.env.THU_USERNAME!,
    password: process.env.THU_PASSWORD!
};

test('Basic test', () => {
    expect(testCredential.username).not.toBeUndefined();
    expect(testCredential.password).not.toBeUndefined();
});

test('Test zhjw', async () => {
    const info = new InfoHelper(),
        zhjw = new ZhjwHelper();
    await info.login(testCredential);
    await zhjw.login(info.zhjwRoam, info.userType);
    const studentInfo = await zhjw.getStudentInfo();
    expect(studentInfo).not.toBeUndefined();
    expect(
        await zhjw
            .getRegisterImage(studentInfo['registerTime'][0])
            .then((res) => {
                Buffer.from(res, 'base64');
            })
    ).toBeUndefined();
    expect(await zhjw.getClassCalender()).not.toBeUndefined();
    expect(await zhjw.getCountDown()).not.toBeUndefined();
    expect(
        await zhjw.getAllGrade().then((res) => Object.keys(res).length)
    ).toBe(3);
    expect(await zhjw.getTranscript()).not.toBeUndefined();
    expect(await zhjw.getWeekIndex()).not.toBeUndefined();
    expect(zhjw.getUgMajorProgramCode).toBeUndefined();
    expect(zhjw.getUgMajorProgramCourseGroup).toBeUndefined();
    expect(zhjw.getUgMajorProgramCourse).toBeUndefined();
    expect(zhjw.getPgMajorProgramCourse).not.toBeUndefined();
    expect(await zhjw.getPgMajorProgramCourse!()).not.toBeUndefined();
}, 0);
