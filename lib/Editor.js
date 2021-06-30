import SequenceEditor from './SequenceEditor.js'
import Interface from './Interface.js'

export default class Editor {

    constructor(parent, options) {
        this.parent = parent;
        this.totalBonds = 0;
        this.bonds = {};
        //
        this.inner = {};
        this.outer = {};
        //
        this.singlebonds = {};
        this.annotations = {};
        this.colors = {};
        this.bondslist = [];
        this.titles2 = {};
        this.editors = {};
        this.editorIndices = [];
        this.bondTypes = {};
        this.options = options || {};
        this.annotationNotes = {};

        this.brCount = 1;//moved from buildfromfasta since it is now going to add instead of create a new editor
        
        if (options.width) {
            var width = options.width;
            var count;
            if (width < 776)
                count = 4;
            else if (width < 912)
                count = 5;
            else if (width < 1047)
                count = 6;
            else if (width < 1179)
                count = 7;
            else if (width < 1312)
                count = 8;
            else if (width < 1458)
                count = 9;
            else
                count = 10;
        }
      
        if (!options.buttons) 
            this.options.buttons = [];
        this.buildToolbar(parent);
        this.rowCount = count || 6;
    }

    blankFasta() {
        let blank = '>no title\
\
';
        return blank;
    }

    types = () => {
        return {
            disulfidebond: '#FFC832', nitroxy: '#C44174', 'salt bridge': '#0000FF', hydrogen: '#00FF00'
        }
    }

    addAnnotations(data) {
        this.annotations = {};
        this.annotationCount = 0;
        this.annotationList = [];
        this.annotationNotes = {};
        data = data || this.annotationdlg.form.fields.annotation.jsd.getData();

        for (var j = 0; j <= Math.max(...this.editorIndices); j++) {
            this.annotations[j] = {};
            this.annotationNotes[j] = {};
            //if (data.length == 0) {//solves the problem where the last bond doesn't disappear after all bonds taken away////this is a relic from copying over similar functionality from addBonds... so I am leaving this around and if the same problem shows up again, then I know logic similar to this will likely fix it.
            //    me.editors[j].clearBonds();
        }
        for (var i = 0; i < data.length; i++) {
            var seq = this.chaindict[data[i].seq];
            var annotation = {};
            annotation.seq = seq;
            annotation.color = data[i].color;
            annotation.firstpos = data[i].firstpos;
            annotation.secondpos = data[i].secondpos;
            annotation.notes = data[i].notes;

            if (!this.checkRange(annotation.firstpos, annotation.secondpos, annotation.seq, null))
                console.log("Need to fill in OUT OF RANGE DIALOG!")
                ////return scil.Utils.alert("Error: Out of range. Please check to make sure that all indices are in range!");

            this.annotationList.push(annotation);
            if (!seq && seq != 0)
                this.annotationdlg.close();

            this.annotations[seq][data[i].firstpos] = ["start", this.annotationCount, data[i].color];
            this.annotations[seq][data[i].secondpos] = ["end", this.annotationCount, data[i].color];
            this.annotationNotes[seq]['!' + this.annotationCount] = data[i];
            this.colors['!' + this.annotationCount] = data[i].color;

            this.annotationCount += 1;
        }

        this.rebuildEditors();
        if (this.annotationdlg)
            this.annotationdlg.close();
    }

    addAnnotationDlg() {
        var me = this;
        var chaindict = {};//key:chaintext value: index from this.titles
        var chainname = {};//key: chainname value: chaintext
        if (this.annotationdlg) {
            dojo.destroy(this.annotationdlg.id);/*this.annotationdlg.show();*///Should probably eventually refactor this to render based on data saved in objects similarly to editbonddlg
        }
        var chains = [];
        for (var i = 0; i < this.editorIndices.length; i++) {
            var chaintext = "Chain " + (i + 1);
            chains.push(chaintext);
            chaindict[chaintext] = this.editorIndices[i];//so basically now text corresponds to id of editor
            chainname[this.editorIndices[i]] = chaintext;
        }

        var items = {
            annotation: {
                label: "Annotation", type: "table", columns: {
                    seq: { label: "Sequence", key: "seq", type: "select", items: chains, width: 75 },//change this to "Chain 1", "Chain 2", etc.
                    firstpos: { label: "Start Position", key: "first", type: "input", width: 75 },
                    secondpos: { label: "End Position", key: "second", type: "input", width: 75 },
                    color: { label: "Color", key: "color", type: "color", width: 75 },
                    notes: { label: "Notes", key: "notes", type: "textarea", width: 300 }
                }
            }
        };

        ////this.annotationdlg = scil.Form.createDlgForm("Add/Edit Annotation", items, {
            ////src: scil.App.imgSmall("submit.png"), label: "Confirm Changes", onclick: function () { me.addAnnotations(); }
        ////});
        ////this.annotationdlg.form.fields.annotation.jsd.clear();
        console.log("Need to fill in DLG!")
        if (this.annotationList)
            for (var j = 0; j < this.annotationList.length; j++) {
                var newAnnotation = {};
                var annotation = this.annotationList[j];
                if (chainname[annotation.seq]) {
                    newAnnotation.seq = chainname[annotation.seq];
                    newAnnotation.color = annotation.color;
                    newAnnotation.firstpos = annotation.firstpos;
                    newAnnotation.secondpos = annotation.secondpos;
                    newAnnotation.notes = annotation.notes;
                    this.annotationdlg.form.fields.annotation.jsd.addRow(newAnnotation);
                }
            }

        this.chainname = chainname;
        this.chaindict = chaindict;
    }

    addBonds(data) {
        var me = this;
        this.bondslist = [];
        this.bonds = {};
        this.colors = {};//key: (bond)id value: color
        this.singlebonds = {};
        this.addDict = {};

        data = data || this.editbonddlg.form.items.bonds.field.jsd.getData();

        this.totalBonds = 0;
        this.totalSingle = 0;
        this.outer = [];

        for (var j = 0; j <= Math.max(...this.editorIndices); j++) {
            var index = this.editorIndices[j];
            this.bonds[index] = {};
            this.singlebonds[index] = {};
            this.inner[index] = [];
            if (data.length == 0) {//edge case where bond doesn't dissappear after all bonds taken away!!!
                me.editors[index].clearBonds();
            }
        }

        //for (var i = 0; i < data.length; i++) {
        //    var firstseq = this.chaindict[data[i].seq] || data[i].firstseq;
        //    if (!firstseq && firstseq != 0)
        //        this.editbonddlg.close();
        //    var secondseq = this.chaindict[data[i].secondseq] || data[i].secondseq;          
        //    me.addBond(data[i].firstpos, data[i].secondpos, data[i].bondtype, firstseq, secondseq);              
        //}

        for (var i = 0; i < data.length; i++) {
            //var firstseq = this.chaindict ? this.chainname[data[i].seq] : data[i].firstseq;
            //if (!firstseq && firstseq != 0)
            //    this.editbonddlg.close();
            //var secondseq = this.chaindict ? this.chaindict[data[i].secondseq] : data[i].secondseq;
            //var firstseq = this.chaindict && this.chaindict[data[i].seq] ? this.chaindict[data[i].seq] : data[i].seq;
            //if (!firstseq && firstseq != 0)
            //    this.editbonddlg.close();
            //var secondseq = this.chaindict && this.chaindict[data[i].secondseq] ? this.chaindict[data[i].secondseq] : data[i].secondseq;
            //me.addBond(data[i].firstpos, data[i].secondpos, data[i].bondtype, firstseq, secondseq);
            var firstseq = this.chaindict && this.chaindict[data[i].seq] != null ? this.chaindict[data[i].seq] : data[i].seq;
            if (!firstseq && firstseq != 0)
                this.editbonddlg.close();
            var secondseq = this.chaindict && this.chaindict[data[i].secondseq] != null ? this.chaindict[data[i].secondseq] : data[i].secondseq;
            me.addBond(data[i].firstpos, data[i].secondpos, data[i].bondtype, firstseq, secondseq);
        }

        this.rebuildEditors();

        if (data.length == 0)
            this.editbonddlg.close();
        if (this.editbonddlg)
            this.editbonddlg.close();
    }

    connectSolo(removedBonds) {//2/25/2019 removed bonds seems to be added only in the case that structures are edited and thus the bonds have to be removed...
        var svg = document.getElementById('ColSVG');
        svg.innerHTML = "";
        var connecting = {};
        var heights = {};
        var add = 0;

        var past = {};
        for (var l = 0; l < this.editorIndices.length; l++) {
            var index = this.editorIndices[l];
            this.editors[index].moveBoxes(null, this);//essentially a "buildDualBonds" function, in that it does the same thing as the next function except for bonds within the same chain.
            this.editors[index].buildSoloBonds(this.addDict, removedBonds);
            var solo = this.editors[index].singlearr;//TIME COMPLEXITY BOTTLENECK!!!

            for (var m = 0; m < solo.length; m++) {
                if (connecting[solo[m].id]) {
                    if (heights[solo[m].vert]) {//Checking to see if a bond is to be generated on the same row as another bond... if true, then we would raise the bondline 7 pixels so that it can be distinguished from the other bond on the same line
                        add = 7 * heights[solo[m].vert];
                        heights[solo[m].vert] += 1;
                    }
                    else {
                        add = 0;
                        heights[solo[m].vert] = 1;
                    }
                    var olderadd = past[solo[m].id] || 0;
                    this.interConnect(connecting[solo[m].id], solo[m].vert, solo[m].horiz, this.colors[solo[m].id], olderadd, add, this.addDict[solo[m].id]);
                } else {
                    connecting[solo[m].id] = solo[m].vert;
                    if (heights[solo[m].vert]) {//same as above, but if we find that the first base of a bond is on the same line as another previous bond, then we raise the bond to be drawn by 7 pixels so it will be above the other bond
                        past[solo[m].id] = 7 * heights[solo[m].vert];//since we don't know the second location/base that this base will form a bond with, we must store the starting position in a dictionary so we can be sure to locate it easily after we find the second base and are ready to draw the connecting bond
                        heights[solo[m].vert] += 1;
                    } else {
                        heights[solo[m].vert] = 1;
                    }
                }
            }

        }
    }

    handleEdit(removedBonds, num) {
        if (this.options.onchange != null)
            this.options.onchange(this);
        this.annotations[num] = {};
        for (var j = 0; j < this.bondslist.length; j++) {
            if (removedBonds[this.bondslist[j].id]) {//SOMETHING JSUT ISN"T RIGHT ABOUT ALL OF THIS FUNCTIONALITY PLEASE FIGURE OUT AND REWRITE 3/6/2019 10:44 AM -TYler
                this.singlebonds[this.bondslist[j].secondseqIndex][this.bondslist[j].secondpos] = "";
                this.singlebonds[this.bondslist[j].seqIndex][this.bondslist[j].firstpos] = "";
                //this.bondslist[j] = {};//CURRENTLY NOT GOING TO DELETE ENTRY IN BONDSLIST BECAUSE WE WANT IT TO CONTINUE TO SHOW IN THE LIST SO THE USER CAN EASILY RE-ADD ANY AND ALL REMOVED BONDS....
            }
        }
        this.inner[num] = [];
        this.deleteOuterBond(num);
        this.bonds[num] = 0;

        this.rebuildEditors(removedBonds);//this replaces commented out part below, will leave for now incase

        //var input = this.createInput(num);
        //this.editors[num].buildEditor(input, this.colors, this.annotationNotes[num]);
        //this.editors[num].setParentHeight();
        //this.connectSolo(removedBonds);
    }

    interConnect(first, second, horizontal, color, yadd1, yadd2, add2) {
        console.log(first, second);
        if (!color)
            color = "rgb(255,0,0);";
        else
            color += ";";
        var svg = document.getElementById('ColSVG');
        var verticalOff = Math.ceil(svg.getBoundingClientRect().top);

        var line = '<line x1="' + (0 + add2) + '" y1="' + (first - verticalOff - yadd1) + '" x2="' + (0 + add2) + '" y2="' + (second - verticalOff - yadd2) + '" style="stroke:' + color + 'stroke-width:1;pointer-events:none;overflow:auto" />';
        svg.innerHTML += line;
    }

    checkRange(firstpos, secondpos, seqIndex, secondseqIndex) {
        var seq1 = this.editors[seqIndex].getCleanSequence();
        if (parseInt(firstpos) > seq1.length)
            return false;
        if (secondseqIndex) {
            var seq2 = this.editors[secondseqIndex].getCleanSequence();
            if (parseInt(secondpos) > seq2.length)
                return false;
        } else {
            if (parseInt(secondpos) > seq1.length)
                return false;
        }
        return true;
    }

    addBond(firstpos, secondpos, bondtype, seqIndex, secondseqIndex) {

        if (!this.checkRange(firstpos, secondpos, seqIndex, secondseqIndex))
            console.log("OUT OF RANGE==> NEED TO MAKE DLG FOR IT")
            ////return scil.Utils.alert("Out of Range. Please check to make sure first and second positions are in the range of the selected sequence chain!");

        var bond = {};
        //WE DEFINITELY NEED TO CHECK AT SOME POINT TO MAKE SURE THAT THE BONDS ARE WITHIN THE RANGE OF THE SELECTED CHAIN!!!     //Right now I think they just aren't generated in this case without any clear repercussions
        bond.firstpos = firstpos;
        bond.secondpos = secondpos;
        bond.bondtype = bondtype;
        bond.seq = this.titles2[seqIndex];
        bond.seqIndex = seqIndex;
        var secondsequence = this.titles2[secondseqIndex];
        var currentAdd = 0;
        var bondid = (this.totalBonds + 1).toString();
        if (!secondsequence || secondseqIndex == seqIndex) {
            this.bonds[seqIndex][firstpos] = bondid;
            this.bonds[seqIndex][secondpos] = bondid + "b";
            this.inner[seqIndex].push(bond);
        } else {
            this.singlebonds[seqIndex][firstpos] = bondid;
            this.singlebonds[secondseqIndex][secondpos] = bondid + "b";
            this.addDict[bondid] = this.totalSingle * 7;
            this.addDict[bondid + "b"] = this.totalSingle * 7;
            this.totalSingle++;

            bond.secondseqIndex = secondseqIndex;
            bond.secondseq = secondsequence;
            bond.id = bondid;//////THIS IS WHY SINGLE BONDS END UP WITH IDS BUT THE 
            this.outer.push(bond);
            if (bondtype)
                this.colors[bondid + "b"] = this.types[bondtype];
        }

        if (bondtype)
            this.colors[bondid] = this.types[bondtype];

        this.bondslist.push(bond);
        this.totalBonds++;
    }

    clearBackgrounds(id) {
        this.currentSelected = id;//sets the variable so the rest of the application knows what is currently selected

        for (var k = 0; k < this.editorIndices.length; k++) {
            var index = this.editorIndices[k];
            var num = this.editors[index].num;
            var parentid = "parent" + num;
            if (id == parentid) {
                this.currentId = index;//sets the actual index, of selected, from editorIndices for future reference
            } else {
                var parent = document.getElementById(parentid);
                parent.style.background = "";//Makes sure to clear any background formatting from all other editors when another selection is made.
            }
        }
    }

    createInput(index) {
        var seq = this.editors[index].getCleanSequence();
        var finalStr = "";
        for (var i = 0; i < seq.length; i++) {
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

            } else if (this.bonds[index][i + 1])
                finalStr += "$" + this.bonds[index][i + 1][0] + seq[i] + "$";
            else if (this.singlebonds[index][i + 1]) {
                var id = this.singlebonds[index][i + 1][0];
                finalStr += "%" + id + seq[i] + "%";
            }
            else
                finalStr += seq[i];
        }
        return finalStr;
    }

    deleteChainDlg() {
        var me = this;
        var title = this.titles2[this.currentId];
        //scil.Utils.confirmYes("Would you like to delete the chain titled \n '" + title + "'", function () { me.deleteChain(); });
        console.log("Need to fill in a confirmyes dialog to make sure users want to delete the chain!")
    }

    deleteChain(index) {
        if (this.currentSelected) {
            this.editors[this.currentId].selfDestruct(this.currentSelected);
            this.editors[this.currentId] = {};
            var parent = document.getElementById(this.currentSelected);
            parent.innerHTML = "";
            dojo.destroy(this.currentSelected);
            this.buildSVG(this.svgColumn);
            for (var i = 0; i < this.editorIndices.length; i++) {
                if (this.editorIndices[i] == this.currentId)
                    scil.Utils.removeArrayItem(this.editorIndices, this.currentId);

            }

            for (var j = 0; j < this.bondslist.length; j++) {
                if (this.bondslist[j].seqIndex == this.currentId) {
                    this.singlebonds[this.bondslist[j].secondseqIndex][this.bondslist[j].secondpos] = "";
                }
                else if (this.bondslist[j].secondseqIndex == this.currentId) {
                    this.singlebonds[this.bondslist[j].seqIndex][this.bondslist[j].firstpos] = "";
                }
            }

            this.deleteOuterBond(this.currentId);

            this.titles2[this.currentId] = "";
            this.singlebonds[this.currentId] = {};
            this.annotations[this.currentId] = {};
            this.inner[this.currentID] = [];
        }
        this.rebuildEditors();
    }

    deleteOuterBond(id) {
        for (var k = 0; k < this.outer.length; k++) {
            if (this.outer[k].seqIndex == id)
                this.outer[k] = {};
            if (this.outer[k].secondseqIndex == id)
                this.outer[k] = {};
        }
    }

    adjustToolbar() {
        var toolbar = document.getElementById("toolbar-main");
        var editor = document.getElementById("editor-full");
        toolbar.width = editor.clientWidth + 1;
        editor.style.border = "1px solid rgb(221, 221, 221)";
        toolbar.style.border = "1px solid rgb(221, 221, 221)";
    }

    buildToolbar(parentid) {
        var me = this;
        var toolbar = document.createElement("table");
        toolbar.id = "toolbar-main";
        var parent = document.getElementById(parentid);

        var buttons = [
            { iconurl: "http://localhost:8080/images/file.png", tooltips: "Clear Editor Chains", onclick: function () { me.newBlankEditor(parent); } },
            //"-",
            { iconurl: "http://localhost:8080/images/listadd.png", tooltips: "Import Fasta Sequence or Chain", onclick: function () { me.createDlg(parent); } },
            //"-",
            { iconurl: "http://localhost:8080/images/addchain.png", tooltips: "Add Blank Chain", onclick: function () { me.newBlankChain(parent); } },
            { iconurl: "http://localhost:8080/images/removechain.png", tooltips: "Remove Chain", onclick: function () { me.deleteChainDlg(); } },
            //"-",
            { iconurl: "http://localhost:8080/images/smallmolecule.png", tooltips: "Add/Edit Bonds", onclick: function () { me.editBondDlg(); } },
            { iconurl: "http://localhost:8080/images/addannotation.png", tooltips: "Add/Edit Annotations", onclick: function () { me.addAnnotationDlg(); } },
            //"-",
            { iconurl: "http://localhost:8080/images/doc.png", tooltips: "Get XML", onclick: function () { me.getXml(); } },
            { iconurl: "http://localhost:8080/images/addnote.png", tooltips: "Set XML", onclick: function () { me.createDlg(parent, "xml"); } }
            //{ iconurl: scil.App.imgSmall("addnote.png"), tooltips: "Add Bond Type", onclick: function () { me.addBondTypeDlg(); } }//saving this in case customers or team request that we add some ability to customize bond type because I think it should be at the very least availible for admins (Tony disagree)...
        ];

        buttons = buttons.concat(this.options.buttons);

        parent.appendChild(toolbar);
        var tr = toolbar.insertRow(0);
        var td = tr.insertCell(0);
        toolbar.style.backgroundColor = "rgb(221, 221, 221)";
        this.createButtons(td, buttons)
    }

    buildEditor(parent, seq) {
        var sequence = seq || this.fastadlg.form.fields.fasta.value;
        var fullEditor = document.getElementById("editor-full") || document.createElement("table");//Element that will be a parent to all editor instances

        if (this.options.onchange != null)
            this.options.onchange(this);

        if (this.editorIndices.length == 0) {
            fullEditor.id = "editor-full";
            parent.appendChild(fullEditor);
            this.buildFromFasta(fullEditor, sequence);
        } else {
            this.addFromFasta(fullEditor, sequence);
        }
        if (this.fastadlg)
            this.fastadlg.hide();
    }

    buildEditorFromXml(parent, seq, title, bonds) {
        var fullEditor = document.getElementById("editor-full") || document.createElement("table");//Element that will be a parent to all editor instances

        if (this.options.onchange != null)
            this.options.onchange(this);

        if (this.editorIndices.length == 0) {
            fullEditor.id = "editor-full";
            parent.appendChild(fullEditor);
            this.buildFromXml(fullEditor, seq, title);
        } else {
            this.buildFromXml(fullEditor, seq, title);
        }
        if (this.fastadlg)
            this.fastadlg.hide();
    }

    buildFromFasta(table, fasta) {//pre-refactor
        var me = this;
        this.titles2 = {};//key: editorIndex value: title
        this.editors = {};
        this.editorIndices = [];
        var arr = this.getArrayOfFasta(fasta);
        for (var i = 0; i < arr.length; i++) {
            var sequence = this.getSequenceFromFasta(arr[i]);
            sequence = sequence.replace(/\s/g, '');
            var title = this.getTitleFromFasta(arr[i]);
            me.addChain(table, sequence, title, i);
        }

        this.buildSVG(this.svgColumn);
        this.adjustToolbar();
    }

    buildFromXml(table, seq, title) {
        this.addChain(table, seq, title);
        this.buildSVG(this.svgColumn);
        this.adjustToolbar();
    }

    createButtons(parent, buttons) {
        for (const value of buttons) {
            console.log(value)
            const button = document.createElement("button");
            button.title = value.tooltips;

            parent.appendChild(button);

            button.addEventListener("click", value.onclick);
            button.innerHTML = '<img src="' + value.iconurl + '" />';
        }
    }

    addFromFasta(table, fasta) {
        var me = this;
        var arr = this.getArrayOfFasta(fasta);

        for (var i = 0; i < arr.length; i++) {
            var sequence = this.getSequenceFromFasta(arr[i]);
            sequence = sequence.replace(/\s/g, '');
            var title = this.getTitleFromFasta(arr[i]);
            me.addChain(table, sequence, title);
        }

        this.buildSVG(this.svgColumn);
        this.adjustToolbar();
        this.connectSolo();
    }

    addChain(table, sequence, title, i) {
        table = table || document.getElementById("editor-full");

        if (this.editorIndices.length > 0)
            i = isNaN(i) ? Math.max(...this.editorIndices) + 1 : i;
        else if (!i) {
            i = 0;
            var breakRow = table.insertRow(0);
            var breakCell = breakRow.insertCell(0);
            breakCell.innerHTML = '<br>';
            this.brCount = 1;
        }

        var flex = i == 0 ? "none" : i;
        var row = table.insertRow(i + this.brCount);
        var editorRow = row.insertCell(0);

        var div = document.createElement("div");
        div.id = "parent" + i;

        editorRow.appendChild(div);
        //Long side column for bonds across chains so we don't have a big mess crossing through other chains
        if (i == 0) {
            this.svgColumn = row.insertCell(1);
            this.svgColumn.rowSpan = 50;
            this.svgColumn.id = "SVGCol";
        }

        div.style.flex = flex;
        div.style.height = '600px';

        this.titles2[i] = title;

        if (!Object.create) {
            Object.create = (function () {
                var F = function () { };

                return function (o) {
                    if (arguments.length !== 1) {
                        throw new Error('Object.create implementation only accepts one parameter.');
                    }
                    console.log("IE 8: Object.create() custom function used!!!");
                    F.prototype = o;
                    return new F();
                };
            }());
        }
        ////var editor = Object.create(scil.SDMS.SequenceEditor2);//seems to be supported in IE (Tommy said if works in IE will be ok but check with Tony anyways);
        var editor = Object.create(SequenceEditor);

        //this.editors[i] = editor.init(div, sequence, title, i, this, this.rowCount);
        this.editors[i] = new SequenceEditor(div, sequence, title, i, this, this.rowCount)
        this.editorIndices.push(i);
        this.bonds[i] = {};
        this.singlebonds[i] = {};
        var postBrRow = table.insertRow(i + ++this.brCount);
        var postBrCell = postBrRow.insertCell(0);
        postBrCell.innerHTML = '<br>';
        this.addTitleClick(i);
        this.buildSVG(this.svgColumn);
    }


    buildSVG(col) {
        col = col || this.svgColumn;
        col.innerHTML = "";
        var fullEditor = document.getElementById("editor-full");
        var svg = '<svg id="ColSVG" xmlns="http://www.w3.org/2000/svg" width="50" height="' + Math.ceil(fullEditor.offsetHeight) + '" style="position:relative;pointer-events:none;"></svg>';

        col.innerHTML = svg;
    }

    editBondDlg(parent) {
        var me = this;
        var chains = [];
        var chaindict = {};//key:chaintext value: index from editorIndices
        var chainname = {};//key: chainname value: chaintext

        //chaindict key: chaintext // value: editorIndex
        for (var i = 0; i < this.editorIndices.length; i++) {
            var chaintext = "Chain " + (i + 1);
            chains.push(chaintext);
            chaindict[chaintext] = this.editorIndices[i];
            chainname[this.editorIndices[i]] = chaintext;
        }

        var types = this.types ? scil.Utils.getDictKeys(this.types) : [];

        if (this.editbonddlg)
            dojo.destroy(this.editbonddlg.id);
        
        var items = {
            bonds: {
                label: "Bonds", type: "table", columns: {
                    seq: { label: "First Sequence", key: "seq", type: "select", items: chains, width: 100 },
                    firstpos: { label: "First Position", key: "first", type: "input", width: 100 },                 
                    secondseq: { label: "Second Sequence", key: "secondseq", type: "select", items: chains, width: 100 },
                    secondpos: { label: "Second Position", key: "second", type: "input", width: 100 },
                    bondtype: { label: "Bond Type", key: "bondtype", type: "select", items: types }
                }
            }
        };

        this.editbonddlg = scil.Form.createDlgForm("Add/Edit Bonds", items, { src: scil.App.imgSmall("submit.png"), label: "Confirm Changes", onclick: function (a) { me.addBonds(); } });
        this.editbonddlg.form.fields.bonds.jsd.clear();
        for (var j = 0; j < this.bondslist.length; j++) {
            var newBond = {};
            var bond = this.bondslist[j];
            newBond.firstpos = bond.firstpos;
            newBond.secondpos = bond.secondpos;
            newBond.bondtype = bond.bondtype;

            if (chainname[this.bondslist[j].seqIndex])
                newBond.seq = chainname[this.bondslist[j].seqIndex];
            if (chainname[this.bondslist[j].secondseqIndex])
                newBond.secondseq = chainname[this.bondslist[j].secondseqIndex];

            if (newBond.firstpos)
                this.editbonddlg.form.fields.bonds.jsd.addRow(newBond);
        }
        this.chainname = chainname;
        this.chaindict = chaindict;
    }

    createDlg(parent, type) {//refactoring so that this will work for both fasta and xml       
        var me = this;
        var items = {
            fasta: { label: "Fasta", type: "textarea", width: 550, height: 200 }
        };
        console.log("CREATING DLG")
        if (type == "xml") {
            items = {
                xml: { label: "XML", type: "textarea", width: 550, height: 200 }
            };

            //this.fastadlg = scil.Form.createDlgForm("Import Sequence Editor XML Data", items, { src: scil.App.imgSmall("submit.png"), label: "Create", onclick: function () { me.setXml(parent); } });

            //this.fastadlg = Interface.createInputDialog("Import Sequence Editor XML Data", items, { parent: parent, onclick: function () { me.setXml(parent); } });
            this.fastadlg = Interface.modal("Import Sequence Editor XML Data:", parent, this.setXml.bind(me))
            //this.fastadlg.form.fields.xml.spellcheck = false;
        } else {          
            this.fastadlg = Interface.modal("Import Fasta Sequence or Chain:", parent, this.buildEditor.bind(me))//("Import Fasta Sequence or Chain", items, { parent: parent, onclick: function () { me.buildEditor(parent); } });
            //this.fastadlg.form.fields.fasta.spellcheck = false;
        }      
    }

    getSequenceFromFasta(seq) {//to be used with individual fasta sequence taken from getArrayOfFasta()
        if (seq.search(/\>[^\f\n\r]+[\f\n\r]/) != -1) {
            seq = seq.replace(/\>[^\f\n\r]+[\f\n\r]/, "");
        }
        return seq;//be sure to refactor thuroughly
    }

    getArrayOfFasta(seq) {//be sure to refactor thuroughly
        var arr = [];
        var matchArray;
        var regex = /\>[^\>]+/g;
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
        var xml = "<se>";
        for (var k = 0; k < this.editorIndices.length; k++) {
            var chainXml = "<chain>";
            var index = this.editorIndices[k];
            var title = this.editors[index].getTitle();
            chainXml += "<c>" + title + "</c>";

            var sequence = this.editors[index].getCleanSequence();
            var seq = "<seq s='" + sequence + "' >";

            if (this.annotations[index] != {}) {
                //we need to add each annotation to a custom chain tag
                var annotationString = "";
                var notes = this.annotationNotes[index];
                for (var i in notes) 
                    annotationString += "<a st='" + notes[i].firstpos + "' ed='" + notes[i].secondpos + "' c='" + notes[i].color + "' t='b'>" + notes[i].notes + "</a>";//we can add types later but for now all types are t='b'
                
                seq += annotationString + "</seq>";
            }

            chainXml += seq;

            if (this.inner[index]) {
                var bondString = "";
                var bonds = this.inner[index];
                for (var j = 0; j < bonds.length; j++)
                    bondString += "<b st='" + bonds[j].firstpos + "' end='" + bonds[j].secondpos + "' t='" + bonds[j].bondtype + "'></b>";
                
                chainXml += bondString;
            }
            chainXml += "</chain>";
            xml += chainXml;     
        }

        if (this.outer) {
            let outerBondString = "";
            for (var m = 0; m < this.outer.length; m++) {
                if (this.outer[m].firstpos && this.outer[m].secondpos && this.outer[m].id)
                    outerBondString += "<cb pos1='" + this.outer[m].firstpos + "' seq1='" + this.outer[m].seqIndex + "' seq2='" + this.outer[m].secondseqIndex + "' pos2='" + this.outer[m].secondpos + "' t='" + this.outer[m].bondtype + "' id='" + this.outer[m].id + "'></cb>";
            }
            xml += outerBondString;
        }

        xml += "</se>";

        var div = document.createElement("div");
        var txt = document.createElement("textarea");
        txt.style = 

        //var div = scil.Utils.createElement(null, "div");
        //var txt = scil.Utils.createElement(div, "textarea", null, { width: "580px", height: "400px" });
        //var btn = scil.Utils.createElement(
        //    scil.Utils.createElement(div, "div", null, { textAlign: "center" }),
        //    "button", "OK", { width: "200px" });
        //var dlg = new scilligence.Dialog("XML Generated from Sequence", div);
        dojo.connect(btn, "onclick", function (e) { dlg.hide(); });
        txt.innerHTML = xml;
        dlg.show();
    }


    setXml(parent, xml) {
        parent = parent || document.getElementById(this.parent);
        xml = xml || this.fastadlg.form.fields.xml.value;
        this.newBlankEditor(parent);
        var bonds = [];
        var annotations = [];
        var dict = scil.Utils.parseXml(xml);
        var chains = dict.childNodes[0].childNodes;
        for (var i = 0; i < chains.length; i++) {
            if (chains[i].localName == "chain") {
                var tags = chains[i].children;
                var title;
                var text;
                for (var j = 0; j < tags.length; j++) {
                    var tagName = tags[j].localName;
                    if (tagName == "c") //we have a title/caption with s="sequence"
                        title = tags[j].textContent;
                     else if (tagName == "seq") 
                        text = tags[j].attributes.s.value;
                     else if (tagName == "b") {
                        var bond = {};
                        var bondAttributes = tags[j].attributes;
                        bond.firstpos = bondAttributes.st.value;
                        bond.secondpos = bondAttributes.end.value;
                        bond.bondtype = bondAttributes.t.value;
                        bond.seq = i;
                        bonds.push(bond);
                    } else if (tagName == "a") {
                        var annotation = {};
                        var attributes = tags[j].attributes;
                        annotation.start = attributes.st;
                        annotation.start = attributes.st;
                        annotation.end = attributes.ed;
                        annotation.type = attributes.t;
                        annotation.color = attributes.c;
                        annotation.notes = tags[j].innerHTML;
                        annotation.seq = i;//?
                        annotations.push(annotation);
                    }
                }
                //If at least text was found, then we have to add a chain to represent this... however we may need to build new logic as the buildfromfasta method usually calls addchain
                this.buildEditorFromXml(parent, text, title, bond);
            } else if (chains[i].localName == "cb") {//thus we have a connecting bond
                var connectingBond = {};
                var connectingBondAttributes = chains[i].attributes;
                connectingBond.firstpos = connectingBondAttributes.pos1.value;
                connectingBond.secondpos = connectingBondAttributes.pos2.value;
                connectingBond.seq = connectingBondAttributes.seq1.value;
                connectingBond.secondseq = connectingBondAttributes.seq2.value;
                connectingBond.bondtype = connectingBondAttributes.t ? connectingBondAttributes.t.value : null;
                connectingBond.id = connectingBondAttributes.id.value;
                bonds.push(connectingBond);
            }        
        }
        if (bonds.length > 0)
            this.addBonds(bonds);
    }

    addTitleClick(num) {
        var me = this;
        var title = document.getElementById('title' + num);

        title.addEventListener("focusout", function (a, b) {
            if (me.options.onchange != null)
                me.options.onchange(me);
            this.contentEditable = false;
            var newTitle = this.textContent;
            me.titles2[num] = newTitle;
        });

        title.ondblclick = function (a, b) {
            this.contentEditable = true;
            this.focus();
        };
    }

    getTitleFromFasta(sequenceRecord) {//be sure to refactor thuroughly
        var fastaTitle = "Untitled";
        if (sequenceRecord.search(/\>[^\f\n\r]+[\f\n\r]/) != -1) {
            fastaTitle = sequenceRecord.match(/\>[^\f\n\r]+[\f\n\r]/, "").toString();
            fastaTitle = fastaTitle.replace(/\>|[\f\n\r]/g, "");
            fastaTitle = fastaTitle.replace(/\s{2,}/g, " ");
            fastaTitle = fastaTitle.replace(/[\<\>]/gi, "");
        }
        return fastaTitle;
    }

    newBlankChain(parent) {
        console.log(this.blankFasta())
        this.buildEditor(parent, this.blankFasta() + '\nAAA');
    }

    newBlankEditor(parent) {
        this.editors = {};
        this.titles2 = {};
        this.totalBonds = 0;
        this.bonds = {};
        this.singlebonds = {};
        this.annotations = {};
        this.colors = {};
        this.bondslist = [];
        this.bondtypes = {};
        this.editorIndices = [];
        var fullEditor = document.getElementById("editor-full") || document.createElement("table");//Element that will be a parent to all editor instances
        fullEditor.innerHTML = "";
        fullEditor.id = "editor-full";
        parent.appendChild(fullEditor);
        if (this.options.onchange != null)
            this.options.onchange(this);
    }

    rebuildEditors(removedBonds) {
        if (this.options.onchange != null)
            this.options.onchange(this);

        for (var k = 0; k < this.editorIndices.length; k++) {
            var index = this.editorIndices[k];
            var input = this.createInput(index);
            var notes = this.annotationNotes[index];
            this.editors[index].buildEditor(input, this.colors, notes);
        }
        this.connectSolo(removedBonds);
    }
};

       //addBondTypes: function () {
    //    //this.data = this.addbondtypedlg.form.getData();
    //    this.data = this.addbondtypedlg.form.fields.type.jsd.getData();
    //    this.types = {};

    //    for (var i = 0; i < this.data.length; i++) {
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

    //    var items = {
    //        type: {
    //            label: "Bond Type", type: "table", columns: {
    //                type: { label: "Name", key: "type", type: "input" },
    //                color: { label: "Color", key: "color", type: "color" },
    //            }
    //        }
    //    };

    //    var me = this;
    //    if (!this.addbondtypedlg)
    //        this.addbondtypedlg = scil.Form.createDlgForm("Add Bond Type", items, { src: scil.App.imgSmall("submit.png"), label: "Create", onclick: function () { me.addBondTypes(); } });
    //    else
    //        this.addbondtypedlg.show();
    //    //this.addbondtypedlg.form.onchange = function (a, b) {
    //    //    if (me.bondTypes[a.value] && a.value[0] != "#")
    //    //        this.items.color.field.value = me.bondTypes[a.value];
    //    //}

    //    //if (this.data) {
    //    //    this.addbondtypedlg.form.setData(this.data);
    //    //}
    //},