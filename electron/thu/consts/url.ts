const serverSet = {
    info: 'https://info.tsinghua.edu.cn',
    zhjw: 'https://zhjw.cic.tsinghua.edu.cn'
};

const urlSet = {
    info: {
        home: () => serverSet.info,
        login: () => serverSet.info + '/Login',
        index: () => serverSet.info + '/render.userLayoutRootNode.uP',
        notification: () => serverSet.info + '/minichan/info_student.jsp',
        roam: (i: number) => serverSet.info + `/minichan/roamaction.jsp?id=${i}`
    },
    zhjw: {
        studentInfo: () => serverSet.zhjw + '/jxmh.do',
        home: () => serverSet.zhjw,
        roam: () => serverSet.zhjw + '/j_acegi_login.do',
        index: () => serverSet.zhjw + '/jxmh.do',
        portal: () => serverSet.zhjw + '/portal3rd.do',
        queryGrade: () => serverSet.zhjw + '/cj.cjCjbAll.do',
        ugProgram: () => serverSet.zhjw + '/jhBks.vjhBksPyfabBs.do',
        ugProgramDetail: () => serverSet.zhjw + '/jhBks.vjhBksPyfakcbBs.do'
    }
};

export default urlSet;
