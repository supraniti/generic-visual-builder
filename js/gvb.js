var inlineEditorSimple={
    inline: true,
    toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent |colorbox',
    menubar: false
};

Vue.directive('editable', {
  twoWay: true,
  data: {
    singleLine: true,
    model : '',
    isInitialized : false,
    modified: false
  },
  params: ['editable-multiline'],
  bind: function () {
    if(this.params.editableMultiline) {
      this.data.singleLine = false;
    }
    this.el.setAttribute("contenteditable", "");
    this.el.addEventListener("blur", function (event) {
        var content = this.getContent();
        this.set(content);
        // resetting the directive.
        this.data.model = '';
        this.data.isInitialized = false;
        if (this.isModified() === true) {
            this.vm.$dispatch('modified');
        }
    }.bind(this));
  },
  update: function () {
    this.el.addEventListener("keydown", function (key) {
      // setting initial html value for safety escape button.
      if (this.data.isInitialized === false) {
        this.data.model = this.getContent();
        this.data.isInitialized = true;
      }
      var code = key.keyCode ? key.keyCode : key.which;

      if (this.data.singleLine && this.isNewLine(code)) {
        key.stopPropagation();
        key.preventDefault();
        this.el.blur();
        this.data.modified = true;
      } else if (this.isEscape(code)) {
        this.data.isInitialized = false;
        this.data.modified = false;

        this.el.innerHTML = this.data.model;
        this.el.blur();
      } else {
        this.data.modified = true;
      }

    }.bind(this));

  },
  isNewLine: function (code) {
    var overrideKeys = [13, 38, 48];

    for(var i in overrideKeys) {
        if(overrideKeys[i] == code) return true;
    }
  },
  isEscape: function (code) {
    return code === 27;
  },
  isModified: function() {
    return this.data.modified;
  },
  getContent: function () {
    var content = this.el.innerHTML;
    // stripped string taken from http://css-tricks.com/snippets/javascript/strip-html-tags-in-javascript/
    content = content.replace(/&nbsp;/gi,'');
    content = content.replace(/(<([^>]+)>)/ig,"");

    return content;
  }
})
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
Vue.directive('editor', {
    twoWay: true,
    params: ['initial'],
    bind: function () {
        this.trumbowyg = $(this.el).trumbowyg({ autogrow: true });
        $(this.el).trumbowyg().on('tbwchange ', function () {
            //this.set($(this.el).trumbowyg('html'));
            this.update();
        } .bind(this));
        //$(this.el).trumbowyg('html', this.params.initial);
    },
    intitialize: function (value) {
        //$(this.el).trumbowyg('html', value);
    },
    update: function (value, oldValue) {
        console.log('update');
        console.log($(this.el).trumbowyg('html'));
        //$(this.el).trumbowyg('html', this.params.initial);
        this.set($(this.el).trumbowyg('html'));
        //$(this.el).trumbowyg('html', this.params.initial);
    },
    unbind: function () {
    }
})

Vue.directive('tinymce', {
    twoWay: true,
    params: ['initial'],
    bind: function () {
        var self = this;
        this.editorID = generateUUID();
        $(this.el).context.id = this.editorID
        //Creates a new editor instance
        this.ed = tinymce.EditorManager.createEditor(this.editorID, inlineEditorSimple);
        console.log(tinymce.EditorManager);
        this.ed.on('show', function (e) {
            console.log(this.editorID);
            console.log('shown!');
        });
        this.ed.on('change', function (e) {
            console.log(self.ed.getContent({ format: 'html' }));
            this.update(self.ed.getContent({ format: 'html' }));
        } .bind(this));

        this.ed.render();
    },
    update: function (value) {
        console.log(value)
        console.log(this);
        this.set(value);
        //console.log(tinymce.EditorManager.get(this.editorID));

    },
    unbind: function () {
        tinymce.remove(this.editorID);
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
    self.colwidth = 3;
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
var mainclass = 'ui accordion';
var propObj = {};
var childPartial = 'accordion-tab';
var childPropObj = [
    {
        name: 'title',
        value: 'title place holder',
        editable: true,
        type: 'text'
    },
    {
        name: 'content',
        value: 'content place holder',
        editable: true,
        type: 'text'
    }
];
var childCount = 3;
function readyFunction() {
    $('.ui.accordion').accordion();
};

//COMPONENT STRUCTURE
var abstractComplexComponent = function (type, mainclass, propObj, childPropObj, childPartial, childCount, readyFunction) {
    var self = this;
    this.parent = true;
    this.type = type; //threaded/nested/simple
    this.children = [];
    this.subObjects = [];
    this.properties = [];
    this.readyFunction = readyFunction;
    this.mainClass = mainclass;
    this.classObject = {};
    this.styleObject = {};
    this.content = {};
    this.partialTemplate = '';
    this.addMagic = function (childPropObj) {
        var child = new abstractComponentChild();
        child.partial = childPartial;
        for (var i = 0; i < childPropObj.length; i += 1) {
            child.properties[childPropObj[i].name] = childPropObj[i].value;
        }
        this.children.push(child);
    };
    this.removeMagic = function (index) {
        this.children.splice(index, 1);
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
        this.properties.push(new abstractComponentProperty(propObj[j].name, propObj[j].value));
    }
}
var abstractComponentChild = function () {
    var self = this;
    this.partial = '';
    this.subObjects = [];
    this.classObject = {};
    this.styleObject = {};
    this.properties = {};
    this.editable = false;
    this.toggle = function () {
        if (this.editable) {
            this.editable = false;
        }
        else {
            this.editable = true;
        }
    }
}
var abstractComponentProperty = function (name, value) {
    var self = this;
    this[name] = value;
    //this.name = name;
    //this.value = value;
}

// GRID
var layoutgrid = new Vue({
    el: 'body',
    data: {
        msg: 'hellp',
        variablecheck: {
            name: "editable content",
            editor: false,
            html: 'place your content here',
            toggle: function () {
                if (this.editor) {
                    this.editor = false;
                    //$('#trumbowyg-demo').trumbowyg('destroy');
                }
                else {
                    this.editor = true;
                    //$('#trumbowyg-demo').trumbowyg();
                }
            }
        },
        variablecheck1: {
            name: "editable content",
            editor: false,
            html: 'place your content here',
            toggle: function () {
                if (this.editor) {
                    this.editor = false;
                    //$('#trumbowyg-demo').trumbowyg('destroy');
                }
                else {
                    this.editor = true;
                    //$('#trumbowyg-demo').trumbowyg();
                }
            }
        },
        variablecheck2: {
            name: "editable content",
            editor: false,
            html: 'place your content here',
            toggle: function () {
                if (this.editor) {
                    this.editor = false;
                    //$('#trumbowyg-demo').trumbowyg('destroy');
                }
                else {
                    this.editor = true;
                    //$('#trumbowyg-demo').trumbowyg();
                }
            }
        },
        UUID: '',
        magicRows: [],
        context: {},
        magicSettings: [{
            sizeguide: []
        }],
        editable: true,
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
        var self = this;
        this.UUID = generateUUID();
        //tinimce.init();
        tinymce.EditorManager.init({});
        console.log('grid is ready');
    },
    methods: {
        catalog: function () {
            $('.catalog').sidebar('toggle');
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
        'render-main': {
            props: ['data'],
            template: "#render-main",
            name: 'render-content',
            ready: function () {
                var self = this;
                if (this.data.parent) {
                    this.data.readyFunction();
                    console.log('component is ready');
                }
            },
            partials: {
                'accordion-tab': '#accordion-tab',
                'accordion-tab-2': '#accordion-tab-2',
                'text-content': '#text-content'

            },
            components: {

            }
        },
        'render-child': {
            props: ['data'],
            template: "#render-child",
            name: 'render-child',
            ready: function () {
                var self = this;
                console.log('child is ready');
            },
            partials: {
                'accordion-tab': '#accordion-tab',
                'accordion-tab-2': '#accordion-tab-2',
                'text-content': '#text-content'
            }
        },
        'editable-content': {
            props: ['data'],
            template: "#editable-content",
            ready: function () {
                var self = this;
                $(this.el).trumbowyg({ autogrow: true });
                $(this.el).trumbowyg('html', this.data.properties.content);
                $(this.el).trumbowyg().on('tbwchange ', function () {
                    self.update();
                });
            },
            update: function () {
                this.data.properties.content.set($(this.el).trumbowyg('html'));
            }
            //$(this.el).trumbowyg({ autogrow: true });
            //$(this.el).trumbowyg('html', self);
            //$(this.el).trumbowyg().on('tbwchange ', function () {
            //  self.update();
            //});
        }
    }
})