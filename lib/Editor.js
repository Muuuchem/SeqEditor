import SequenceEditor from './SequenceEditor.js'
import Interface from './Interface.js'
import { parseXml, arrayMax, createButtons, getDictKeys } from './Tools.js';

export default class Editor {

    constructor(parent, width) {
        this.parent = parent;
        this.setEmptyBondData();
        this.setEmptyAnnotationData();
        this.editors = {};
        this.editorIndices = [];

        this.titles = {};
        this.buildToolbar(parent);
        this.rowCount = width || 6;
    }

    setEmptyAnnotationData() {
        this.annotations = {};
        this.annotationCount = 0;
        this.annotationNotes = {};
        this.annotationList = [];
    }

    setEmptyBondData() {
        this.totalBonds = 0;//never to reset except when readding bonds because this will keep ids unique...
        this.bonds = {};
        this.inner = {};
        this.outer = [];
        this.singlebonds = {};
        this.totalSingle = 0;
        this.addDict = {};
        this.colors = {};
        this.bondslist = [];
        this.brCount = 1;//moved from buildfromfasta since it is now going to add instead of create a new editor
    }

    blankFasta() {
        let blank = '>no title\nACGACG';
        return blank;
    }

    types = {
                disulfidebond: '#FFC832', nitroxy: '#C44174', 'salt bridge': '#0000FF', hydrogen: '#00FF00'
            }

    addAnnotation(data, fromXml) {
        this.annotationCount = this.annotationCount ? this.annotationCount : 0;

        for (let j = 0; j <= Math.max(...this.editorIndices); j++) {
            if (!this.annotations[j])
                this.annotations[j] = {};
            if (!this.annotationNotes[j])
                this.annotationNotes[j] = {};
        }

        let seq = this.chaindict && this.chaindict[data.seq] != null ? this.chaindict[data.seq] : data.seq;
        let annotation = {};
        annotation.seq = seq;
        annotation.color = data.color;
        annotation.firstpos = data.firstpos;
        annotation.secondpos = data.secondpos;
        annotation.notes = data.notes;


        if (!this.checkRange(annotation.firstpos, annotation.secondpos, annotation.seq, null))
            return alert("Error: Out of range. Please check to make sure that all indices are in range!");

        this.annotationList.push(annotation);

        this.annotations[seq][data.firstpos] = ["start", this.annotationCount, data.color];
        this.annotations[seq][data.secondpos] = ["end", this.annotationCount, data.color];
        this.annotationNotes[seq]['!' + this.annotationCount] = data;
        this.colors['!' + this.annotationCount] = data.color;

        this.annotationCount += 1;

        if (!fromXml)//stops from rebuilding too early in setxmll
            this.rebuildEditors();
    }

    addAnnotations(data, fromXml) {
        this.annotations = {};
        this.annotationCount = 0;
        this.annotationList = [];
        this.annotationNotes = {};

        for (let j = 0; j <= Math.max(...this.editorIndices); j++) {
            this.annotations[j] = {};
            this.annotationNotes[j] = {};
        }

        for (let i in data) {
            if (data[i]["Delete?"] == true)
                continue;
            let seq = this.chaindict && this.chaindict[data[i].seq] != null ? this.chaindict[data[i].seq] : data[i].seq;
            let annotation = {};
            annotation.seq = seq;
            annotation.color = data[i].color;
            annotation.firstpos = data[i].firstpos;
            annotation.secondpos = data[i].secondpos;
            annotation.notes = data[i].notes;

            if (!this.checkRange(annotation.firstpos, annotation.secondpos, annotation.seq, null))
                return alert("Error: Out of range. Please check to make sure that all indices are in range!");

            this.annotationList.push(annotation);
            if (!seq && seq != 0)
                return alert("Error: First sequence must be defined");

            this.annotations[seq][data[i].firstpos] = ["start", this.annotationCount, data[i].color];
            this.annotations[seq][data[i].secondpos] = ["end", this.annotationCount, data[i].color];
            this.annotationNotes[seq]['!' + this.annotationCount] = data[i];
            this.colors['!' + this.annotationCount] = data[i].color;

            this.annotationCount += 1;
        }

        if (!fromXml)//stops from rebuilding too early in setxmll
            this.rebuildEditors();
    }

    addBond(firstpos, secondpos, bondtype, seqIndex, secondseqIndex, bondNotes) {

        //if (!this.checkRange(firstpos, secondpos, seqIndex, secondseqIndex))
        //    return alert("Out of Range. Please check to make sure first and second positions are in the range of the selected sequence chain!");

        let bond = {};
        bond.firstpos = firstpos;
        bond.secondpos = secondpos;
        bond.bondtype = bondtype;
        bond.seq = this.titles[seqIndex];
        bond.seqIndex = seqIndex;
        bond.notes = bondNotes;
        let secondsequence = this.titles[secondseqIndex];
        let bondid = (this.totalBonds + 1).toString();
        if (!secondsequence || secondseqIndex == seqIndex) {
            this.bonds[seqIndex][firstpos] = bondid;
            this.bonds[seqIndex][secondpos] = bondid + "b";
            bond.id = bondid;
            this.inner[seqIndex].push(bond);
        } else {
            this.singlebonds[seqIndex][firstpos] = bondid;
            this.singlebonds[secondseqIndex][secondpos] = bondid;
            this.addDict[bondid] = this.totalSingle * 7;
            this.addDict[bondid + "b"] = this.totalSingle * 7;
            this.totalSingle++;

            bond.secondseqIndex = secondseqIndex;
            bond.secondseq = secondsequence;
            bond.id = bondid;
            this.outer.push(bond);
            if (bondtype)
                this.colors[bondid + "b"] = this.types[bondtype];
        }

        if (bondtype)
            this.colors[bondid] = this.types[bondtype];

        this.bondslist.push(bond);
        this.totalBonds++;
    }

    addBonds(data, fromXml) {
        this.bondslist = [];
        this.bonds = {};
        this.colors = {};//key: (bond)id value: color
        this.singlebonds = {};
        this.addDict = {};

        this.totalBonds = 0;
        this.totalSingle = 0;
        this.outer = [];

        this.ensureBondObjects();
        for (let i = 0; i < data.length; i++) {
            let firstseq = this.chaindict && this.chaindict[data[i].seq] != null ? this.chaindict[data[i].seq] : data[i].seq;
            let secondseq = this.chaindict && this.chaindict[data[i].secondseq] != null ? this.chaindict[data[i].secondseq] : data[i].secondseq;
            secondseq = secondseq == "undefined" ? firstseq : secondseq;
            if (firstseq > secondseq)
                this.addBond(data[i].secondpos, data[i].firstpos, data[i].bondtype, secondseq, firstseq, data[i].notes);
            else
                this.addBond(data[i].firstpos, data[i].secondpos, data[i].bondtype, firstseq, secondseq, data[i].notes);
        }

        if (!fromXml)
            this.rebuildEditors();

    }

    addOneBond(data) {
        let firstseq = this.chaindict && this.chaindict[data.seq] != null ? this.chaindict[data.seq] : data.seq;
        let secondseq = this.chaindict && this.chaindict[data.secondseq] != null ? this.chaindict[data.secondseq] : data.secondseq;
        this.ensureBondObjects();
        if (firstseq > secondseq)
            this.addBond(data.second, data.first, data.bondtype, secondseq, firstseq, data.notes);
        else
            this.addBond(data.first, data.second, data.bondtype, firstseq, secondseq, data.notes);

        this.rebuildEditors();

    }

    checkRange(firstpos, secondpos, seqIndex, secondseqIndex) {
        let seq1 = this.editors[seqIndex].getCleanSequence();
        if (parseInt(firstpos) > seq1.length)
            return false;
        if (secondseqIndex || secondseqIndex == 0) {
            let seq2 = this.editors[secondseqIndex].getCleanSequence();
            if (parseInt(secondpos) > seq2.length)
                return false;
        } else {
            if (parseInt(secondpos) > seq1.length)
                return false;
        }
        return true;
    }

    clearBackgrounds(id) {
        this.currentSelected = id;//clears backgrounds of previously selected/highlighted

        for (let k = 0; k < this.editorIndices.length; k++) {
            let index = this.editorIndices[k];
            let num = this.editors[index].num;
            let parentid = "parent" + num;
            if (id == parentid) {
                this.currentId = index;
            } else {
                let parent = document.getElementById(parentid);
                parent.style.background = "";
            }
        }
    }

    createInput(index) {
        let seq = this.editors[index].getCleanSequence();
        let finalStr = "";
        for (let i = 0; i < seq.length; i++) {
            if (this.annotations && this.annotations[index] && this.annotations[index][i + 1]) {

                if (this.annotations[index][i + 1][0] == "start") {
                    finalStr += "!" + this.annotations[index][i + 1][1];
                    if (this.singlebonds[index][i + 1])
                        finalStr += "%" + this.singlebonds[index][i + 1][0] + seq[i] + "%";
                    else
                        finalStr += seq[i];
                } else if (this.annotations[index][i + 1][0] == "end") {
                    if (this.singlebonds[index][i + 1]) {
                        finalStr += "%" + this.singlebonds[index][i + 1][0] + seq[i] + "%!";
                    } else {
                        finalStr += seq[i] + "!";
                        this.colors['!' + this.annotations[index][i + 1][1]] = this.annotations[index][i + 1][2];
                    }
                }

            } else if (this.bonds[index][i + 1]) {
                let myString = this.bonds[index][i + 1];
                myString = myString.replace(/\D/g, '');
                finalStr += "$" + myString + seq[i] + "$";
            }
            else if (this.singlebonds[index][i + 1]) {
                let id = this.singlebonds[index][i + 1];
                id = id.replace(/\D/g, '');
                finalStr += "%" + id + seq[i] + "%";
            }
            else
                finalStr += seq[i];
        }
        return finalStr;
    }

    ensureBondObjects() {
        for (let j = 0; j <= Math.max(...this.editorIndices); j++) {//cycling through and clearing stored bond information from all editor indices that have been used (including removed), so that they can be replaced with the new incoming data (which is an edited version of the old data)...
            let index = this.editorIndices[j];
            if (!this.bonds[index])
                this.bonds[index] = {};
            if (!this.singlebonds[index])
                this.singlebonds[index] = {};
            if (!this.inner[index])
                this.inner[index] = [];
        }
    }

    outerHover() {
        for (let i = 0; i < this.outer.length; i++) {
            let bond = this.outer[i];
            let notes = bond.notes;
            let firstPos = bond.firstpos;
            let secondPos = bond.secondpos;

            let type = bond.bondtype;
            let seq = bond.seqIndex;
            let secondSeq = bond.secondseqIndex;

            let span = document.getElementById("%" + seq + ":" + bond.id);
            let secondSpan = document.getElementById("%" + secondSeq + ":" + bond.id);
            if (!span || !secondSpan)
                continue;

            let title = 'Bond of type ' + type + ' between ' + bond.seq + ' at position ' + firstPos + ' and sequence ' + bond.secondseq + ' at position ' + secondPos + ':' + notes;
            span.title = title;
            secondSpan.title = title;
        }
    }

    drawBonds(removedBonds) {
        let svg = document.getElementById('ColSVG');
        svg.innerHTML = "";
        let connecting = {};

        let past = {};
        for (let l = 0; l < this.editorIndices.length; l++) {
            let index = this.editorIndices[l];
            this.editors[index].moveBoxes(null, this);//moves rectangles encapsulating bonds
            let endpos = this.editors[index].buildSoloBonds(this.addDict, removedBonds, this.outer);
            this.outerHover();
            let solo = this.editors[index].singlearr;
            for (let m = 0; m < solo.length; m++) {
                let id = solo[m].id;
                let id2 = solo[m].id2;
                if (connecting[id]) {
                    let firstend = past[id];
                    let secondend = endpos[id2];
                    this.interConnect(firstend, secondend, this.colors[id]);
                } else {
                    if (endpos[id2]) {
                        connecting[id] = true;
                        past[id] = endpos[id2];
                    }
                }
            }
        }
    }

    handleEdit(num, input) {
        this.inner[num] = [];
        this.outer = [];
        this.bonds[num] = {};
        for (let j = 0; j < this.bondslist.length; j++) {
            let bond = this.bondslist[j];
            if (this.removedBonds[bond.id]) {
                if (bond.secondseqIndex != null) {
                    this.singlebonds[this.bondslist[j].secondseqIndex][this.bondslist[j].secondpos] = "";
                    this.singlebonds[this.bondslist[j].seqIndex][this.bondslist[j].firstpos] = "";
                    this.totalSingle--;
                }
                this.bondslist[j] = {};//do we want to delete entry in bondslist?
            } else if (bond.secondseqIndex == null && bond.seqIndex == num) {
                this.bonds[num][bond.firstpos] = bond.id;
                this.bonds[num][bond.secondpos] = bond.id + "b";
                this.inner[num].push(bond);
            } else if (bond.secondseqIndex == num) {
                this.singlebonds[num][bond.secondpos] = bond.id;
            } else if (bond.seqIndex == num) {
                this.singlebonds[num][bond.firstpos] = bond.id;
            }

            if (bond.seqIndex == num && input == "") {
                this.bondslist[j] = {};
            }

            if (!this.removedBonds[bond.id] && (bond.seqIndex || bond.seqIndex == 0) && (bond.secondseqIndex || bond.secondseqIndex == 0))//we have an outer bond that hasn't been removed
                this.outer.push(bond)
        }

        let editedDict = {};
        editedDict[num] = input;
        this.rebuildEditors(this.removedBonds, editedDict);//this replaces commented out part below, will leave for now incase
        this.removedBonds = {};
    }

    interConnect(first, second, color) {
	    if (!color)
		    color = "rgb(255,0,0);";
	    else
		    color += ";";
	    let svg = document.getElementById('ColSVG');
	    let verticalOff = svg.getBoundingClientRect().top;
	    let horizontalOff = svg.getBoundingClientRect().left;

	    let line = '<line x1="' + Math.floor(Math.abs(first[0] - horizontalOff)) + '" y1="' + (first[1] - verticalOff) + '" x2="' + Math.floor(Math.abs(second[0] - horizontalOff)) + '"y2="' + (second[1] - verticalOff) + '" style="stroke:' + color + 'stroke-width:1;pointer-events:none;overflow:auto" />';

	    svg.innerHTML += line;
    }

    extractInput(sequence, length, seqID) {//maybe add progress wheel while rebuilding because this may take a second
        let newInput = "";
        let n = 0;
        const originalLength = length;
        let newBonds = {};
        let newSingleBonds = {};
        let newAnnotations = {};
        let newAnnotations2 = {};
        let openAnnotation = false;
        while (length >= 0 || current != undefined) {
            let sequenceIndex = (originalLength - length) + 1;
            let span = "";
            let current = sequence[n];

            if (current == '&') {//case where we have &nbsp;
                while (current != ';') {//increment until the end of the nbsp;
                    current = sequence[n];
                    n++;
                }
            } else if (current == '<') {//case where we have a <span> or <br>;
                var spanType;
                var bondid;
                if (sequence[n + 1] == "/") {//we are closing an annotation span
                    newInput += '!';
                    spanType = '!';
                    newAnnotations[sequenceIndex - 1] = ["end", annotationid, this.colors['!' + annotationid]];
                    newAnnotations2[annotationid].end = sequenceIndex - 1;
                }
                while (current != '>') {
                    current = sequence[n];
                    if (current == '$' || current == '%') {//bond
                        spanType = current;
                        bondid = "";
                        while (current != '"') {
                            bondid += current;
                            n++;
                            current = sequence[n];
                            span += current;
                        }
                    } else if (current == '!' && openAnnotation == false) {//annotation
                        spanType = current;
                        n++;
                        current = sequence[n];
                        var annotationid = "";
                        while (current != '"') {
                            annotationid += current;
                            n++;
                            current = sequence[n];
                            span += current;
                        }
                        newInput += '!' + annotationid;
                        newAnnotations[sequenceIndex] = ["start", annotationid, this.colors['!' + annotationid]];
                        newAnnotations2[annotationid] = {};
                        newAnnotations2[annotationid].start = sequenceIndex;
                        newAnnotations2[annotationid].color = this.colors['!' + annotationid];
                        openAnnotation == true;
                        while (current != '>') {
                            n++;
                            current = sequence[n];
                            span += current;
                        }
                    }
                    span += current;
                    n++;
                }
                if (span[1] == "s" && spanType != '!') {
                    let character = sequence[n];
                    current = sequence[n];
                    while (current != '>') {//get out of the closing span  tag
                        current = sequence[n];
                        span += current;
                        n++;
                    }

                    let id = bondid.replace(/.*:/, "");
                    id = id.replace(/\D/g, '');
                    newInput += spanType + id + character + spanType;
                    if (newBonds[id]) {//if exists then we add second pos
                        if (spanType == '$')
                            newBonds[id].end = sequenceIndex;
                        else if (spanType == '%')
                            newSingleBonds[id].pos = sequenceIndex;
                    } else {//if doesn't exist, then we need to create and add first pos
                        if (spanType == '$') {
                            newBonds[id] = {};
                            newBonds[id].start = sequenceIndex;
                        } else if (spanType == '%') {
                            newSingleBonds[id] = sequenceIndex;
                        }
                    }
                    length--;
                }
            } else if (current == " ") {
                n++;
            } else if (current == "\n") {
                n++;
            } else {
                newInput += current ? current : "";
                length--;
                n++;
            }
        }
        this.adjustAnnotations(newAnnotations, newAnnotations2, seqID);
        this.adjustBonds(newBonds, newSingleBonds, seqID);
        return newInput;
    }

    adjustBonds(newBonds, newSingleBonds, seqID) {//compares bonds in bondslist to newly acquired bonds, and edits the bondslist to reflect changes in position
        this.removedBonds = {};

        for (let i = 0; i < this.bondslist.length; i++) {
            let bond = this.bondslist[i];
            let newBond = newBonds[bond.id];
            if (bond.seqIndex == seqID && newBonds[bond.id]) {

                if (newBond.start == null || newBond.end == null) {
                    this.removedBonds[bond.id] = true;
                    this.bonds[seqID][bond.firstpos] = "";
                    this.bonds[seqID][bond.secondpos] = "";
                }
                bond.firstpos = newBond.start;
                bond.secondpos = newBond.end;
            } else if (bond.seqIndex == seqID) {
                if (newSingleBonds[bond.id])
                    bond.firstpos = newSingleBonds[bond.id];
                else {
                    this.removedBonds[bond.id] = true;
                }
                //bond has been deleted, and corresponding bond on other chain needs to be deleted too....
            } else if (bond.secondseqIndex == seqID) {
                if (newSingleBonds[bond.id])
                    bond.secondpos = newSingleBonds[bond.id];
                else
                    this.removedBonds[bond.id] = true;
            }
        }
    }

    adjustAnnotations(newAnnotations, newAnnotations2, seqID) {
        this.annotations[seqID] = {};
        for (let i = 0; i < this.annotationList.length; i++) {
            let currentAn = this.annotationList[i];
            if (newAnnotations2[i]) {
                let firstpos = newAnnotations2[i].start;
                let secondpos = newAnnotations2[i].end;

                this.annotations[seqID][firstpos] = newAnnotations[firstpos];
                this.annotations[seqID][secondpos] = newAnnotations[secondpos];

                this.annotationNotes[seqID]['!' + i].firstpos = firstpos;
                this.annotationNotes[seqID]['!' + i].secondpos = secondpos;

                currentAn.firstpos = firstpos;
                currentAn.secondpos = secondpos;
            }
        }
    }

    deleteChainDlg() {
        let title = this.titles[this.currentId];
        let conformed = confirm("Would you like to delete the chain titled \n '" + title + "'?");
        if (conformed)
            this.deleteChain();
    }

    deleteChain(index) {
        if (this.currentSelected) {
            let keys = getDictKeys(this.editors[this.currentId].singlebonds);
            let removedBonds = {};
            for (let i in keys) {
                let soloid = this.editors[this.currentId].idDict[keys[i]];
                removedBonds[soloid] = true;
            }

            this.removedBonds = removedBonds;
            this.editors[this.currentId].selfDestruct(this.currentSelected);
            this.editors[this.currentId] = {};
            let parent = document.getElementById(this.currentSelected);
            parent.innerHTML = "";
            parent.remove();
            this.buildSVG(this.svgColumn);
            for (let i = 0; i < this.editorIndices.length; i++) {
                if (this.editorIndices[i] == this.currentId)
                    this.editorIndices.splice(i, 1);
            }

            this.handleEdit(this.currentId, "");
        }
    }

    deleteOuterBond(id) {//deletes outer bond from internal data structure when a chain is deleted
        for (let k = 0; k < this.outer.length; k++) {//right now not in use because handle edit is sorting through bondslist, removing deleted, and rebuilding inner and outer dicts...
            if (this.outer[k].seqIndex == id)
                this.outer[k] = {};
            if (this.outer[k].secondseqIndex == id)
                this.outer[k] = {};
        }
    }

    adjustToolbar() {
        let toolbar = document.getElementById("toolbar-main");
        let editor = document.getElementById("editor-full");
        toolbar.width = editor.clientWidth + 1;
        editor.style.border = "1px solid rgb(221, 221, 221)";
        toolbar.style.border = "1px solid rgb(221, 221, 221)";
    }

    buildToolbar(parentid) {
        let me = this;
        let toolbar = document.createElement("table");
        toolbar.id = "toolbar-main";
        let parent = document.getElementById(parentid);

        let buttons = [
            { iconurl: "http://localhost:8080/images/icons8-create-64.png", tooltips: "Clear Editor Chains", onclick: function () { me.newBlankEditor(parent); } },
            { iconurl: "http://localhost:8080/images/icons8-biotech-50.png", tooltips: "Import Fasta Sequence or Chain", onclick: function () { me.createDlg(parent); } },
            { iconurl: "http://localhost:8080/images/bio-add.png", tooltips: "Add Blank Chain", onclick: function () { me.newBlankChain(parent); } },
            { iconurl: "http://localhost:8080/images/icons8-event-log-50.png", tooltips: "Remove Highlighted Chain", onclick: function () { me.deleteChainDlg(); } },
            { iconurl: "http://localhost:8080/images/molecule.png", tooltips: "Add a Bond", onclick: function () { Interface.addBondDlg(me); } },
            { iconurl: "http://localhost:8080/images/chemical.png", tooltips: "Edit/Delete Bonds", onclick: function () { Interface.editBondDlg(me); } },
            { iconurl: "http://localhost:8080/images/icons8-add-property-50.png", tooltips: "Add an Annotation", onclick: function () { Interface.addAnnotationDlg(me); } },
            { iconurl: "http://localhost:8080/images/icons8-outline-50.png", tooltips: "Edit/Delete Annotations", onclick: function () { Interface.editAnnotationDlg(me); } },
            { iconurl: "http://localhost:8080/images/icons8-refresh-52.png", tooltips: "Rerender Bonds and Annotations", onclick: function () { me.rebuildEditors(); } },
            { iconurl: "http://localhost:8080/images/icons8-code-50.png", tooltips: "Get XML", onclick: function () { me.getXml(); } },            
            { iconurl: "http://localhost:8080/images/icons8-code-502.png", tooltips: "Set XML", onclick: function () { me.createDlg(parent, "xml"); } }
            //{ iconurl: , tooltips: "Add Bond Type", onclick: function () { me.addBondTypeDlg(); } }//saving this in case customers or team request that we add some ability to customize bond type because I think it should be at the very least availible for admins (Tony disagree)...
        ];

        parent.appendChild(toolbar);
        let tr = toolbar.insertRow(0);
        let td = tr.insertCell(0);
        toolbar.style.backgroundColor = "rgb(221, 221, 221)";
        let p = document.createElement("p");
        p.innerHTML = 'Biological Sequence Editor - Icons Sourced from Icons8.com and Flaticon.com';
        td.appendChild(p);
        createButtons(td, buttons)
    }

    buildChainEditor(parent, seq) {
        let sequence = seq;
        let fullEditor = document.getElementById("editor-full") || document.createElement("table");//Element that will be a parent to all editor instances

        if (this.editorIndices.length == 0) {
            fullEditor.id = "editor-full";
            parent.appendChild(fullEditor);
            this.buildFromFasta(fullEditor, sequence);
        } else {
            this.addFromFasta(fullEditor, sequence);
        }
    }

    buildEditorFromXml(parent, seq, title) {
        let fullEditor = document.getElementById("editor-full") || document.createElement("table");//Element that will be a parent to all editor instances

        if (this.editorIndices.length == 0) {
            fullEditor.id = "editor-full";
            parent.appendChild(fullEditor);
            this.addChain(fullEditor, seq, title);
        } else {
            this.addChain(fullEditor, seq, title);
        }
    }

    buildFromFasta(table, fasta) {
        let me = this;
        this.titles = {};//key: editorIndex value: title
        this.editors = {};
        this.editorIndices = [];
        let arr = this.getArrayOfFasta(fasta);
        for (let i = 0; i < arr.length; i++) {
            let sequence = this.getSequenceFromFasta(arr[i]);
            sequence = sequence.replace(/\s/g, '');
            let title = this.getTitleFromFasta(arr[i]);
            me.addChain(table, sequence, title, i);
        }

        this.buildSVG(this.svgColumn);
        this.adjustToolbar();
    }

    addFromFasta(table, fasta) {
        let arr = this.getArrayOfFasta(fasta);

        for (let i = 0; i < arr.length; i++) {
            let sequence = this.getSequenceFromFasta(arr[i]);
            sequence = sequence.replace(/\s/g, '');
            let title = this.getTitleFromFasta(arr[i]);
            this.addChain(table, sequence, title);
        }

        this.buildSVG(this.svgColumn);
        this.adjustToolbar();
        this.drawBonds();//formerly known as connectsolo
    }

    addChain(table, sequence, title, i) {
        table = table || document.getElementById("editor-full");

        if (this.editorIndices.length > 0)
            i = isNaN(i) ? Math.max(...this.editorIndices) + 1 : i;
        else if (!i) {
            i = 0;
            let breakRow = table.insertRow(0);
            let breakCell = breakRow.insertCell(0);
            breakCell.innerHTML = '<br>';
            this.brCount = 1;
        }

        let flex = i == 0 ? "none" : i;
        let row = table.insertRow(i + this.brCount);
        let editorRow = row.insertCell(0);

        let div = document.createElement("div");
        div.id = "parent" + i;

        editorRow.appendChild(div);
        if (i == 0) {//inserting a column to the right of the editor to draw connections between chains without causing errors.
            this.svgColumn = row.insertCell(1);
            this.svgColumn.rowSpan = 50;
            this.svgColumn.id = "SVGCol";
        }

        div.style.flex = flex;
        div.style.height = '600px';

        this.titles[i] = title;

        this.editors[i] = new SequenceEditor(div, sequence, title, i, this, this.rowCount)
        this.editorIndices.push(i);
        this.bonds[i] = {};
        this.singlebonds[i] = {};
        let postBrRow = table.insertRow(i + ++this.brCount);
        let postBrCell = postBrRow.insertCell(0);
        postBrCell.innerHTML = '<br>';
        this.addTitleClick(i);
        this.buildSVG(this.svgColumn);
    }

    buildSVG(col) {
        col = col || this.svgColumn;
        col.innerHTML = "";
        let maxAdd = arrayMax(Object.values(this.addDict));
        let add = maxAdd >= 50 ? maxAdd : 50;

        let fullEditor = document.getElementById("editor-full");
        let svg = '<svg id="ColSVG" xmlns="http://www.w3.org/2000/svg" width="' + add + '" height="' + Math.ceil(fullEditor.offsetHeight) + '" style="position:relative;pointer-events:none;"></svg>';

        col.innerHTML = svg;
    }

    createDlg(parent, type) {   
        if (type == "xml")
            Interface.modal("Import Sequence Editor XML Data:", parent, this.setXml.bind(this));
        else
            Interface.modal("Import Fasta Sequence or Chain:", parent, this.buildChainEditor.bind(this));
    }

    getSequenceFromFasta(seq) {//to be used with individual fasta sequence taken from getArrayOfFasta()
        if (seq.search(/\>[^\f\n\r]+[\f\n\r]/) != -1) {
            seq = seq.replace(/\>[^\f\n\r]+[\f\n\r]/, "");
        }
        return seq;
    }

    getArrayOfFasta(seq) {
        let arr = [];
        let matchArray;
        let regex = /\>[^\>]+/g;
        if (seq.search(/\>[^\f\n\r]+[\f\n\r]/) != -1) {
            while (matchArray = regex.exec(seq)) {
                arr.push(matchArray[0]);
            }
        }
        else {
            arr[0] = seq;
        }
        return arr;
    }

    getXml() {
        let xml = "<se>";
        for (let k = 0; k < this.editorIndices.length; k++) {
            let chainXml = "<chain>";
            let index = this.editorIndices[k];
            let title = this.editors[index].getTitle();
            chainXml += "<c>" + title + "</c>";

            let sequence = this.editors[index].getCleanSequence();
            let seq = "<seq s='" + sequence + "' >";

            if (this.annotations[index] != {}) {
                //we need to add each annotation to a custom chain tag
                let annotationString = "";
                let notes = this.annotationNotes[index];
                for (let i in notes) 
                    annotationString += "<a st='" + notes[i].firstpos + "' ed='" + notes[i].secondpos + "' c='" + notes[i].color + "' >" + notes[i].notes + "</a>";
                
                seq += annotationString + "</seq>";
            }

            chainXml += seq;

            if (this.inner[index]) {
                let bondString = "";
                let bonds = this.inner[index];
                for (let j = 0; j < bonds.length; j++) {
                    let note = bonds[j].notes;
                    bondString += "<b st='" + bonds[j].firstpos + "' end='" + bonds[j].secondpos + "' t='" + bonds[j].bondtype + "'>" + (note ? note : "") + "</b>";
                }
                chainXml += bondString;
            }
            chainXml += "</chain>";
            xml += chainXml;     
        }

        if (this.outer) {
            let outerBondString = "";
            for (let m = 0; m < this.outer.length; m++) {
                if (this.outer[m].firstpos && this.outer[m].secondpos && this.outer[m].id) {
                    let note = this.outer[m].notes;
                    outerBondString += "<cb pos1='" + this.outer[m].firstpos + "' seq1='" + this.outer[m].seqIndex + "' seq2='" +
                        this.outer[m].secondseqIndex + "' pos2='" + this.outer[m].secondpos + "' t='" + this.outer[m].bondtype + "' id='" +
                        this.outer[m].id + "'>" + (note ? note : "") + "</cb>";
                }
            }
            xml += outerBondString;
        }

        xml += "</se>";

        Interface.modal("XML Generated from Sequence:", this.parent);
        let modal = document.getElementById("modal");
        modal.children[0].innerHTML = xml;
    }


    setXml(parent, xml) {
        parent = parent || document.getElementById(this.parent);
        let bonds = [];
        let annotations = [];
        let dict = parseXml(xml);
        let chains = dict.childNodes[0].childNodes;
        this.newBlankEditor(parent);
        for (let i = 0; i < chains.length; i++) {
            if (chains[i].localName == "chain") {
                let tags = chains[i].children;
                let title;
                let text;
                for (let j = 0; j < tags.length; j++) {
                    let tagName = tags[j].localName;
                    if (tagName == "c") {//title found
                        title = tags[j].textContent;
                    } else if (tagName == "seq") {//sequence found
                        text = tags[j].attributes.s.value;
                        let children = tags[j].children;
                        if (children.length > 0) {
                            for (let an in children) {
                                let item = children[an];
                                if (item.tagName == "a") {
                                    let annotation = {};
                                    let attributes = item.attributes;
                                    annotation.firstpos = attributes.st.value;
                                    annotation.secondpos = attributes.ed.value;
                                    annotation.type = attributes.t.value;
                                    annotation.color = attributes.c.value;
                                    annotation.notes = item.innerHTML;
                                    annotation.seq = i;
                                    annotations.push(annotation);
                                }
                            }
                        }
                    } else if (tagName == "b") {//inner chain bond
                        let bond = {};
                        let bondAttributes = tags[j].attributes;
                        bond.firstpos = bondAttributes.st.value;
                        bond.secondpos = bondAttributes.end.value;
                        bond.bondtype = bondAttributes.t.value;
                        bond.seq = i;
                        bond.notes = tags[j].innerHTML;
                        bonds.push(bond);
                    }
                }
                //this.newBlankEditor(parent);
                this.buildEditorFromXml(parent, text, title, bonds);
            } else if (chains[i].localName == "cb") {//bond between two sequences
                let connectingBond = {};
                let connectingBondAttributes = chains[i].attributes;
                connectingBond.firstpos = connectingBondAttributes.pos1.value;
                connectingBond.secondpos = connectingBondAttributes.pos2.value;
                connectingBond.seq = connectingBondAttributes.seq1.value;
                connectingBond.secondseq = connectingBondAttributes.seq2.value;
                connectingBond.bondtype = connectingBondAttributes.t ? connectingBondAttributes.t.value : null;
                connectingBond.id = connectingBondAttributes.id.value;
                connectingBond.notes = chains[i].innerHTML;
                bonds.push(connectingBond);
            }        
        }
        if (bonds.length > 0)
            this.addBonds(bonds, true);
        if (annotations.length > 0)
            this.addAnnotations(annotations, true);
        if (bonds.length > 0 || annotations.lenght > 0)
            this.rebuildEditors();    
    }

    addTitleClick(num) {
        let me = this;
        let title = document.getElementById('title' + num);

        title.addEventListener("focusout", function (a, b) {
            this.contentEditable = false;
            let newTitle = this.textContent;
            me.titles[num] = newTitle;
        });

        title.ondblclick = function (a, b) {
            this.contentEditable = true;
            this.focus();
        };
    }

    getTitleFromFasta(sequenceRecord) {
        let fastaTitle = "Untitled";
        if (sequenceRecord.search(/\>[^\f\n\r]+[\f\n\r]/) != -1) {
            fastaTitle = sequenceRecord.match(/\>[^\f\n\r]+[\f\n\r]/, "").toString();
            fastaTitle = fastaTitle.replace(/\>|[\f\n\r]/g, "");
            fastaTitle = fastaTitle.replace(/\s{2,}/g, " ");
            fastaTitle = fastaTitle.replace(/[\<\>]/gi, "");
        }
        return fastaTitle;
    }

    newBlankChain(parent) {
        this.buildChainEditor(parent, this.blankFasta());
    }

    newBlankEditor(parent) {
        this.setEmptyBondData();
        this.setEmptyAnnotationData();
        this.editors = {};
        this.editorIndices = [];
        let fullEditor = document.getElementById("editor-full") || document.createElement("table");//Element that will be a parent to all editor instances
        fullEditor.innerHTML = "";
        fullEditor.id = "editor-full";
        parent.appendChild(fullEditor);
    }

    rebuildEditors(removedBonds, edited) {

        for (let k = 0; k < this.editorIndices.length; k++) {
            let index = this.editorIndices[k];
            let input = edited && edited[index] ? edited[index] : this.createInput(index);
            let notes = this.annotationNotes[index];
            let inner = this.inner[index];
            this.editors[index].buildFullEditor(input, this.colors, notes, inner);
        }

        this.buildSVG(this.svgColumn);
        this.adjustToolbar();
        this.drawBonds(removedBonds);//formerly known as connectsolo
    }

};

       //addBondTypes: function () {
    //    //this.data = this.addbondtypedlg.form.getData();
    //    this.data = this.addbondtypedlg.form.fields.type.jsd.getData();
    //    this.types = {};

    //    for (let i = 0; i < this.data.length; i++) {
    //        if (this.data[i].isnew)
    //            this.types[this.data[i].type] = this.data[i].color;
    //    }

    //    //if (!this.bondTypes[this.data.type])
    //    //    this.bondTypes[this.data.type] = this.data.color;
    //    //else
    //    //    this.bondTypes[this.data.type] = this.data.color;

    //    this.addbondtypedlg.close();
    //},

    //addBondTypeDlg: function () {
    //    let items = {
    //        type: {
    //            label: "Bond Type", type: "table", columns: {
    //                type: { label: "Name", key: "type", type: "input" },
    //                color: { label: "Color", key: "color", type: "color" },
    //            }
    //        }
    //    };

    //    let me = this;
    //    Interface.modal("Add Bond Type", items,  onclick: function () { me.addBondTypes(); }, onchange: (a, b) => {
    //    if (me.bondTypes[a.value] && a.value[0] != "#")
    //    //        this.items.color.field.value = me.bondTypes[a.value];
    //});

    //},