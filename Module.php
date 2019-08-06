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
//						$mSubResult = $aResult;
						$mSubResult = [
							'CallHelpdesk' => true,
							'ChangePassword' => true,
							'DaysBeforeExpire' => -1,
						];
//						var_dump($aResult); exit;
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
