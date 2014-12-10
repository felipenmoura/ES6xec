
// useeful global shortcuts
function log(){
    window.console.log.apply(window.console, [].slice.call(arguments));
};

(function(){

    "use strict";

    var utils = {},
        bodyCL = document.body.classList,
        previousCode= "",
        showInEs5Label = 'Show in ES5';

    utils.strToType = function (val) {
        return JSON.stringify(val, null, 4);
    }
    utils.loadSample = function (sample, step) {
        var samples = utils.samples[sample],
            sampleName= sample;

        if(samples){
            step = step || samples.cur || 0;
            sample = samples[step];
            returnedValue.innerHTML = "";

            if(samples.length > 1){
                bodyCL.add('hasSteps');
            }else{
                bodyCL.remove('hasSteps');
            }

            utils.learning = {
                item: sampleName,
                idx: step,
                last: samples.length-1
            };

            workingOnDesc.innerHTML = (samples.description || sampleName).replace(/\-/g, ' ');
        }else{
            sample = false;
        }

        utils.codeEditor.setValue(sample || "\n// sample \""+ sampleName +"\" not found\n");
        utils.setStepLabel();
        
        showBtn.value = showInEs5Label;
    }
    utils.prevStep = function(){
        if(utils.learning && utils.learning.idx > 0){
            utils.loadSample(utils.learning.item, --utils.learning.idx);
        }
        utils.setStepLabel();
    }
    utils.nextStep = function(){
        if(utils.learning && utils.learning.idx < utils.learning.last){
            utils.loadSample(utils.learning.item, ++utils.learning.idx);
        }
        utils.setStepLabel();
    }
    utils.setStepLabel = function () {
        if(utils.learning){
            stepsLabel.innerHTML = (utils.learning.idx + 1) + '/' + (utils.learning.last + 1);
        }
    }

    function bindEvents () {
        showBtn.addEventListener('click', function(){
            //alert(to5.transform(codeEditor.getValue()).code);
            if(this.value == showInEs5Label){
                this.value = 'Back to ES6';
                previousCode= utils.codeEditor.getValue();
                utils.codeEditor.setValue(to5.transform(utils.codeEditor.getValue()).code);
                //document.body.classList.add('showingTranspiler');
            }else{
                this.value = showInEs5Label;
                //document.body.classList.remove('showingTranspiler');
                utils.codeEditor.setValue(previousCode);
            }
        });

        runBtn.addEventListener('click', function(){
            returnedValue.innerHTML= "";
            var ret= "";
            try{
                ret= to5.eval(utils.codeEditor.getValue());
                returnedValue.innerHTML+= "<br/>> " + utils.strToType(ret);
            }catch(e){
                ret= "<span class='error-message'>"+e.message+"</span>";
                returnedValue.innerHTML+= "<br/>> Error: " + ret;
            }

        });

        theNav.addEventListener('click', function(event){

            if(event.target.getAttribute('data-type') == 'preLoad') {
                // clicked on a code sample
                utils.loadSample(event.target.getAttribute('data-id'));
            }
        });

        prevStep.addEventListener('click', function (event) {
            utils.prevStep();
        });
        nextStep.addEventListener('click', function (event) {
            utils.nextStep();
        });
    }

    function setEnv () {

        // prepare samples
        utils.samples = (function(){
            function getTemplatesFrom (templateSet) {
                var list= [];
                [].slice.call(templateSet.getElementsByTagName('template')).forEach(function(cur){
                    list.push(cur.innerHTML.replace(/\&lt;/g, '<').replace(/\&gt;/g, '>'));
                });
                list.cur = 0;
                list.description = templateSet.getElementsByTagName('label');
                list.description = list.description.length? list.description[0].innerHTML : false;
                return list;
            }

            var sampleEls = document.querySelectorAll('#samples section'),
                samples = {};
            [].slice.call(sampleEls).forEach(function(cur){
                samples[cur.getAttribute('id')] = getTemplatesFrom(cur);
            });
            return samples;
        }());

        // LOG
        var originalLog = window.console.log;
        window.console.log = function () {
            var args= [].slice.call(arguments),
                val,
                finalMessage= "";

            args.forEach(function(cur){
                val = utils.strToType(cur);
                finalMessage+= " " + (val && val.replace? val.replace(/\\n/g, '\n') : "");
            });
            returnedValue.innerHTML+= "<br/>> " + finalMessage.replace(/^ /, '');

            originalLog.apply(window.console, args);
        }

        // auto-open
        if(location.search){
            var s= location.search.match(/[\?\&]learn=([a-z0-9\-\._]+)/i);
            var h= location.search.match(/[\?\&]hideDescription=([01])/i);
            if(s){
                s = s[1];
               utils.loadSample(s);
            }
            if(h && h[1]){
                bodyCL.add('hideDescription');
            }
        }
    }

    function setEditors () {
        utils.codeEditor = CodeMirror(function(elt) {
            originalCode.parentNode.replaceChild(elt, originalCode);
        }, {
            value: originalCode.value,
            indentUnit: 4,
            tabSize: 4,
            indentWithTabs: false,
            lineWrapping: false,
            lineNumbers: true,
            viewportMargin: 5
        });

        utils.transpiledTo = CodeMirror(function(elt) {
            transpiledToEl.parentNode.replaceChild(elt, transpiledToEl);
        }, {
            value: "",
            indentUnit: 4,
            tabSize: 4,
            indentWithTabs: false,
            lineWrapping: false,
            lineNumbers: true,
            viewportMargin: 5
        });
    }

    bindEvents();
    setEditors();
    setEnv();
}());

