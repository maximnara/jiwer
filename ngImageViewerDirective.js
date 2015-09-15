;(function () {
	'use strict';
	angular.module('ngImageViewer', [])
		.directive('draggablePhoto', function ($window, $document, $timeout) {
			return {
				restrict: 'A',
				scope: {
					viewedImgId: '=',
					imgId: '='
				},
				link: function(scope, element) {
					var eventNames, eventHandlers, _mrx, _dragOffset, _mx, _tx, move, tools;

					_dragOffset = {};
					eventNames = {
						start: 'touchstart mousedown',
						move: 'touchmove mousemove',
						end: 'touchend mouseup'
					};

					move = {
						to: function (x) {
							element.css({
								transform: 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ' + x + ', 0, 0, 1)',
								'-webkit-transform': 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ' + x + ', 0, 0, 1)',
								'-ms-transform': 'matrix(1, 0, 0, 1, ' + x + ', 0)',
								'transition': ''
							});
						},
						defaults: function() {
							element.css({
								'transform':'translate3d(0,0,0)',
								'-webkit-transform': 'translate3d(0,0,0)',
								'-ms-transform': 'translate3d(0,0,0)',
								'transition': '0.5s ease all'
							});
						},
						right: function() {
							element.css({
								'transform':'translate3d(130%,0,0)',
								'-webkit-transform': 'translate3d(130%,0,0)',
								'-ms-transform': 'translate3d(130%,0,0)',
								'transition': '0.5s ease all'
							});
						},
						left: function() {
							element.css({
								'transform':'translate3d(-130%,0,0)',
								'-webkit-transform': 'translate3d(-130%,0,0)',
								'-ms-transform': 'translate3d(-130%,0,0)',
								'transition': '0.5s ease all'
							});
						}
					};

					eventHandlers = {
						start: function(evt) {
							if (!tools.isCurrentImgViewed()) {
								return false;
							}
							if (!tools.isCurrentObj(evt.target)) {
								return false;
							}
							evt.preventDefault();

							_dragOffset = angular.element(element)[0].getBoundingClientRect();
							_mx = tools.getEvent(evt).pageX;
							_mrx = _mx - _dragOffset.left;
							_tx = _mx - _mrx - $window.pageXOffset;

							$document.on(eventNames.move, eventHandlers.move);
							$document.on(eventNames.end, eventHandlers.end);
						},
						move: function(evt) {
							if (!tools.isCurrentImgViewed()) {
								return false;
							}
							if (!tools.isCurrentObj(evt.target)) {
								return false;
							}
							evt.preventDefault();

							_mx = tools.getEvent(evt).pageX;
							_tx = _mx - _mrx - _dragOffset.left;

							move.to(_tx);
						},
						end: function(evt) {
							if (!tools.isCurrentImgViewed()) {
								return false;
							}
							if (!tools.isCurrentObj(evt.target)) {
								return false;
							}
							evt.preventDefault();

							if (_mrx + (_mrx / 3) > _mx) {
								move.right();
								scope.$emit('photoViewer:next');
							}
							else if (_mx - (_mx / 3) > _mrx) {
								move.left();
								scope.$emit('photoViewer:back');
							}
							else {
								move.defaults();
							}
							$document.off(eventNames.move, eventHandlers.move);
							$document.off(eventNames.end, eventHandlers.end);
						}
					};

					tools = {
						getEvent: function(event) {
							if (angular.isDefined(event.touches)) {
								return event.touches[0];
							}
							else if (angular.isDefined(event.originalEvent) && angular.isDefined(event.originalEvent.touches)) {
								return event.originalEvent.touches[0];
							}
							return event;
						},
						isCurrentObj: function (target) {
							return angular.equals(angular.element(target)[0], element[0]);
						},
						isCurrentImgViewed: function () {
							return scope.viewedImgId == scope.imgId;
						},
						calculateImgPosition: function () {
							if (tools.isCurrentImgViewed()) {
								move.defaults();
							}
							else if (scope.viewedImgId < scope.imgId) {
								move.right();
							}
							else if (scope.viewedImgId > scope.imgId) {
								move.left();
							}
						}
					};

					$document.on(eventNames.start, eventHandlers.start);
					$document.on(eventNames.move, eventHandlers.move);
					$document.on(eventNames.end, eventHandlers.end);

					scope.$watch('viewedImgId', tools.calculateImgPosition);
					scope.$on('changePhoto', tools.calculateImgPosition);

					tools.calculateImgPosition();
				}
			};
		})
		.directive('ngImageViewer', function () {
			return {
				restrict: 'A',
				scope: {
					imgs: '=',
					current: '=?'
				},
				template:
					'<div class="photo-viewer-wrap" ng-repeat="img in imgs" ng-show="$index + 1 >= current || $index - 1 <= current">' +
						'<img src="" ng-src="{{ img }}" class="image" draggable-photo img-id="$index" viewed-img-id="currentImgId" style="position: absolute; width: 100%;">' +
					'</div>',
				link: function(scope) {
					scope.current = !!scope.current ? scope.current : 0;
					scope.currentImgId = scope.current;
				},
				controller: function($scope, Debounce) {
					var backDebounceFunc, forwardDebounceFunc;
					$scope.$on('photoViewer:back', function () {
						if (!backDebounceFunc) {
							backDebounceFunc = Debounce(10, function () {
								$scope.$broadcast('changePhoto');
								if ($scope.currentImgId < 1) {
									return false;
								}
								$scope.currentImgId -= 1;
								backDebounceFunc = undefined;
							});
						}
						backDebounceFunc();
					});
					$scope.$on('photoViewer:next', function () {
						if (!forwardDebounceFunc) {
							forwardDebounceFunc = Debounce(10, function () {
								$scope.$broadcast('changePhoto');
								if ($scope.currentImgId == $scope.imgs.length - 1) {
									return false;
								}
								$scope.currentImgId += 1;
								forwardDebounceFunc = undefined;
							});
						}
						forwardDebounceFunc();
					});
					$scope.$watch('current', function (newVal) {
						$scope.currentImgId = $scope.current;
					});
				}
			};
		})
		.factory('Debounce', function ($timeout) {
			return function (wait, fn) {
				var args, context, result, timeout;
				function ping() {
					result = fn.apply(context || this, args || []);
					context = args = null;
				}
				function cancel() {
					if (timeout) {
						$timeout.cancel(timeout);
						timeout = null;
					}
				}
				function wrapper() {
					context = this;
					args = arguments;
					cancel();
					timeout = $timeout(ping, wait);
				}
				function flushPending() {
					var pending = !!context;
					if (pending) {
						// Call pending, do it now.
						cancel();
						ping();
					}
					return pending;
				}
				wrapper.flush = function () {
					if (!flushPending() && !timeout) {
						ping();
					}
					return result;
				};
				wrapper.flushPending = function () {
					flushPending();
					return result;
				};
				wrapper.cancel = cancel;
				return wrapper;
			};
		});
})();