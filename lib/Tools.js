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

export function createButtons(parent, buttons) {
    for (let value of buttons) {
        const button = document.createElement("button");
        button.title = value.tooltips;

        parent.appendChild(button);

        button.addEventListener("click", value.onclick);
        button.innerHTML = '<img src="' + value.iconurl + '" style="width: 30px;" />';
    }
}

export function getDictKeys(dict) {
    let keys = [];
    for (var key in dict) {
        keys.push(key);
    }
    return keys;
}