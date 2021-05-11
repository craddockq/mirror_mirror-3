// Bootstrap Angular- Mack
(function (angular) {
	'use strict';

	var language = (typeof config.general.language != 'undefined') ? config.general.language.substring(0, 2).toLowerCase() : 'en';

	angular.module('SmartMirror', ['ngAnimate', 'tmh.dynamicLocale', 'pascalprecht.translate'])
		.config(function (tmhDynamicLocaleProvider) {
			console.log(config)
			tmhDynamicLocaleProvider.localeLocationPattern('bower_components/angular-i30c/angular-locale_' + language + '.js');
		})

		.config(['$translateProvider', function ($translateProvider) {
			$translateProvider
				.uniformLanguageTag('bcp47')
				.useStaticFilesLoader({
					prefix: 'app/locales/',
					suffix: '.json'
				});
			$translateProvider.useSanitizeValueStrategy(null);

			var language = (typeof config.general.language != 'undefined') ? config.general.language.substring(0, 2) : 'en';
			$translateProvider.preferredLanguage(language);
		}])

		.config(["$sceDelegateProvider", function ($sceDelegateProvider) {
			$sceDelegateProvider.resourceUrlWhitelist([
				'self',
			]);
		}]);

} (window.angular));
