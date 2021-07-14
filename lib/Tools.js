export function parseXml(xml) {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xml, "text/xml");
    return xmlDoc;
}

export function arrayMax(arr) {
    var len = arr.length, max = -Infinity;
    while (len--) {
        if (Number(arr[len]) > max) {
            max = Number(arr[len]);
        }
    }
    return max;
}
