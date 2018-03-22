
class ArenaBulletRender {
    constructor(arenaId, bulletData) {
        this.$arena = $(arenaId);
        this.bulletData = bulletData;
        this.materialize();
    }

    materialize() {
        // Body
        this.$arena.append('<img id=' + this.bulletData.id + 'B' + ' class="tail">');
        this.$body = $('#' + this.bulletData.id + 'B');

    }

    refresh(bulletData) {
        this.bulletData = bulletData;
        // Body
        this.$body.css('left', this.bulletData.x - 20 + 'px');
        this.$body.css('top', this.bulletData.y - 26 + 'px');
        //this.tailAnimation(this.bulletData.x, this.bulletData.y);
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
        }, 200);
        setTimeout(function () {
            $('#' + uid).remove();
        }, 200)
    }

    remove() {
        this.$body.remove();
    }
}