const dateRegEx = /(2[0-9]{3,})(0[1-9]|1[0-2])([0-2][0-9]|3[0-1])/;
const monthRegEx = /(2[0-9]{3,})(0[1-9]|1[0-2])/;
const delimiter = /[-/\\,]/g;

const WeekMap = {
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    日: 7,
    ['' as string]: 0
};

function parseDate(date: string): Date {
    let match = null;
    for (const i of [dateRegEx, monthRegEx])
        match = match || date.replace(delimiter, '').match(i);
    const [y, m, d] = match!.slice(1).map(Number);
    return new Date(y, m, d);
}

function parseNumber(num: string): number {
    return Number(num.replace(delimiter, ''));
}

export { WeekMap, parseDate, parseNumber };
