import SequenceEditor from './SequenceEditor.js'
import Interface from './Interface.js'
import { parseXml } from './Tools.js';

export default class Editor {

    constructor(parent, options) {
        this.parent = parent;
        this.totalBonds = 0;//never to reset except when readding bonds because this will keep ids unique...
        this.bonds = {};
        //
        this.inner = {};
        this.outer = [];
        //
        this.singlebonds = {};
        this.totalSingle = 0;
        this.addDict = {};
        this.annotations = {};
        this.colors = {};
        this.bondslist = [];
        this.titles = {};
        this.editors = {};
        this.editorIndices = [];
        //this.bondTypes = {};
        this.options = options || {};
        this.annotationNotes = {};
        this.annotationList = [];

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

    //old constructor (few changes delete soon)
    //    this.parent = parent;
    //    this.totalBonds = 0;
    //    this.bonds = {};
    //    //
    //    this.inner = {};
    //    this.outer = {};
    //    //
    //    this.singlebonds = {};
    //    this.annotations = {};
    //    this.colors = {};
    //    this.bondslist = [];
    //    this.titles = {};
    //    this.editors = {};
    //    this.editorIndices = [];
    //    this.bondTypes = {};
    //    this.options = options || {};
    //    this.annotationNotes = {};

    //    this.brCount = 1;//moved from buildfromfasta since it is now going to add instead of create a new editor
        
    //    if (options.width) {
    //        var width = options.width;
    //        var count;
    //        if (width < 776)
    //            count = 4;
    //        else if (width < 912)
    //            count = 5;
    //        else if (width < 1047)
    //            count = 6;
    //        else if (width < 1179)
    //            count = 7;
    //        else if (width < 1312)
    //            count = 8;
    //        else if (width < 1458)
    //            count = 9;
    //        else
    //            count = 10;
    //    }
      
    //    if (!options.buttons) 
    //        this.options.buttons = [];
    //    this.buildToolbar(parent);
    //    this.rowCount = count || 6;
    //}

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

    addAnnotations(data, fromXml) {
        this.annotations = {};
        this.annotationCount = 0;
        this.annotationList = [];
        this.annotationNotes = {};

        for (var j = 0; j <= Math.max(...this.editorIndices); j++) {
            this.annotations[j] = {};
            this.annotationNotes[j] = {};
        }
        for (var i = 0; i < data.length; i++) {
            var seq = this.chaindict && this.chaindict[data[i].seq] != null ? this.chaindict[data[i].seq] : data[i].seq;
            var annotation = {};
            annotation.seq = seq;
            annotation.color = data[i].color;
            annotation.firstpos = data[i].firstpos;
            annotation.secondpos = data[i].secondpos;
            annotation.notes = data[i].notes;

            if (!this.checkRange(annotation.firstpos, annotation.secondpos, annotation.seq, null))
                return alert("Error: Out of range. Please check to make sure that all indices are in range!");

            this.annotationList.push(annotation);
            if (!seq && seq != 0)
                this.annotationdlg.close();

            this.annotations[seq][data[i].firstpos] = ["start", this.annotationCount, data[i].color];
            this.annotations[seq][data[i].secondpos] = ["end", this.annotationCount, data[i].color];
            this.annotationNotes[seq]['!' + this.annotationCount] = data[i];
            this.colors['!' + this.annotationCount] = data[i].color;

            this.annotationCount += 1;
        }

        if (!fromXml)//stops from rebuilding too early in setxmll
            this.rebuildEditors();
        if (this.annotationdlg)
            this.annotationdlg.close();
    }

    //addAnnotations(data) {
    //    this.annotations = {};
    //    this.annotationCount = 0;
    //    this.annotationList = [];
    //    this.annotationNotes = {};
    //    data = data || this.annotationdlg.form.fields.annotation.jsd.getData();

    //    for (var j = 0; j <= Math.max(...this.editorIndices); j++) {
    //        this.annotations[j] = {};
    //        this.annotationNotes[j] = {};
    //        //if (data.length == 0) {//solves the problem where the last bond doesn't disappear after all bonds taken away////this is a relic from copying over similar functionality from addBonds... so I am leaving this around and if the same problem shows up again, then I know logic similar to this will likely fix it.
    //        //    me.editors[j].clearBonds();
    //    }
    //    for (var i = 0; i < data.length; i++) {
    //        var seq = this.chaindict[data[i].seq];
    //        var annotation = {};
    //        annotation.seq = seq;
    //        annotation.color = data[i].color;
    //        annotation.firstpos = data[i].firstpos;
    //        annotation.secondpos = data[i].secondpos;
    //        annotation.notes = data[i].notes;

    //        if (!this.checkRange(annotation.firstpos, annotation.secondpos, annotation.seq, null))
    //            console.log("Need to fill in OUT OF RANGE DIALOG!")
    //            ////return scil.Utils.alert("Error: Out of range. Please check to make sure that all indices are in range!");

    //        this.annotationList.push(annotation);
    //        if (!seq && seq != 0)
    //            this.annotationdlg.close();

    //        this.annotations[seq][data[i].firstpos] = ["start", this.annotationCount, data[i].color];
    //        this.annotations[seq][data[i].secondpos] = ["end", this.annotationCount, data[i].color];
    //        this.annotationNotes[seq]['!' + this.annotationCount] = data[i];
    //        this.colors['!' + this.annotationCount] = data[i].color;

    //        this.annotationCount += 1;
    //    }

    //    this.rebuildEditors();
    //    if (this.annotationdlg)
    //        this.annotationdlg.close();
    //}

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

        //var items = {
        //    annotation: {
        //        label: "Annotation", type: "table", columns: {
        //            seq: { label: "Sequence", key: "seq", type: "select", items: chains, width: 75 },//change this to "Chain 1", "Chain 2", etc.
        //            firstpos: { label: "Start Position", key: "first", type: "input", width: 75 },
        //            secondpos: { label: "End Position", key: "second", type: "input", width: 75 },
        //            color: { label: "Color", key: "color", type: "color", width: 75 },
        //            notes: { label: "Notes", key: "notes", type: "input", width: 300 }
        //        }
        //    }
        //};
        const items = {
            //label: "Annotation", type: "table", columns: {
            seq: { label: "Sequence", key: "seq", type: "select", items: chains, width: 75 },//change this to "Chain 1", "Chain 2", etc.
            firstpos: { label: "Start Position", key: "firstpos", type: "number", width: 75 },
            secondpos: { label: "End Position", key: "secondpos", type: "number", width: 75 },
            color: { label: "Color", key: "color", type: "color", width: 75 },
            notes: { label: "Notes", key: "notes", type: "textarea", width: 300, height: 200 }
        };
        //};

        this.annotationdlg = Interface.modal("Add/Edit Annotation", this.parent, this.addAnnotations.bind(me), items)
        //**//this.annotationdlg = scil.Form.createDlgForm("Add/Edit Annotation", items, {
            //src: scil.App.imgSmall("submit.png"), label: "Confirm Changes", onclick: function () { me.addAnnotations(); }
        //});
        //this.annotationdlg.form.fields.annotation.jsd.clear();
        if (this.annotationList.length > 0)
            for (var j = 0; j < this.annotationList.length; j++) {
                var newAnnotation = {};
                var annotation = this.annotationList[j];
                if (chainname[annotation.seq]) {
                    newAnnotation.seq = chainname[annotation.seq];
                    newAnnotation.color = annotation.color;
                    newAnnotation.firstpos = annotation.firstpos;
                    newAnnotation.secondpos = annotation.secondpos;
                    newAnnotation.notes = annotation.notes;
                    //this.annotationdlg.form.fields.annotation.jsd.addRow(newAnnotation);
                    //**//don't forget to fix the annotation dlg not working
                    //This is the part where I added the annotations to the annotation dlg, which I used to keep up with it
                }
            }

        this.chainname = chainname;
        this.chaindict = chaindict;
    }

    //old version
    //addAnnotationDlg() {
    //    var me = this;
    //    var chaindict = {};//key:chaintext value: index from this.titles
    //    var chainname = {};//key: chainname value: chaintext
    //    if (this.annotationdlg) {
    //        dojo.destroy(this.annotationdlg.id);/*this.annotationdlg.show();*///Should probably eventually refactor this to render based on data saved in objects similarly to editbonddlg
    //    }
    //    var chains = [];
    //    for (var i = 0; i < this.editorIndices.length; i++) {
    //        var chaintext = "Chain " + (i + 1);
    //        chains.push(chaintext);
    //        chaindict[chaintext] = this.editorIndices[i];//so basically now text corresponds to id of editor
    //        chainname[this.editorIndices[i]] = chaintext;
    //    }

    //    var items = {
    //        annotation: {
    //            label: "Annotation", type: "table", columns: {
    //                seq: { label: "Sequence", key: "seq", type: "select", items: chains, width: 75 },//change this to "Chain 1", "Chain 2", etc.
    //                firstpos: { label: "Start Position", key: "first", type: "input", width: 75 },
    //                secondpos: { label: "End Position", key: "second", type: "input", width: 75 },
    //                color: { label: "Color", key: "color", type: "color", width: 75 },
    //                notes: { label: "Notes", key: "notes", type: "textarea", width: 300 }
    //            }
    //        }
    //    };

    //    ////this.annotationdlg = scil.Form.createDlgForm("Add/Edit Annotation", items, {
    //        ////src: scil.App.imgSmall("submit.png"), label: "Confirm Changes", onclick: function () { me.addAnnotations(); }
    //    ////});
    //    ////this.annotationdlg.form.fields.annotation.jsd.clear();
    //    console.log("Need to fill in DLG!")
    //    if (this.annotationList)
    //        for (var j = 0; j < this.annotationList.length; j++) {
    //            var newAnnotation = {};
    //            var annotation = this.annotationList[j];
    //            if (chainname[annotation.seq]) {
    //                newAnnotation.seq = chainname[annotation.seq];
    //                newAnnotation.color = annotation.color;
    //                newAnnotation.firstpos = annotation.firstpos;
    //                newAnnotation.secondpos = annotation.secondpos;
    //                newAnnotation.notes = annotation.notes;
    //                this.annotationdlg.form.fields.annotation.jsd.addRow(newAnnotation);
    //            }
    //        }

    //    this.chainname = chainname;
    //    this.chaindict = chaindict;
    //}

    addBonds(data, fromXml) {
        this.bondslist = [];
        this.bonds = {};
        this.colors = {};//key: (bond)id value: color
        this.singlebonds = {};
        this.addDict = {};

        data = data; //|| this.editbonddlg.form.items.bonds.field.jsd.getData();

        this.totalBonds = 0;
        this.totalSingle = 0;
        this.outer = [];

        for (var j = 0; j <= Math.max(...this.editorIndices); j++) {//cycling through and clearing stored bond information from all editor indices that have been used (including removed), so that they can be replaced with the new incoming data (which is an edited version of the old data)...
            var index = this.editorIndices[j];
            this.bonds[index] = {};
            this.singlebonds[index] = {};
            this.inner[index] = [];
            if (data.length == 0) {//edge case where bond doesn't dissappear after all bonds taken away!!!
                this.editors[index].clearBonds();
            }
        }

        for (var i = 0; i < data.length; i++) {
            var firstseq = this.chaindict && this.chaindict[data[i].seq] != null ? this.chaindict[data[i].seq] : data[i].seq;
            //if (!firstseq && firstseq != 0)
            //    this.editbonddlg.close();
            var secondseq = this.chaindict && this.chaindict[data[i].secondseq] != null ? this.chaindict[data[i].secondseq] : data[i].secondseq;
            if (firstseq > secondseq)
                this.addBond(data[i].secondpos, data[i].firstpos, data[i].bondtype, secondseq, firstseq, data[i].notes);
            else
                this.addBond(data[i].firstpos, data[i].secondpos, data[i].bondtype, firstseq, secondseq, data[i].notes);
        }

        if (!fromXml)//stops extra rebuild when both annotations and bonds in setxml
            this.rebuildEditors();

        //if (data.length == 0)
        //    this.editbonddlg.close();
        //if (this.editbonddlg)
        //    this.editbonddlg.close();
    }

    //old version
        //addBonds(data) {
    //    var me = this;
    //    this.bondslist = [];
    //    this.bonds = {};
    //    this.colors = {};//key: (bond)id value: color
    //    this.singlebonds = {};
    //    this.addDict = {};

    //    data = data || this.editbonddlg.form.items.bonds.field.jsd.getData();

    //    this.totalBonds = 0;
    //    this.totalSingle = 0;
    //    this.outer = [];

    //    for (var j = 0; j <= Math.max(...this.editorIndices); j++) {
    //        var index = this.editorIndices[j];
    //        this.bonds[index] = {};
    //        this.singlebonds[index] = {};
    //        this.inner[index] = [];
    //        if (data.length == 0) {//edge case where bond doesn't dissappear after all bonds taken away!!!
    //            me.editors[index].clearBonds();
    //        }
    //    }

    //    //for (var i = 0; i < data.length; i++) {
    //    //    var firstseq = this.chaindict[data[i].seq] || data[i].firstseq;
    //    //    if (!firstseq && firstseq != 0)
    //    //        this.editbonddlg.close();
    //    //    var secondseq = this.chaindict[data[i].secondseq] || data[i].secondseq;          
    //    //    me.addBond(data[i].firstpos, data[i].secondpos, data[i].bondtype, firstseq, secondseq);              
    //    //}

    //    for (var i = 0; i < data.length; i++) {
    //        //var firstseq = this.chaindict ? this.chainname[data[i].seq] : data[i].firstseq;
    //        //if (!firstseq && firstseq != 0)
    //        //    this.editbonddlg.close();
    //        //var secondseq = this.chaindict ? this.chaindict[data[i].secondseq] : data[i].secondseq;
    //        //var firstseq = this.chaindict && this.chaindict[data[i].seq] ? this.chaindict[data[i].seq] : data[i].seq;
    //        //if (!firstseq && firstseq != 0)
    //        //    this.editbonddlg.close();
    //        //var secondseq = this.chaindict && this.chaindict[data[i].secondseq] ? this.chaindict[data[i].secondseq] : data[i].secondseq;
    //        //me.addBond(data[i].firstpos, data[i].secondpos, data[i].bondtype, firstseq, secondseq);
    //        var firstseq = this.chaindict && this.chaindict[data[i].seq] != null ? this.chaindict[data[i].seq] : data[i].seq;
    //        if (!firstseq && firstseq != 0)
    //            this.editbonddlg.close();
    //        var secondseq = this.chaindict && this.chaindict[data[i].secondseq] != null ? this.chaindict[data[i].secondseq] : data[i].secondseq;
    //        me.addBond(data[i].firstpos, data[i].secondpos, data[i].bondtype, firstseq, secondseq);
    //    }

    //    this.rebuildEditors();

    //    if (data.length == 0)
    //        this.editbonddlg.close();
    //    if (this.editbonddlg)
    //        this.editbonddlg.close();
    //}

    addOneBond() {//same as older method
        var data = this.addbonddlg.form.getData();
        var firstseq = this.chaindict && this.chaindict[data.seq] != null ? this.chaindict[data.seq] : data.seq;

        if (!firstseq && firstseq != 0)
            this.addbonddlg.close();
        var secondseq = this.chaindict && this.chaindict[data.secondseq] != null ? this.chaindict[data.secondseq] : data.secondseq;
        if (firstseq > secondseq)
            this.addBond(data.secondpos, data.firstpos, data.bondtype, secondseq, firstseq, data.notes);
        else
            this.addBond(data.firstpos, data.secondpos, data.bondtype, firstseq, secondseq, data.notes);

        this.rebuildEditors();

        if (this.addbonddlg)
            this.addbonddlg.close();
    }

    //seems mostly the same as newer function
    outerHover() {
        for (var i = 0; i < this.outer.length; i++) {
            var bond = this.outer[i];
            var notes = bond.notes;
            var firstPos = bond.firstpos;
            var secondPos = bond.secondpos;

            var type = bond.bondtype;
            var seq = bond.seqIndex;
            var secondSeq = bond.secondseqIndex;

            var span = document.getElementById("%" + seq + ":" + bond.id);
            var secondSpan = document.getElementById("%" + secondSeq + ":" + bond.id);
            if (!span || !secondSpan)
                continue;

            var title = 'Cross-Chain Connection[' + type + '][' + seq + ':' + firstPos + ']-[' + secondSeq + ':' + secondPos + ']: ' + notes;
            span.title = title;
            secondSpan.title = title;
        }
    }

    drawBonds(removedBonds) {//2/25/2019 removed bonds seems to be added only in the case that structures are edited and thus the bonds have to be removed...
        var svg = document.getElementById('ColSVG');
        svg.innerHTML = "";
        var connecting = {};

        var past = {};
        for (var l = 0; l < this.editorIndices.length; l++) {
            var index = this.editorIndices[l];
            this.editors[index].moveBoxes(null, this);//essentially a "buildDualBonds" function, in that it does the same thing as the next function except for bonds within the same chain.
            var endpos = this.editors[index].buildSoloBonds(this.addDict, removedBonds, this.outer);
            this.outerHover();
            var solo = this.editors[index].singlearr;//TIME COMPLEXITY BOTTLENECK!!!
            for (var m = 0; m < solo.length; m++) {
                var id = solo[m].id;
                var id2 = solo[m].id2;
                if (connecting[id]) {
                    var firstend = past[id];
                    var secondend = endpos[id2];
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

    //draw bonds replaces this
    //connectSolo(removedBonds) {//2/25/2019 removed bonds seems to be added only in the case that structures are edited and thus the bonds have to be removed...
    //    var svg = document.getElementById('ColSVG');
    //    svg.innerHTML = "";
    //    var connecting = {};
    //    var heights = {};
    //    var add = 0;

    //    var past = {};
    //    for (var l = 0; l < this.editorIndices.length; l++) {
    //        var index = this.editorIndices[l];
    //        this.editors[index].moveBoxes(null, this);//essentially a "buildDualBonds" function, in that it does the same thing as the next function except for bonds within the same chain.
    //        this.editors[index].buildSoloBonds(this.addDict, removedBonds);
    //        var solo = this.editors[index].singlearr;//TIME COMPLEXITY BOTTLENECK!!!

    //        for (var m = 0; m < solo.length; m++) {
    //            if (connecting[solo[m].id]) {
    //                if (heights[solo[m].vert]) {//Checking to see if a bond is to be generated on the same row as another bond... if true, then we would raise the bondline 7 pixels so that it can be distinguished from the other bond on the same line
    //                    add = 7 * heights[solo[m].vert];
    //                    heights[solo[m].vert] += 1;
    //                }
    //                else {
    //                    add = 0;
    //                    heights[solo[m].vert] = 1;
    //                }
    //                var olderadd = past[solo[m].id] || 0;
    //                this.interConnect(connecting[solo[m].id], solo[m].vert, solo[m].horiz, this.colors[solo[m].id], olderadd, add, this.addDict[solo[m].id]);
    //            } else {
    //                connecting[solo[m].id] = solo[m].vert;
    //                if (heights[solo[m].vert]) {//same as above, but if we find that the first base of a bond is on the same line as another previous bond, then we raise the bond to be drawn by 7 pixels so it will be above the other bond
    //                    past[solo[m].id] = 7 * heights[solo[m].vert];//since we don't know the second location/base that this base will form a bond with, we must store the starting position in a dictionary so we can be sure to locate it easily after we find the second base and are ready to draw the connecting bond
    //                    heights[solo[m].vert] += 1;
    //                } else {
    //                    heights[solo[m].vert] = 1;
    //                }
    //            }
    //        }

    //    }
    //}

    //takes edited removed bond list from adjustbonds and iterates through it updating data structures of the changes (singlebonds, bonds) 
    //and refilling this.inner[num] and this.outer
    handleEdit(num, input) {
        this.inner[num] = [];
        this.outer = [];
        if (this.options.onchange != null)
            this.options.onchange(this);
        this.bonds[num] = {};
        for (var j = 0; j < this.bondslist.length; j++) {
            var bond = this.bondslist[j];
            if (this.removedBonds[bond.id]) {//
                if (bond.secondseqIndex != null) {
                    this.singlebonds[this.bondslist[j].secondseqIndex][this.bondslist[j].secondpos] = "";
                    this.singlebonds[this.bondslist[j].seqIndex][this.bondslist[j].firstpos] = "";
                    this.totalSingle--;
                }
                this.bondslist[j] = {};//CURRENTLY NOT GOING TO DELETE ENTRY IN BONDSLIST BECAUSE WE WANT IT TO CONTINUE TO SHOW IN THE LIST SO THE USER CAN EASILY RE-ADD ANY AND ALL REMOVED BONDS....
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
                this.outer.push(bond);

        }

        var editedDict = {};
        editedDict[num] = input;
        this.rebuildEditors(this.removedBonds, editedDict);//this replaces commented out part below, will leave for now incase
        this.removedBonds = {};
    }

    //Old Version
    //handleEdit(removedBonds, num) {
    //    if (this.options.onchange != null)
    //        this.options.onchange(this);
    //    this.annotations[num] = {};
    //    for (var j = 0; j < this.bondslist.length; j++) {
    //        if (removedBonds[this.bondslist[j].id]) {//SOMETHING JSUT ISN"T RIGHT ABOUT ALL OF THIS FUNCTIONALITY PLEASE FIGURE OUT AND REWRITE 3/6/2019 10:44 AM -TYler
    //            this.singlebonds[this.bondslist[j].secondseqIndex][this.bondslist[j].secondpos] = "";
    //            this.singlebonds[this.bondslist[j].seqIndex][this.bondslist[j].firstpos] = "";
    //            //this.bondslist[j] = {};//CURRENTLY NOT GOING TO DELETE ENTRY IN BONDSLIST BECAUSE WE WANT IT TO CONTINUE TO SHOW IN THE LIST SO THE USER CAN EASILY RE-ADD ANY AND ALL REMOVED BONDS....
    //        }
    //    }
    //    this.inner[num] = [];
    //    this.deleteOuterBond(num);
    //    this.bonds[num] = 0;

    //    this.rebuildEditors(removedBonds);//this replaces commented out part below, will leave for now incase

    //    //var input = this.createInput(num);
    //    //this.editors[num].buildEditor(input, this.colors, this.annotationNotes[num]);
    //    //this.editors[num].setParentHeight();
    //    //this.connectSolo(removedBonds);
    //}

    arrayMax(arr) {
        var len = arr.length, max = -Infinity;
        while (len--) {
            if (Number(arr[len]) > max) {
                max = Number(arr[len]);
            }
        }
        return max;
    }

    interConnect(first, second, color) {
	    if (!color)
		    color = "rgb(255,0,0);";
	    else
		    color += ";";
	    var svg = document.getElementById('ColSVG');
	    var verticalOff = svg.getBoundingClientRect().top;
	    var horizontalOff = svg.getBoundingClientRect().left;

	    var line = '<line x1="' + Math.floor(Math.abs(first[0] - horizontalOff)) + '" y1="' + (first[1] - verticalOff) + '" x2="' + Math.floor(Math.abs(second[0] - horizontalOff)) + '"y2="' + (second[1] - verticalOff) + '" style="stroke:' + color + 'stroke-width:1;pointer-events:none;overflow:auto" />';

	    svg.innerHTML += line;
    }

    //old version
    //interConnect(first, second, horizontal, color, yadd1, yadd2, add2) {
    //    console.log(first, second);
    //    if (!color)
    //        color = "rgb(255,0,0);";
    //    else
    //        color += ";";
    //    var svg = document.getElementById('ColSVG');
    //    var verticalOff = Math.ceil(svg.getBoundingClientRect().top);

    //    var line = '<line x1="' + (0 + add2) + '" y1="' + (first - verticalOff - yadd1) + '" x2="' + (0 + add2) + '" y2="' + (second - verticalOff - yadd2) + '" style="stroke:' + color + 'stroke-width:1;pointer-events:none;overflow:auto" />';
    //    svg.innerHTML += line;
    //}

    checkRange(firstpos, secondpos, seqIndex, secondseqIndex) {
        var seq1 = this.editors[seqIndex].getCleanSequence();
        if (parseInt(firstpos) > seq1.length)
            return false;
        if (secondseqIndex || secondseqIndex == 0) {
            var seq2 = this.editors[secondseqIndex].getCleanSequence();
            if (parseInt(secondpos) > seq2.length)
                return false;
        } else {
            if (parseInt(secondpos) > seq1.length)
                return false;
        }
        return true;
    }

    //checkRange(firstpos, secondpos, seqIndex, secondseqIndex) {
    //    var seq1 = this.editors[seqIndex].getCleanSequence();
    //    if (parseInt(firstpos) > seq1.length)
    //        return false;
    //    if (secondseqIndex) {
    //        var seq2 = this.editors[secondseqIndex].getCleanSequence();
    //        if (parseInt(secondpos) > seq2.length)
    //            return false;
    //    } else {
    //        if (parseInt(secondpos) > seq1.length)
    //            return false;
    //    }
    //    return true;
    //}

    //same as other function except only a few lines changed or deleted
    addBond(firstpos, secondpos, bondtype, seqIndex, secondseqIndex, bondNotes) {

        if (!this.checkRange(firstpos, secondpos, seqIndex, secondseqIndex))
            return alert("Out of Range. Please check to make sure first and second positions are in the range of the selected sequence chain!");

        var bond = {};
        //WE DEFINITELY NEED TO CHECK AT SOME POINT TO MAKE SURE THAT THE BONDS ARE WITHIN THE RANGE OF THE SELECTED CHAIN!!!     //Right now I think they just aren't generated in this case without any clear repercussions
        bond.firstpos = firstpos;
        bond.secondpos = secondpos;
        bond.bondtype = bondtype;
        bond.seq = this.titles[seqIndex];
        bond.seqIndex = seqIndex;
        bond.notes = bondNotes;
        var secondsequence = this.titles[secondseqIndex];
        //taken out of new version//var currentAdd = 0;
        var bondid = (this.totalBonds + 1).toString();
        if (!secondsequence || secondseqIndex == seqIndex) {
            this.bonds[seqIndex][firstpos] = bondid;
            this.bonds[seqIndex][secondpos] = bondid + "b";
            bond.id = bondid;
            this.inner[seqIndex].push(bond);
        } else {
            this.singlebonds[seqIndex][firstpos] = bondid;
            this.singlebonds[secondseqIndex][secondpos] = bondid;
            //changed in new version//this.singlebonds[secondseqIndex][secondpos] = bondid + "b";
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

    //exactly the same as other function 
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
    //only difference is commented out
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

            } else if (this.bonds[index][i + 1]) {
                var myString = this.bonds[index][i + 1];
                myString = myString.replace(/\D/g, '');
                finalStr += "$" + myString + seq[i] + "$";
            }
            else if (this.singlebonds[index][i + 1]) {
                var id = this.singlebonds[index][i + 1];
                id = id.replace(/\D/g, '');
                finalStr += "%" + id + seq[i] + "%";
            }
            else
                finalStr += seq[i];

            //} else if (this.bonds[index][i + 1])
            //    finalStr += "$" + this.bonds[index][i + 1][0] + seq[i] + "$";
            //else if (this.singlebonds[index][i + 1]) {
            //    var id = this.singlebonds[index][i + 1][0];
            //    finalStr += "%" + id + seq[i] + "%";
            //}
            //else
            //    finalStr += seq[i];
        }
        return finalStr;
    }

    //new method that was not originally in this......
    extractInput(sequence, length, seqID) {//maybe add progress wheel while rebuilding because this may take a second
        var newInput = "";
        var n = 0;
        var originalLength = length;
        var newBonds = {};
        var newSingleBonds = {};
        var newAnnotations = {};
        var newAnnotations2 = {};
        while (length >= 0 || current != undefined) {
            var sequenceIndex = (originalLength - length) + 1;
            var innerColumnIndex = sequenceIndex % 10;
            var rowIndex = sequenceIndex % 60;
            var span = "";
            var current = sequence[n];

            if (current == '&') {//case where we have &nbsp;
                while (current != ';') {//increment until the end of the nbsp;, don't need to record anything, we will add new nbsp; at another point
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
                    } else if (current == '!') {//annotation
                        spanType = current;
                        current = sequence[++n];
                        var annotationid = "";
                        while (current != '"') {
                            annotationid += current;
                            current = sequence[++n];
                            span += current;
                        }
                        newInput += '!' + annotationid;
                        newAnnotations[sequenceIndex] = ["start", annotationid, this.colors['!' + annotationid]];
                        newAnnotations2[annotationid] = {};
                        newAnnotations2[annotationid].start = sequenceIndex;
                        newAnnotations2[annotationid].color = this.colors['!' + annotationid];
                    }
                    span += current;
                    n++;
                }
                if (span[1] == "s" && spanType != '!') {
                    var character = sequence[n];
                    current = sequence[n];
                    while (current != '>') {//get out of the closing span  tag
                        current = sequence[n];
                        span += current;
                        n++;
                    }

                    var id = bondid.replace(/.*:/, "");
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

    //another method not in old file...
    adjustBonds(newBonds, newSingleBonds, seqID) {//compares bonds in bondslist to newly acquired bonds, and edits the bondslist to reflect changes in position

        this.removedBonds = {};
        var currentSingleBonds = this.singlebonds[seqID];

        for (var i = 0; i < this.bondslist.length; i++) {
            var bond = this.bondslist[i];
            var newBond = newBonds[bond.id];
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

    //also new to file
    adjustAnnotations(newAnnotations, newAnnotations2, seqID) {
        this.annotations[seqID] = {};
        for (var i = 0; i < this.annotationList.length; i++) {
            var currentAn = this.annotationList[i];
            if (newAnnotations2[i]) {
                var firstpos = newAnnotations2[i].start;
                var secondpos = newAnnotations2[i].end;

                this.annotations[seqID][firstpos] = newAnnotations[firstpos];
                this.annotations[seqID][secondpos] = newAnnotations[secondpos];

                this.annotationNotes[seqID]['!' + i].firstpos = firstpos;
                this.annotationNotes[seqID]['!' + i].secondpos = secondpos;

                currentAn.firstpos = firstpos;
                currentAn.secondpos = secondpos;
            }
        }
    }

    deleteChainDlg() {//made changes with confirm
        var title = this.titles[this.currentId];
        let conformed = confirm("Would you like to delete the chain titled \n '" + title + "'?");
        if (conformed)
            this.deleteChain();
    }

    deleteChain(index) {
        if (this.currentSelected) {

            var keys = Interface.getDictKeys(this.editors[this.currentId].singlebonds);
            //var keys = scil.Utils.getDictKeys(this.editors[this.currentId].singlebonds);
            var removedBonds = {};
            for (var i in keys) {
                var soloid = this.editors[this.currentId].idDict[keys[i]];
                removedBonds[soloid] = true;
            }

            this.removedBonds = removedBonds;

            this.editors[this.currentId].selfDestruct(this.currentSelected);
            this.editors[this.currentId] = {};
            var parent = document.getElementById(this.currentSelected);
            parent.innerHTML = "";
            //**//neeed to replace dojo.destroy
            dojo.destroy(this.currentSelected);
            this.buildSVG(this.svgColumn);//whyyy this here???
            for (var i = 0; i < this.editorIndices.length; i++) {
                if (this.editorIndices[i] == this.currentId)
                    scil.Utils.removeArrayItem(this.editorIndices, this.currentId);//**//
            }

            this.handleEdit(this.currentId, "");
        }
    }

    //deleteChain(index) {//not sure which version of deletechain to use
    //    if (this.currentSelected) {
    //        this.editors[this.currentId].selfDestruct(this.currentSelected);
    //        this.editors[this.currentId] = {};
    //        var parent = document.getElementById(this.currentSelected);
    //        parent.innerHTML = "";
    //        //**//dojo.destroy(this.currentSelected);//**//
    //        console.log("Find a way to replace dojo.destory", this.currentSelected)
    //        this.buildSVG(this.svgColumn);
    //        for (var i = 0; i < this.editorIndices.length; i++) {
    //            if (this.editorIndices[i] == this.currentId)//**//
    //                this.editorIndices.splice(i, 1)
    //                //**//scil.Utils.removeArrayItem(this.editorIndices, this.currentId);
    //        }

    //        for (var j = 0; j < this.bondslist.length; j++) {
    //            if (this.bondslist[j].seqIndex == this.currentId) {
    //                this.singlebonds[this.bondslist[j].secondseqIndex][this.bondslist[j].secondpos] = "";
    //            }
    //            else if (this.bondslist[j].secondseqIndex == this.currentId) {
    //                this.singlebonds[this.bondslist[j].seqIndex][this.bondslist[j].firstpos] = "";
    //            }
    //        }

    //        this.deleteOuterBond(this.currentId);

    //        this.titles[this.currentId] = "";
    //        this.singlebonds[this.currentId] = {};
    //        this.annotations[this.currentId] = {};
    //        this.inner[this.currentID] = [];
    //    }
    //    this.rebuildEditors();
    //}

    //no other version
    deleteOuterBond(id) {//deletes outer bond from internal data structure when a chain is deleted
        for (var k = 0; k < this.outer.length; k++) {//right now not in use because handle edit is sorting through bondslist, removing deleted, and rebuilding inner and outer dicts...
            if (this.outer[k].seqIndex == id)
                this.outer[k] = {};
            if (this.outer[k].secondseqIndex == id)
                this.outer[k] = {};
        }
    }

    adjustToolbar() {//same in other version
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
            { iconurl: "http://localhost:8080/images/listadd.png", tooltips: "Import Fasta Sequence or Chain", onclick: function () { me.createDlg(parent); } },
            { iconurl: "http://localhost:8080/images/addchain.png", tooltips: "Add Blank Chain", onclick: function () { me.newBlankChain(parent); } },
            { iconurl: "http://localhost:8080/images/removechain.png", tooltips: "Remove Chain", onclick: function () { me.deleteChainDlg(); } },
            { iconurl: "http://localhost:8080/images/addcomment.png", tooltips: "Add a Bond", onclick: function () { me.addBondDlg(); } },
            { iconurl: "http://localhost:8080/images/smallmolecule.png", tooltips: "Add/Edit Bonds", onclick: function () { me.editBondDlg(parent); } },
            { iconurl: "http://localhost:8080/images/addannotation.png", tooltips: "Add/Edit Annotations", onclick: function () { me.addAnnotationDlg(); } },
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

//    buildToolbar: function (parentid) {
//    var me = this;
//    var toolbar = document.createElement("table");
//    toolbar.id = "toolbar-main";
//    var parent = document.getElementById(parentid);

//    var buttons = [
//        { iconurl: scil.App.imgSmall("file.png"), tooltips: "New Sequence", onclick: function () { me.newBlankEditor(parent); } },
//        "-",
//        { iconurl: scil.App.imgSmall("listadd.png"), tooltips: "Import Fasta Sequence or Chain", onclick: function () { me.createDlg(parent); } },
//        "-",
//        { iconurl: scil.App.imgSmall("addchain.png"), tooltips: "Add Blank Chain", onclick: function () { me.newBlankChain(parent); } },
//        { iconurl: scil.App.imgSmall("removechain.png"), tooltips: "Remove Chain", onclick: function () { me.deleteChainDlg(); } },
//        "-",
//        { iconurl: scil.App.imgSmall("addcomment.png"), tooltips: "Add a Bond", onclick: function () { me.addBondDlg(); } },
//        { iconurl: scil.App.imgSmall("smallmolecule.png"), tooltips: "Add/Edit Bonds", onclick: function () { me.editBondDlg(); } },
//        { iconurl: scil.App.imgSmall("addannotation.png"), tooltips: "Add/Edit Annotations", onclick: function () { me.addAnnotationDlg(); } },
//        "-",
//        { iconurl: scil.App.imgSmall("doc.png"), tooltips: "Get XML", onclick: function () { me.getXml(); } },
//        { iconurl: scil.App.imgSmall("addnote.png"), tooltips: "Set XML", onclick: function () { me.createDlg(parent, "xml"); } }
//        //{ iconurl: scil.App.imgSmall("addnote.png"), tooltips: "Add Bond Type", onclick: function () { me.addBondTypeDlg(); } }//saving this in case customers or team request that we add some ability to customize bond type because I think it should be at the very least availible for admins (Tony disagree)...
//    ];

//    buttons = buttons.concat(this.options.buttons);

//    parent.appendChild(toolbar);
//    var tr = toolbar.insertRow(0);
//    var td = tr.insertCell(0);
//    toolbar.style.backgroundColor = "rgb(221, 221, 221)";
//    scil.Form.createToolbarButtons(td, buttons, 3);

//},

    //same in other file
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

    //**//different functions
    buildEditorFromXml(parent, seq, title, bonds) {
        var fullEditor = document.getElementById("editor-full") || document.createElement("table");//Element that will be a parent to all editor instances

        if (this.options.onchange != null)
            this.options.onchange(this);

        if (this.editorIndices.length == 0) {
            fullEditor.id = "editor-full";
            parent.appendChild(fullEditor);
            this.addChain(fullEditor, seq, title);
            //this.buildFromXml(fullEditor, seq, title);
        } else {
            this.addChain(fullEditor, seq, title);
            //this.buildFromXml(fullEditor, seq, title);
        }
        if (this.fastadlg)
            this.fastadlg.hide();
    }
    //very similar
    buildFromFasta(table, fasta) {//pre-refactor
        var me = this;
        this.titles = {};//key: editorIndex value: title
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

    //buildFromXml(table, seq, title) {
    //    this.addChain(table, seq, title);
    //    this.buildSVG(this.svgColumn);
    //    this.adjustToolbar();
    //}

    //new to this file
    createButtons(parent, buttons) {
        for (const value of buttons) {
            const button = document.createElement("button");
            button.title = value.tooltips;

            parent.appendChild(button);

            button.addEventListener("click", value.onclick);
            button.innerHTML = '<img src="' + value.iconurl + '" />';
        }
    }

    //fixed tiny part
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
        this.drawBonds();//formerly known as connectsolo
    }

    //edited with comments
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

        this.titles[i] = title;

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
        //not sure if this has some purpose I am forgetting//var editor = Object.create(SequenceEditor);

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
        var maxAdd = this.arrayMax(Object.values(this.addDict));
        var add = maxAdd >= 50 ? maxAdd : 50;//if still having problems just put add as maxAdd as it appears to be working great in test environment...

        var fullEditor = document.getElementById("editor-full");
        var svg = '<svg id="ColSVG" xmlns="http://www.w3.org/2000/svg" width="' + add + '" height="' + Math.ceil(fullEditor.offsetHeight) + '" style="position:relative;pointer-events:none;"></svg>';

        col.innerHTML = svg;
    }

    //buildSVG(col) {
    //    col = col || this.svgColumn;
    //    col.innerHTML = "";
    //    var fullEditor = document.getElementById("editor-full");
    //    var svg = '<svg id="ColSVG" xmlns="http://www.w3.org/2000/svg" width="50" height="' + Math.ceil(fullEditor.offsetHeight) + '" style="position:relative;pointer-events:none;"></svg>';

    //    col.innerHTML = svg;
    //}

    //**//needs fixing dojo

    editBondDlg(parent) {
        var me = this;
        var chains = [];
        var chaindict = {};//key:chaintext value: index from editorIndices
        var chainname = {};//key: chainname value: chaintext

        //chaindict key: chaintext // value: editorIndex
        for (var i = 0; i < this.editorIndices.length; i++) {//Making names for dlg based on sequential order. 
            var chaintext = "Chain " + (i + 1);
            chains.push(chaintext);
            chaindict[chaintext] = this.editorIndices[i];
            chainname[this.editorIndices[i]] = chaintext;//making dicts to easily convert back and forth between these temporary chain names
        }

        var types = this.types ? Interface.getDictKeys(this.types) : [];//Types defined by admin or in config, fetching them here

        //if (this.editbonddlg) {
        //    this.editbonddlg.form.clear();
        //    this.editbonddlg.form.destory();
        //}

        const items = {
            //bonds: {
            //label: "Bonds", type: "table", columns: {
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
        var options = { onAddRow: function (r, values) { me.onCreate(r, values); } };
        
        //**//
        //this.editbonddlg = scil.Form.createDlgForm("Add/Edit Bonds", items, { src: scil.App.imgSmall("submit.png"), label: "Confirm Changes", onclick: function (a) { me.addBonds(); } });
        this.editbonddlg = Interface.modal("Add/Edit Bonds", this.parent,  me.addBonds.bind(me), items, options)
        //this.editbonddlg.form.fields.bonds.jsd.clear();
        for (var j = 0; j < this.bondslist.length; j++) {//cycling through the list of previous bonds and inserting them back into the form
            var newBond = {};
            var bond = this.bondslist[j];
            newBond.firstpos = bond.firstpos;
            newBond.secondpos = bond.secondpos;
            newBond.bondtype = bond.bondtype;
            newBond.color = this.types[bond.bondtype];
            newBond.id = bond.id;
            newBond.notes = bond.notes;

            if (chainname[this.bondslist[j].seqIndex])
                newBond.seq = chainname[this.bondslist[j].seqIndex];
            if (chainname[this.bondslist[j].secondseqIndex])
                newBond.secondseq = chainname[this.bondslist[j].secondseqIndex];

            //if (newBond.firstpos)
                //this.editbonddlg.form.fields.bonds.jsd.addRow(newBond);
        }
        this.chainname = chainname;
        this.chaindict = chaindict;
    }

    //old version
    //editBondDlg(parent) {
    //    var me = this;
    //    var chains = [];
    //    var chaindict = {};//key:chaintext value: index from editorIndices
    //    var chainname = {};//key: chainname value: chaintext

    //    //chaindict key: chaintext // value: editorIndex
    //    for (var i = 0; i < this.editorIndices.length; i++) {
    //        var chaintext = "Chain " + (i + 1);
    //        chains.push(chaintext);
    //        chaindict[chaintext] = this.editorIndices[i];
    //        chainname[this.editorIndices[i]] = chaintext;
    //    }

    //    var types = this.types ? scil.Utils.getDictKeys(this.types) : [];

    //    if (this.editbonddlg)
    //        dojo.destroy(this.editbonddlg.id);
        
    //    var items = {
    //        bonds: {
    //            label: "Bonds", type: "table", columns: {
    //                seq: { label: "First Sequence", key: "seq", type: "select", items: chains, width: 100 },
    //                firstpos: { label: "First Position", key: "first", type: "input", width: 100 },                 
    //                secondseq: { label: "Second Sequence", key: "secondseq", type: "select", items: chains, width: 100 },
    //                secondpos: { label: "Second Position", key: "second", type: "input", width: 100 },
    //                bondtype: { label: "Bond Type", key: "bondtype", type: "select", items: types }
    //            }
    //        }
    //    };

    //    this.editbonddlg = scil.Form.createDlgForm("Add/Edit Bonds", items, { src: scil.App.imgSmall("submit.png"), label: "Confirm Changes", onclick: function (a) { me.addBonds(); } });
    //    this.editbonddlg.form.fields.bonds.jsd.clear();
    //    for (var j = 0; j < this.bondslist.length; j++) {
    //        var newBond = {};
    //        var bond = this.bondslist[j];
    //        newBond.firstpos = bond.firstpos;
    //        newBond.secondpos = bond.secondpos;
    //        newBond.bondtype = bond.bondtype;

    //        if (chainname[this.bondslist[j].seqIndex])
    //            newBond.seq = chainname[this.bondslist[j].seqIndex];
    //        if (chainname[this.bondslist[j].secondseqIndex])
    //            newBond.secondseq = chainname[this.bondslist[j].secondseqIndex];

    //        if (newBond.firstpos)
    //            this.editbonddlg.form.fields.bonds.jsd.addRow(newBond);
    //    }
    //    this.chainname = chainname;
    //    this.chaindict = chaindict;
    //}

    //new function... what is count for???
    onCreate(data, values) {
        var count = 1;
        if (values && data) {
            var childrens = data.children;
            for (var i = 0; i < childrens.length; i++) {
                var child = childrens[i];
                var section = child.attributes[0].value;
                if (section == "color") {
                    this.drawSampleBond(this.types[values.bondtype], child, values.id);
                    count++;
                }
            }
        }
    }

    //same as other I think
    drawSampleBond(color, child, id) {//version with hard coded width values
        var sampleid = "Sample" + id;
        var svg = '<svg id=' + sampleid + ' xmlns="http://www.w3.org/2000/svg" width="' + 50 + '" height="' + child.offsetHeight / 2 + '" style="position:relative;pointer-events:none;padding:0;"></svg>';
        var lineWidth = 50 / 7;
        var line = '<line x1="' + lineWidth + '" y1="' + (10) + '" x2="' + (lineWidth * 5) + '" y2="' + (10) + '" style="stroke:' + color + ';stroke-width:2;pointer-events:none;" />';
        child.innerHTML = svg;
        var element = document.getElementById(sampleid);
        element.innerHTML = line;
    }

    addBondDlg(data) {
        var me = this;
        var chains = [];
        var chaindict = {};
        var chainname = {};

        for (var i = 0; i < this.editorIndices.length; i++) {
            var chaintext = "Chain " + (i + 1);
            chains.push(chaintext);
            chaindict[chaintext] = this.editorIndices[i];//making dicts to easily convert back and forth between these temporary chain names
            chainname[this.editorIndices[i]] = chaintext;
        }

        var types = this.types ? Interface.getDictKeys(this.types) : [];//fetched from config or admin menu (code exists to add/edit types but I was told to shelf it (remove))

        //if (this.addbonddlg)//**//
        //    dojo.destroy(this.addbonddlg.id);

        const items = {
            seq: { label: "First Sequence", key: "seq", type: "select", items: chains, width: 100 },
            firstpos: { label: "First Position", key: "first", type: "number", width: 100 },
            secondseq: { label: "Second Sequence", key: "secondseq", type: "select", items: chains, width: 100 },
            secondpos: { label: "Second Position", key: "second", type: "number", width: 100 },
            bondtype: {
                label: "Bond Type", key: "bondtype", type: "select", items: types, onchange: function (data) { me.changeBondType(data); }
            },
            notes: { label: "Notes", key: "notes", type: "input" }
        };

        //**//
       // this.addbonddlg = scil.Form.createDlgForm("Add a Bond", items, { src: scil.App.imgSmall("submit.png"), label: "Confirm Add", onclick: function (a) { me.addOneBond(a); } });
        this.addbonddlg = Interface.modal("Add a Single Bond to your Sequence", this.parent, this.addOneBond.bind(this), items);
        this.chainname = chainname;
        this.chaindict = chaindict;
    }

    changeBondType(data, values) {//changes sample bond color when bondtype is changed
        var children = data.parentNode.parentNode.children;
        var bondtype = data.value;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var section = child.attributes[0].value;
            if (section == "color") {
                child.firstChild.firstChild.attributes.style.value = "stroke:" + this.types[bondtype] + ";stroke-width:2;pointer-events:none;"
            }
        }
        var color = this.types[data.value];
    }

    createDlg(parent, type) {//refactoring so that this will work for both fasta and xml       
        var me = this;
        //const items = {
        //    fasta: { label: "Fasta", type: "textarea", width: 550, height: 200 }
        //};
        console.log("CREATING DLG")
        if (type == "xml") {
            //items = {
            //    xml: { label: "XML", type: "textarea", width: 550, height: 200 }
            //};

            //this.fastadlg = scil.Form.createDlgForm("Import Sequence Editor XML Data", items, { src: scil.App.imgSmall("submit.png"), label: "Create", onclick: function () { me.setXml(parent); } });

            //this.fastadlg = Interface.createInputDialog("Import Sequence Editor XML Data", items, { parent: parent, onclick: function () { me.setXml(parent); } });
            this.fastadlg = Interface.modal("Import Sequence Editor XML Data:", parent, this.setXml.bind(me))
            //this.fastadlg.form.fields.xml.spellcheck = false;
        } else {          
            this.fastadlg = Interface.modal("Import Fasta Sequence or Chain:", parent, this.buildEditor.bind(me))//("Import Fasta Sequence or Chain", items, { parent: parent, onclick: function () { me.buildEditor(parent); } });
            //this.fastadlg.form.fields.fasta.spellcheck = false;
        }      
    }

    //checked
    getSequenceFromFasta(seq) {//to be used with individual fasta sequence taken from getArrayOfFasta()
        if (seq.search(/\>[^\f\n\r]+[\f\n\r]/) != -1) {
            seq = seq.replace(/\>[^\f\n\r]+[\f\n\r]/, "");
        }
        return seq;
    }

    //checked
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
                for (var j = 0; j < bonds.length; j++) {
                    var note = bonds[j].notes;
                    bondString += "<b st='" + bonds[j].firstpos + "' end='" + bonds[j].secondpos + "' t='" + bonds[j].bondtype + "'>" + (note ? note : "") + "</b>";
                }
                chainXml += bondString;
            }
            chainXml += "</chain>";
            xml += chainXml;     
        }

        if (this.outer) {
            const outerBondString = "";
            for (var m = 0; m < this.outer.length; m++) {
                if (this.outer[m].firstpos && this.outer[m].secondpos && this.outer[m].id) {
                    var note = this.outer[m].notes;
                    outerBondString += "<cb pos1='" + this.outer[m].firstpos + "' seq1='" + this.outer[m].seqIndex + "' seq2='" + this.outer[m].secondseqIndex + "' pos2='" + this.outer[m].secondpos + "' t='" + this.outer[m].bondtype + "' id='" + this.outer[m].id + "'>" + (note ? note : "") + "</cb>";
                }
            //    xml += outerBondString;
            }
            xml += outerBondString;
        }

        xml += "</se>";

        var div = document.createElement("div");

        Interface.modal("XML Generated from Sequence:", this.parent);
        let modal = document.getElementById("modal");
        modal.children[0].innerHTML = xml;
    }


    setXml(parent, xml) {
        parent = parent || document.getElementById(this.parent);
        xml = xml || this.fastadlg.form.fields.xml.value;
        this.newBlankEditor(parent);
        var bonds = [];
        var annotations = [];
        //var dict = scil.Utils.parseXml(xml);
        var dict = parseXml(xml);
        var chains = dict.childNodes[0].childNodes;
        for (var i = 0; i < chains.length; i++) {
            if (chains[i].localName == "chain") {
                var tags = chains[i].children;
                var title;
                var text;
                for (var j = 0; j < tags.length; j++) {
                    var tagName = tags[j].localName;

                    //if (tagName == "c") //we have a title/caption with s="sequence"
                    //    title = tags[j].textContent;
                    // else if (tagName == "seq") 
                    //    text = tags[j].attributes.s.value;
                    // else if (tagName == "b") {
                    if (tagName == "c") {//we have a title/caption with s="sequence"
                        title = tags[j].textContent;
                    } else if (tagName == "seq") {
                        text = tags[j].attributes.s.value;

                        var children = tags[j].children;
                        if (children.length > 0) {
                            for (var an in children) {
                                var item = children[an];
                                if (item.tagName == "a") {
                                    var annotation = {};
                                    var attributes = item.attributes;
                                    annotation.firstpos = attributes.st.value;
                                    annotation.secondpos = attributes.ed.value;
                                    annotation.type = attributes.t.value;
                                    annotation.color = attributes.c.value;
                                    annotation.notes = item.innerHTML;
                                    annotation.seq = i;//?
                                    annotations.push(annotation);
                                }
                            }
                        }
                    } else if (tagName == "b") {
                        var bond = {};
                        var bondAttributes = tags[j].attributes;
                        bond.firstpos = bondAttributes.st.value;
                        bond.secondpos = bondAttributes.end.value;
                        bond.bondtype = bondAttributes.t.value;
                        bond.seq = i;
                        bond.notes = tags[j].innerHTML;
                        bonds.push(bond);
                    //} else if (tagName == "a") {
                    //    var annotation = {};
                    //    var attributes = tags[j].attributes;
                    //    annotation.start = attributes.st;
                    //    annotation.start = attributes.st;
                    //    annotation.end = attributes.ed;
                    //    annotation.type = attributes.t;
                    //    annotation.color = attributes.c;
                    //    annotation.notes = tags[j].innerHTML;
                    //    annotation.seq = i;//?
                    //    annotations.push(annotation);
                    }
                }
                //If at least text was found, then we have to add a chain to represent this... however we may need to build new logic as the buildfromfasta method usually calls addchain
                //this.buildEditorFromXml(parent, text, title, bond);
                this.buildEditorFromXml(parent, text, title, bonds);
            } else if (chains[i].localName == "cb") {//thus we have a connecting bond
                var connectingBond = {};
                var connectingBondAttributes = chains[i].attributes;
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

    //setXml(parent, xml) {
    //    parent = parent || document.getElementById(this.parent);
    //    xml = xml || this.fastadlg.form.fields.xml.value;
    //    this.newBlankEditor(parent);
    //    var bonds = [];
    //    var annotations = [];
    //    var dict = scil.Utils.parseXml(xml);
    //    var chains = dict.childNodes[0].childNodes;
    //    for (var i = 0; i < chains.length; i++) {
    //        if (chains[i].localName == "chain") {
    //            var tags = chains[i].children;
    //            var title;
    //            var text;
    //            for (var j = 0; j < tags.length; j++) {
    //                var tagName = tags[j].localName;
    //                if (tagName == "c") //we have a title/caption with s="sequence"
    //                    title = tags[j].textContent;
    //                else if (tagName == "seq")
    //                    text = tags[j].attributes.s.value;
    //                else if (tagName == "b") {
    //                    var bond = {};
    //                    var bondAttributes = tags[j].attributes;
    //                    bond.firstpos = bondAttributes.st.value;
    //                    bond.secondpos = bondAttributes.end.value;
    //                    bond.bondtype = bondAttributes.t.value;
    //                    bond.seq = i;
    //                    bonds.push(bond);
    //                } else if (tagName == "a") {
    //                    var annotation = {};
    //                    var attributes = tags[j].attributes;
    //                    annotation.start = attributes.st;
    //                    annotation.start = attributes.st;
    //                    annotation.end = attributes.ed;
    //                    annotation.type = attributes.t;
    //                    annotation.color = attributes.c;
    //                    annotation.notes = tags[j].innerHTML;
    //                    annotation.seq = i;//?
    //                    annotations.push(annotation);
    //                }
    //            }
    //            //If at least text was found, then we have to add a chain to represent this... however we may need to build new logic as the buildfromfasta method usually calls addchain
    //            this.buildEditorFromXml(parent, text, title, bond);
    //        } else if (chains[i].localName == "cb") {//thus we have a connecting bond
    //            var connectingBond = {};
    //            var connectingBondAttributes = chains[i].attributes;
    //            connectingBond.firstpos = connectingBondAttributes.pos1.value;
    //            connectingBond.secondpos = connectingBondAttributes.pos2.value;
    //            connectingBond.seq = connectingBondAttributes.seq1.value;
    //            connectingBond.secondseq = connectingBondAttributes.seq2.value;
    //            connectingBond.bondtype = connectingBondAttributes.t ? connectingBondAttributes.t.value : null;
    //            connectingBond.id = connectingBondAttributes.id.value;
    //            bonds.push(connectingBond);
    //        }
    //    }
    //    if (bonds.length > 0)
    //        this.addBonds(bonds);
    //}

    //checked
    addTitleClick(num) {
        var me = this;
        var title = document.getElementById('title' + num);

        title.addEventListener("focusout", function (a, b) {
            if (me.options.onchange != null)
                me.options.onchange(me);
            this.contentEditable = false;
            var newTitle = this.textContent;
            me.titles[num] = newTitle;
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
        this.buildEditor(parent, this.blankFasta() + '\nAAA');
    }

    //checked
    newBlankEditor(parent) {
        this.editors = {};
        this.titles = {};
        this.totalBonds = 0;
        this.bonds = {};
        this.singlebonds = {};
        this.annotations = {};
        this.colors = {};
        this.bondslist = [];
        //this.bondtypes = {};
        this.editorIndices = [];
        var fullEditor = document.getElementById("editor-full") || document.createElement("table");//Element that will be a parent to all editor instances
        fullEditor.innerHTML = "";
        fullEditor.id = "editor-full";
        parent.appendChild(fullEditor);
        if (this.options.onchange != null)
            this.options.onchange(this);
    }

    rebuildEditors(removedBonds, edited) {
        if (this.options.onchange != null)
            this.options.onchange(this);

        for (var k = 0; k < this.editorIndices.length; k++) {
            var index = this.editorIndices[k];
            var input = edited && edited[index] ? edited[index] : this.createInput(index);
            var notes = this.annotationNotes[index];
            var inner = this.inner[index];
            this.editors[index].buildEditor(input, this.colors, notes, inner);
        }

        this.buildSVG(this.svgColumn);
        this.adjustToolbar();
        this.drawBonds(removedBonds);//formerly known as connectsolo
    }
    //rebuildEditors(removedBonds) {
    //    if (this.options.onchange != null)
    //        this.options.onchange(this);

    //    for (var k = 0; k < this.editorIndices.length; k++) {
    //        var index = this.editorIndices[k];
    //        var input = this.createInput(index);
    //        var notes = this.annotationNotes[index];
    //        this.editors[index].buildEditor(input, this.colors, notes);
    //    }
    //    this.connectSolo(removedBonds);
    //}
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