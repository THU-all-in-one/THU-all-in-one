import { regEx } from '../consts';
import { InfoHelper } from '../info';
import { ApiError } from '../exception';

const testCredential = {
    username: process.env.THU_USERNAME!,
    password: process.env.THU_PASSWORD!
};

test('Basic test', () => {
    expect(testCredential.username).not.toBeUndefined();
    expect(testCredential.password).not.toBeUndefined();
});

describe('Test info', () => {
    const helper = new InfoHelper();
    test('no log in', () => {
        expect(() => {
            return helper.zhjwRoam;
        }).toThrowError(ApiError);
    }, 0);
    test('fail login', () => {
        return expect(
            helper.login({ username: 'test', password: 'test' })
        ).rejects.toBeInstanceOf(ApiError);
    }, 0);
    test('login', () => {
        return expect(helper.login(testCredential)).resolves.toBeUndefined();
    }, 0);
    test('zhjwRoam', () => {
        expect(helper.zhjwRoam).toBeInstanceOf(Array<string>);
        for (const e of helper.zhjwRoam) {
            expect(e.match(regEx.andRegEx)).toBeFalsy();
        }
    }, 0);
    test('getPublicNotification', () => {
        return expect(helper.getPublicNotification()).resolves.toBeInstanceOf(
            Array<{ title: string; url: string }>
        );
    }, 0);
});
