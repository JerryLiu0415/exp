class Render_Donut {
    constructor(arenaId, donutData) {
        this.$arena = $(arenaId);
        this.donutData = donutData;
        this.materialize();
    }

    materialize() {
        // Body
        this.$arena.append('<img id=' + this.donutData.id + ' class="tank" src="img/testbase.png">');
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
        this.donutData = donutData;
        // Body
        this.$body.css('left', (this.donutData.x).toFixed(1) - 30 + 'px');
        this.$body.css('top', (this.donutData.y).toFixed(1) - 40 + 'px');

        this.$body.css('-webkit-transform', 'rotateZ(' + this.donutData.angle + 'deg)');
        this.$body.css('-moz-transform', 'rotateZ(' + this.donutData.angle + 'deg)');
        this.$body.css('-o-transform', 'rotateZ(' + this.donutData.angle + 'deg)');
        this.$body.css('transform', 'rotateZ(' + this.donutData.angle + 'deg)');

        // Info
        this.$info.css('left', ((this.donutData.x).toFixed(1) + 10) + 'px');
        this.$info.css('top', (this.donutData.y).toFixed(1) + 'px');
        this.$info.find('.hp-bar').css('width', this.donutData.hp * 10 + 'px');
        this.$info.find('.hp-bar').css('background-color', getGreenToRed(this.donutData.hp));

    }

    remove() {
        this.$body.remove();
        this.$info.remove();
    }
}


function getGreenToRed(percent) {
    r = percent < 5 ? 255 : Math.floor(255 - (percent * 20 - 100) * 255 / 100);
    g = percent > 5 ? 255 : Math.floor((percent * 20) * 255 / 100);
    return 'rgb(' + r + ',' + g + ',0)';
}