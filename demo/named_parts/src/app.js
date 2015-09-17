var NamedPartsLayer = cc.LayerColor.extend(
{
    _robotPlain: null,
    _robotNesting: null,
    //loader
    _loading: null,
    _isLoading: false,

    update: function(dt)
    {
        if (this._isLoading && this._loading)
        {
            var l = this._loading;
            var speed = 600;
            l.setRotation(l.getRotation() - dt * speed);
        }
    },

    showLoading: function()
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

    hideLoading: function()
    {
        this._isLoading = false;
        var l = this._loading;
        if (!l) return;
        if (l.getParent())
            this.removeChild(l);
    },

    loadPlain: function()
    {
        this.showLoading();

        var self = this;
        var asset = gaf.Asset.create("res/robot_plain/robot.gaf");
        var onLoad = function()
        {
            if (asset.removeEventListener)
            {
                // Only JS library loads assets async
                asset.removeEventListener("load", onLoad);
            }
            var size = cc.winSize;
            var a = self._robotPlain = asset.createObjectAndRun(true);
            self.addChild(a);
            a.setAnchorPoint(0.5, 0.5);
            a.setPosition(a.width * 0.5, size.height * 0.65);
            self.loadNesting();
        };

        if (asset.addEventListener)
        {
            // Only JS library loads assets async
            asset.addEventListener("load", onLoad);
        }
        else
        {
            // JSB load resources sync and have no method `addEventListener`
            onLoad();
        }
    },

    loadNesting: function()
    {
        var self = this;
        var asset = gaf.Asset.create("res/robot_nesting/robot.gaf");
        var onLoad = function()
        {
            if (asset.removeEventListener)
            {
                // Only JS library loads assets async
                asset.removeEventListener("load", onLoad);
            }
            var size = cc.winSize;
            var a = self._robotNesting = asset.createObjectAndRun(true);
            self.addChild(a);
            a.setAnchorPoint(0.5, 0.5);
            a.setPosition(a.width * 1.5, size.height * 0.67);
            self.hideLoading();
            self.init();
        };

        if (asset.addEventListener)
        {
            // Only JS library loads assets async
            asset.addEventListener("load", onLoad);
        }
        else
        {
            // JSB load resources sync and have no method `addEventListener`
            onLoad();
        }
    },

    ctor: function()
    {
        //////////////////////////////
        // 1. super init first
        this._super(cc.color.GRAY);
        var size = cc.winSize;

        this.schedule(this.update, 1 / 24);
        this.loadPlain();

        return true;
    },

    //override cc.Layer.init()
    init: function()
    {
        cc.Layer.prototype.init.call(this);

        var self = this;
        this.createTextField("Click the robots to show/hide guns", cc.winSize.width, cc.p(0, cc.winSize.height * 0.8));
        this.createTextField("Plain", this._robotPlain.width, cc.p(-50, 0));
        this.createTextField("Nesting", this._robotNesting.width, cc.p(450, 0));

        var touchHandler = function (touch, event)
        {
            self._robotPlain.body_gun.visible = !self._robotPlain.body_gun.visible;
            self._robotNesting.body.gun.visible = !self._robotNesting.body.gun.visible;
        };

        var touchListener = cc.EventListener.create(
        {
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: touchHandler
        });

        cc.eventManager.addListener(touchListener, this);
    },

    createTextField: function(text, width, position)
    {
        var field = new cc.TextFieldTTF(text, new cc.size(width, 100), cc.TEXT_ALIGNMENT_CENTER, "Arial", 24);
        field.setAnchorPoint(0, 0);
        field.setColorSpaceHolder(new cc.color(cc.BLACK));
        field.setPosition(position);
        this.addChild(field);
    }
});

var NamedPartsScene = cc.Scene.extend(
{
    onEnter: function()
    {
        this._super();
        var layer = new NamedPartsLayer();
        this.addChild(layer);
    }
});