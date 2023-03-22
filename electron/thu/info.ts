import { Credential, BaseHelper } from './utils/network';
import { andRegEx, zhjwRegEx } from './utils/regex';
import urlSet from './url';
import cheerio from 'cheerio';
import { ErrorCode, ApiError } from './utils/exception';

class InfoHelper extends BaseHelper {
    private _zhjwRoam?: string[] | undefined;
    public get zhjwRoam(): string[] {
        if (this._zhjwRoam === undefined) {
            throw new ApiError(ErrorCode.NOT_LOGGED_IN);
        }
        return this._zhjwRoam;
    }
    private set zhjwRoam(value: string[]) {
        this._zhjwRoam = value;
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
            this.zhjwRoam = result
                .match(zhjwRegEx)!
                .map((e) => e.replace(andRegEx, '&'));
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
