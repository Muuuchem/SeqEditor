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


        } else {
            let form = document.createElement("form");

            for (const i in items) {
                var item = items[i];
                let p = document.createElement("p");
                form.appendChild(p);
                var label = document.createElement("label");
                label.className = "form-label";
                p.appendChild(label);
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
            }
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