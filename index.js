module.exports = function (cb, opts) {
    var page = new Page(cb, opts);
    window.addEventListener('popstate', onpopstate);
    
    function onpopstate () {
        var href = window.location.pathname;
        page.show(href);
    }
    process.nextTick(onpopstate);
    
    var fn = page.show.bind(page)
    fn.push = page.push.bind(page)
    fn.show = page.show.bind(page)
    return fn;
};

function Page (cb, opts) {
    if (!opts) opts = {};
    this.current = null;
    this.hasPushState = opts.pushState !== undefined
        ? opts.pushState
        : window.history && window.history.pushState
    ;
    this.scroll = opts.saveScroll !== false ? {} : null;
    this.cb = cb;
}

Page.prototype.show = function (href, force) {
    href = href.replace(/^\/+/, '/');
     
    if (!force && this.current === href) return;
    this.saveScroll(href);
    this.current = href;
    
    var scroll = this.scroll[href];
    this.cb(href, {
        scrollX : scroll && scroll[0] || 0,
        scrollY : scroll && scroll[1] || 0
    });
    
    this.pushHref(href);
};

Page.prototype.saveScroll = function (href) {
    if (this.scroll && this.current) {
        this.scroll[this.current] = [ window.scrollX, window.scrollY ];
    }
};

Page.prototype.push = function (href) {
    href = href.replace(/^\/+/, '/');
    this.saveScroll(href);
    this.pushHref(href);
};

Page.prototype.pushHref = function (href) {
    this.current = href;
    var mismatched = window.location.pathname !== href;
    if (mismatched) window.history.pushState(null, '', href);
};
