var animationIn = 'animateIn';
var animationOut = 'animateOut';
var transitionEndEvent = function(event){
    event.stopPropagation();
    if (event.target.classList.contains(animationOut)){
        event.target && event.target.parentNode && event.target.parentNode.removeChild(event.target)
        dragManager.createRectangleSpace(dragManager.dropZone);
    }
}
var dragManager ={
    dragStatus: 'none',
    //none - before event
    //init - drag started, initialize all variables, place ghost in original position
    //search - looking for the right target
    //found - found target and wait
    //drop - end drag event
    init: function(container, index, element){
        //
        this.dropZone = {};
        this.dropIndex = -1;
        //abstract component
        this.currentContainer = container;
        this.currentIndex = index;
        this.component = container.children[index];
        //html element
        this.dragElement = element;
        this.ghostElement = element.cloneNode(true);//clean copy for future clones
        this.dragGhost = element.cloneNode(true);
        this.dragGhost.classList.add('ghost');
        this.dragGhost.addEventListener("animationend", function(){transitionEndEvent(event)},false)
        this.clientX = 0;
        this.clientY = 0;
        this.rectangles = [];
        this.initialize = false;
        this.elements = [];
        this.lastX = -1;
        this.lastY = -1;
    },
    mouseMove: function(event){
      if((event.clientX !== this.lastX)||(event.clientY !== this.lastY)) {
          this.lastX = event.clientX;
          this.lastY = event.clientY;
          return true;
      }
      else{
          return false;
      }
    },
    createGhost:function(){
        var ghost = this.ghostElement.cloneNode(true);
        ghost.classList.add('ghost');
        ghost.addEventListener("animationend", function(){transitionEndEvent(event)},false)
        return ghost;
    },
    toggleGhost:function(){
        this.dragGhost.classList.add('animated');
        this.dragGhost.classList.add(animationOut);
        var ghost = this.ghostElement.cloneNode(true);
        ghost.classList.add('ghost');
        ghost.addEventListener("animationend", function(){transitionEndEvent(event)},false)
        this.dragGhost = ghost;
    },
    done: function(){
        layoutgrid.dragEvent = false;
        this.dragElement.classList.remove('hidden');
        var element = this.dragGhost;
        element && element.parentNode && element.parentNode.removeChild(element);
        this.component.dragged = false;
    },
    enterDropZone: function(component){
        if (!this.initialize){//only once in a drag session
            layoutgrid.dragEvent = true;//set drag state view
            this.dragElement.classList.add('hidden');//hide original element from view
            this.initialize = true;
        }
        this.createRectangleSpace(component);
        this.currentIndex = -1;
        this.currentContainer.dropzone = false;
        this.currentContainer = component.data;
        this.currentContainer.dropzone = true;
    },
    simulateNest: function(component) {
        console.log('simulate nest')
        if (component.$el.children[1].children.length === 0){//1st option - the container is empty
            console.log('empty container')
            this.toggleGhost();
            this.dragGhost.classList.add('animated');
            this.dragGhost.classList.add(animationIn);
            component.$el.children[1].appendChild(this.dragGhost);
            this.dropIndex = 0;
            this.dropZone = component;
        }
        else{
            console.log('not empty')
        }
        try{
        }
        catch(e){

        }
        window.getComputedStyle(this.dragGhost).maxHeight;
    },
    simulateDrop: function(component,index){
        console.log('simulateDrop');
        this.toggleGhost();
        this.dragGhost.classList.add('animated');
        this.dragGhost.classList.add(animationIn);
        if (component.$el.children[1].children[index].classList.contains(animationOut)){
            console.log('double')
        }
        else{
            component.$el.children[1].insertBefore(this.dragGhost,this.elements[index]);
            this.dropIndex = index;
            this.dropZone = component;
        }
        window.getComputedStyle(this.dragGhost).maxHeight;
    },
    newLocation: function(component,index){
        if ((this.dropIndex === index) && (this.dropZone.$el === component.$el)){
            return false;
        }
        else{
            return true;
        }
    },
    updateIndex: function(index){

    },
    setContainer: function(container){
        this.currentContainer.dropzone = false;
        this.currentContainer = container;
        this.currentContainer.dropzone = true;
        layoutgrid.container = this.currentContainer.children.length;
    },
    detachComponent: function(){
        if(!this.detached){
            if (this.currentContainer.children[this.currentIndex] != null){
                //this.component = this.currentContainer.children.splice(this.currentIndex,1)[0];//remove component from its previous container
                // this.component = this.currentContainer.children[this.currentIndex];//set current component
                this.dragElement.classList.add('hidden');
                this.detached = true;
            }
            else{
                console.log('ERROR trying to perform detach on:')
            }
        }
        else{
            console.log('ERROR already detached')
        }
    },
    emulateDrop: function(container, index){
        this.currentContainer = container;
        this.component = this.currentContainer.children.splice(this.currentIndex,1)[0]//remove element from it's current position
        console.log('spliced!!')
        this.currentContainer.children.splice(index,0,this.component);//put element in place
        this.setIndex(index);
        this.dragElement.classList.remove('hidden');
        this.detached = false;
        console.log('emulateDrop')
    },
    createRectangleSpace: function(component) {
        console.log('creating new rect space!');
        var children = component.$el.children[1].children;
        this.rectangles = [];
        this.elements = [];
        layoutgrid.rectangles = [];
        for (var i=0; i<children.length; i+=1){
            var list = children[i].classList;
            if ((!list.contains('ghost'))&&(!list.contains('dragged'))) {
                var boundingRect = children[i].getBoundingClientRect();
                var rect = {};
                rect.top = boundingRect.top;
                rect.left = boundingRect.left;
                rect.bottom = boundingRect.bottom;
                rect.right = boundingRect.right;
                this.rectangles.push(rect);
                this.elements.push(children[i]);
                var lgrect = {};
                lgrect.styleObject = {};
                lgrect.styleObject.top = rect.top + 'px';
                lgrect.styleObject.left = rect.left + 'px';
                lgrect.styleObject.width = (rect.right - rect.left) + 'px';
                lgrect.styleObject.height = (rect.bottom - rect.top) + 'px';
                layoutgrid.rectangles.push(lgrect);
            }
        }
    },
    movementCheck: function(event){
        // if ((this.clientX !== event.clientX)||(this.clientY !== event.clientY)){
        //     return true;
        // }
        // else{
        //     return false;
        // }//for future performance improvement
        var gap = Math.abs(this.clientX - event.clientX + this.clientY - event.clientY);
        if (gap > 0){
            return true;
        }
        else{
            return false;
        }
    },
    setIndex: function(index){
        if (this.currentIndex !== index){
            this.currentIndex = index;
            this.touched = true;
        }
        else{
            this.touched = false;
        }
        return this.currentIndex;
    },
    handleMovement: function(event){
        this.clientX = event.clientX;
        this.clientY = event.clientY;
        if (this.rectangles.length === 0){
            return 0;
        }
        ///take care of this when you have the time...
        if (this.rectangles.length === 1){
            if (this.rectangles[0].bottom < this.clientY) {//rect is above point
                return 1;
            }
            if (this.rectangles[0].right < this.clientX) {//rect is left of point
                return 1;
            }
            if (this.rectangles[0].top > this.clientY) {//rect is below point
                return 0;
            }
            if (this.rectangles[0].left > this.clientX) {//rect is right of point
                return 0;
            }
        }
        var indexAbove = this.countRectangles('y',0,this.rectangles.length-1);
        var indexBelow = this.countRectangles('y',this.rectangles.length-1,0);
        if (indexAbove === indexBelow){
            return indexAbove;
        }
        else{
            return this.countRectangles('x', indexAbove,indexBelow-1);
        }
    },
    countRectangles: function(axis, startIndex, endIndex) {
        var index = startIndex;
        if (index <= endIndex) {//count up
            while (index <= endIndex) {
                if (axis === 'y') {
                    if ((this.rectangles[index].bottom) < this.clientY) {//rect is above point
                    // if ((this.rectangles[index].top) < this.clientY) {//rect is above point
                        index += 1;
                    }
                    else {
                        return index;
                    }
                }
                else {
                    if (this.rectangles[index].right < this.clientX) {//rect is left of point
                        index += 1;
                    }
                    else {
                        return index;
                    }
                }
            }
            return index;
        }
        if (index >= endIndex){//count down
            while (index >= endIndex) {
                if (axis === 'y') {
                    if ((this.rectangles[index].top)> this.clientY) {//rect is below point
                    // if ((this.rectangles[index].bottom) > this.clientY) {//rect is below point
                        index -=1;
                    }
                    else {
                        return index+1;
                    }
                }
                else {
                    if (this.rectangles[index].left > this.clientX) {//rect is right of point
                        index -=1;
                    }
                    else {
                        return index+1;
                    }
                }
            }
            return index+1;
        }
    }
};

var genericAddMagic = function(component, id){
    component.children.push(new abstractComponent(id));
}
var genericRemoveMagic = function(component, index){
    component.children.splice(index,1);
}
var setDragged = function(component, bool){
    component.data.dragged = bool;
    for (var i=0; i<component.$children.length; i+=1){
        setDragged(component.$children[i],bool);
    }
}
var abstractComponent = function(id){
    this.id = id;
    this.dragged = false;
    this.dropzone = false;
    this.me = false;
    this.size = componentCatalog[id].size;
    if (componentCatalog[id].nestable){
        this.children = [];
    }
    this.classObject = {
        mainClass: componentCatalog[id].mainClass,
        collector : [],
        get calculatedClass() {
            return this.mainClass.concat([].concat.apply([], this.collector));
        }
    }
    this.styleObject = {};
    if (componentCatalog[id].content){
        this.content='';
    }
    return this;
}
var spaceRect = function(){
    this.top = '';
    this.left = '';
    this.width = '';
    this.height = '';
}


//*** DATA STRUCTURE ***
var componentCatalog = [
    {
        name: 'Main Container',
        icon: 'browser',
        id: 0,//index
        mainClass: ['flex-layout','flex-column'],
        placeHolder: false,
        options:true,
        classOptions:[
            {
                optionName: 'Grid Variations',
                optionType: 'select-multiple',
                options: [
                    {
                        name: 'Padded',
                        info: 'Use padding instead of negative margins',
                        value: 'padded'
                    },
                    {
                        name: 'Relaxed',
                        info: 'Increase the gutters size',
                        value: 'relaxed'
                    }
                ]
            },
            {
                optionName: 'Grid Type',
                optionType: 'select-radio',
                options: [
                    {
                        name: 'Divided',
                        info: 'Divided layout',
                        value: 'divided'
                    },
                    {
                        name: 'Celled',
                        info: 'Divided layout with borders',
                        value: 'celled'
                    },
                    {
                        name: 'Internally Celled',
                        info: 'Divided layout with inline borders',
                        value: 'internally celled'
                    }
                ]

            }
        ],
        nestable: true,
        componentFunctions: {
            readyFunction: function () {},
            addMagicFunction: genericAddMagic,
            removeMagicFunction: genericRemoveMagic
        }
    },
    {
        name: 'Row',
        icon: 'ellipsis horizontal',
        id: 1,//index
        mainClass: ['flex-layout','flex-row'],//temporary
        size: 'size-12',//temporary
        placeHolder: 'row',
        options:false,
        nestable: true,
        componentFunctions: {
            readyFunction: function () {},
            addMagicFunction: genericAddMagic,
            removeMagicFunction: genericRemoveMagic
        }
    },
    {
        name: 'Column',
        icon: 'ellipsis vertical',
        id: 2,//index
        // mainClass: ['four', 'wide', 'column'],
        mainClass: ['flex-layout','flex-column'],//temporary
        size: 'size-3',//temporary
        placeHolder: 'column',
        options:true,
        classOptions:[
            {
                optionName: 'Grid Variations',
                optionType: 'select-multiple',
                options: [
                    {
                        name: 'Padded',
                        info: 'Use padding instead of negative margins',
                        value: 'padded'
                    }
                ]
            }
        ],
        nestable: true,
        componentFunctions: {
            readyFunction: function () {},
            addMagicFunction: genericAddMagic,
            removeMagicFunction: genericRemoveMagic
        }
    },
    {
        name: 'Segment',
        icon: 'newspaper',
        id: 3,//index
        type: 'content',
        mainClass: ['ui', 'segment'],
        placeHolder: 'ui segment',
        options:true,
        nestable: true,
        componentFunctions: {
            readyFunction: function () {},
            addMagicFunction: genericAddMagic,
            removeMagicFunction: genericRemoveMagic
        }
    },
    {
        name: 'Rich Text',
        icon: 'file text outline',
        id: 4,//index
        type: 'content',
        mainClass: [],
        placeHolder: 'ui segment',
        options:false,
        nestable: false,
        partialID: 'rich-text',
        content: true,
        componentFunctions: {
            readyFunction: function () {},
        }
    },
    {
        name: 'Flex Layout',
        icon: 'grid layout',
        id: 5,//index
        layoutElement: true,
        options: true,
        mainClass: ['flex-layout','flex-row'],
        size: 'size-12',
        placeHolder: '',
        nestable: true,
        componentFunctions: {
            readyFunction: function () {},
            addMagicFunction: genericAddMagic,
            removeMagicFunction: genericRemoveMagic
        }
    },
    {
        name: 'Flex Cell',
        icon: 'square outline',
        id: 6,//index
        layoutElement: true,
        options:true,
        mainClass: ['flex-cell'],
        placeHolder: '',
        nestable: false,
        componentFunctions: {
            readyFunction: function () {},
            addMagicFunction: genericAddMagic,
            removeMagicFunction: genericRemoveMagic
        }
    }
]


var testVariable = new abstractComponent(0);

var sampleTitle = '<h3>Lorem ipsum dolor sit amet</h3>';
var sampleParagraph = '<p>Suspendisse enim velit, porta et urna at, vehicula interdum sapien. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ipsum augue, condimentum rhoncus est quis, cursus dignissim sapien. Fusce id interdum nunc. Suspendisse neque tellus, aliquam quis maximus sit amet, ultricies vel ipsum. Proin porttitor massa ut pharetra convallis. Sed ligula odio, scelerisque eget sapien at, pretium venenatis arcu. Nulla facilisi.</p>';
//Generate UUID
function generateUUID(){
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxx-xyxy'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}
//Structure for sortable directive
var structure = ['.magicRows', '.magicColumns', '.magicSlots', '.magicProperties'];
//instance for sortable directive
var instance = 'layoutgrid';
//Tree walker for sortable directive
var walk = function (item) {
    var depth = $(item).parents("ul").length;
    var path = [];
    for (var i = 0; i < depth; i += 1) {
        path.unshift(item.index());
        item = item.parent().parent();
    }
    return path;
}
//Transformer for sortable directive
var transformtoeval = function (index, structure, splice) {
    var str = instance;
    for (var i = 0; i < index.length; i += 1) {
        if (i > structure.length - 1) {
            var j = structure.length - 1;
        }
        else {
            var j = i;
        }
        if ((i == index.length - 1) && (splice)) {
            str += structure[j] + ".splice(" + index[i];
        }
        else {
            str += structure[j] + "[" + index[i] + "]";
        }

    }
    return str;
}
//Swapper for sortable directive
var swap = function (oldindex, newindex) {
    var oldsplice = transformtoeval(oldindex, structure, true) + ",1)";
    var newsplice = transformtoeval(newindex, structure, true) + ",0, placeholder)";
    var placeholder = eval(transformtoeval(oldindex, structure, false));
    eval(oldsplice);
    eval(newsplice);
    placeholder = '';
}
//Vue editor directive
Vue.directive('tinymce', {
    twoWay:true,
    deep:true,
    params:['obj'],
    bind: function(){
        var self = this;
        this.editorValue = '';
        this.editorID = generateUUID();
        this.sel = '#'+ this.editorID;
        $(this.el).context.id = this.editorID;
        $(this.el).hover(
            function(){
                this.editor = tinymce.init({
                    selector: self.sel,
                    inline:true,
                    toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent |colorbox',
                    menubar: false,
                    setup: function(ed){
                        ed.on('NodeChange', function(e){
                            self.updateobj(ed.getContent());
                        });
                        ed.on('keyup', function(e){
                            self.updateobj(ed.getContent());
                        });
                        ed.on('init', function(e){
                            if (tinymce.EditorManager.editors.length > 1){
                                tinymce.EditorManager.editors[0].remove();
                            }
                            if(ed.id!==tinymce.EditorManager.editors[0].id){
                                console.log('ERROR!!!!');
                            }
                            if (tinymce.EditorManager.editors.length > 1){
                                console.log('ERROR!!!!!');
                            }
                        })
                        ed.on('remove', function(e){
                            console.log('remove');
                        });
                    }
                });
            },
            function(){
                self.unbind();
            }
        )
    },
    update:function(value){
        if (value!== undefined){
            this.el.innerHTML = value;
        }
    },
    updateobj:function(content){
        this.set(content);
    },
    unbind: function () {
    }
})

// ROW data structure variable


// GRID
var layoutgrid = new Vue({
    el: 'body',
    data: {
        rectangles:[],
        dragComponent:{},
        eventTracker: {},
        appstatus: 'edit',//edit / preview / dragevent
        dropIndex:0,
        dropZone:{},
        container:{},
        dragEvent: false,
        dragzone:false,
        UUID: '',
        context: {},
        catalog: {},
        editable: true,
        test: testVariable,
        basicColors:[
            {name: "Default", value:""},
            {name: "Red", value:"red"},
            {name: "Orange", value:"orange"},
            {name: "Yellow", value:"yellow"},
            {name: "Olive", value:"olive"},
            {name: "Green", value:"green"},
            {name: "Teal", value:"teal"},
            {name: "Blue", value:"blue"},
            {name: "Violet", value:"violet"},
            {name: "Purple", value:"purple"},
            {name: "Pink", value:"pink"},
            {name: "Brown", value:"brown"},
            {name: "Grey", value:"grey"},
            {name: "Black", value:"black"}
        ]
    },
    ready: function () {
        this.UUID = generateUUID();
        tinymce.EditorManager.init({});
        $('.ui.basic.modal').modal({inverted: true});
        console.log('grid is ready');
    },
    events:{
        changeAppStatus: function(status){
            this.appstatus = status;
        }
    },
    methods: {
        sortme: function(){
        },
        catalog: function () {
            $('.catalog').sidebar('toggle');
        },
        invoke: function(){
            $('.ui.basic.modal').modal('show')
        }
    },
    components: {
        'drop-zone':{
            name:'drop-zone',
            template:'#drop-zone',
            props:['rect']
        },
        'component-catalog':{
            name: 'component-catalog',
            template: '#component-catalog',
            methods:{
                getCatalog: function(){
                    return componentCatalog;
                },
                addMagic: function(id) {
                    componentCatalog[layoutgrid.context.id].componentFunctions['addMagicFunction'](layoutgrid.context, id);
                }
            }
        },
        'component-context':{
            name: 'component-context',
            props: ['context', 'catalog'],
            template: '#component-context',
            methods:{
            },
            ready:function(){
                console.log('contextisready')
            },
            partials:{
                'select-single': '#action-menu',
                'select-multiple':'#select-multiple',
                'select-radio':'#select-radio',
                'user-help':'#user-help',
                'picker':''
            }
        },
        'recursive-comp':{
            props: ['data', 'index'],
            name: 'recursive-comp',
            template: '#recursive-comp',
            ready: function(){
            },
            methods:{
                catalog:function(){
                    layoutgrid.context = this.data;
                    $('.component-catalog').sidebar('show');
                },
                context:function(){
                    layoutgrid.context = this.data;
                    layoutgrid.catalog = componentCatalog[this.data.id];
                    Vue.nextTick(function(){
                        $('.ui.dropdown').dropdown();
                        $('.ui.radio.checkbox').checkbox();
                        $('.component-context').sidebar('show');
                        $('.user-help').popup({
                        });
                    });
                },
                getProperty: function(id, prop){
                    return componentCatalog[id][prop];
                },
                startDragEvent: function(event){
                    console.log('dragstart');
                    dragManager.init(this.$parent.data,this.index, this.$el);
                    setDragged(this, true);
                },
                dragEnterEvent: function(event){
                    var move = dragManager.mouseMove(event);
                    dragManager.enterDropZone(this);
                },
                dragLeaveEvent: function(event){
                    // this.data.dropzone = false;
                    // console.log('dragleave');
                },
                dragOverEvent:function(event){
                    var move = dragManager.mouseMove(event);
                    if (move){
                        if (this.data.children.length === 0) {
                            if (dragManager.newLocation(this,0)) {
                                dragManager.simulateNest(this);
                            }
                        }
                        if (this.data.children.length > 0) {//need to determine the drop index...
                            var index = dragManager.handleMovement(event);
                            layoutgrid.dropIndex = index;
                            if (dragManager.newLocation(this,index)){
                                dragManager.simulateDrop(this,index);
                            }
                        }
                    }
                },
                endDragEvent:function(){
                    dragManager.done();
                    setDragged(this, false);
                    // console.log('drag end!');
                    // layoutgrid.dragEvent = false;
                    // dragManager.done();
                    // layoutgrid.dragzone = false;
                    // this.$el.classList.remove('hightlight')
                },
                dropEvent:function(event){
                    dragManager.done();
                    setDragged(this, false);


                    // layoutgrid.dragEvent = false;

                    // dragManager.done();
                    // this.$el.classList.remove('hightlight')

                    //validation needed!!!
                    //layoutgrid.droptarget.splice(layoutgrid.droptargetIndex,0,layoutgrid.placeholder.splice(layoutgrid.placeholderIndex,1)[0]);
                    // layoutgrid.droptarget.splice(layoutgrid.droptargetIndex,0,placeholderComponent);
                    console.log('drop');
                    // layoutgrid.dragzone = false;
                },
                addMagic: function(magic) {
                    componentCatalog[this.data.id].componentFunctions['addMagicFunction'](this.data, magic);
                },
                removeMagic: function(index){
                    componentCatalog[this.data.id].componentFunctions['removeMagicFunction'](this.data, index);
                },
                getPartialID: function(){
                    if (!componentCatalog[this.data.id].partialID){
                        return false;
                    }
                    else{
                        return componentCatalog[this.data.id].partialID;
                    }
                },
                isNestable: function(){
                    return componentCatalog[this.data.id].nestable;
                },
                isSelectable: function(){
                    return componentCatalog[this.data.id].options;
                }
            },
            partials:{
                'action-menu': '#action-menu',
                'drop-zone': '#drop-zone',
                'drop-zone-nested': '#drop-zone-nested',
                'rich-text': '#rich-text'
            }
        }
    }
})



//////KNOWN BUGS//////
// inverted and styled collision
// when removing a child - make sure to remove co-responding tinymce editors