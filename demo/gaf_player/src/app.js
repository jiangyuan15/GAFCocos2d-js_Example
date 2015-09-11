
var s_animations = 
[
    "res/fireman/fireman.gaf",
    "res/cut_the_hope/cut_the_hope.gaf",
    "res/biggreen/biggreen.gaf",
    "res/bird_bezneba/bird_bezneba.gaf",
    "res/christmas2013_julia2/christmas2013_julia2.gaf",
    "res/fairy2/fairy2.gaf",
    "res/myshopsgame4/myshopsgame4.gaf",
    "res/peacock/peacock.gaf",
    "res/leopard/leopard.gaf"
];

var GafPlayerLayer = cc.LayerColor.extend({
    _animations: s_animations,
    _currentAnimationId: 0,
    _anim: null,
    _loading: null,
    _isLoading: false,
    _playBtn: null,
    _pauseBtn: null,
    _nextSeqBtn: null,
    _prevSeqBtn: null,
    _sequences: null,
    _currentSeqId: null,
    _sequenceName: null,

    update: function(dt)
    {
        if(this._isLoading && this._loading)
        {
            var l = this._loading;
            var speed = 600;
            l.setRotation(l.getRotation() - dt * speed);
        }

    },

    showLoading: function(){
        this._isLoading = true;
        if(!this._loading)
        {
            var size = cc.winSize;
            var l = this._loading = cc.Sprite.create(res.loading_image);
            l.retain();
            this.addChild(l, 1000);
            l.setAnchorPoint(0.5, 0.5);
            l.setPosition(size.width/2, size.height/2);
        }
        this._loading.setRotation(0);
    },

    hideLoading: function(){
        this._isLoading = false;
        var l = this._loading;
        if(!l) return;
        if(l.getParent())
            this.removeChild(l);
    },

    nextAnimation: function(){
        if(this._isLoading) return;
        if(this._currentAnimationId < this._animations.length - 1)
            ++this._currentAnimationId;
        else
            this._currentAnimationId = 0;
        this.loadAnimation(this._animations[this._currentAnimationId]);
    },

    prevAnimation: function(){
        if(this._isLoading) return;
        if(this._currentAnimationId > 0)
            --this._currentAnimationId;
        else
            this._currentAnimationId = this._animations.length - 1;
        this.loadAnimation(this._animations[this._currentAnimationId]);
    },

    prevFrame: function(){
        if(this._isLoading) return;
        var a = this._anim;
        var f = a.getCurrentFrameIndex() - 1;
        a.setFrame(f);
    },

    nextFrame: function(){
        if(this._isLoading) return;
        var a = this._anim;
        var f = a.getCurrentFrameIndex() + 1;
        a.setFrame(f);
    },

    restart: function(){
        if(this._isLoading) return;
        if(!this._anim) return;
        var a = this._anim;
        a.clearSequence();
        a.stop();
        a.start();
        this.play();
        this._currentSeqId = -1;
        this.nextSequence();
    },

    pause: function()
    {
        if(this._isLoading) return;
        this._anim.setAnimationRunning(false, true);
        this._playBtn.setVisible(true);
        this._pauseBtn.setVisible(false);
    },

    play: function()
    {
        if(this._isLoading) return;
        this._anim.setAnimationRunning(true, true);
        this._playBtn.setVisible(false);
        this._pauseBtn.setVisible(true);
    },

    setSequnces: function(names){
        this._currentSeqId = 0;
        this._sequences = names;
        if(names.length == 0)
        {
            this._sequenceName.setVisible(false);
            this._nextSeqBtn.setVisible(false);
            this._prevSeqBtn.setVisible(false);
            return;
        }
        var name = names[this._currentSeqId];
        this._sequenceName.setString(name);
        this._sequenceName.setVisible(true);
        this._nextSeqBtn.setVisible(true);
        this._prevSeqBtn.setVisible(true);
    },

    loadAnimation: function(name){
        this.showLoading();
        if(this._anim)
        {
            this.removeChild(this._anim);
            this._anim = null;
        }
        var self = this;

        var asset = gaf.Asset.create(name);
        var onLoad = function()
        {
            var size = cc.winSize;
            var a = self._anim = asset.createObjectAndRun(true);
            self.addChild(a);
            a.setAnchorPoint(0.5, 0.5);
            a.setPosition(size.width/2, size.height/2);
            self.hideLoading();
            self.play();
            var names = a.getSequences();
            self.setSequnces(Object.keys(names));

            var sceneColor = self._anim._gafproto.getAsset().getSceneColor();
            if (sceneColor)
            {
                self.setColor(sceneColor);
            }
        };

        if(asset.addEventListener)
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

    prevSequence: function()
    {
        if(this._isLoading) return;
        var l = this._sequences.length;
        if(l == 0) return;
        this._currentSeqId -= 1;
        if(this._currentSeqId < 0) this._currentSeqId = l - 1;
        var name = this._sequences[this._currentSeqId];
        this._sequenceName.setString(name);
        this._anim.playSequence(name);
    },

    nextSequence: function()
    {
        if(this._isLoading) return;
        var l = this._sequences.length;
        if(l == 0) return;
        this._currentSeqId = (this._currentSeqId + 1) % l;
        var name = this._sequences[this._currentSeqId];
        this._sequenceName.setString(name);
        this._anim.playSequence(name);
    },

    addButton: function(idle, pressed, pos, fun)
    {
        var self = this;
        var callback = function(){self[fun].call(self)}
        var size = cc.winSize;
        var item = new cc.MenuItemImage();
        item.initWithNormalImage(idle, pressed, null, callback);
        item.setPosition(size.width * pos.x, size.height * pos.y);
        return item;
    },

    createMenu: function()
    {
        var size = cc.winSize;
        var Y = 0.1;
        var buttons = [];
        var self = this;
        buttons.push(this.addButton(
            res.btn_prev_anim, 
            res.btn_prev_anim_s, 
            cc.p(0, Y), 
            'prevAnimation'
        ));
        buttons.push(this.addButton(
            res.btn_prev_frame, 
            res.btn_prev_frame_s, 
            cc.p(0.1, Y), 
            'prevFrame'
        ));
        this._playBtn = this.addButton(
            res.btn_play, 
            res.btn_play_s, 
            cc.p(0.22, Y), 
            'play'
        );
        buttons.push(this._playBtn);
        this._pauseBtn = this.addButton(
            res.btn_pause, 
            res.btn_pause_s, 
            cc.p(0.22, Y), 
            'pause'
        );
        buttons.push(this._pauseBtn);
        buttons.push(this.addButton(
            res.btn_next_frame, 
            res.btn_next_frame_s, 
            cc.p(0.34, Y), 
            'nextFrame'
        ));
        buttons.push(this.addButton(
            res.btn_next_anim, 
            res.btn_next_anim_s, 
            cc.p(0.44, Y), 
            'nextAnimation'
        ));
        buttons.push(this.addButton(
            res.btn_restart, 
            res.btn_restart_s, 
            cc.p(0.57, Y), 
            'restart'
        ));
        this._prevSeqBtn = this.addButton(
            res.btn_prev_seq, 
            res.btn_prev_seq_s, 
            cc.p(0.05, 0.93), 
            'prevSequence'
        );
        buttons.push(this._prevSeqBtn);
        this._nextSeqBtn = this.addButton(
            res.btn_next_seq, 
            res.btn_next_seq_s, 
            cc.p(0.4, 0.93), 
            'nextSequence'
        );
        buttons.push(this._nextSeqBtn);
        this._sequenceName = new cc.LabelTTF("---", "System", 24);
        this._sequenceName.setAnchorPoint(0.5, 2);
        this._sequenceName.setPosition(size.width/2, size.height);
        this.addChild(this._sequenceName);

        var menu = new cc.Menu(buttons);
        //menu.setAnchorPoint(0, 0);
        menu.setPosition(size.width / 4, 0);
        menu.setContentSize(size);
        this.addChild(menu, 10000);

        var gafLogo = new cc.Sprite(res.gaf_logo);
        gafLogo.setAnchorPoint(1, 1);
        gafLogo.setScale(0.5 * cc.director.getContentScaleFactor());
        gafLogo.setPosition(size.width * 0.93, size.height * 0.93);
    
        this.addChild(gafLogo, 10000);

        this._playBtn.setVisible(false);
        this._nextSeqBtn.setVisible(false);
        this._prevSeqBtn.setVisible(false);
    },

    ctor: function ()
    {
        //////////////////////////////
        // 1. super init first
        this._super();
        var size = cc.winSize;

        this.createMenu();
        this.schedule(this.update, 1/24);
        this.loadAnimation(this._animations[this._currentAnimationId]);

        return true;
    }
});

var GafPlayerScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new GafPlayerLayer();
        this.addChild(layer);
    }
});

