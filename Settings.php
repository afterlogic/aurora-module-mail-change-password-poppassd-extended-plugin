<?php
/**
 * This code is licensed under AGPLv3 license or Afterlogic Software License
 * if commercial version of the product was purchased.
 * For full statements of the licenses see LICENSE-AFTERLOGIC and LICENSE-AGPL3 files.
 */

namespace Aurora\Modules\MailChangePasswordPoppassdExtendedPlugin;

use Aurora\System\SettingsProperty;

/**
 * @property bool $Disabled
 * @property array $SupportedServers
 * @property string $Host
 * @property int $Port
 */

class Settings extends \Aurora\System\Module\Settings
{
    protected function initDefaults()
    {
        $this->aContainer = [
            "Disabled" => new SettingsProperty(
                false,
                "bool",
                null,
                "Setting to true disables the module",
            ),
            "SupportedServers" => new SettingsProperty(
                [
                    "*"
                ],
                "array",
                null,
                "If IMAP Server value of the mailserver is in this list, password change is enabled for it. * enables it for all the servers.",
            ),
            "Host" => new SettingsProperty(
                "127.0.0.1",
                "string",
                null,
                "Defines hostname used to connect to POPPASSD service",
            ),
            "Port" => new SettingsProperty(
                106,
                "int",
                null,
                "Defines port number used to connect to POPPASSD service",
            ),
        ];
    }
}
