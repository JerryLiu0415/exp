class Render_Bullet {
    constructor(arenaId, bulletData) {
        this.$arena = $(arenaId);
        this.bulletData = bulletData;
        this.materialize();
    }

    materialize() {
        // Body
        this.$arena.append('<img id=' + this.bulletData.id + 'B' + ' class="tank" src="img/testbullet.png">');
        this.$body = $('#' + this.bulletData.id + 'B');

    }

    refresh(bulletData) {
        this.bulletData = bulletData;
        // Body
        this.$body.css('left', this.bulletData.x - 20 + 'px');
        this.$body.css('top', this.bulletData.y - 26 + 'px');

    }

    remove() {
        this.$body.remove();
    }
}