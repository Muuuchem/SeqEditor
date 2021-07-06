export function parseXml(xml) {
    //<se><chain><c>no title</c><seq s='AAA' ></seq></chain><chain><c>no title</c><seq s='AAA' ></seq></chain></se>
    let parser = new DOMParser();

    let xmlDoc = parser.parseFromString(xml, "text/xml");

    return xmlDoc;
    //let test = xmlDoc.getElementsByTagName("se")[0].childNodes[0];
    //console.log(test);

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
