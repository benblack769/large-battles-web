function createEL(name,methods){
    var el = document.createElement(name)
    if(methods.style){
        for(var key in methods.style){
            el.style[key] = methods.style[key]
        }
        delete methods.style
    }
    if(methods.parent){
        methods.parent.appendChild(el);

        delete methods.parent;
    }
    if(methods.children){
        methods.children.forEach(function(child){
            el.appendChild(child)
        })
        delete methods.children
    }
    for(key in methods){
        el[key] = methods[key]
    }
    return el;
}
function createDiv(methods){
    return createEL("div", methods)
}
function createSpan(methods){
    return createEL("span", methods)
}
class BaseComponent {
    constructor(parent, basediv){
        this.__parent = parent;
        this.basediv = basediv;
    }
    messageChildren(message){
        this.children().forEach(function(child){
            child.messageDown(message)
        })
    }
    sendMessageUp(message){
        this.__parent.messageUp(message)
    }
    messageUp(message){
        this.sendMessageUp(message)
    }
    messageDown(message){
        //no-op
    }
    children(){
        return []
    }
}
module.exports = {
    BaseComponent: BaseComponent,
    createSpan: createSpan,
    createDiv: createDiv,
    createEL: createEL,
}
