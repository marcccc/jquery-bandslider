# jquery-bandslider
带宽滑块插件

## Demo
[http://amaml.qiniudn.com/assets/jquery/bandslider/test/index.html](http://amaml.qiniudn.com/assets/jquery/bandslider/test/index.html)

##Dependencies
[jquery](http://jquery.com/download/)

## Configuration
### html
```
<link rel="stylesheet" type="text/css" href="../css/band.slider.css">
<div id="slider"></div>
```
## javascript
onChange 带宽选择变化时触发函数
```
$('#slider').bandSlider({
    maxValue: 10000, // 可选择最大带宽
    value: 200, // 当前值
    width: 0.98, // 宽度
    onChange: function(value, text) {
        console.log(value, text);
    }
});

// 获取当前选择值
$('#slider').bandSlider('getValue');
```


