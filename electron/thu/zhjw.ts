import { BaseHelper } from './utils/network';
import { regEx, urlSet } from './consts';
import nameMap from './consts/namemap';
import { load } from 'cheerio';
import {
    breakdown,
    groupby,
    iter,
    merge,
    zip,
    replaceKey
} from './utils/itertools';
import {
    buildComplexTable,
    buildGroupedTable,
    buildTable,
    extractRow,
    extractTextArray
} from './utils/cheerio';
import { parseDate } from './utils/format';

class ZhjwHelper extends BaseHelper {
    // TODO
    // 开放交流时间
    // /jxmhkfjl.jxmh_kfjlsjxs.do#
    // 教学计划、完成情况及本学期教学计划
    // /jhBks.by_fascjgmxb_gr.do?m=queryJxjhScjgmx_gr&xsViewFlag=jxjh
    // 培养方案完成情况
    // /jhBks.by_fascjgmxb_gr.do?m=queryFaScjgmx_gr&xsViewFlag=pyfa

    private userType: 'g' | 'ug' | undefined;

    login = async (urls: string[], userType: 'g' | 'ug' | undefined) => {
        await Promise.all(urls.map((e) => this.query(e)));
        this.userType = userType;
    };

    getWeekIndex = async () => {
        const $ = await this.query(urlSet.zhjw.portal(), {
            sjxl: 'true',
            m: 'tsxx'
        }).then(load);
        return Number(
            $('span.d_text')
                .text()
                .match(/第(\d{1,2})周/)![1]
        );
    };

    getStudentInfo = async () => {
        function toDictionary(array: string[][]) {
            return array
                .map((elem) => merge(iter(array[0]), iter(elem)))
                .slice(1)
                .filter((e) => Object.keys(e).length);
        }
        const m = this.userType == 'g' ? 'yjs_ShowYjsXx' : 'bks_ShowBksXx',
            $ = await this.query(urlSet.zhjw.studentInfo(), { m }).then(load);

        const tableContent = $('table.table-condensed')
            .toArray()
            .map((elem) => extractRow($, elem));

        let result: { [key: string]: string | string[] } = {};
        const studentInfo = tableContent[0]
            .map((elem) => {
                const len = elem.length;
                return elem.slice(0, len - (len % 2));
            })
            .reduce((acc, curr) => [...acc, ...curr], []);
        for (const [key, value] of breakdown(studentInfo))
            if (nameMap.zhjwInfoNameMap.inA(key))
                result[nameMap.zhjwInfoNameMap.get(key)!] = value;

        if (this.userType == 'ug') {
            const [secondMajor, majorChange, punishment] = [1, 3, 4].map(
                (i) =>
                    toDictionary(tableContent[i]) as unknown as {
                        [key: string]: string;
                    }
            );

            result = {
                ...result,
                ...secondMajor,
                ...majorChange,
                ...punishment
            };
        }

        const registerTime = $('img')
            .map((_, elem) => {
                return {
                    _: $(elem).attr('src')!.match(regEx.registerImageRegEx)
                };
            })
            .filter((_, elem) => elem._ !== null)
            .map((_, elem) => elem._!.slice(1))
            .toArray();

        return { ...result, registerTime };
    };

    getRegisterImage = async (date: string) => {
        const registerDate = parseDate(date);
        const history =
            Date.now() - registerDate.getTime() >= new Date(0, 6).getTime();
        return this.query(
            urlSet.zhjw.index(),
            {
                /* eslint-disable camelcase */
                m: 'xs_zcimage',
                p_zcnd: date,
                ...(history ? { p_zclb: 'ln' } : {})
                /* eslint-enable camelcase */
            },
            'base64'
        );
    };

    getClassCalender = async () => {
        const m = this.userType == 'g' ? 'yjs_jxrl' : 'bks_jxrl',
            $ = await this.query(urlSet.zhjw.index(), { m }).then(load);

        const root = $('#bks_xj_jf_zc_zs > div');
        const days = root
            .find('div[class$="day"]')
            .map((_, elem) => parseDate($(elem).text().trim()))
            .toArray();
        const events = root
            .find('div.side_content_2 > table')
            .map((_, elem) => {
                const result = {
                    _: [] as { time: string; name: string; place: string }[]
                };
                const elements = extractTextArray($, elem, 'td');
                for (const [time, entry] of breakdown(elements)) {
                    const [name, place] = regEx.entryRegex
                        .exec(entry)!
                        .slice(1);
                    result._.push({ time: time, ...{ name, place } });
                }
                return result;
            })
            .toArray();
        const result = [];
        for (const [date, entry] of zip(iter(days), iter(events)))
            result.push({ date: date, entries: entry._ });
        return result;
    };

    getCountDown = async () => {
        const m = 'tsxx',
            $ = await this.query(urlSet.zhjw.portal(), { m }).then(load);

        const event = extractTextArray($, 'span.djs_title');
        const countDown = extractTextArray($, 'b').map(Number);

        const result = [];
        for (const [e, c] of zip(iter(event), iter(countDown)))
            result.push({ event: e, countDown: c });
        return result;
    };

    getAllGrade = async () => {
        const m = this.userType == 'g' ? 'yjs_yxkccj' : 'bks_yxkccj',
            $ = await this.query(urlSet.zhjw.queryGrade(), { m }).then(load);

        const [en, ...courses] = $('table.table-condensed')
            .toArray()
            .map((elem) => buildTable($, elem))
            .reverse();
        const [failed, retake, passed] = courses.map((elem) =>
            elem
                .map((course) => replaceKey(course, nameMap.zhjwCourseNameMap))
                .slice(0, -2)
        );

        return { passed, retake, failed };
    };

    getTranscript = async () => {
        const m = this.userType == 'g' ? 'yjs_cjdcx' : 'bks_cjdcx',
            $ = await this.query(urlSet.zhjw.queryGrade(), { m }).then(load);

        return buildTable($, '#table1').map((elem) =>
            replaceKey(elem, nameMap.zhjwCourseNameMap)
        );
    };

    getExamSchedule = async (semester: string) => {
        const $ = await this.query(urlSet.zhjw.index(), {
            /* eslint-disable camelcase */
            m: this.userType == 'g' ? 'yjs_ksSearch' : 'bks_ksSearch',
            p_xnxq: semester
            /* eslint-enable camelcase */
        }).then(load);

        return buildTable($, 'table.biaodan_table').map((elem) =>
            replaceKey(elem, nameMap.zhjwExamNameMap)
        );
    };

    private _getUgMajorProgramCode = async () => {
        const m = 'grPyfabks',
            $ = await this.query(urlSet.zhjw.ugProgram(), { m }).then(load);
        const url = $('a.mainHref').attr('href')!;
        return url.match(regEx.programId)![1];
    };

    public get getUgMajorProgramCode() {
        if (this.userType != 'ug') return undefined;
        return this._getUgMajorProgramCode;
    }

    private _getUgMajorProgramCourseGroup = async (programCode: string) => {
        const $ = await this.query(urlSet.zhjw.ugProgram(), {
            /* eslint-disable camelcase */
            p_id: programCode,
            m: 'showCenter',
            theModule: 'pyfa'
            /* eslint-enable camelcase */
        }).then(load);
        const [info, groups] = $('div.tab').toArray();
        const courses = await this.getUgMajorProgramCourse!(programCode);
        return {
            info: buildComplexTable($, info),
            courses: buildTable($, groups).map((elem) => {
                const ret: {
                    [key: string]:
                        | string
                        | { [key: string]: string | undefined }[];
                } = replaceKey(elem, nameMap.zhjwCourseGroupNameMap);
                ret['courses'] = courses[ret['name'] as string].map((course) =>
                    replaceKey(course, nameMap.zhjwCourseNameMap)
                );
                return ret;
            })
        };
    };

    public get getUgMajorProgramCourseGroup() {
        if (this.userType != 'ug') return undefined;
        return this._getUgMajorProgramCourseGroup;
    }

    private _getUgMajorProgramCourse = async (programCode: string) => {
        const $ = await this.query(urlSet.zhjw.ugProgramDetail(), {
            /* eslint-disable camelcase */
            p_fajhh: programCode,
            m: 'index2',
            theModule: 'pyfa'
            /* eslint-enable camelcase */
        }).then(load);
        const _headers = extractTextArray($, 'tr.trr1', 'td');
        const content = buildGroupedTable($, 'div#content_1', _headers);
        return groupby(content, (elem) => elem['所属课组']!);
    };

    public get getUgMajorProgramCourse() {
        if (this.userType != 'ug') return undefined;
        return this._getUgMajorProgramCourse;
    }

    private _getPgMajorProgramCourse = async () => {
        const $ = await this.query(urlSet.zhjw.portal(), {
            m: 'yjs_grpyfaXx'
        }).then(load);
        const content = buildTable($, 'table.tab_common');
        return content.map((elem) =>
            replaceKey(elem, nameMap.zhjwCourseNameMap)
        );
    };

    public get getPgMajorProgramCourse() {
        if (this.userType != 'g') return undefined;
        return this._getPgMajorProgramCourse;
    }
}

export { ZhjwHelper };
