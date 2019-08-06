<?php
/**
 * This code is licensed under AGPLv3 license or Afterlogic Software License
 * if commercial version of the product was purchased.
 * For full statements of the licenses see LICENSE-AFTERLOGIC and LICENSE-AGPL3 files.
 */

namespace Aurora\Modules\MailChangePasswordPoppassdExtendedPlugin;

use function Sabre\Uri\split;

/**
 * Allows users to change passwords on their email accounts using POPPASSD protocol.
 * 
 * @license https://www.gnu.org/licenses/agpl-3.0.html AGPL-3.0
 * @license https://afterlogic.com/products/common-licensing Afterlogic Software License
 * @copyright Copyright (c) 2019, Afterlogic Corp.
 *
 * @package Modules
 */
class Module extends \Aurora\Modules\MailChangePasswordPoppassdPlugin\Module
{
	public function init() 
	{
		parent::init();
		$this->subscribeEvent('Core::Login::before', array($this, 'onBeforeLogin'));
	}
	
	public function onBeforeLogin($aArgs, &$mResult, &$mSubResult)
	{
		if (null === $this->oPopPassD)
		{
			$this->oPopPassD = new \Aurora\Modules\MailChangePasswordPoppassdPlugin\Poppassd(
				$this->getConfig('Host', '127.0.0.1'),
				$this->getConfig('Port', 106)
			);
		}

		if ($this->oPopPassD && $this->oPopPassD->Connect())
		{
			$sLogin = $aArgs['Login'];
			$sPassword = $aArgs['Password'];
			try
			{
				$this->oPopPassD->SendLine('getuser '.$sLogin);
				
				if ($this->oPopPassD->CheckResponse($this->oPopPassD->ReadLine()))
				{
					if ($this->oPopPassD->SendLine('pass '.$sPassword) && $this->oPopPassD->CheckResponse($this->oPopPassD->ReadLine()))
					{
						while ($sLine =  $this->oPopPassD->ReadLine())
						{
							$aLine = \explode(' ', $sLine);
							if ($aLine[0] == 200)
							{
								if (\count($aLine) === 3)
								{
									$aResult[$aLine[1]] = \trim($aLine[2]);
								}
								if (\strtolower(\trim($aLine[1])) === 'complete.')
								{
									break;
								}
							}
						}
						
						$iExpire = isset($aResult['EXPIRE']) ? (int) $aResult['EXPIRE'] : 0;
						$iCfgGrace = isset($aResult['CFGGRACE']) ? (int) $aResult['CFGGRACE'] : 0;
						$iCfgWarn = isset($aResult['CFGWARN']) ? (int) $aResult['CFGWARN'] : 0;

						$mSubResult = [
							'CallHelpdesk' => ($iExpire < 0 && abs($iExpire) > $iCfgGrace) ? true : false,
							'ChangePassword' => ($iExpire <= $iCfgWarn) ? true : false,
							'DaysBeforeExpire' => $iExpire,
						];
					}
				}
			}
			catch (Exception $oException)
			{
				$this->oPopPassD->Disconnect();
				throw $oException;
			}
		}
	}
}
