var battleInterface;

function battle(){
    battleInterface = new BattleInterface();

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    var beatCount = 1;
    var timer1 = setInterval(function(){
        ventureManager.frisk.beep();
        if (beatCount < 3) beatCount++;
        else clearInterval(timer1);
    }, 150);
    setTimeout(function(){ ventureManager.frisk.movesSoul() }, 600);
    setTimeout(function(){ ventureManager.frisk.soul.heartBeat() }, 2 * k);
    setTimeout(function(){ ventureManager.frisk.soul.draw() }, 5 * k);

    // flowey, box, interface fades in
    setTimeout(function(){
        var op = 0;
        var timer2 = setInterval(function(){
            ctx.save();
            ctx.globalAlpha = op;
            battleInterface.flowey.floweyPortrait.draw("smile");
            ctx.restore();
            battleInterface.box.draw(op);
            battleInterface.soul.draw();

            if (op < 1) op += 0.1;
            else clearInterval(timer2);
        }, 150);
    }, 5 * k);

    setTimeout(function(){ floweyScriptBattle() }, 7 * k);
}

var scriptBattleCtr = 0;

function floweyScriptBattle(){
    scriptBattleCtr++;
    switch (scriptBattleCtr){
        case 1:
            curStage = "battle";
            var instance = createjs.Sound.play("flowey", {loop:-1});
            battleInterface.flowey.talk({s1: "저 하트 모양 보이지?"});
            break;
        case 2: battleInterface.flowey.talk({s1: "저건 바로 네 영혼이야."}); break;
        case 3:
            var op = 0;
            // fade status bar in
            var timer = setInterval(function() {
                battleInterface.statusBar.draw(op);
                if (op < 1) op += 0.1;
                else clearInterval(timer);
            }, 100);

            setTimeout(function() {
                battleInterface.flowey.talk({emote: "calm",
                    s1:"지금의 네 영혼은 엄청 약해.",
                    s2:"만약 어떤 괴물이 너한테 해코지라도 했다간, ",
                    s3:"바로 죽어버릴지도 몰라."});
            }, 2 * k);
            break;
        case 4:
            battleInterface.flowey.talk({emote: "smile", s1:"하지만 LV를 올리면", s2:"더 강해질 수 있어!"}); break;
        case 5: battleInterface.flowey.talk({pauseInterval: 1.5 * k, s1:"LV가 뭔지는 알지?", s2:"바로 LOVE의 준말이야."}); break;
        case 6: battleInterface.flowey.talk({s1:"네가 더 강해지고 싶다면,", s2:"LOVE를 많이 모으도록 해."}); break;
        case 7: battleInterface.flowey.talk({pauseInterval: 200, s1:"널 위해서 내가 LOVE를", s2:"조금 나눠줄게."}); break;
    }
}

function BattleBox(){
    var self = this;
    self.x = 210;
    self.y = 220;
    self.width = 220;
    self.height = 180;

    self.draw =function(op) {
        if (op === undefined) op = 1;
        ctx.save();
        ctx.globalAlpha = op;
        ctx.fillStyle = "#fff";
        ctx.fillRect(self.x, self.y, self.width, self.height);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#000";
        ctx.fillRect(self.x+5, self.y+5, self.width-10, self.height-10);
        ctx.restore();
    };

    self.drawArrows = function(){
    };
}

function StatusBar(){
    var self = this;
    self.x = 160;
    self.y = 435,
    self.hpMax = 20;
    self.hp = 20;

    self.draw = function(op){
        if (op === undefined) op = 1;
        ctx.save();
        ctx.globalAlpha = op;
        ctx.fillStyle = "#fff";
        ctx.font = "25px persuasionBRK";
        ctx.fillText("LV 1", self.x, self.y);
        ctx.fillText(self.hp + " / " + self.hpMax, self.x + 200, self.y);
        ctx.font = "17px persuasionBRK";
        ctx.fillText("HP", self.x + 105, self.y - 4);

        // hp bar
        if (self.hp < self.hpMax) { // if hp is not reduced, don't draw red part
            ctx.fillStyle = "#ff0000";
            ctx.fillRect(self.x + 150, self.y - 20, 1.5 * self.hpMax , 20);
        }
        ctx.fillStyle = "#ffff00";
        ctx.fillRect(self.x + 150, self.y - 20, 1.5 * self.hp, 20);
        ctx.restore();
    };
}

function SpeechBubble(){
    var self = this;
    self.x = 360;
    self.y = 70;
    self.on = false;
    self.draw = function(){
        if (self.on) { // if speech bubble is already drawn, just paint area with white
            ctx.save();
            ctx.fillStyle = "#fff";
            ctx.fillRect(self.x + 45, self.y + 25, 190, 90);
            ctx.restore();
        }
        else {
            ctx.drawImage(images.speechBubble, self.x, self.y)
            self.on = true;
        }
    };

    self.clear = function(){
        if (self.on){
            ctx.clear(self.x + self.y, images.speechBubble.width, images.speechBubble.height);
            self.on = false;
        }
    };
}

function FloweyBattle(){
    var self = this;
    self.x = 360 + 50;
    self.y = 70 + 45;
    self.talkSpeed = 55;
    self.pauseInterval = 10;

    self.floweyPortrait = new FloweyProtrait(275, 100);
    self.speechBubble = new SpeechBubble();

    self.talk = function (args){
        ableUserInput = false;
        var scriptString = {};
        var stringNum = 0;
        var _x = self.x;
        var _y = self.y;
        var scriptArea = 250;
        var curStringIdx = 0;
        var yGap = 20;

        var pauseInterval;
        var talkSpeed;

        if (args.talkSpeed === undefined) talkSpeed = self.talkSpeed;
        else talkSpeed = args.talkSpeed;
        if (args.pauseInterval === undefined) pauseInterval = self.pauseInterval;
        else pauseInterval = args.pauseInterval / talkSpeed;

        if (args.s1) { scriptString[0] = args.s1; stringNum++; }
        if (args.s2) { scriptString[1] = args.s2; stringNum++; }
        if (args.s3) { scriptString[2] = args.s3; stringNum++; }
        if (args.emote) { self.floweyPortrait.setEmotion(args.emote); }

        var scriptStringSplit;
        var nlFlag = false;
        var pause = true;
        var pauseCounter = pauseInterval;
        var stringIdxChange = true;

        self.speechBubble.draw();

        var timer = setInterval(function(){
            // pauses for about (talkspeed times 8) secs when there's comma or line changes
            if (pause){
                if (curStringIdx == stringNum) { // if all lines printed, end repeat
                    clearInterval(timer);
                    ableUserInput = true;
                }
                pauseCounter++;

                if (pauseCounter > pauseInterval){
                    if (stringIdxChange){
                        scriptStringSplit = scriptString[curStringIdx].split(""); // prepare for the next line
                        stringIdxChange = false;
                    }
                    pause = false;
                    pauseCounter = 0;
                }
            }
            else {
                var char = scriptStringSplit.shift();

                // change line if sentence gets long
                if (_x > ( self.x + scriptArea-80)){
                    _y += yGap;
                    _x = self.x;
                    nlFlag = true;
                }

                ctx.save();
                ctx.fillStyle = "#000";
                ctx.font = "15px tbyt";
                ctx.fillText(char, _x, _y);
                ctx.restore();
                self.floweyPortrait.talk();

                if (char == ",") pause = true;
                else if (char == "." || (char == " " && !nlFlag)) _x += 11;
                else if (char !== " ") {
                    createjs.Sound.play("floweyVoiceCham");
                    _x += 11;
                }
                if (nlFlag) nlFlag = false;
                if (scriptStringSplit <= 0) {
                    curStringIdx++;
                    stringIdxChange = true;
                    pause = true;
                    _y += yGap;
                    _x = self.x;
                }
            }
        }, talkSpeed);
    }
}

function BattleInterface() {
    var self = this;

    self.flowey = new FloweyBattle();
    self.box = new BattleBox();
    self.statusBar = new StatusBar();
    self.soul = new Soul();

    self.drawPellets = function(){
        //ctx.clear within box
        //
    };
}