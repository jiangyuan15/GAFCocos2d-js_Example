var TextFieldsLayer = cc.LayerColor.extend(
{
    _anim: null,
    _asset: null,
    _loading: null,
    _isLoading: false,
    _bg: null,
    _bgColor: 127,
    //loader
    update: function (dt)
    {
        if (this._isLoading && this._loading)
        {
            var l = this._loading;
            var speed = 600;
            l.setRotation(l.getRotation() - dt * speed);
        }
    },

    showLoading: function ()
    {
        this._isLoading = true;
        if (!this._loading)
        {
            var size = cc.winSize;
            var l = this._loading = cc.Sprite.create(res.loading_image);
            l.retain();
            this.addChild(l, 1000);
            l.setAnchorPoint(0.5, 0.5);
            l.setPosition(size.width / 2, size.height / 2);
        }
        this._loading.setRotation(0);
    },

    hideLoading: function ()
    {
        this._isLoading = false;
        var l = this._loading;
        if (!l) return;
        if (l.getParent())
            this.removeChild(l);
    },

    loadAnimation: function (name)
    {
        this.showLoading();
        if (this._anim)
        {
            this.removeChild(this._anim);
            this._anim = null;
        }
        var self = this;

        this._asset = gaf.Asset.create(name);
        var onLoad = function ()
        {
            if (self._asset.removeEventListener)
            {
                // Only JS library loads assets async
                self._asset.removeEventListener("load", onLoad);
            }
            var size = cc.winSize;
            var a = self._anim = self._asset.createObjectAndRun(true);
            self.addChild(a);
            a.setAnchorPoint(0.5, 0.5);
            a.setPosition(250, size.height * 0.5);
            self.hideLoading();
            self.init();
        };

        if (this._asset.addEventListener)
        {
            // Only JS library loads assets async
            this._asset.addEventListener("load", onLoad);
        }
        else
        {
            // JSB load resources sync and have no method `addEventListener`
            onLoad();
        }
    },

    ctor: function ()
    {
        //////////////////////////////
        // 1. super init first
        this._super(cc.color.GRAY);
        var size = cc.winSize;

        this.schedule(this.update, 1 / 24);
        this.loadAnimation("res/text_field_demo/text_field_demo.gaf");

        return true;
    },

    //override cc.Layer.init()
    init: function ()
    {
        cc.Layer.prototype.init.call(this);

        var self = this;
        var outputTxt = this._anim.getObjectByName("dynamic_txt");
        var inputTxt = this._anim.getObjectByName("input_txt");
        var button = this._anim.getObjectByName("swapBtn");
        button.gotoAndStop(0);

        var onTouchBegan = function (touches, event)
        {
            var touch = touches[0];
            var locationInNode = button.parent.convertToNodeSpace(touch.getLocation());
            var rect = button.getBoundingBoxForCurrentFrame();
            if (cc.rectContainsPoint(rect, locationInNode))
            {
                button.gotoAndStop(2);
                outputTxt.text = inputTxt.text;
            }
        };

        var onTouchEnded = function (touches, event)
        {
            button.gotoAndStop(0);
        };

        cc.eventManager.addListener(
        {
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
            swallowTouches: false,
            onTouchesBegan: onTouchBegan,
            onTouchesEnded: onTouchEnded
        }, this);

        this.setColor({r: 47, g: 33, b: 76});
    }
});

var TextfieldsScene = cc.Scene.extend(
{
    onEnter: function ()
    {
        this._super();
        var layer = new TextFieldsLayer();
        this.addChild(layer);
    }
});