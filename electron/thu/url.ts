const serverSet = {
    info: 'https://info.tsinghua.edu.cn',
    zhjw: 'https://zhjw.cic.tsinghua.edu.cn'
};

const urlSet = {
    info: {
        home: () => serverSet.info,
        login: () => serverSet.info + '/Login',
        index: () => serverSet.info + '/render.userLayoutRootNode.uP',
        notification: () => serverSet.info + '/minichan/info_student.jsp'
    },
    zhjw: {
        home: () => serverSet.zhjw
    }
};

export default urlSet;
