export default class Interface {
    static init() {
        console.log("new class constructed !")
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
        //this.modaloff('modal'); // hide
    }

    static modal(title, parent, submitFunction) {
        let el = document.getElementById("modal");
        let body = document.querySelector("body");
        let bg = document.createElement("div");
        bg.className = "modal-js-overlay";

        let titleDiv = document.createElement("title");
        titleDiv.className = "modal-title"
        titleDiv.innerHTML = title;

        let textarea = document.createElement("textarea");
        textarea.className = "text-area";

        let submitButton = document.createElement("button");
        submitButton.className = "modal-submit"
        submitButton.innerHTML = "Submit"

        body.appendChild(bg);
        el.appendChild(titleDiv);
        el.appendChild(textarea);
        el.appendChild(submitButton);

        el.style.display = 'grid';

        let close = document.createElement("button");
        close.className = "modal-js-close";
        close.innerHTML = "x";
        el.appendChild(close)



        submitButton.addEventListener("click", () => {
            console.log(textarea.value);
            submitFunction(parent, textarea.value);
            this.clearModal(textarea, titleDiv, submitButton, body);
        });

        close.addEventListener('click', () => this.clearModal(textarea, titleDiv, submitButton, body))
    }

    static clearModal(textarea, titleDiv, submitButton, body) {
        let modal = document.getElementById("modal");
        let overlay = body.querySelector(".modal-js-overlay");
        let closebtn = modal.querySelector(".modal-js-close");
        body.removeChild(overlay);

        
        modal.classList.remove('on');
        modal.removeChild(closebtn);
        modal.removeChild(textarea);
        modal.removeChild(titleDiv)
        modal.removeChild(submitButton)
    }

    static  modaloff(id) {
        let body = document.querySelector("body");
        //let el = document.querySelector(id);
        let el = document.getElementById(id);
        let overlay = body.querySelector(".modal-js-overlay");
        console.log(el)
        el.classList.remove('on');
        body.removeChild(overlay);
        el.style.display = "None"
        el.removeChild('textarea')
    }
}