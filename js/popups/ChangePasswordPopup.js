'use strict';

var
	_ = require('underscore'),
	$ = require('jquery'),
	ko = require('knockout'),
	
	TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),
	UrlUtils = require('%PathToCoreWebclientModule%/js/utils/Url.js'),
	ValidationUtils = require('%PathToCoreWebclientModule%/js/utils/Validation.js'),
	
	Ajax = require('%PathToCoreWebclientModule%/js/Ajax.js'),
	Api = require('%PathToCoreWebclientModule%/js/Api.js'),
	App = require('%PathToCoreWebclientModule%/js/App.js'),
	Screens = require('%PathToCoreWebclientModule%/js/Screens.js'),
	
	Popups = require('%PathToCoreWebclientModule%/js/Popups.js'),
	AlertPopup = require('%PathToCoreWebclientModule%/js/popups/AlertPopup.js'),
	
	CAbstractPopup = require('%PathToCoreWebclientModule%/js/popups/CAbstractPopup.js')
;

/**
 * @constructor
 */
function CChangePasswordPopup()
{
	CAbstractPopup.call(this);
	
	this.currentPassword = ko.observable('');
	this.newPassword = ko.observable('');
	this.confirmPassword = ko.observable('');
	
	this.fAfterPasswordChanged = null;
}

_.extendOwn(CChangePasswordPopup.prototype, CAbstractPopup.prototype);

CChangePasswordPopup.prototype.PopupTemplate = '%ModuleName%_ChangePasswordPopup';

/**
 * @param {Function} fAfterPasswordChanged
 */
CChangePasswordPopup.prototype.onOpen = function (fAfterPasswordChanged)
{
	this.currentPassword('');
	this.newPassword('');
	this.confirmPassword('');
	
	this.fAfterPasswordChanged = fAfterPasswordChanged;
};

CChangePasswordPopup.prototype.change = function ()
{
	var
		sNewPass = $.trim(this.newPassword()),
		sConfirmPassword = $.trim(this.confirmPassword())
	;
	
	if (ValidationUtils.checkPassword(sNewPass, sConfirmPassword))
	{
		this.sendChangeRequest();
	}
};

CChangePasswordPopup.prototype.sendChangeRequest = function ()
{
	var
		oParameters = {
			'CurrentPassword': $.trim(this.currentPassword()),
			'NewPassword': $.trim(this.newPassword())
		}
	;
	
	Ajax.send('%ModuleName%', 'ChangePassword', oParameters, this.onUpdatePasswordResponse, this);
};

/**
 * @param {Object} oResponse
 * @param {Object} oRequest
 */
CChangePasswordPopup.prototype.onUpdatePasswordResponse = function (oResponse, oRequest)
{
	if (oResponse.Result === false)
	{
		Api.showErrorByCode(oResponse, TextUtils.i18n('%MODULENAME%/ERROR_PASSWORD_NOT_SAVED'));
		Ajax.startSendRequests();
	}
	else
	{
		if (oResponse.Result && oResponse.Result.RefreshToken)
		{
			App.setAuthToken(oResponse.Result.RefreshToken);
			
			Popups.showPopup(AlertPopup, [TextUtils.i18n('%MODULENAME%/REPORT_PASSWORD_CHANGED') + ' ' + TextUtils.i18n('%MODULENAME%/REPORT_REDIRECT_TO_LOGIN'), function () {
				UrlUtils.clearAndReloadLocation(true, false);
			}]);
		}
		else
		{
			Screens.showReport(TextUtils.i18n('%MODULENAME%/REPORT_PASSWORD_CHANGED'));

			this.closePopup();

			if (_.isFunction(this.fAfterPasswordChanged))
			{
				this.fAfterPasswordChanged();
			}
		}
	}
};

module.exports = new CChangePasswordPopup();
