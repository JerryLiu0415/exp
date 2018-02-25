class Render_Donut {
    constructor(arenaId, donutData) {
        this.$arena = $(arenaId);
        this.$arena.css('width', 1100);
        this.$arena.css('height', 580);
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
        this.$body.css('left', this.donutData.x - 30 + 'px');
        this.$body.css('top', this.donutData.y - 40 + 'px');

        this.$body.css('-webkit-transform', 'rotateZ(' + this.donutData.angle + 'deg)');
		this.$body.css('-moz-transform', 'rotateZ(' + this.donutData.angle + 'deg)');
		this.$body.css('-o-transform', 'rotateZ(' + this.donutData.angle + 'deg)');
		this.$body.css('transform', 'rotateZ(' + this.donutData.angle + 'deg)');

        // Info
        this.$info.css('left', (this.donutData.x + 10) + 'px');
        this.$info.css('top', (this.donutData.y) + 'px');
        
    }

    remove() {
        this.$body.remove();
        this.$info.remove();
    }
}