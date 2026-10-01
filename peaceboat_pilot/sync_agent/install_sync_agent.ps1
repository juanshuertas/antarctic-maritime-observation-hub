param(
 [string]$ApiBase,
 [string]$ArchiveToken,
 [string]$ArchiveRoot = "C:\AMOH\DATA"
)
$ErrorActionPreference="Stop"
if(-not $ApiBase.StartsWith("https://")){throw "ApiBase must be HTTPS"}
if([string]::IsNullOrWhiteSpace($ArchiveToken)){throw "ArchiveToken required"}
$here=Split-Path -Parent $MyInvocation.MyCommand.Path
$venv=Join-Path $here ".venv"
python -m venv $venv
& "$venv\Scripts\python.exe" -m pip install --upgrade pip
& "$venv\Scripts\python.exe" -m pip install requests
$config=Join-Path $here "run_sync_agent.ps1"
@"
`$env:OLEA_API_BASE='$ApiBase'
`$env:OLEA_ARCHIVE_TOKEN='$ArchiveToken'
`$env:OLEA_ARCHIVE_ROOT='$ArchiveRoot'
& '$venv\Scripts\python.exe' '$here\sync_agent.py'
"@ | Set-Content -LiteralPath $config -Encoding UTF8
$taskName="OLEA PB124 Windows Archive Sync"
$action=New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$config`""
$trigger=New-ScheduledTaskTrigger -AtLogOn
$settings=New-ScheduledTaskSettingsSet -RestartCount 5 -RestartInterval (New-TimeSpan -Minutes 2) -StartWhenAvailable
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description "OLEA PB124 server-to-C:\AMOH\DATA archive mirror" -Force | Out-Null
Start-ScheduledTask -TaskName $taskName
Write-Host "SYNC AGENT INSTALLED: $taskName"
Write-Host "ROOT: $ArchiveRoot"
