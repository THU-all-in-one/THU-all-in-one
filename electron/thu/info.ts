import { Credential, BaseHelper } from './utils/network';
import regEx from './consts/regex';
import urlSet from './consts/url';
import cheerio from 'cheerio';
import { ErrorCode, ApiError } from './exception';

class InfoHelper extends BaseHelper {
    private _zhjwRoam?: string[] | undefined;
    private _userType?: 'g' | 'ug' | undefined;

    public get zhjwRoam(): string[] {
        if (this._zhjwRoam === undefined) {
            throw new ApiError(ErrorCode.NOT_LOGGED_IN);
        }
        return this._zhjwRoam;
    }
    private set zhjwRoam(value: string[]) {
        this._zhjwRoam = value;
    }
    public get userType(): 'g' | 'ug' | undefined {
        return this._userType;
    }
    private set userType(value: 'g' | 'ug' | undefined) {
        this._userType = value;
    }

    login = async (credential: Credential) => {
        const { username, password } = credential;
        const url = urlSet.info.login();
        const prefetch = [urlSet.zhjw.home(), urlSet.info.home()];
        await Promise.all(prefetch.map((url) => this.query(url)));
        await this.post(
            url,
            {
                userName: username,
                password: password,
                ...{ redirect: 'NO', x: '0', y: '0' }
            },
            'form'
        );
        try {
            const result = await this.query(urlSet.info.index());
            const studentType = await this.query(urlSet.info.roam(2613));
            this.zhjwRoam = result
                .match(regEx.zhjwRegEx)!
                .map((e) => e.replace(regEx.andRegEx, '&'));
            switch (regEx.userTypeRegEx.exec(studentType)![1]) {
                case 'yjs_ShowYjsXx':
                    this.userType = 'g';
                    break;
                case 'bks_ShowBksXx':
                    this.userType = 'ug';
                    break;
                default:
                    this.userType = undefined;
            }
        } catch (e) {
            throw new ApiError(ErrorCode.BAD_CREDENTIAL);
        }
    };

    getPublicNotification = async () => {
        const $ = await this.query(urlSet.info.notification()).then(
            cheerio.load
        );
        return $('div.contbox')
            .map((_, elem) => {
                return {
                    _: $(elem)
                        .find('a')
                        .map((_, a) => {
                            return {
                                title: $(a).text(),
                                url: $(a).attr('href')
                            };
                        })
                        .toArray()
                };
            })
            .toArray()
            .map((elem) => elem._);
    };
}

export { InfoHelper };
