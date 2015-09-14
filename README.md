AngularJs / Ionic Image Viewer
===========

Gallery, carousel, image viewer module for Angular JS, can be used with Ionic. Touch devices supported. 
[**Simple Demo**](http://maximnara.github.io/jiwer/example-simple.html) and [**Ionic Demo**](http://maximnara.github.io/jiwer/example-ionic.html)
---
### Usage:

- Add `angular` and `ngImageViewer` to your code:

```html
<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular.min.js"></script>
<script src="ngImageViewerDirective.js"></script>
```

- Add a dependency to the `ngImageViewer` module in your application.

```js
angular.module('app', ['ngImageViewer']);
```

- Add attribute directives to your html:

```html
<div class="container">
  <div ng-image-viewer imgs="imgs" current="currentImgId"></div>
</div>
```
** Parameters **
* `imgs` array of urls (required)
* `current` index of image thal will be shown (optional, defaults to 0)



**Ionic usage:**
You need just create modal and insert:
```html
<div ng-image-viewer imgs="imgs" current="currentImgId"></div>
```

## Pull requests
We welcome pull requests but please check that all the examples still work if you modified the source base. There have been serveral PRs recently that broke core functionality. If you are feeling really keen you could include some protractor test cases in your PR.
