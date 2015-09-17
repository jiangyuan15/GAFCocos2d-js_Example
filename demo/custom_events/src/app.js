var CustomEventsLayer = cc.LayerColor.extend(
{
    _anim: null,
    //loader
    _loading: null,
    _isLoading: false,
    _subtitles:
    [
        "- Our game is on fire!",
        "- GAF Team, there is a job for us!",
        "- Go and do your best!"
    ],

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

        var self = this;
        var asset = gaf.Asset.create(name);
        var onLoad = function ()
        {
            if (asset.removeEventListener)
            {
                // Only JS library loads assets async
                asset.removeEventListener("load", onLoad);
            }
            var size = cc.winSize;
            var a = self._anim = asset.createObjectAndRun(true);
            self.addChild(a);
            a.setAnchorPoint(0.5, 0.5);
            a.setPosition(a.width * 0.5, size.height * 0.65);
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

    ctor: function ()
    {
        //////////////////////////////
        // 1. super init first
        this._super(cc.color.GRAY);
        var size = cc.winSize;

        this.schedule(this.update, 1 / 24);
        this.loadAnimation("res/fireman/fireman.gaf");

        return true;
    },

    //override cc.Layer.init()
    init: function ()
    {
        var self = this;

        cc.Layer.prototype.init.call(this);

        var onShow = function(sequence)
        {
            self._anim.subtitles_txt.text = self._subtitles[sequence._userData - 1];
        };

        var onHide = function(sequence)
        {
            self._anim.subtitles_txt.text = "";
        }
        this._anim.addEventListener("showSubtitles", onShow);
        this._anim.addEventListener("hideSubtitles", onHide);
    }
});

var CustomEventsScene = cc.Scene.extend(
{
    onEnter: function ()
    {
        this._super();
        var layer = new CustomEventsLayer();
        this.addChild(layer);
    }
});