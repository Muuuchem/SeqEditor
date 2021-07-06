export default class SequenceEditor {

    constructor(parent, sequence, title, num, that, rowNumber) {
        var me = this;
        this.num = num;
        this.parent = parent;
        this.bonds = {};
        this.colors = {};
        this.connectCount = [];
        var rowNums = "&nbsp;";
        for (var i = 1; i <= rowNumber; i++) {
            rowNums += i + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
        }

        parent.innerHTML += '\
        <table id="editTable' + me.num + '" style="position:absolute;table-layout:fixed;"> \
            <tbody> \
                <tr> \
                    <td style="width:50px;display:inline-block;"></td> \
                    <td id="title' + me.num + '" style="display:inline-block;">' + title + '</td> \
                </tr> \
                <tr> \
                    <td style="width:50px;display:inline-block;"></td> \
                    <td style="color: rgb(221, 221, 221); text-align: left; font-size:20px;font-family:monospace;display:inline-block;">' + rowNums + '</td> \
                </tr> \
                <tr> \
                    <td id="vert' + me.num + '" width="50" style="display:inline-block;width:50px;text-align:right;padding-right:10px;vertical-align:top;font-size:20px;font-family:monospace;color:rgb(221, 221, 221);"></td> \
                    <td style="display:inline-block;position:absolute;"> \
                        <div class="editor" style="position:absolute;pointer-events:none;" id="editor' + me.num + '"></div> \
                        <div contenteditable="false" id="paragraph' + me.num + '" spellcheck="false" style="font-family:monospace;font-size:20px;display:inline-block;word-break:break-word;"></div> \
                    </td> \
                </tr> \
            </tbody> \
        </table> \
        <div style="position:relative;"></div>';

        this.rowLength = rowNumber * 10;
        this.buildEditor(sequence, {});

        parent.onclick = function (e) {
            e.preventDefault();
            this.style.background = "whitesmoke";
            that.clearBackgrounds(this.id);
        };

        var p = document.getElementById('paragraph' + me.num);

        p.ondblclick = function (e) {
            e.preventDefault();
            me.beforeEdit = p.innerHTML;
            this.contentEditable = true;
            this.focus();
        };

        p.addEventListener("focusout", function (e) {//me.beforeEdit is the original changes
            //also need to make sure content is updated and maybe realign the editor as well 
            e.preventDefault();
            p.contentEditable = false;

            if (p.innerHTML != me.beforeEdit) {
                var length = me.quickParse(p.innerText).length;
                var input = that.extractInput(p.innerHTML, length, me.num);//somehow need to pass the found bond information from here to processEdit
                me.processEdit(input, that);
            }
        });

        p.oninput = function (e, f) {//maybe could check and see if character input contains '$' or '!' or '%', in which case we would cancel the input
            var input;
            if (e.data != null && e.inputType == "insertText")
                input = e.data;
            that.removedBonds = {};
            that.drawBonds();
        };
        return this;
    }

    //constructor(parent, sequence, title, num, that, rowNumber) {
    //    var me = this;
    //    this.num = num;
    //    this.parent = parent;
    //    this.bonds = {};
    //    this.colors = {};
    //    this.connectCount = [];
    //    var rowNums = "";
    //    for (var i = 1; i <= rowNumber; i++) {
    //        rowNums += i + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    //    }

    //    parent.innerHTML += '\
    //<table id="editTable' + me.num + '" style="position:absolute;table-layout:fixed;"> \
    //    <tbody> \
    //        <tr> \
    //            <td style="width:50px;display:inline-block;"></td> \
    //            <td id="title' + me.num + '" style="display:inline-block;">' + title + '</td> \
    //        </tr> \
    //        <tr> \
    //            <td style="width:50px;display:inline-block;"></td> \
    //            <td style="color: rgb(221, 221, 221); text-align: left; font-size:20px;display:inline-block;">' + rowNums + '</td> \
    //        </tr> \
    //        <tr> \
    //            <td id="vert' + me.num + '" width="50" style="display:inline-block;width:50px;text-align:right;padding-right:10px;vertical-align:top;font-size:18px;color:rgb(221, 221, 221);"></td> \
    //            <td style="display:inline-block;"> \
    //                <div class="editor" style="position:absolute;pointer-events:none;" id="editor' + me.num + '"></div> \
    //                <div contenteditable="false" id="paragraph' + me.num + '" spellcheck="false" style="font-family:monospace;font-size:20px;"></div> \
    //            </td> \
    //        </tr> \
    //    </tbody> \
    //</table> \
    //<div style="position:relative;"></div>';

    //    this.rowLength = rowNumber * 10;
    //    this.buildEditor(sequence, {});

    //    parent.onclick = function (e) {
    //        e.preventDefault();
    //        this.style.background = "whitesmoke";
    //        that.clearBackgrounds(this.id);
    //    };

    //    var p = document.getElementById('paragraph' + me.num);

    //    p.ondblclick = function (e) {
    //        e.preventDefault();
    //        me.beforeEdit = p.innerHTML;
    //        this.contentEditable = true;
    //        this.focus();
    //    };

    //    p.addEventListener("focusout", function (e) {
    //        //also need to make sure content is updated and maybe realign the editor as well 
    //        p.contentEditable = false;
    //        if (p.innerHTML != me.beforeEdit) {
    //            let confirmed = confirm("Editing the current chain will remove any bonds or annotations associated with the chain. Would you like to proceed?")
    //            if (confirmed) {
    //                me.processEdit(confirmed, p, that)
    //            }
    //            ////scil.Utils.confirm("Editing the current chain will remove any bonds or annotations associated with the chain. Would you like to proceed?", function (action) { me.processEdit(action, p, that); });
    //            //Need to create dialog to ask same as with scil tools....
    //        }
    //    });
    //    //removed event listeners moved to the commented out section at the bottom of this doc in case you need to use some of the functionality that originally helped rebuild the bonds after each input or after fully editing....
    //    return this;
    //}

    //checked
    getCleanSequence() {
        var p = document.getElementById('paragraph' + this.num);
        return this.quickParse(p.innerText).join("");
    }

    //checked
    getTitle() {
        var element = document.getElementById("title" + this.num);
        return element.innerText;
    }

    //added from other file
    processRow(sequence, count) {//counts the number of unique bonds on the row
        var position = 0;//the position in line not considering nonmonomer characters
        var addition = 0;//will increment each time representing the actual position in a row
        var bonds = {};
        var heightincrease = 0;
        var seqpos = count + addition;
        while (position <= this.rowLength && seqpos <= sequence.length) {

            seqpos = count + addition;
            var char = sequence[seqpos];
            if (char == '%' || char == '$') {//single bond/crosschain
                var id = sequence[seqpos + 1];
                if (!isNaN(parseInt(id))) {//if id is a number

                    if (!isNaN(parseInt(sequence[seqpos + 2])))//if next value is also a number we have 2 digit id
                        id = id.concat(sequence[seqpos + 2]);

                    if (bonds[id]) {
                        addition++;
                        continue;
                    }

                    bonds[id] = true;
                    heightincrease++;
                } //else we are at the end of the bond and can just continue
            } else if (char == '!') {//annotation character//should only have to ignore it and the associated ID

            } else if (!isNaN(char)) {//we have reached an ID => just skip it?

            } else {//we must have a nucleotide if none of the other scenarios fit
                position++;
            }
            addition++;
        }

        return heightincrease;
    }

    buildEditor(sequence, colors, annotationNotes, inner) {//need to pass in inner and specific outer from editor similarly to annoationnotes
        this.idDict = {};//Will translate full ID (%X:Y) to soloid (Y) // key: FullID (%X:Y) value: soloID
        this.colors = {};
        if (!this.rowLength)
            this.rowLength = 60;
        if (!annotationNotes)
            annotationNotes = {};

        var stringSplit = sequence.split('');
        var vertNums = "";
        var count = 0;
        var buildingSpan = false;
        var annotating = false;
        var paragraph = document.getElementById('paragraph' + this.num);
        paragraph.innerHTML = "";
        this.bonds = {};
        this.singlebonds = {};
        this.connectCount = [];
        this.singlearr = [];
        var eventList = [];
        var finishedRows = {};
        var span = "";
        var postspan = "";
        for (var i = 0; i < stringSplit.length; i++) {
            var nucleotide = stringSplit[i];
            if (count % this.rowLength == 0 && paragraph.innerHTML[paragraph.innerHTML.length - 2] != 'r' && nucleotide != "\n" && !buildingSpan && !finishedRows[count]) {//maybe need to refactor this condition so that it checks that there isn't a full <br/>, or else it may skip some lowercase 'r's (Although they should all be uppercase?)
                //this is where we will utilize the preProcessing data to dynamically alter the row height...
                var heightincrease = this.processRow(sequence, i);
                var add2 = heightincrease + 1
                var add = (4 * heightincrease) + 1;
                var height = 25 + add;
                var rowheight = height + 'px';
                var newline = "";
                //if (count == 0) {
                //    newline = add != 1 ? '<br style="line-height:' + add + 'px' + 'margin-top:10px;">' : '';
                //    vertNums += add != 1 ? '<br style="line-height:' + add + 'px' + 'margin-top:10px;">' : '';
                //} else {
                //    newline = '<br style="line-height:' + rowheight + ';">';
                //    vertNums += '<br style="line-height:' + rowheight + ';">';
                //}
                var addNum = Math.ceil(add2 / 7);
                if (count != 0 && addNum != 1) {
                    newline += "<br/>"
                    vertNums += "<br/>"
                }
                for (var j = 0; j < addNum; j++) {
                    if (count == 0) {
                        newline += add2 != 1 ? "<br/>" : '';
                        vertNums += add2 != 1 ? "<br/>" : ''
                    } else {
                        newline += "<br/>"
                        vertNums += "<br/>"
                    }
                }

                if (annotating)
                    if (nucleotide == '!')
                        postspan += newline;
                    else
                        span += newline;
                else
                    paragraph.innerHTML += newline;

                vertNums += count + 1;
                finishedRows[count] = true;
            } else if (count % 10 == 0 && paragraph.innerHTML[paragraph.innerHTML.length - 2] != 'r' && (paragraph.innerHTML[paragraph.innerHTML.length - 1] != ';' || span[span.length - 1] != ';') && nucleotide != "\n" && !buildingSpan && count % 60 != 0)
                if (annotating) {
                    if (nucleotide == '!')
                        postspan += '&nbsp;&nbsp;';
                    else
                        if (span.length > 0 && span[span.length - 2] != 'r' && span[span.length - 2] != '"')
                            span += '&nbsp;&nbsp;';
                } else if (paragraph.innerHTML[paragraph.innerHTML.length - 1] != ';')
                    paragraph.innerHTML += '&nbsp;&nbsp;';

            if (nucleotide == '$' && buildingSpan == false) {
                buildingSpan = true;
            } else if (nucleotide == '%' && buildingSpan == false) {
                buildingSpan = true;
            } else if (nucleotide == '!' && annotating == false) {
                annotating = true;
            } else if (annotating == true && !buildingSpan && !isNaN(nucleotide)) {
                var annotationid = nucleotide;
                if (!isNaN(stringSplit[i + 1]))//we have a two-digit annotationid
                    annotationid = nucleotide.concat(stringSplit[i + 1]);
                span += '<span style="background:' + colors['!' + annotationid] + ';" id="' + '!' + annotationid + '">';
                eventList.push('!' + annotationid);
            } else if (annotating == true && nucleotide == '!') {
                span += '</span>';
                paragraph.innerHTML += span + postspan;
                span = "";
                postspan = "";
                annotating = false;
            } else if (buildingSpan == true && nucleotide == '%') {
                var soloid = stringSplit[i - 2];
                var solobonding = stringSplit[i - 1];
                buildingSpan = false;

                var spanid = '%' + this.num.toString() + ':' + soloid;

                if (stringSplit[i - 3] != "%" || soloid == 0) {
                    soloid = stringSplit[i - 3] + stringSplit[i - 2];
                    spanid = '%' + this.num.toString() + ":" + soloid;
                }

                this.singlebonds[spanid] = [];
                this.idDict[spanid] = soloid;
                this.colors[spanid] = colors[soloid];
                if (annotating)
                    span += '<span contenteditable="false" id="' + '%' + this.num.toString() + ':' + soloid + '">' + solobonding + '</span>';
                else
                    paragraph.innerHTML += '<span contenteditable="false" id="' + '%' + this.num.toString() + ':' + soloid + '">' + solobonding + '</span>';
                count++;
            } else if (nucleotide == "\n") {
                ////should I put next?
            } else if (buildingSpan == true && nucleotide == '$') {
                var id = stringSplit[i - 2];
                var bonding = stringSplit[i - 1];
                buildingSpan = false;
                var bondid = '$' + this.num.toString() + ":" + id;
                if (stringSplit[i - 3] != "$" || id == 0) {
                    id = stringSplit[i - 3] + stringSplit[i - 2];
                    bondid = '$' + this.num.toString() + ":" + id;
                }
                this.idDict[bondid] = id;
                if (this.bonds[bondid] == null) {
                    if (annotating)
                        span += '<span contenteditable="false" id="' + bondid + '">' + bonding + '</span>';
                    else
                        paragraph.innerHTML += '<span contenteditable="false" id="' + bondid + '">' + bonding + '</span>';
                    this.bonds[bondid] = [];
                    this.colors[bondid] = colors[id];
                }
                else {
                    if (annotating)
                        span += '<span contenteditable="false" id="' + bondid + 'b">' + bonding + '</span>';
                    else
                        paragraph.innerHTML += '<span contenteditable="false" id="' + bondid + 'b">' + bonding + '</span>';
                    this.bonds[bondid + 'b'] = [];
                    this.connectCount.push(id);
                    this.colors[bondid + 'b'] = colors[id];
                }
                count++;
            } else if (buildingSpan == true) {
                //basically we don't want to do anything now until the span is closed. should I call next?
            } else if (annotating) {
                span += nucleotide;
                count++;
            } else {
                paragraph.innerHTML += nucleotide;
                count++;
            }
        }
        var vertCol = document.getElementById('vert' + this.num);
        vertCol.innerHTML = vertNums;

        this.setParentHeight();
        this.addHoverEvents(eventList, annotationNotes);
        if (inner)
            this.addHoverEvents2(inner);
    }

    //buildEditor(sequence, colors, annotationNotes) {
    //    console.log("here")
    //    this.idDict = {};//Will translate full ID (%X:Y) to soloid (Y) // key: FullID (%X:Y) value: soloID
    //    this.colors = {};
    //    if (!this.rowLength)
    //        this.rowLength = 60;
    //    if (!annotationNotes)
    //        annotationNotes = {};

    //    var stringSplit = sequence.split('');
    //    var vertNums = "";
    //    var count = 0;
    //    var buildingSpan = false;
    //    var annotating = false;
    //    var paragraph = document.getElementById('paragraph' + this.num);
    //    paragraph.innerHTML = "";
    //    this.bonds = {};
    //    this.singlebonds = {};
    //    this.connectCount = [];
    //    this.singlearr = [];
    //    var eventList = [];
    //    var span = "";
    //    var postspan = "";
    //    for (var i = 0; i < stringSplit.length; i++) {
    //        var nucleotide = stringSplit[i];
    //        if (count % this.rowLength == 0 && paragraph.innerHTML[paragraph.innerHTML.length - 2] != 'r' && nucleotide != "\n" && !buildingSpan) {
    //            var newline = count == 0 ? "" : '</br>';
    //            if (annotating)
    //                if (nucleotide == '!')
    //                    postspan += newline;
    //                else
    //                    span += newline;
    //            else
    //                paragraph.innerHTML += newline;

    //            vertNums += newline ? '<br style="line-height:25px;">' : "";////FREQUENT BUG AROUND HERE INVESTIGATE WHEN FREE --> causes 1 to be added to vertNums repeatedly rather than just once --> 111 column
    //            vertNums += count + 1;
    //        } else if (count % 10 == 0 && paragraph.innerHTML[paragraph.innerHTML.length - 2] != 'r' && (paragraph.innerHTML[paragraph.innerHTML.length - 1] != ';' || span[span.length - 1] != ';') && nucleotide != "\n" && !buildingSpan)
    //            if (annotating) {
    //                if (nucleotide == '!')
    //                    postspan += '&nbsp;&nbsp;';
    //                else
    //                    if (span.length > 0 && span[span.length - 2] != 'r' && span[span.length - 2] != '"')
    //                        span += '&nbsp;&nbsp;';
    //            } else if (paragraph.innerHTML[paragraph.innerHTML.length - 1] != ';')
    //                paragraph.innerHTML += '&nbsp;&nbsp;';

    //        if (nucleotide == '$' && buildingSpan == false) {
    //            buildingSpan = true;
    //        } else if (nucleotide == '%' && buildingSpan == false) {
    //            buildingSpan = true;
    //        } else if (nucleotide == '!' && annotating == false) {
    //            annotating = true;
    //        } else if (annotating == true && !buildingSpan && !isNaN(nucleotide)) {
    //            var annotationid = nucleotide;
    //            span += '<span contenteditable="false" style="background:' + colors['!' + annotationid] + ';" id="' + '!' + annotationid + '">';
    //            eventList.push('!' + annotationid);
    //        } else if (annotating == true && nucleotide == '!') {
    //            span += '</span>';
    //            paragraph.innerHTML += span + postspan;
    //            span = "";
    //            postspan = "";
    //            annotating = false;
    //        } else if (buildingSpan == true && nucleotide == '%') {
    //            var soloid = stringSplit[i - 2];
    //            var solobonding = stringSplit[i - 1];
    //            buildingSpan = false;

    //            var spanid = '%' + this.num.toString() + ':' + soloid;
    //            this.singlebonds[spanid] = [];
    //            this.idDict[spanid] = soloid;
    //            this.colors[spanid] = colors[soloid];
    //            if (annotating)
    //                span += '<span contenteditable="false" id="' + '%' + this.num.toString() + ':' + soloid + '">' + solobonding + '</span>';
    //            else
    //                paragraph.innerHTML += '<span contenteditable="false" id="' + '%' + this.num.toString() + ':' + soloid + '">' + solobonding + '</span>';
    //            count++;
    //        } else if (nucleotide == "\n") {
    //            ////should I put next?
    //        } else if (buildingSpan == true && nucleotide == '$') {
    //            var id = stringSplit[i - 2];
    //            var bonding = stringSplit[i - 1];
    //            buildingSpan = false;
    //            var bondid = this.num.toString() + ":" + id;

    //            if (this.bonds[bondid] == null) {
    //                if (annotating)
    //                    span += '<span contenteditable="false" id="' + bondid + '">' + bonding + '</span>';
    //                else
    //                    paragraph.innerHTML += '<span contenteditable="false" id="' + bondid + '">' + bonding + '</span>';
    //                this.bonds[bondid] = [];
    //                this.colors[bondid] = colors[id];
    //            }
    //            else {
    //                if (annotating)
    //                    span += '<span contenteditable="false" id="' + bondid + 'b">' + bonding + '</span>';
    //                else
    //                    paragraph.innerHTML += '<span contenteditable="false" id="' + bondid + 'b">' + bonding + '</span>';
    //                this.bonds[bondid + 'b'] = [];
    //                this.connectCount.push(id);
    //                this.colors[bondid + 'b'] = colors[id];
    //            }
    //            count++;
    //        } else if (buildingSpan == true) {
    //            //basically we don't want to do anything now until the span is closed. should I call next?
    //        } else if (annotating) {
    //            span += nucleotide;
    //            count++;
    //        } else {
    //            paragraph.innerHTML += nucleotide;
    //            count++;
    //        }
    //    }
    //    var vertCol = document.getElementById('vert' + this.num);
    //    vertCol.innerHTML = vertNums;

    //    this.setParentHeight();
    //    this.addHoverEvents(eventList, annotationNotes);
    //}

    //checked
    addHoverEvents(eventList, annotationNotes) {
        for (var i = 0; i < eventList.length; i++) {
            var id = eventList[i];
            var notes = annotationNotes[id].notes;
            var firstpos = annotationNotes[id].firstpos;
            var secondpos = annotationNotes[id].secondpos;
            var newSpan = document.getElementById(id);
            newSpan.title = 'Annotation[' + firstpos + '-' + secondpos + ']: ' + notes;
        }
    }

    //new from other file
    addHoverEvents2(inner) {
        for (var i = 0; i < inner.length; i++) {
            var data = inner[i];
            var note = data.notes;
            var firstPos = data.firstpos;
            var secondPos = data.secondpos;
            var newSpan = document.getElementById("$" + this.num + ":" + data.id);
            var spanTwo = document.getElementById("$" + this.num + ":" + data.id + "b");

            var bondtype = data.bondtype;

            if (!newSpan || !spanTwo)
                continue;
            newSpan.title = 'Interchain Connection[' + bondtype + '][' + firstPos + '-' + secondPos + ']: ' + note;
            spanTwo.title = 'Interchain Connection[' + bondtype + '][' + firstPos + '-' + secondPos + ']: ' + note;
        }
    }

    //checked
    retrieveSpanCoordinates(id) {
        var span = document.getElementById(id);

        if (span == null)
            return null;

        var left = span.getClientRects()[0].left;
        var top = span.getClientRects()[0].top;
        var right = span.getClientRects()[0].right;
        var bottom = span.getClientRects()[0].bottom;

        return [[left, top], [right, bottom]];
    }

    getWidth(id) {//For width of span that we are drawing a box around
        var span = document.getElementById(id);
        return span.offsetWidth;
    }

    getHeight(id) {//For height of span that we are drawing a box around
        var span = document.getElementById(id);
        return span.offsetHeight;
    }

    moveBoxes(paragraph, that) {
        paragraph = paragraph || document.getElementById('paragraph' + this.num);
        this.clearBonds();
        var svgelement = this.buildSVG(paragraph);
        for (var id in this.bonds) {
            var coords = this.retrieveSpanCoordinates(id);
            if (coords)
                this.bonds[id] = coords;
            else {
                this.bonds[id] = null;
            }
        }
        this.heights = {};
        var add;
        for (var i = 0; i < this.connectCount.length; i++) {
            var bondid = '$' + this.num + ":" + this.connectCount[i];
            var bondid2 = '$' + this.num + ":" + this.connectCount[i] + "b";
            var bond1 = this.bonds[bondid];
            var bond2 = this.bonds[bondid2];
            if (bond1 == null || bond2 == null) {
                if (bond1 == null)
                    bond2 = null;
                else
                    bond1 = null;
                continue;
            }
            this.buildRectangle(bond1, this.getWidth(bondid), this.getHeight(bondid), this.colors[bondid], svgelement, bondid);
            this.buildRectangle(bond2, this.getWidth(bondid2), this.getHeight(bondid2), this.colors[bondid2], svgelement, bondid2);
            var horiz = this.bonds[bondid][0][1];
            var horiz2 = this.bonds[bondid2][0][1];
            if (horiz == horiz2)
                if (this.heights[horiz]) {
                    add = this.heights[horiz] * 3;//changed from 4
                    this.heights[horiz] += 1;
                } else {
                    add = 0;
                    this.heights[horiz] = 1;
                }
            this.connectBases(this.connectCount[i], svgelement, add);
        }
    }

    //replaced by new version
    //moveBoxes(paragraph, that) {
    //    paragraph = paragraph || document.getElementById('paragraph' + this.num);
    //    this.clearBonds();
    //    var svgelement = this.buildSVG(paragraph);
    //    for (var id in this.bonds) {
    //        this.bonds[id] = this.retrieveSpanCoordinates(id);
    //        this.buildRectangle(this.bonds[id], this.getWidth(id), this.getHeight(id), this.colors[id], svgelement);
    //    }
    //    //this.buildSoloBonds(svgelement, that);

    //    for (var i = 0; i < this.connectCount.length; i++) {
    //        this.connectBases(this.connectCount[i], svgelement);
    //    }
    //    //if (that)
    //    //    that.connectSolo();
    //}

    //checked
    buildSVG(paragraph) {
               var p = paragraph || document.getElementById('paragraph' + this.num);
        var rect = p.getClientRects()[0];
        var edit = document.getElementById('editor-full');
        var rect2 = edit.getClientRects()[0];
        var svgid = 'SVG' + this.num.toString();
        var svg = '<svg id="' + svgid + '" xmlns="http://www.w3.org/2000/svg" width="' + Math.ceil(rect2.width) + '" height="' + Math.ceil(rect.height) + '" style="position:relative;pointer-events:none;" transform="translate(0, ' + 0 + ')"></svg>';
        var editor = document.getElementById('editor' + this.num);
        editor.innerHTML += svg;
        return document.getElementById(svgid);
    }

    //checked ==> other method has id added but not used ???
    buildRectangle(coords, width, height, color, svgelement) {
        var svg = svgelement || document.getElementById('SVG' + this.num);
        if (!color)
            color = "rgb(255,0,0);";
        else
            color += ";";

        var verticalOff = svg.getBoundingClientRect().top;
        var horizontalOff = svg.getBoundingClientRect().left;
        var rect = '<rect x="' + (coords[0][0] - horizontalOff) + '" y="' + (coords[0][1] - verticalOff) + '" width="' + width + '" height="' + height + '" fill="none" style="stroke:' + color + 'pointer-events:none;" />';
        svg.innerHTML += rect;
    }

    buildSoloBonds(addDict, removedBonds) {
        var svgid = 'SVG' + this.num.toString();
        var svgelement = document.getElementById(svgid);
        this.singlearr = [];
        var add = 0;
        var heights = this.heights || {};
        var soloEnds = {};//going to store the end positions of each single bond drawn...// key: id | value: end position?
        for (var id in this.singlebonds) {
            //attempting to remove single bonds that have been removed at the other chain...
            var singlebondid = this.idDict[id];
            if (removedBonds && removedBonds[singlebondid]) {//if conditional is met, then the bond has been removed at another chain, and thus this ID should be skipped and ultimately removed
                this.singlebonds[id] = null;
                continue;
            }

            var coords = this.retrieveSpanCoordinates(id);

            if (coords) {
                this.singlebonds[id] = coords;
                var obj = {};
                obj.id = singlebondid;
                obj.id2 = id;
                obj.vert = this.singlebonds[id][0][1];
                obj.horiz = this.singlebonds[id][0][0];

                if (heights[obj.vert]) {
                    add = 4 * heights[obj.vert];
                    heights[obj.vert] += 1;
                }
                else {
                    add = 0;
                    heights[obj.vert] = 1;
                }

                this.singlearr.push(obj);
                this.buildRectangle(this.singlebonds[id], this.getWidth(id), this.getHeight(id), this.colors[id], svgelement, id);
                var endpos = this.buildSoloConnections(id, svgelement, add, addDict[obj.id]);
                soloEnds[id] = endpos;
            } else {
                soloEnds[id] == false;
            }
        }
        return soloEnds;
    }

    ////buildSoloBonds(addDict, removedBonds) {
    ////    var svgid = 'SVG' + this.num.toString();
    ////    var svgelement = document.getElementById(svgid);
    ////    this.singlearr = [];
    ////    var add = 0;
    ////    var add2 = 0;
    ////    var mult = 1;
    ////    var heights = {};
    ////    for (var id in this.singlebonds) {
    ////        //attempting to remove single bonds that have been removed at the other chain...
    ////        var len = id.length;
    ////        var singlebondid = id[len - 1];
    ////        if (removedBonds && removedBonds[singlebondid]) {//if conditional is met, then the bond has been removed at another chain, and thus this ID should be skipped and ultimately removed
    ////            this.singlebonds[id] = null;
    ////            continue;
    ////        }

    ////        this.singlebonds[id] = this.retrieveSpanCoordinates(id);

    ////        var obj = {};
    ////        obj.id = id[id.length - 1];
    ////        obj.vert = this.singlebonds[id][0][1];
    ////        obj.horiz = this.singlebonds[id][0][0];

    ////        if (heights[obj.vert]) {
    ////            add = 7 * heights[obj.vert];
    ////            heights[obj.vert] += 1;
    ////        }
    ////        else {
    ////            add = 0;
    ////            heights[obj.vert] = 1;
    ////        }

    ////        this.singlearr.push(obj);
    ////        this.buildRectangle(this.singlebonds[id], this.getWidth(id), this.getHeight(id), this.colors[id], svgelement);
    ////        this.buildSoloConnections(id, svgelement, add, addDict[obj.id]);
    ////    }
    ////}

    buildSoloConnections(bondid, svgelement, add, add2) {
        var svg = svgelement || document.getElementById('SVG' + this.num);
        var color = this.colors[bondid];
        add += 4;

        if (!color)
            color = "rgb(255,0,0);";
        else
            color += ";";

        var toConnect = this.singlebonds[bondid];

        var top = toConnect[0][1];
        var right = toConnect[1][0];
        var left = toConnect[0][0];
        var x = Math.abs(right + left) / 2;

        var verticalOff = svg.getBoundingClientRect().top + add;
        var horizontalOff = svg.getBoundingClientRect().left;

        var svgcol = document.getElementById('ColSVG');
        var horizontalSVGOff = svgcol.getBoundingClientRect().left;
        var xendposition = horizontalSVGOff + add2 - horizontalOff;
        var yendposition = top - verticalOff;

        var line = '<line x1="' + (x - horizontalOff) + '" y1="' + (top - verticalOff) + '" x2="' + xendposition + '" y2="' + yendposition + '" style="stroke:' + color + 'stroke-width:1;pointer-events:none;" />';//this vertoff is the position
        svg.innerHTML += line;

        if (add) {//Can reuse this peice of code for the inner bonds
            var line2 = '<line x1="' + (x - horizontalOff) + '" y1="' + (top - verticalOff + add) + '" x2="' + (x - horizontalOff) + '" y2="' + (top - verticalOff) + '" style="stroke:' + color + 'stroke-width:1;pointer-events:none;" />';
            svg.innerHTML += line2;
        }
        return [xendposition + horizontalOff, yendposition + verticalOff - add];

    }
    
    //buildSoloConnections(bondid, svgelement, add, add2) {
    //    var svg = svgelement || document.getElementById('SVG' + this.num);
    //    var color = this.colors[bondid];

    //    if (!color)
    //        color = "rgb(255,0,0);";
    //    else
    //        color += ";";

    //    var toConnect = this.singlebonds[bondid];

    //    var top = toConnect[0][1];
    //    var right = toConnect[1][0];
    //    var left = toConnect[0][0];
    //    var x = Math.abs(right + left) / 2;

    //    var verticalOff = svg.getBoundingClientRect().top + add;
    //    var horizontalOff = svg.getBoundingClientRect().left;

    //    var svgcol = document.getElementById('SVGCol');
    //    var horizontalSVGOff = svgcol.getBoundingClientRect().left;

    //    var line = '<line x1="' + (right - horizontalOff) + '" y1="' + (top - verticalOff) + '" x2="' + Math.ceil(horizontalSVGOff - horizontalOff + add2) + '" y2="' + (top - verticalOff) + '" style="stroke:' + color + 'stroke-width:1;pointer-events:none;" />';//this vertoff is the position
    //    svg.innerHTML += line;

    //    if (add) {//I cant remember why this is here, I was thinking maybe it is for the case where 
    //        var line2 = '<line x1="' + (right - horizontalOff) + '" y1="' + (top - verticalOff + add) + '" x2="' + (right - horizontalOff) + '" y2="' + (top - verticalOff) + '" style="stroke:' + color + 'stroke-width:1;pointer-events:none;" />';
    //        svg.innerHTML += line2;
    //    }

    //}

    connectBases(id, svgelement, add) {
        var svg = svgelement || document.getElementById('SVG' + this.num);
        var bondid = '$' + this.num + ':' + id;
        var color = this.colors[bondid];

        if (!color)
            color = "rgb(255,0,0);";
        else
            color += ";";

        if (!add)
            add = 0;
        add += 4;

        var toConnect = this.bonds[bondid];
        var toConnect2 = this.bonds[bondid + 'b'];

        var top = toConnect[0][1];
        var right = toConnect[1][0];
        var left = toConnect[0][0];
        var mid = (right + left) / 2;
        var x = Math.abs(right + left) / 2;

        var top2 = toConnect2[0][1];
        var right2 = toConnect2[1][0];
        var left2 = toConnect2[0][0];
        var x2 = Math.abs(right2 + left2) / 2;

        var verticalOff = svg.getBoundingClientRect().top + add;
        var horizontalOff = svg.getBoundingClientRect().left;

        var line = '<line x1="' + (x - horizontalOff) + '" y1="' + (top - verticalOff) + '" x2="' + (x2 - horizontalOff) + '" y2="' + (top2 - verticalOff) + '" style="stroke:' + color + 'stroke-width:1;pointer-events:none;" />';
        svg.innerHTML += line;

        if (add) {//Can reuse this peice of code for the inner bonds
            var line2 = '<line x1="' + (x - horizontalOff) + '" y1="' + (top - verticalOff + add) + '" x2="' + (x - horizontalOff) + '" y2="' + (top - verticalOff) + '" style="stroke:' + color + 'stroke-width:1;pointer-events:none;" />';
            var line3 = '<line x1="' + (x2 - horizontalOff) + '" y1="' + (top2 - verticalOff + add) + '" x2="' + (x2 - horizontalOff) + '" y2="' + (top2 - verticalOff) + '" style="stroke:' + color + 'stroke-width:1;pointer-events:none;" />';
            svg.innerHTML += line2;
            svg.innerHTML += line3;
        }
    }

    //connectBases(id, svgelement) {
    //    var svg = svgelement || document.getElementById('SVG' + this.num);
    //    var bondid = this.num + ':' + id;
    //    var color = this.colors[bondid];

    //    if (!color)
    //        color = "rgb(255,0,0);";
    //    else
    //        color += ";";

    //    var toConnect = this.bonds[bondid];
    //    var toConnect2 = this.bonds[bondid + 'b'];

    //    var top = toConnect[0][1];
    //    var right = toConnect[1][0];
    //    var left = toConnect[0][0];
    //    var x = Math.abs(right + left) / 2;

    //    var top2 = toConnect2[0][1];
    //    var right2 = toConnect2[1][0];
    //    var left2 = toConnect2[0][0];
    //    var x2 = Math.abs(right2 + left2) / 2;

    //    var verticalOff = svg.getBoundingClientRect().top;
    //    var horizontalOff = svg.getBoundingClientRect().left;

    //    var line = '<line x1="' + (right - horizontalOff) + '" y1="' + (top - verticalOff) + '" x2="' + (left2 - horizontalOff) + '" y2="' + (top2 - verticalOff) + '" style="stroke:' + color + 'stroke-width:1;pointer-events:none;" />';
    //    svg.innerHTML += line;
    //}

    //checked
    quickParse(sequence) {//will not work for spans
        //var matches = sequence.match(/[a-zA-Z]+/g);//can't remember what the difference is with the plus????
        var matches = sequence.match(/[a-zA-Z]/g);//returns an array of the letters...
        return matches;
    }

    //checked
    setParentHeight() {
        var parent = document.getElementById('parent' + this.num);
        var table = document.getElementById('editTable' + this.num);
        var tableData = table.getBoundingClientRect();
        parent.style.height = tableData.height.toString() + 'px';
        parent.style.width = tableData.width.toString() + 'px';
    }

    clearBonds() {//////THIS ONLY DELETES THE SVG ELEMENT
        var editor = document.getElementById('editor' + this.num);
        editor.innerHTML = "";
    }

    selfDestruct() {
        this.clearBonds();
    }

    //not sure which processEdit should be used here!
    processEdit(input, that) {
        this.clearBonds();
        this.bonds = {};
        this.connectCount = [];
        this.singlebonds = {};

        that.handleEdit(this.num, input);
    }

    //processEdit(action, p, that) {
    //    if (action == true) {
    //        this.clearBonds();
    //        this.bonds = {};
    //        this.connectCount = [];
    //        //collect singlebond ids to not build
    //        ////var keys = scil.Utils.getDictKeys(this.singlebonds);
    //        var keys = Interface.getDictKeys(this.singlebonds)
    //        var removedBonds = {};
    //        for (var i in keys) {
    //            var soloid = this.idDict[keys[i]];
    //            removedBonds[soloid] = true;
    //        }
    //        this.singlebonds = {};
    //        if (that)
    //            that.handleEdit(removedBonds, this.num);
    //    } else {
    //        p.innerHTML = this.beforeEdit;
    //    }
    //}
};


    //reAlignEditor: function (sequence, length, paragraph) {// Function currently retired because span inside span problem. Could be fixed with recursive function. Could instead just use this function without annotations...
    //    paragraph.innerHTML = "";
    //    var n = 0;
    //    var originalLength = length;
    //    while (length > 0) {
    //        var sequenceIndex = originalLength - length;
    //        var innerColumnIndex = sequenceIndex % 10;
    //        //var row = Math.ceil(sequenceIndex / 60);
    //        var rowIndex = sequenceIndex % 60;
    //        var span = "";
    //        var current = sequence[n];

    //        if (current == '&') {//case where we have &nbsp;
    //            while (current != ';') {//increment until the end of the nbsp;, don't need to record anything, we will add new nbsp; at another point
    //                current = sequence[n];
    //                n++;
    //            }
    //        } else if (current == '<') {//case where we have a <span> or <br>;
    //            while (current != '>') {
    //                current = sequence[n];
    //                span += current;
    //                n++;
    //            }
    //            current = sequence[n];
    //            if (span[1] == "s") {
    //                var previous = sequence[n - 1];
    //                while (current != '>') {//breaks if we have annotations ==> would give case where span inside of span so it will detect new span's closing bracket as the original span's final closing bracket... thus why this function is currently retired...
    //                    current = sequence[n];
    //                    previous = sequence[n - 1];
    //                    span += current;
    //                    n++;
    //                }
    //                //while (current != '>') {
    //                //    current = sequence[n];
    //                //    span += current;
    //                //    n++;
    //                //}
    //                if (rowIndex == 0 && paragraph.innerHTML.length > 0)
    //                    paragraph.innerHTML += '</br>';
    //                else if (innerColumnIndex == 0 && paragraph.innerHTML.length > 0)//maybe change this if we don't want in the beginning
    //                    paragraph.innerHTML += '&nbsp;&nbsp;';
    //                //if (rowIndex == 0)
    //                //    paragraph.innerHTML += '</br>';
    //                //else if (innerColumnIndex == 0)//maybe change this if we don't want in the beginning
    //                //    paragraph.innerHTML += '&nbsp;&nbsp;';
    //                paragraph.innerHTML += span;
    //                length--;
    //            }
    //        } else if (current == " ") {
    //            n++;
    //        } else if (current == "\n") {
    //            n++;
    //        } else {
    //            //if (rowIndex == 0)
    //            //    paragraph.innerHTML += '</br>';
    //            if (rowIndex == 0 && sequenceIndex != 0)
    //                paragraph.innerHTML += '</br>';
    //            else if (innerColumnIndex == 0 && rowIndex != 0)//maybe change this if we don't want in the beginning
    //                paragraph.innerHTML += '&nbsp;&nbsp;';
    //            paragraph.innerHTML += current;

    //            length--;
    //            n++;
    //        }
    //    }
    //},

    ////////////////////////////////////////////////////////Event Listeners from earlier versions that rebuilt the editors + bonds after each character input or after each focusout......................:

    //p.oninput = function (event) {


    //    //var seqIn = scil.SDMS.SequenceEditor2.quickParse(this.innerText);
    //    //var newSequence = p.innerText;//maybe figure out the index that was changed and what was changed? check function input values for specific letter input
    //    me.moveBoxes(p, that);

    //};



    //parent.addEventListener("focusout", function (e2) {//I am commenting this out because editing sequences is not a priority (TONY) && reAlignEditor has not been altered to handle the new sequence annotation in the input string
    //    console.log(me);
    //    e2.preventDefault();
    //    var p = document.getElementById(`paragraph${me.num}`);
    //    //var rows = p.innerHTML.split('<br>');
    //    //var splitSections = {};
    //    //for (i = 0; i < rows.length; i++) {
    //    //    splitSections[i+1] = rows[i].split('&nbsp;&nbsp;');
    //    //}
    //    var length = me.quickParse(p.innerText).length;
    //    //me.reAlignEditor(p.innerHTML, length, p);
    //    //that.buildSVG();
    //    //that.addBonds();
    //    that.buildSVG();
    //    me.moveBoxes(p, that);
    //    //that.connectSolo();

    //    //me.rebuildEditor(splitSections, length);

    //    //var seqIn = scil.SDMS.SequenceEditor2.quickParse(this.innerText);
    //    //this.contentEditable = false;
    //    //p.contentEditable = false;

    //    //this.quickReformat();
    //    //this.style.display = "none";            
    //});


    //parent.oninput = function (e, f) {
    //    var input;
    //    if (e.data != null && e.inputType == "insertText")
    //        input = e.data;
    //    //inputType: "deleteContentBackward" e.data == null
    //    //inputType: "deleteContentForward" e.data == null
    //    //inputType: "insertText" works with space as well e.data == " "
    //    //for some reason TAB key causes "focusout" event??????
    //    var p = document.getElementById(`paragraph${num}`);
    //    //var seqIn = scil.SDMS.SequenceEditor2.quickParse(this.innerText);
    //    var newSequence = p.innerText;//maybe figure out the index that was changed and what was changed? check function input values for specific letter input
    //    me.moveBoxes(p);
    //    //that.buildSVG();
    //    //that.addBonds();
    //};

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
     function aa1to3(aa){
    if(aa=="A") return "Ala";
    else if(aa=="C") return "Cys";
    else if(aa=="D") return "Asp";
    else if(aa=="E") return "Glu";
    else if(aa=="F") return "Phe";
    else if(aa=="G") return "Gly";
    else if(aa=="H") return "His";
    else if(aa=="I") return "Ile";
    else if(aa=="K") return "Lys";
    else if(aa=="L") return "Leu";
    else if(aa=="M") return "Met";
    else if(aa=="N") return "Asn";
    else if(aa=="P") return "Pro";
    else if(aa=="Q") return "Gln";
    else if(aa=="R") return "Arg";
    else if(aa=="S") return "Ser";
    else if(aa=="T") return "Thr";
    else if(aa=="V") return "Val";
    else if(aa=="W") return "Trp";
    else if(aa=="Y") return "Tyr";
    else if(aa=="*") return "stop";
    else if(aa=="X") return "ambiguous";
    else return aa;
}*/

    //function retrievePureString(str) {
    //    //this function would be used to convert the string with annotations to a usable, editable string in one span...
    //}

    //function renderEditableSpan() {
    //    //rerender span with purestring for editing
    //}
    //////////////////////////// Code that can replace $n(id)$ from string while also grabbing the index ////////////////////////////////////////////////////////////
    //    var n = 0;
    //    var final = "";
    //    var str1 = "AGCTAGGCCTAGCTGGCT$1C$TAGC$1C$AGGTAGCTGGCTAGGCTAGCCTAGCTGGCTAGGCTAGCCTAGCTGG";
    //    var sections = [];
    //    var regex = /\$\d\w\$/gi;
    //    var result, indices =[];
    //    var gaps = [];
    //    while(result = regex.exec(str1)) {
    //        var section = {};
    //        console.log(result, regex.lastIndex, 'er');
    //        indices.push(result.index);
    //        section.start = result.index;
    //        section.end = regex.lastIndex;
    //        //section.id = 
    //        sections.push(section);
    //        if (n >= 20)
    //            break;
    //        n++;
    //    }
    //sections;
    //    var start = 0;
    //    for(i = 0; i<= sections.length; i++) {
    //    console.log(final);
    //    if (i == sections.length) {
    //        final += str1.slice(start, str1.length1);
    //        console.log(str1.slice(start, str1.length1));
    //    } else {
    //        final += str1.slice(start, sections[i].start);
    //        start = sections[i].end;
    //        console.log(str1.slice(start, sections[i].start));
    //    }
    //}
    //str1.replace(regex, "").length == final.length

    //rebuildEditor: function (sequence, length) {
    //    var rownumber = Math.ceil(length / 60);
    //    var newSections = {};
    //    for (i = 1; i <= rownumber; i++) {
    //        for (j = 0; j < 10; j++) {
    //            newSections[i] = newSections[i] ? newSections[i] : {};
    //            if (sequence[i][j] != null)
    //                newSections[i][j] = sequence[i][j].split("&nbsp;").join("").split(" ").join();
    //        }
    //    }
    //    return newSections;

    //    //splitSections[1][4].replaceAll("&nbsp;", '').replaceAll(" ", "");
    //},

    //String.prototype.replaceAll = function (search, replacement) {
    //    var target = this;
    //    return target.split(search).join(replacement);
    //};
    //////////////////////////
    //console.log(me);
    //e2.preventDefault();
    //var p = document.getElementById('paragraph${num}');
    //var rows = p.innerHTML.split('<br>');
    //var splitSections = {};
    //for (i = 0; i < rows.length; i++) {
    //    splitSections[i+1] = rows[i].split('&nbsp;&nbsp;');
    //}
    //var length = me.quickParse(p.innerText).length;
    //me.reAlignEditor(p.innerHTML, length, p);
    //me.moveBoxes(p);
    //me.rebuildEditor(splitSections, length);
    //var seqIn = scil.SDMS.SequenceEditor2.quickParse(this.innerText);
    //this.contentEditable = false;
    //p.contentEditable = false;
    //this.quickReformat();
    //this.style.display = "none";

    /////////////////////////

    //var bondAnnotations = this.currentFullString.match(/[$]\w*[$]/g);//grabs each text part that we don't want to display
    //var regex = /\$\d\w\$/gi;
    //var result, indices = [];
    //while ((result = regex2.exec(str1))) {
    //    console.log(result, regex.lastIndex, 'er');
    //    indices.push(result.index);
    //}
