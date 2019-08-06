'use strict';

module.exports = function (oAppData) {
	var
		TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),
		
		App = require('%PathToCoreWebclientModule%/js/App.js'),
		Popups = require('%PathToCoreWebclientModule%/js/Popups.js'),
		AlertPopup = require('%PathToCoreWebclientModule%/js/popups/AlertPopup.js'),
		ConfirmPopup = require('%PathToCoreWebclientModule%/js/popups/ConfirmPopup.js'),
		ChangePasswordPopup = require('modules/%ModuleName%/js/popups/ChangePasswordPopup.js')
	;
	
	return {
		start: function (ModulesManager) {
			App.subscribeEvent('StandardLoginFormWebclient::ConstructView::after', function (oParams) {
				var
					oLoginScreenView = oParams.View
				;
				if (oLoginScreenView)
				{
					oLoginScreenView.onSystemLoginResponse = function (oResponse, oRequest) {
						if (oResponse && oResponse.Result && oResponse.Result.AuthToken && oResponse.SubscriptionsResult && oResponse.SubscriptionsResult['%ModuleName%::onBeforeLogin'])
						{
							this.loading(false);
							var oResult = oResponse.SubscriptionsResult['%ModuleName%::onBeforeLogin'];
							if (oResult.CallHelpdesk)
							{
								Popups.showPopup(AlertPopup, [TextUtils.i18n('%MODULENAME%/INFO_PASSWORD_EXPIRED'), function () {}, TextUtils.i18n('%MODULENAME%/HEADING_PASSWORD_EXPIRED')]);
							}
							else if (oResult.ChangePassword)
							{
								if (oResult.DaysBeforeExpire >= 0)
								{
									var sConfirm = TextUtils.i18n('%MODULENAME%/INFO_PASSWORD_ABOUT_EXPIRE_PLURAL', {'COUNT': oResult.DaysBeforeExpire}, null, oResult.DaysBeforeExpire);
									if (oResult.DaysBeforeExpire === 0)
									{
										sConfirm = TextUtils.i18n('%MODULENAME%/INFO_PASSWORD_EXPIRES_TODAY');
									}
									sConfirm += ' ' + TextUtils.i18n('%MODULENAME%/INFO_CHANGE_PASSWOD_BEFORE_EXPIRING');
									Popups.showPopup(ConfirmPopup, [sConfirm, function (bChangePassword) {
										if (bChangePassword)
										{
											App.setAuthToken(oResponse.Result.AuthToken);
											Popups.showPopup(ChangePasswordPopup);
										}
										else
										{
											this.onSystemLoginResponseBase(oResponse, oRequest);
										}
									}.bind(this), TextUtils.i18n('%MODULENAME%/HEADING_PASSWORD_ABOUT_EXPIRE'), TextUtils.i18n('%MODULENAME%/ACTION_CHANGE'), TextUtils.i18n('%MODULENAME%/ACTION_LATER')]);
								}
								else
								{
									App.setAuthToken(oResponse.Result.AuthToken);
									Popups.showPopup(ChangePasswordPopup);
								}
							}
							
						}
						else
						{
							this.onSystemLoginResponseBase(oResponse, oRequest);
						}
					};
				}
			});
		}
	};
};
