export default class Interface {
    static init() {
        console.log("new class constructed !")
    }

    static getDictKeys(dict) {
        let keys = [];
        for (var key in dict) {
            keys.push(key);
        }
        return keys;
    }

    static createDialog(text) {
        const dlg = document.createElement("dialog");
        const dlgTxt = document.createTextNode(text);
        const bl = document.createElement("BR");
        const yesBtn = document.createElement("yes");
        const noBtn = document.createElement("no")
        //const btnText = document.createTextNode("CLICK HERE");
        dlg.setAttribute("open", "open");
        dlg.appendChild(dlgTxt);
        dlg.appendChild(bl);
        btn.appendChild(btnText);
        dlg.appendChild(btn);
        document.body.appendChild(dlg);
    }

    static createInputDialog(text, items, options) {
        var input = prompt("Enter XML representing sequence to import");

        if (input != null) {
            options.onclick(input)
        }

    }

    static createDialog2(text, items, options) {
        //const modal = document.getElementById("modal_window")
        const dlg = document.createElement("dialog");
        const updateButton = document.createElement("button")
        const textArea = document.createElement("textarea")
        textArea.style.height = '450px'
        //console.log(modal)
        dlg.appendChild(textArea)
        dlg.appendChild(updateButton)
        dlg.setAttribute("open", "open");        //var confirmBtn = document.getElementById('confirmBtn');
        dlg.style.width = '200px'
        dlg.style.height = '500px'
        document.body.appendChild(dlg)
        // "Update details" button opens the <dialog> modally
        updateButton.addEventListener('click', options.onclick);

        //dlg.showModal()
        // "Favorite animal" input sets the value of the submit button
        //selectEl.addEventListener('change', function onSelect(e) {
        //    confirmBtn.value = selectEl.value;
        //});
        // "Confirm" button of form triggers "close" on dialog because of [method="dialog"]
        //favDialog.addEventListener('close', function onClose() {
        //    outputBox.value = favDialog.returnValue + " button clicked - " + (new Date()).toString();
        //});
    }

    static addAnnotationDlg(that) {
        var me = that;
        var chaindict = {};//key:chaintext value: index from this.titles
        var chainname = {};//key: chainname value: chaintext
        var chains = [];
        for (var i = 0; i < that.editorIndices.length; i++) {
            var chaintext = "Chain " + (i + 1);
            chains.push(chaintext);
            chaindict[chaintext] = that.editorIndices[i];//so basically now text corresponds to id of editor
            chainname[that.editorIndices[i]] = chaintext;
        }

        const items = {
            seq: { label: "Sequence", key: "seq", type: "select", items: chains, width: 75 },//change this to "Chain 1", "Chain 2", etc.
            firstpos: { label: "Start Position", key: "firstpos", type: "number", width: 75 },
            secondpos: { label: "End Position", key: "secondpos", type: "number", width: 75 },
            color: { label: "Color", key: "color", type: "color", width: 75 },
            notes: { label: "Notes", key: "notes", type: "textarea", width: 300, height: 200 }
        };

        that.annotationdlg = Interface.modal("Add Annotation", that.parent, that.addAnnotation.bind(that), items)

        that.chainname = chainname;
        that.chaindict = chaindict;
    }

    static addBondDlg(that) {
        var chains = [];
        var chaindict = {};
        var chainname = {};

        for (var i = 0; i < that.editorIndices.length; i++) {
            var chaintext = "Chain " + (i + 1);
            chains.push(chaintext);
            chaindict[chaintext] = that.editorIndices[i];//making dicts to easily convert back and forth between these temporary chain names
            chainname[that.editorIndices[i]] = chaintext;
        }

        var types = that.types() ? Interface.getDictKeys(that.types) : [];//fetched from config or admin menu (code exists to add/edit types but I was told to shelf it (remove))

        const items = {
            seq: { label: "First Sequence", key: "seq", type: "select", items: chains, width: 100 },
            firstpos: { label: "First Position", key: "first", type: "number", width: 100 },
            secondseq: { label: "Second Sequence", key: "secondseq", type: "select", items: chains, width: 100 },
            secondpos: { label: "Second Position", key: "second", type: "number", width: 100 },
            bondtype: {
                label: "Bond Type", key: "bondtype", type: "select", items: types, onchange: function (data) { that.changeBondType(data); }
            },
            notes: { label: "Notes", key: "notes", type: "input" }
        };

        this.modal("Add a Single Bond to your Sequence", that.parent, that.addOneBond.bind(that), items);
        that.chainname = chainname;
        that.chaindict = chaindict;
    }

    static editBondDlg(that) {
        var table = document.createElement("table");
        var fields = {
            bondtype: "Bond Type",
            firstpos: "First Position",
            id: "ID",
            notes: "Notes",
            secondpos: "Second Position",
            secondseq: "Second Sequence Name",
            secondseqIndex: "Second Sequence Index",
            seq: "Sequence Name",
            seqIndex: "Sequence Index"
        }
        var chains = [];
    //    var chaindict = {};//key:chaintext value: index from editorIndices
    //    var chainname = {};//key: chainname value: chaintext

    //    //chaindict key: chaintext // value: editorIndex
    //    for (var i = 0; i < this.editorIndices.length; i++) {//Making names for dlg based on sequential order. 
    //        var chaintext = "Chain " + (i + 1);
    //        chains.push(chaintext);
    //        chaindict[chaintext] = this.editorIndices[i];
    //        chainname[this.editorIndices[i]] = chaintext;//making dicts to easily convert back and forth between these temporary chain names
    //    }
        var types = that.types() ? Interface.getDictKeys(this.types) : [];//Types defined by admin or in config, fetching them here

        const items = {
            id: { label: "id", key: "id", type: "hidden" },
            seq: { label: "First Sequence", key: "seq", type: "select", items: chains, width: 100 },
            firstpos: { label: "First Position", key: "first", type: "input", width: 100 },
            secondseq: { label: "Second Sequence", key: "secondseq", type: "select", items: chains, width: 100 },
            secondpos: { label: "Second Position", key: "second", type: "input", width: 100 },
            bondtype: {
                label: "Bond Type", key: "bondtype", type: "select", items: types, onchange: function (data, values) { me.changeBondType(data, values); }
            },
            color: { label: "Color", key: "color-pick", type: "color" },
            notes: { label: "Notes", key: "notes", type: "textarea" }
        };
        if (that.bondslist.length > 0) {
            var text = "Checkmark any bonds from that list that you would like to delete:";
            this.modal(text, that.parent, that.addBonds.bind(that), items, "table", that.bondslist);
        }

    }

    static createDialog3() {
        this.modal('modal'); // show
    }

    static tableDlg(submitFunction, items) {

    }

    static addRow(table, row, fields) {
        var rowCnt = table.rows.length;   // table row count.
        var tr = table.insertRow(rowCnt); // the table row.
        tr = table.insertRow(rowCnt);

        var c = 0;
        for (const [key, value] of row) {

            if (c == 0) {      // the first column.
                let td = document.createElement('td'); // table definition.
                td.setAttribute('id', 'table')
                td = tr.insertCell(c);
                //    // add a checkmark in every new row in the first column.
                var chk = document.createElement('input');
                chk.setAttribute('type', 'checkbox');
                chk.setAttribute('id', 'table');
                td.appendChild(chk);
                c += 1;
            } //else {
            let td = document.createElement('td'); // table definition.
            td.setAttribute('id', 'table')
            td = tr.insertCell(c);
            let rowType = fields[key];
            if (rowType.type == "color") {
                var ele = document.createElement('input');
                ele.style.width = "60px";
                ele.setAttribute('type', 'color');
                ele.setAttribute('value', value);
            } else if (rowType.type == "select") {
                var ele = document.createElement('select');
                //ele.style.width = "60px";
                ele.setAttribute('type', "select");
                ele.setAttribute('id', "selector");
                for (var j in rowType.items) {
                    var option = document.createElement("option");
                    //option.value = rowType.items[j];
                    option.value = j;
                    option.text = rowType.items[j];
                    if (value == j)
                        option.selected = true;
                    ele.appendChild(option);
                }
            } else {
                var ele = document.createElement('input');
                ele.style.width = "60px";
                ele.setAttribute('type', 'text');
                ele.setAttribute('value', value);
                ele.setAttribute("id", "table");
            }

            td.appendChild(ele);
            td.setAttribute("id", "table")
            c += 1;
        }
    }

    static modal(title, parent, submitFunction, items, options, fieldData) {
        var toAttach = []

        let modal = document.getElementById("modal");
        modal.style.display = 'grid';
        let body = document.querySelector("body");
        let bg = document.createElement("div");
        bg.className = "modal-js-overlay";

        var titleDiv = document.createElement("title");
        titleDiv.className = "modal-title";
        titleDiv.innerHTML = title;
        toAttach.push(titleDiv);

        var close = document.createElement("button");
        close.className = "modal-js-close";
        close.innerHTML = "x";
        toAttach.push(close);

        var submitButton = document.createElement("button");
        submitButton.className = "modal-submit";
        if (!submitFunction) {
            submitButton.innerHTML = "Close"
        } else {
            submitButton.innerHTML = "Submit";
        }
        toAttach.push(submitButton);

        if (!items) {
            let textarea = document.createElement("textarea");
            textarea.className = "text-area";

            toAttach.unshift(textarea);

            submitButton.addEventListener("click", () => {
                if (submitFunction) {
                    submitFunction(parent, textarea.value);
                }
                this.clearModal2(modal, overlay, toAttach);
                //this.clearModal(textarea, titleDiv, submitButton, body);
            });

        } else if (options == "table") {
            var table = document.createElement('table'); 
           // table.setAttribute("border", 1);
            table.style.border = "1px solid #000";
            table.setAttribute('class', 'table'); // table id.
            var fields = items;//fieldData ? fieldData : items[0];
            var tr = table.insertRow(-1);
            tr.setAttribute("class", 'table')
            //adding row for checkmark
            var checkmarkHeader = document.createElement('th');
            checkmarkHeader.setAttribute('class', 'table');
            checkmarkHeader.innerHTML = "Delete?";
            tr.appendChild(checkmarkHeader);
            var fieldArray = Object.entries(fields);
            let order = [];
            for (const [key, value] of fieldArray) {
                var th = document.createElement('th'); // create table headers
                th.setAttribute('class', 'table')
                th.innerHTML = value.label;//fields[h];
                tr.appendChild(th);
                order.push(key);
            }
            toAttach.push(table);
            for (const [key, value] of Object.entries(fieldData)) {
                let sortedValues = [];
                order.forEach((columnName) => {
                    sortedValues.push([columnName, value[columnName]]);
                })
                this.addRow(table, sortedValues, fields);
            }
            
            submitButton.addEventListener("click", () => {
                var data = [];
                let columnNames = {};
                for (var i in toAttach) {
                    var element = toAttach[i].lastChild;

                    if (element.tagName === "TBODY") {
                        var children = Array.from(element.children);
                        children.forEach((row, rowNumber) => {
                            //let row = children[rowNumber];
                            //let columnNames = {};
                            //data[rowNumber] = {};
                            if (row && row.className === "table") {
                                //row with headers
                                let rowChildren = Array.from(row.childNodes);
                                //for (var colNumber in rowChildren) {
                                rowChildren.forEach((col, colNumber) => {
                                    //var col = rowChildren[colNumber];
                                    var titles = col.childNodes;
                                    //for (var title in titles.values)
                                    titles.forEach((title) => {
                                        columnNames[colNumber] = title.nodeValue;
                                    });
                                });
                            } else if (row.childElementCount > 0) {
                                //value rows
                                let rowChildren = Array.from(row.childNodes);
                                let dataRow = {};
                                rowChildren.forEach((col, colNumber) => {
                                    let column = columnNames[colNumber];
                                    if (col.children[0].type == "checkbox")
                                        dataRow[column] = col.children[0].checked;
                                    else
                                        dataRow[column] = col.children[0].value;
                                });
                                data.push(dataRow);

                            }
                        });
                    }
                }
                console.log(fieldArray);
                var nameKey = {};
                var finalData = {};
                fieldArray.forEach((arr) => {
                    var item = arr[1];
                    var colID = arr[0];
                    var name = item.label;
                    nameKey[name] = colID;
                })
                for (var r in data) {
                    finalData[r] = {};
                    for (var [k, v] of Object.entries(data[r])) {
                        let fKey = nameKey[k] || "Delete?";
                        finalData[r][fKey] = v;
                    }
                }
                submitFunction(finalData);
                //submitFunction(data);
                this.clearModal2(modal, overlay, toAttach);
            });
        } else {
            let form = document.createElement("form");

            for (const i in items) {
                var item = items[i];
                let p = document.createElement("p");
                form.appendChild(p);

                var label = document.createElement("label");
                label.className = "form-label";
                p.appendChild(label);
                //var input = document.createElement("input");
                //p.appendChild(input);
                //toAttach.push(p);
                if (item.type == "select") {
                    label.innerHTML = item.label;
                    var select = document.createElement("select");
                    label.setAttribute("for", item.key);
                    select.setAttribute("class", item.key);
                    select.setAttribute("name", item.key);
                    for (var j in item.items) {
                        var option = document.createElement("option");
                        option.value = item.items[j];
                        option.text = item.items[j];
                        select.appendChild(option);
                    }
                    p.appendChild(select);
                    toAttach.push(p);
                } else {
                    var input = document.createElement("input");
                    p.appendChild(input);
                    toAttach.push(p);
                    for (const j in item) {
                        let value = item[j];
                        console.log(item, value);
                        //let p = document.createElement("p");
                        //form.appendChild(p);
                        //var label = document.createElement("label");
                        //var input = document.createElement("input");

                        if (j == "label") {
                            //var label = document.createElement("label");
                            if (item.type != "hidden") {
                                label.innerHTML = value + ":";
                            }
                            //p.appendChild(label);
                        } else if (j == "key") {
                            label.setAttribute("for", value);
                            input.setAttribute("class", value);
                            input.setAttribute("name", value);

                        } else if (j == "type") {
                            //var input = document.createElement("input");
                            //if (value != "hidden") {
                            input.setAttribute(j, value);
                            //} else {

                            //}
                            //input.setAttribute
                        } else if (j == "onchange") {
                            input.onchange = value;
                        } else if (j == "items") {
                            input.items = value
                        } else {
                            console.log(j, value);
                            input.setAttribute(j, value);
                        }
                    }

                }

            }
            submitButton.addEventListener("click", () => {
                var data = {};
                for (var i in toAttach) {
                    var element = toAttach[i].lastChild;
                    if (element.value !== undefined) {
                        data[element.className] = element.value;
                    }
                }
                submitFunction(data);
                this.clearModal2(modal, overlay, toAttach);
            });
        }


        //let submitButton = document.createElement("button");
        //submitButton.className = "modal-submit";
        //submitButton.innerHTML = "Submit";

        body.appendChild(bg);
        //toAttach.push(body);
        let overlay = body.querySelector(".modal-js-overlay");

        close.addEventListener("click", () => {
            this.clearModal2(modal, overlay, toAttach)
        });

        for (var i in toAttach) {
            modal.appendChild(toAttach[i]);
        }

        //submitButton.addEventListener("click", () => {
        //    submitFunction(parent, textarea.value);
        //    this.clearModal(textarea, titleDiv, submitButton, body);
        //});

        //close.addEventListener('click', () => this.clearModal(textarea, titleDiv, submitButton, body))
    }

    static clearModal2(modal, overlay, children) {
        let closebtn = modal.querySelector(".modal-js-close");
        let body = overlay.parentNode;
        body.removeChild(overlay);
        modal.classList.remove('on');
        for (var idx in children) {
            let child = children[idx];
            modal.removeChild(child);
        }
        modal.style.display = "None";
    } 

    static clearModal(textarea, titleDiv, close, submitButton, body) {
        let modal = document.getElementById("modal");
        let overlay = body.querySelector(".modal-js-overlay");
        let closebtn = modal.querySelector(".modal-js-close");
        body.removeChild(overlay);

        
        modal.classList.remove('on');
        modal.removeChild(closebtn);
        modal.removeChild(textarea);
        modal.removeChild(titleDiv)
        modal.removeChild(submitButton);
        modal.style.display = "None"
    }

    static  modaloff(id) {
        let body = document.querySelector("body");
        //let el = document.querySelector(id);
        let modal = document.getElementById(id);
        let overlay = body.querySelector(".modal-js-overlay");
        modal.classList.remove('on');
        body.removeChild(overlay);
        modal.style.display = "None"
        modal.removeChild('textarea')
    }
}