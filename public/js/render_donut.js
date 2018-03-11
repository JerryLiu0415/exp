class Render_Donut {
    constructor(arenaId, donutData) {
        this.timer = 0;
        this.$arena = $(arenaId);
        this.donutData = donutData;
        this.hp_prev = donutData.hp;
        this.materialize();
    }

    materialize() {
        var color = parseInt(this.donutData.id) % 4;
        // Body
        this.$arena.append('<img id=' + this.donutData.id + ' class="tank" src="img/testbase' + '_' + color + '.png">');
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

        console.log('<img id=' + this.donutData.id + ' class="tank" src="img/testbase' + '_' + color + '.png">');
    }

    refresh(donutData) {
        this.timer++;
        this.donutData = donutData;
        // Body
        this.$body.css('left', (this.donutData.x).toFixed(1) - 30 + 'px');
        this.$body.css('top', (this.donutData.y).toFixed(1) - 40 + 'px');
        this.donutData.dead ? this.$body.css('opacity', '0.3') : this.$body.css('opacity', '1');

        this.$body.css('-webkit-transform', 'rotateZ(' + this.donutData.angle + 'deg)');
        this.$body.css('-moz-transform', 'rotateZ(' + this.donutData.angle + 'deg)');
        this.$body.css('-o-transform', 'rotateZ(' + this.donutData.angle + 'deg)');
        this.$body.css('transform', 'rotateZ(' + this.donutData.angle + 'deg)');

        // Info
        this.$info.css('left', ((this.donutData.x).toFixed(1) + 10) + 'px');
        this.$info.css('top', (this.donutData.y).toFixed(1) + 'px');
        this.$info.find('.hp-bar').css('width', this.donutData.hp * (100.0 / this.donutData.maxHp) + 'px');
        this.$info.find('.hp-bar').css('background-color', getGreenToRed(this.donutData.hp, this.donutData.maxHp));

        if (parseInt(this.hp_prev) > parseInt(this.donutData.hp)) {
            this.onHitAnimation();
        }
        this.hp_prev = this.donutData.hp;
    }

    remove() {
        this.$body.remove();
        this.$info.remove();
    }

    onHitAnimation() {
        this.$body.fadeTo(200, 0.5);
        this.$body.fadeTo(200, 1);
    }
}

function UID() {
    var key1 = Math.floor(Math.random() * 1000).toString();
    var key2 = Math.floor(Math.random() * 1000).toString();
    var key3 = Math.floor(Math.random() * 1000).toString();
    var key4 = Math.floor(Math.random() * 1000).toString();
    return (key1 + key2 + key3 + key4);
}

function getGreenToRed(current, max) {
    const percent = current / max;
    r = current < 5 ? 255 : Math.floor(255 - (percent * 200.0 - 100) * 255 / 100);
    g = current > 5 ? 255 : Math.floor((percent * 200.0) * 255 / 100);
    return 'rgb(' + r + ',' + g + ',0)';
}


