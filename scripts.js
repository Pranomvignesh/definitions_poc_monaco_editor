require.config({
    paths: {
        vs: "./node_modules/monaco-editor/dev/vs"
    }
})
require(["vs/editor/editor.main"], initEditor)
function addLib(xhrObj,callback){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState === 4 && this.status === 200){
            callback(xhttp);
        }
    };
    xhttp.open("GET", xhrObj.url, true);
    xhttp.send();
}

function parseJsDocJson(jsonStr){
    const json = JSON.parse(jsonStr);
    const lib = {};
    const getCurrObjFrom = function(member,lib){
        let keys = member.split('.');
        let currObj = lib;
        for(let i = 0, len = keys.length; i < len ; i++){
            if(!currObj[keys[i]]){
                currObj[keys[i]] = {}
            }
            currObj = currObj[keys[i]]
        }
        return currObj
    }
    const anonymousFn = function(){};
    json.forEach(function(obj){
        if(obj.memberof && obj.memberof !== '<anonymous>'){
            const currObj = getCurrObjFrom(obj.memberof,lib);
            switch (obj.kind) {
                case 'function':
                    // if(!lib[obj.memberof]){ lib[obj.memberof] = {} };
                    currObj[obj.name] = anonymousFn;
                break;
                case 'package':{
                    // do nothing
                }
                break;
                case 'member':{
                    // if(!lib[obj.memberof]){ lib[obj.memberof] = {} };
                    switch (obj.meta.code.type) {
                        case 'ObjectExpression':{
                            currObj[obj.name] = {}
                        }
                        break;
                        case 'Literal':{
                            currObj[obj.name] = obj.meta.code.value;
                        }
                        break;
                        default:
                            console.log('default',obj)
                        break;
                    }
                }
                break;
                default:
                    console.log(obj);
                break;
            }
        }
    })
    let str = '';
    for(let key in lib){
        str += 'var '+key+' = '+JSON.stringify(lib[key])+';';
    }
    return str;
}

function initEditor(){
    const libUrls = [
        "./node_modules/@types/jquery/JQuery.d.ts",
        "./node_modules/@types/jquery/JQueryStatic.d.ts",
        "./node_modules/@types/jquery/misc.d.ts",
        "./node_modules/@types/jquery/legacy.d.ts"
    ]
    libUrls.forEach(function(url){
        addLib( { url : url } ,function(xhttp){
            monaco.languages.typescript.javascriptDefaults.addExtraLib(xhttp.responseText)
        });
    })
    
    addLib({ url : './testModule.json' },function(xhttp){
        monaco.languages.typescript.javascriptDefaults.addExtraLib(parseJsDocJson(xhttp.responseText));
    })
    const sampleJs = `var a = $("body");`;
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2016,
        allowNonTsExtensions: true,
        module: monaco.languages.typescript.ModuleKind.System,
        noEmit: true,
        typeRoots: ["/node_modules/@types/"],
        noLib: true
    });
    const jsModel = monaco.editor.createModel(sampleJs,"javascript");
    const editorDiv = document.querySelector('.editorDiv');
    const jsContainer = monaco.editor.create(editorDiv,{
        wordWrap : 'on'
    })
    jsContainer.setModel(jsModel);
}