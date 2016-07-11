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
//Vue sortable directive
Vue.directive('sortable', {
    twoWay: true,
    params: ['connectwith', 'handle', 'placeholder'],
    bind: function () {
        var self = this;
        $(this.el).sortable({
            connectWith: self.params.connectwith,
            handle: self.params.handle,
            placeholder: self.params.placeholder,
            forcePlaceholderSize: true,
            start: function (e, ui) {
                $(this).data('previndex', walk(ui.item));
            },
            update: function (e, ui) {
                if ($(this).data('previndex')) {
                    var newIndex = walk(ui.item);
                    var oldIndex = $(this).data('previndex');
                    console.log('from:' + oldIndex + ' to: ' + newIndex);
                    swap(oldIndex, newIndex);
                    $(this).removeData('previndex');
                }
            }
        });
    },
    update: function () {
    },
    unbind: function () {
    }
})
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
//*** DATA STRUCTURE ***
// ROW data structure variable
var magicRowData = function () {
    var self = this;
    self.UUID = generateUUID();
    self.magicColumns = [];
    self.iscontext = false;
    self.addMagic = function () {
        self.magicColumns.splice(0, 0, new magicColumnData());
    };
    self.removebyindex = function (index) {
        if (index !== -1) {
            this.magicColumns.splice(index, 1);
        }
    };
    self.context = function () {
        layoutgrid.context.iscontext = false;
        self.iscontext = true;
        layoutgrid.context = this;
        $('.row-context').sidebar('toggle');
    };
}
// COLUMN data structure variable
var magicColumnData = function () {
    var self = this;
    self.UUID = generateUUID();
    self.magicSlots = [];
    self.iscontext = false;
    self.colwidth = 7;
    self.addMagic = function (magicSlotData) {
        self.magicSlots.splice(0, 0, magicSlotData);
    };
    self.removebyindex = function(index){
        if (index !== -1) {
            this.magicSlots.splice(index, 1)
        }
    },
        self.context = function () {
            layoutgrid.context.iscontext = false;
            self.iscontext = true;
            layoutgrid.context = this;
            $('.col-context').sidebar('toggle');
        };
    self.getwidth = function () {
        return layoutgrid.sizing[self.colwidth];
    };
    self.plus = function () {
        if (self.colwidth < layoutgrid.sizing.length - 1) {
            self.colwidth++;
        }
    };
    self.minus = function () {
        if (self.colwidth > 0) {
            self.colwidth--;
        }
    };
}
// SLOT data structure variable
var magicSlotData = function (component) {
    var self = this;
    self.UUID = generateUUID();
    self.iscontext = false;
    self.component = component;
    self.context = function () {
        layoutgrid.context.iscontext = false;
        self.iscontext = true;
        layoutgrid.context = this;
        $('.component-context').sidebar('toggle');
    };
}
var textContentConstructor = function () {
    var self = this;
}

//ACCORDION SCRIPT
var type = 'nested';
var mainclass = ['ui' ,'accordion'];
var propObj = {};
var childPartial = 'accordion-tab';
var childPropObj = [
    {
        name: 'title',
        value: sampleTitle,
        editable: true,
        partial: 'accordion-title'
    },
    {
        name: 'content',
        value: sampleParagraph,
        editable: true,
        partial: 'accordion-content'
    }
];
var childCount = 3;
function readyFunction() {
    $('.ui.accordion').accordion();
};

//COMPONENT STRUCTURE
var abstractComplexComponent = function (type, mainclass, propObj, childPropObj, childPartial, childCount, readyFunction) {
    var self = this;
    this.parentClass = 'ui segment';
    this.childPropObj = childPropObj;
    this.type = type; //threaded/nested/simple
    this.children = [];
    this.subObjects = [];
    this.properties = [];
    this.readyFunction = readyFunction;
    this.mainClass = mainclass;
    this.classObject = [];
    this.segmentClassA=[];
    this.segmentClassB=[];
    this.segmentClassC=[];
    this.segmentClassD=[];
    this.segmentClassE=[];
    this.styleObject = {};
    this.colorClass = [];
    this.content = {};
    this.inverted = [];
    this.invert = function(bool){
        if (bool){
            this.inverted = ['inverted']
        }
        else{
            this.inverted = [];
        }
    }
    this.toggleInvert = function(){
        if(!this.inverted){
            this.invert(true);
        }
        else{
            this.invert(false);
        }
    }
    this.partialTemplate = '';
    this.addMagic = function (childPropObj) {
        var child = new abstractComponentChild();
        child.partial = childPartial;
        for (var i = 0; i < childPropObj.length; i += 1) {
            child.properties.push(new abstractComponentProperty(childPropObj[i].name, childPropObj[i].value, childPropObj[i].editable, childPropObj[i].partial));
        }
        this.children.push(child);
    };
    this.removebyindex = function (index) {
        this.children.splice(index, 1);
    }
    this.setActive = function(index) {
        this.children[index].toggleActive();
    }
    if (type !== 'simple') {
        for (var i = 0; i < childCount; i += 1) {
            this.addMagic(childPropObj);
        }
    }
    else {
        //simple constructor
    }
    for (var k = 0; k < propObj.length; k += 1) {
        this.properties.push(new abstractComponentProperty(propObj[j].name, propObj[j].value, propObj[j].editable, propObj[j].partial));
    }
}
var abstractComponentChild = function () {
    var self = this;
    this.partial = '';
    this.subObjects = [];
    this.classObject = {};
    this.styleObject = {};
    this.properties = [];
    this.editable = false;
    this.activeOnStart = false;
    this.toggleActive = function(){
        this.activeOnStart = !this.activeOnStart;
    }
    this.toggle = function () {
        this.editable = !this.editable;
    };
}
var abstractComponentProperty = function (name, value, editable, partial) {
    this.name = name;
    this.value = value;
    this.editable = editable;
    this.partial = partial;
}

// GRID
var layoutgrid = new Vue({
    el: 'body',
    data: {
        UUID: '',
        magicRows: [],
        context: {},
        magicSettings: [{
            sizeguide: []
        }],
        editable: true,
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
        ],
        sizing: [
            "one wide column",
            "two wide column",
            "three wide column",
            "four wide column",
            "five wide column",
            "six wide column",
            "seven wide column",
            "eight wide column",
            "nine wide column",
            "ten wide column",
            "eleven wide column",
            "twelve wide column",
            "thirteen wide column",
            "fourteen wide column",
            "fifteen wide column",
            "sixteen wide column"
        ]
    },
    ready: function () {
        this.UUID = generateUUID();
        tinymce.EditorManager.init({});
        $('.ui.basic.modal').modal({inverted: true});
        console.log('grid is ready');
    },
    methods: {
        catalog: function () {
            $('.catalog').sidebar('toggle');
        },
        invoke: function(){
            $('.ui.basic.modal').modal('show')
        },
        setup: function (content) {
            //accordion constructor
            if (content == 'accordion') {
                var newaccordion = new abstractComplexComponent(type, mainclass, propObj, childPropObj, childPartial, childCount, readyFunction);
                var slot = new magicSlotData(newaccordion);
            }
            if (content == 'text') {
                var newtext = new abstractComponent();
                newtext.isPartial = true;
                newtext.template = "text-content";
                newtext.content.content = "some text content";
                var slot = new magicSlotData(newtext);
            }
            slot.iscontext = true;
            this.context.iscontext = false;
            this.context.addMagic(slot);
            this.context = slot;
            $('.component-context').sidebar('toggle');
            $('.catalog').sidebar('toggle');
        },
        addMagic: function () {
            this.magicRows.unshift(new magicRowData());
        },
        removebyindex: function (index) {
            if (index !== -1) {
                this.magicRows.splice(index, 1)
            }
        },
        removeMagic: function (context) {
            var index = this.magicRows.indexOf(context)
            if (index !== -1) {
                this.magicRows.splice(index, 1)
            }
            $('.row-context').sidebar('toggle');
        },
        isEmpty: function () {
            if (this.magicRows.length == 0) {
                return true;
            }
            else {
                return false;
            }
        }
    },
    components: {
        'color-palette':{
            props: ['palette', 'context'],
            template: "#color-palette",
            name: 'color-palette',
            ready: function(){
                console.log('palette ready!');
            },
            methods:{
                updateColor:function(color, inverted){
                    this.context.component.invert(inverted);
                    this.context.component.colorClass = [color];
                    $('.ui.basic.modal').modal('hide');
                }
            }
        },
        'render-main-class':{
            props: ['data'],
            template: "#main-class",
            name: 'render-main-class',
            ready: function () {
                var self = this;
                this.data.readyFunction();
                $('.ui.dropdown').dropdown();
                $('.ui.dropdown.colorpicker').dropdown({
                    onChange: function(value, text, $selectedItem) {
                        self.updateColor(value);
                    }
                });
                $('.ui.checkbox').checkbox();
                console.log('component is ready');
            },
            computed: {
                calculatedClass: function () {//segment
                    return this.data.segmentClassA.concat(this.data.segmentClassB,this.data.segmentClassC,this.data.segmentClassD,this.data.segmentClassE,this.data.colorClass,this.data.inverted);
                },
                calculatedClass2: function(){//accordion...
                    return this.data.mainClass.concat(this.data.classObject,this.data.inverted);
                }
            },
            methods:{
                updateColor: function(value){
                    this.data.colorClass = value;
                },
            },
            partials: {
            }
        },
        'render-sub-class':{
            props: ['data'],
            template: "#sub-class",
            name: 'render-sub-class',
            ready: function () {
                console.log('sub-component is ready');
            },
            partials: {
                'accordion-title': '#accordion-title',
                'accordion-content': '#accordion-content'
            }
        },
        'render-sub-class-context':{
            props: ['data','index'],
            template: "#sub-class-context",
            name: 'render-sub-class-context',
            ready: function () {
                console.log('sub-component is ready');
            },
            partials: {
                'accordion-title': '#accordion-title',
                'accordion-content': '#accordion-content'
            }
        },
        'render-editable-content':{
            props: ['data'],
            template: '<div>555</div>',
            name: 'render-editable-content',
            ready: function () {
                console.log('editable-content is ready');
            }
        },
        'render-component-options':{

        }
    }
})



//////KNOWN BUGS//////
// inverted and styled collision
// when removing a child - make sure to remove co-responding tinymce editors