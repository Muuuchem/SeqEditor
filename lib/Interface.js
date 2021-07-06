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

    static createDialog3() {
        this.modal('modal'); // show
    }

    static tableDlg(submitFunction, items) {

    }

    static addRow(table, row) {
        const addedRows = [];
        var rowCnt = table.rows.length;   // table row count.
        var tr = table.insertRow(rowCnt); // the table row.
        tr = table.insertRow(rowCnt);

        var c = 0;
        //for (var c = 0; c < row.length; c++) {
        for (const [key, value] of Object.entries(row)) {
            var td = document.createElement('td'); // table definition.
            td.setAttribute('id', 'table')
            td = tr.insertCell(c);

            if (c == 0) {      // the first column.
            //    // add a button in every new row in the first column.
                var chk = document.createElement('input');

            //    // set input attributes.
                chk.setAttribute('type', 'checkbox');
                chk.setAttribute('id', 'table');
                td.appendChild(chk);
            //    button.setAttribute('value', 'Remove');

            //    // add button's 'onclick' event.
            //    button.setAttribute('onclick', 'removeRow(this)');

            //    td.appendChild(button);
            }
            //else {
                // 2nd, 3rd and 4th column, will have textbox.
            var ele = document.createElement('input');
            ele.style.width = "60px";
            if (key == "color")
                ele.setAttribute('type', 'color');
            else
                ele.setAttribute('type', 'text');
            ele.setAttribute('value', value);
            ele.setAttribute("id", "table")

            td.appendChild(ele);
            td.setAttribute("id", "table")
            c += 1;
            //}
        }
    }

    static modal(title, parent, submitFunction, items, options) {
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
           // close.addEventListener('click', () => this.clearModal(textarea, titleDiv, submitButton, body))


        } else if (options == "table") {
            var table = document.createElement('table'); 
           // table.setAttribute("border", 1);
            table.style.border = "1px solid #000";
            table.setAttribute('id', 'table'); // table id.
            var fields = items[0];
            var tr = table.insertRow(-1);
            tr.setAttribute("id", 'table')
            for (const [key, value] of Object.entries(fields)) {
                var th = document.createElement('th'); // create table headers
                th.setAttribute('id', 'table')
                th.innerHTML = key;//fields[h];
                tr.appendChild(th);
                //var cell = tr.insertCell(count);
                th.innerHTML = key;
            }
            toAttach.push(table);

            for (const [key, value] of Object.entries(items)) {
                this.addRow(table, value);
            ////    var tr = table.insertRow(key);
            ////    var td = document.createElement('td'); // table definition.
            ////    td = tr.insertCell(count);
            ////    //var tr2 = table.insertRow(key);

            ////    //var tr2 = td.insertRow(count);
            ////    for (const [key2, value2] of Object.entries(value)) {
            ////        //var ele = document.createElement("div");
            ////        //var ele = tr2.insertCell(count);
            ////        var inp = document.createElement('input');
            ////        inp.setAttribute('type', 'text');
            ////        inp.setAttribute('value', value2);
            ////        //ele.setAttribute(key2, value2)
            ////        td.appendChild(inp);
            ////        //count += 1;
            ////    }
            ////    count += 1;
            }
            //let form = document.createElement("form");
            //form.id = "annotation";
            //let table = document.createElement("table");
            //for (const i in Object.keys(items)) {
            //    table.addColumn(i);
            //    var row = table.addRow();
            //    //let row = table.insertRow(i);
            //    let fields = items[i];
            //    let idx = 0;
            //    for (const [key, value] of Object.entries(fields)) {
            //        //let col = row.insertCell(idx);
            //        row.setString(i, value)
            //        //col.innerHTML = value;
            //    }
            //    toAttach.push(row);

            //    //for (const j in Object.keys(fields)) {
            //    //    let col = row.insertCell(j)
            //    //}
            //}
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
                    select.setAttribute("id", item.key);
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
                            input.setAttribute("id", value);
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

                    //submitButton.addEventListener("click", () => {
                    //    var data = {};
                    //    for (var i in toAttach) {
                    //        var element = toAttach[i].lastChild;
                    //        if (element.value !== undefined) {
                    //            data[element.id] = element.value;
                    //        }
                    //    }
                    //    submitFunction(data);
                    //    this.clearModal2(modal, overlay, toAttach);
                    //});
                   
                }

            }
            submitButton.addEventListener("click", () => {
                var data = {};
                for (var i in toAttach) {
                    var element = toAttach[i].lastChild;
                    if (element.value !== undefined) {
                        data[element.id] = element.value;
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