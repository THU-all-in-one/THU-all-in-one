/* eslint-disable max-len */
export default {
    andRegEx: /&amp;/g,
    entryRegex: /(.*?)（(.*?)）$/,
    programId: /fajhh=([0-9A-Za-z]*?)&/,
    registerImageRegEx: /&p_zcnd=([0-9]{6})/,
    userTypeRegEx: /https?:\/\/zhjw\.cic\.tsinghua\.edu\.cn\/jxmh\.do\?m=([a-z]{3}_Show[A-Z][a-z]{2}Xx)/g,
    zhjwRegEx: /https?:\/\/zhjw\.cic\.tsinghua\.edu\.cn.*?ticket=([A-Za-z0-9]{36,})/g
};
