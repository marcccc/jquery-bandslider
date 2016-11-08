(function($) {
    'use strict';

    // 1-10-100-1000-10000
    //带宽提速进度条--分4个区域：0-10M，1M粒度；10-100M,10M粒度；100M-1G，50M粒度；1G以上，100M粒度
    var defaults = {
        maxValue: 10000,
        minValue: 0,
        value: 600,
        width: 1
    };

    var levelSize = {
        '1': 9,
        '2': 9,
        '3': 18,
        '4': 9
    };

    function getBandText(v) {
        if (v >= 1000) {
            return v / 1000 + 'G';
        } else {
            return v + 'M';
        }
    }

    function BandSlider(element, options) {
        this.element = element;
        this.options = $.extend(true, {}, defaults, options);

        // 初始化参数
        if (0 < this.options.width && this.options.width <= 1) {
            this.options.width = $(this.element).width() * this.options.width;
        }
        if (this.options.maxValue < this.options.value) {
            this.options.value = this.options.maxValue;
        }

        this.init();
    }
    BandSlider.prototype.init = function() {

        this.moveFlag = false;
        this.value = this.options.value;
        this.spanSize = Math.ceil(Math.log(this.options.maxValue) / Math.log(10));
        var spanWidth = (this.options.width - 11 * this.spanSize) / this.spanSize;

        var sliderHtml = new Array();
        for (var i = 1; i < this.spanSize; i++) {
            sliderHtml.push('<span>' + getBandText(Math.pow(10, i)) + '</span>');
        }
        sliderHtml.push('<span class="slider-maxValue">' + getBandText(this.options.maxValue) + '</span>');
        $(this.element).html('<div class="band-slider"><span class="slider-holder"><div class="slider-body">' + sliderHtml.join('') + '</div><div class="slider-bg"><div class="slider-body">' + sliderHtml.join('') + '</div></div><div class="slider-drag"><i>||</i></div></span>' + '<div class="slider-tip">' + getBandText(this.value) + '</div></div>');

        this.$sliderBg = $(this.element).find('.slider-bg');
        this.$sliderDrag = $(this.element).find('.slider-drag');
        this.$sliderTip = $(this.element).find('.slider-tip');
        this.$sliderHolder = $(this.element).find('.slider-holder');

        this.$sliderHolder.width(this.options.width);

        $(this.element).find('.band-slider').width(this.options.width);
        $(this.element).find('.slider-body').width(this.options.width);
        $(this.element).find('.slider-body span').width(spanWidth);
        this.spanWidth = spanWidth + 11;

        this.posSlider();
        this.bindEvents();

    };
    BandSlider.prototype.render = function() {

    };

    BandSlider.prototype.getSliderPos = function(v) {

        var vLevel = Math.ceil(Math.log(v) / Math.log(10));
        if (vLevel == this.spanSize) {
            return (v - Math.pow(10, vLevel - 1)) / (this.options.maxValue - Math.pow(10, vLevel - 1)) * this.spanWidth + (vLevel - 1) * this.spanWidth;
        } else {
            return (v - Math.pow(10, vLevel - 1)) / (Math.pow(10, vLevel) - Math.pow(10, vLevel - 1)) * this.spanWidth + (vLevel - 1) * this.spanWidth;
        }
    };

    BandSlider.prototype.posSlider = function() {

        this.$sliderBg.width(this.getSliderPos(this.value) + 2);
        this.$sliderDrag.css('left', (this.getSliderPos(this.value) - this.$sliderDrag.width() / 2) + 'px');
        this.$sliderTip.css('left', (this.getSliderPos(this.value) - this.$sliderTip.width() / 2 - 6) + 'px');
    };

    BandSlider.prototype.bindEvents = function() {

        var _this = this;

        this.$sliderDrag.on('mousedown', function() {
            _this.moveFlag = true;
        });

        $(document).on('mouseup', function() {
            _this.moveFlag = false;
        });

        var pos, level, sWidth, sCount, eBand, value;
        $(document).on('mousemove', function(e) {

            if (!_this.moveFlag) {
                return;
            }
            pos = e.pageX - _this.$sliderHolder.offset().left;
            if (0 >= pos || pos >= _this.spanSize * _this.spanWidth) {
                return;
            }
            level = Math.ceil(pos / _this.spanWidth);
            if (level < _this.spanSize) {
                sWidth = _this.spanWidth / levelSize[level];
                sCount = Math.round((pos - _this.spanWidth * (level - 1)) / sWidth);
                pos = sCount * sWidth + _this.spanWidth * (level - 1);
                value = sCount * (Math.pow(10, level) - Math.pow(10, level - 1)) / levelSize[level] + Math.pow(10, level - 1);
            } else {
                eBand = (Math.pow(10, _this.spanSize) - Math.pow(10, _this.spanSize - 1)) / levelSize[_this.spanSize];
                sWidth = _this.spanWidth / Math.ceil((_this.options.maxValue - Math.pow(10, _this.spanSize - 1)) / eBand);
                sCount = Math.round((pos - _this.spanWidth * (level - 1)) / sWidth);
                pos = sCount * sWidth + _this.spanWidth * (level - 1);
                value = sCount * eBand + Math.pow(10, level - 1);
            }
            if (value != _this.value) {
                _this.value = value;
                _this.$sliderTip.html(getBandText(_this.value));
                _this.posSlider();
                if ('function' == typeof(_this.options.onChange)) {
                    _this.options.onChange(_this.value, getBandText(_this.value))
                }
            }
        });
    };


    var ua = navigator.userAgent.toLowerCase();
    var Browser = {
        isChrome: ua.indexOf('chrome') > -1 && ua.indexOf('edge') == -1,
        isFirefox: ua.indexOf('firefox') > -1,
        isIE: ua.indexOf('msie') > -1,
        isEdge: ua.indexOf('edge') > -1,
        ieVersion: function() {
            if (ua.indexOf('edge') == -1 && ua.indexOf('msie') > -1) {
                return ua.match(/(msie).*?([\d.]+)/)[2];
            }
        }
    };

    $.fn.bandSlider = function(options) {

        var bandSliderInstance;

        if (!this.length) {
            throw new Error('bandSlider cannot be instantiated on an empty selector.');
        }

        if (this.length > 1) {
            throw new Error(
                "bandSlider does not support multiple elements yet. Make sure " +
                "your bandSlider selector returns only one element.");
        }

        if (Browser.isEdge || Browser.isFirefox || Browser.isChrome || (Browser.isIE && parseInt(Browser.ieVersion()) >= 9)) {

            if ('undefined' == typeof(options) || 'object' == typeof(options)) {
                if (!this.data('plugin_bandSlider')) {
                    bandSliderInstance = new BandSlider(this, options);
                    this.data('plugin_bandSlider', bandSliderInstance);
                    return bandSliderInstance;
                }
                return this.data('plugin_bandSlider');
            } else {
                if ('getValue' == options) {
                    if (!this.data('plugin_bandSlider')) {
                        throw new Error('bandSlider isnot init!');
                    }
                    return this.data('plugin_bandSlider').value;
                } else {
                    throw new Error('bandSlider now only support chrome & firefox & IE9+!');
                }
            }

        }
    }
})(jQuery);