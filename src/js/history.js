/*=========================
  History Api with fallback to Hashnav
  ===========================*/
s.history = {
    init: function () {
        if (!s.params.history) return;
        if (!window.history || !window.history.pushState) {
            s.params.history = false;
            s.params.hashnav = true;
            return;
        }
        s.history.initialized = true;
        this.paths = this.getPathValues();
        if (!this.paths.key && !this.paths.value) return;
        this.scrollToSlide(0, this.paths.value, s.params.runCallbacksOnInit);
        if (!s.params.replaceState) {
            window.addEventListener('popstate', this.setHistoryPopState);
        }
    },
    setHistoryPopState: function(e) {
        if (window.location.search) {
            s.history.paths = s.history.getPathValues();
            s.history.scrollToSlide(s.params.speed, s.history.paths.value);
        }
    },
    getPathValues: function() {
        var key;
        var value;
        if (s.params.historyParameters) {
            key = s.params.history;
            value = this.getParameterValue(key) || s.slides.eq(1).attr('data-history');
        } else {
            var pathArray = window.location.pathname.slice(1).split('/');
            var total = pathArray.length;
            key = pathArray[total - 2];
            value = pathArray[total - 1];
        }
        return { key: key, value: value };
    },
    hasParameter: function(params, name) {
        var re = new RegExp('[\\?&]' + name + '=');
        return re.test(params);
    },
    getParameterValue: function(name, url) {
        var param = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var loc = url || window.location.href;
        var re = new RegExp('[\\?&]' + param + '=([^&#]*)');
        var results = re.exec(loc);
        return results == null ? null : results[1];
    },
    updateParameter: function(params, key, value) {
        var re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
        var separator = params.indexOf('?') !== -1 ? '&' : '?';
        if (params.match(re)) {
            return params.replace(re, '$1' + key + '=' + value + '$2');
        }
        return params + separator + key + '=' + value;
    },
    setHistory: function (key, index) {
        if (!s.history.initialized || !s.params.history) return;
        var slide = s.slides.eq(index);
        var value = this.slugify(slide.attr('data-history'));
        if (s.params.historyParameters) {
            var search = window.location.search;
            if (this.hasParameter(search, key)) {
                value = this.updateParameter(search, key, value);
            } else {
                var pre = search ? search + '&' : '?';
                value = pre + key + '=' + value;
            }
        } else if (!window.location.pathname.includes(key)) {
            value = key + '/' + value;
        }

        if (s.params.replaceState) {
            window.history.replaceState(null, null, value);
        } else {
            if(value !== window.location.search) {
                window.history.pushState(null, null, value);
            }
        }
    },
    slugify: function(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    },
    scrollToSlide: function(speed, value, runCallbacks) {
        if (value) {
            for (var i = 0, length = s.slides.length; i < length; i++) {
                var slide = s.slides.eq(i);
                var slideHistory = this.slugify(slide.attr('data-history'));
                if (slideHistory === value && !slide.hasClass(s.params.slideDuplicateClass)) {
                    var index = slide.index();
                    s.slideTo(index, speed, runCallbacks);
                }
            }
        } else {
            s.slideTo(0, speed, runCallbacks);
        }
    }
};
