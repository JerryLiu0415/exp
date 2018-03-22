class ArenaDonutRender {
    constructor(arenaId, donutData, isLocal) {
        this.timer = 0;
        this.$arena = $(arenaId);
        this.donutData = donutData;
        this.donutData_prev = donutData;
        this.isLocal = isLocal;
        this.materialize();
    }

    materialize() {
        var color = parseInt(this.donutData.id) % 4;
        // Body
        switch (this.donutData.type) {
            case 1:
                this.$arena.append(
                    '<img id=' + this.donutData.id + ' class="tank" src=' +
                    DONUT_IMAGE_CLASSIC_PREFIX + color + DONUT_IMAGE_EXT + '>');
                break;
            case 2:
                this.$arena.append(
                    '<img id=' + this.donutData.id + ' class="tank" src=' +
                    DONUT_IMAGE_SWORD_PREFIX + color + DONUT_IMAGE_EXT + '>');
                break;
        }

        // Body initial rotation 
        this.$body = $('#' + this.donutData.id);
        this.$body.css('-webkit-transform', 'rotateZ(' + this.donutData.angle + 'deg)');
        this.$body.css('-moz-transform', 'rotateZ(' + this.donutData.angle + 'deg)');
        this.$body.css('-o-transform', 'rotateZ(' + this.donutData.angle + 'deg)');
        this.$body.css('transform', 'rotateZ(' + this.donutData.angle + 'deg)');

        // Info
        this.$arena.append('<div id="info-' + this.donutData.id + '" class="info"></div>');
        this.$info = $('#info-' + this.donutData.id);
        this.$info.append('<div class="label">' + this.donutData.name + '</div>');
        this.$info.append('<div class="hp-boarder"><div class="hp-bar"></div></div>');
    }

    refresh(donutData) {
        this.timer++;
        this.donutData = donutData;


        // Inv
        if (!this.isLocal && this.donutData.invisible && !this.donutData_prev.invisible) {
            this.$body.fadeOut(500);
            this.$info.fadeOut(500);

        }

        if (!this.isLocal && !this.donutData.invisible && this.donutData_prev.invisible) {
            this.$body.fadeIn(500);
            this.$info.fadeIn(500);
        }

        if (this.isLocal && this.donutData.invisible && !this.donutData_prev.invisible) {
            this.$body.fadeTo(500, 0.4);
        }

        if (this.isLocal && !this.donutData.invisible && this.donutData_prev.invisible) {
            this.$body.fadeTo(500, 1);
        }

        // Body
        this.$body.css('left', (this.donutData.x).toFixed(1) - 30 + 'px');
        this.$body.css('top', (this.donutData.y).toFixed(1) - 40 + 'px');
        //this.donutData.dead ? this.$body.css('opacity', '0.3') : this.$body.css('opacity', '1');

        this.$body.css('-webkit-transform', 'rotateZ(' + this.donutData.angle + 'deg)');
        this.$body.css('-moz-transform', 'rotateZ(' + this.donutData.angle + 'deg)');
        this.$body.css('-o-transform', 'rotateZ(' + this.donutData.angle + 'deg)');
        this.$body.css('transform', 'rotateZ(' + this.donutData.angle + 'deg)');

        // Parts
        // tailAnimation
        for (var i = 0; i < this.donutData.parts.length; i++) {
            this.tailAnimation(this.donutData.parts[i].x, this.donutData.parts[i].y);
        }


        // Info
        this.$info.css('left', ((this.donutData.x).toFixed(1) + 10) + 'px');
        this.$info.css('top', (this.donutData.y).toFixed(1) + 'px');
        this.$info.find('.hp-bar').css('width', this.donutData.hp * (100.0 / this.donutData.maxHp) + 'px');
        this.$info.find('.hp-bar').css('background-color', getGreenToRed(this.donutData.hp, this.donutData.maxHp));

        if (parseInt(this.donutData_prev.hp) > parseInt(this.donutData.hp)) {
            this.onHitAnimation();
        }
        this.donutData_prev = this.donutData;
    }

    remove() {
        this.$body.remove();
        this.$info.remove();
    }

    onHitAnimation() {
        this.$body.fadeTo(200, 0.5);
        this.$body.fadeTo(200, 1);
    }

    tailAnimation(x, y) {
        var uid = UID();
        this.$arena.append('<div id="' + uid + '" class="tail" style="left: ' + x + 'px; top: ' + y + 'px"></div>');
        $('#' + uid).animate({
            opacity: 0.05,
            width: 40,
            height: 40,
            left: x - 20,
            top: y - 20
        }, 100);
        setTimeout(function () {
            $('#' + uid).remove();
        }, 100)
    }
}




