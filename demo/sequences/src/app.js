var SequencesLayer = cc.LayerColor.extend(
{
    _anim: null,
    _asset: null,
    //loader
    _loading: null,
    _isLoading: false,
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
            a.setPosition(a.width * 0.5, size.height * 0.65);
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
        this.loadAnimation("res/RedRobot/RedRobot.gaf");

        return true;
    },

    //override cc.Layer.init()
    init: function ()
    {
        var self = this;

        cc.Layer.prototype.init.call(this);

        this.setSequence("stand");

        var touchHandler = function (touch, event)
        {
            if (self._anim._currentSequence == "walk")
            {
                self.setSequence("stand");
            }
            else
            {
                self.setSequence("walk");
            }
        };

        var touchListener = cc.EventListener.create(
        {
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: touchHandler
        });

        cc.eventManager.addListener(touchListener, this);
    },

    setSequence: function(sequence)
    {
        this._anim.playSequence(sequence, true);
        var tf = this._anim.sequence.text = sequence;
    }
});

var SequencesScene = cc.Scene.extend(
{
    onEnter: function ()
    {
        this._super();
        var layer = new SequencesLayer();
        this.addChild(layer);
    }
});