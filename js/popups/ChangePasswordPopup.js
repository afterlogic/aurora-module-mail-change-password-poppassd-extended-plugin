'use strict';

var
	_ = require('underscore'),
	$ = require('jquery'),
	ko = require('knockout'),
	
	TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),
	ValidationUtils = require('%PathToCoreWebclientModule%/js/utils/Validation.js'),
	
	Ajax = require('%PathToCoreWebclientModule%/js/Ajax.js'),
	Api = require('%PathToCoreWebclientModule%/js/Api.js'),
	Screens = require('%PathToCoreWebclientModule%/js/Screens.js'),
	
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
	
	this.heading = ko.observable('');
	this.fOnPopupClose = null;
}

_.extendOwn(CChangePasswordPopup.prototype, CAbstractPopup.prototype);

CChangePasswordPopup.prototype.PopupTemplate = '%ModuleName%_ChangePasswordPopup';

/**
 * @param {string} sHeading
 * @param {Function} fOnPopupClose
 */
CChangePasswordPopup.prototype.onOpen = function (sHeading, fOnPopupClose)
{
	this.currentPassword('');
	this.newPassword('');
	this.confirmPassword('');
	
	this.heading(sHeading);
	this.fOnPopupClose = fOnPopupClose;
};

CChangePasswordPopup.prototype.onClose = function ()
{
	if (_.isFunction(this.fOnPopupClose))
	{
		this.fOnPopupClose();
	}
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
	
	Ajax.send('Mail', 'ChangePassword', oParameters, this.onUpdatePasswordResponse, this);
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
	}
	else
	{
		Screens.showReport(TextUtils.i18n('%MODULENAME%/REPORT_PASSWORD_CHANGED'));
		this.closePopup();
	}
};

module.exports = new CChangePasswordPopup();
