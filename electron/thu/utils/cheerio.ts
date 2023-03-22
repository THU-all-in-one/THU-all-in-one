import { BasicAcceptedElems, CheerioAPI, AnyNode } from 'cheerio';
import { buildObject, repeat } from './itertools';
import { iter, merge, breakdown } from './itertools';

type CheerioNode = BasicAcceptedElems<AnyNode>;

function extractContent<T>(
    $: CheerioAPI,
    selector: CheerioNode,
    subSelector?: string,
    fn?: (_: number, elem: AnyNode) => T
) {
    const result =
        subSelector === undefined ? $(selector) : $(selector).find(subSelector);
    return result.map(fn === undefined ? () => undefined : fn).toArray();
}

function extractTextArray(
    $: CheerioAPI,
    selector: CheerioNode,
    subSelector?: string
) {
    return extractContent($, selector, subSelector, (_, elem) =>
        $(elem).text().trim()
    );
}

function extractAttrArray(
    $: CheerioAPI,
    selector: CheerioNode,
    subSelector?: string,
    attr?: string
) {
    return extractContent($, selector, subSelector, (_, elem) =>
        $(elem).attr(attr === undefined ? 'id' : attr)
    );
}

function extractRow($: CheerioAPI, node: CheerioNode) {
    return $(node)
        .find('tr')
        .map((_, elem) => {
            return { _: extractTextArray($, elem, 'td') };
        })
        .toArray()
        .map((row) => row._);
}

function extractRowAttribute($: CheerioAPI, node: CheerioNode, attr: string) {
    return $(node)
        .find('tr')
        .map((_, elem) => {
            return { _: extractAttrArray($, elem, 'td', attr) };
        })
        .toArray()
        .map((row) => row._);
}

function buildTable($: CheerioAPI, node: CheerioNode, headers?: string[]) {
    let _header =
        headers === undefined ? extractTextArray($, node, 'th') : headers;
    const rows = extractRow($, node),
        ret = [];
    if (_header.length === 0) _header = rows[0];
    for (const row of rows) ret.push(merge(iter(_header), iter(row)));
    return ret.slice(1);
}

function buildComplexTable($: CheerioAPI, node: CheerioNode) {
    const rows = extractRow($, node);
    const paired = rows
        .map((row) => (row.length % 2 === 0 ? row : row.slice(0, -1)))
        .reduce((acc, curr) => [...acc, ...curr], []);
    const ret = buildObject(breakdown(paired));
    return ret;
}

function buildGroupedTable(
    $: CheerioAPI,
    node: CheerioNode,
    headers?: string[]
) {
    let _header =
        headers === undefined ? extractTextArray($, node, 'th') : headers;
    const rows = extractRow($, node),
        ret: (string | undefined)[][] = [],
        merged: { [key: number]: Iterator<string | undefined> | undefined } =
            {},
        rowspans = extractRowAttribute($, node, 'rowspan');
    if (_header.length === 0) _header = rows[0];
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i],
            rowspan = rowspans[i],
            newrow = [];
        for (let j = 0, k = 0; k < row.length; j++) {
            if (rowspan[j] !== undefined) {
                merged[j] = repeat(row[j], Number(rowspan[j]));
                k++;
            }
            if (merged[j] !== undefined) {
                const next = merged[j]!.next();
                if (next.done) merged[j] = undefined;
                newrow.push(next.value);
            } else newrow.push(row[k++]);
        }
        ret.push(newrow);
    }
    return ret.map((row) => merge(iter(_header), iter(row)));
}

function extractDropdown($: CheerioAPI, node: CheerioNode) {
    const $nodes = $(node);
    const nodeId = extractAttrArray($, $nodes, 'option', 'value');
    const nodeName = extractTextArray($, $nodes, 'option');
    const result = [];
    for (let i = 0; i < nodeId.length; i++)
        result.push({ name: nodeName[i], id: nodeId[i]! });
    return result;
}

export {
    extractTextArray,
    extractAttrArray,
    extractRow,
    buildComplexTable,
    buildTable,
    buildGroupedTable,
    extractDropdown
};
