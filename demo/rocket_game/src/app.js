var RocketGameLayer = cc.Layer.extend(
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
            a.setPosition(a.width * 0.5, a.width - size.width);
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
        this._super();
        var size = cc.winSize;

        this.schedule(this.update, 1 / 24);
        this.loadAnimation("res/mini_game/mini_game.gaf");

        return true;
    },

    //override cc.Layer.init()
    init: function ()
    {
        cc.Layer.prototype.init.call(this);

        var onExplosionEnd = function (event)
        {
            var timeline = event.getCurrentTarget();
            timeline.removeListeners(gaf.EVENT_SEQUENCE_END);
            timeline.stop();
            timeline.parent.stop();
        };

        var touchHandler = function (touch, event)
        {
            var timeline = event.getCurrentTarget();
            if (timeline._name.length == 6
            &&  timeline._name.indexOf("Rocket") < 0
            ||  timeline._currentSequence == "explode")
            {
                return;
            }
            var locationInNode = timeline.parent.convertToNodeSpace(touch.getLocation());

            var rect = timeline.getBoundingBoxForCurrentFrame();
            if (cc.rectContainsPoint(rect, locationInNode)) //Check the click area
            {
                cc.eventManager.removeListener(timeline.touchListener, timeline);
                timeline.parent.pauseAnimation();
                timeline.playSequence("explode");
                timeline.addEventListener(gaf.EVENT_SEQUENCE_END, onExplosionEnd);
            }
        };

        var touchListener = cc.EventListener.create(
        {
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: touchHandler
        });

        var rocket;
        var rocketAnimation;
        for (var i = 1; i < 5; i++)
        {
            rocketAnimation = this._anim.getObjectByName("Rocket_with_guide" + i);
            rocket = rocketAnimation.getObjectByName("Rocket" + i);
            rocket.touchListener = touchListener.clone();
            rocket.playSequence("idle");
            cc.eventManager.addListener(rocket.touchListener, rocket);
        }
    }
});

var RocketGameScene = cc.Scene.extend(
{
    onEnter: function ()
    {
        this._super();
        var layer = new RocketGameLayer();
        this.addChild(layer);
    }
});