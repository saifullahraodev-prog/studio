# Placeholder voice using the Windows built-in voice (no download, no internet).
# Usage: powershell -File tools/tts_placeholder.ps1 <lines.json> <outDir> [voiceName] [rate -10..10]
# lines.json = [{ "id": "b1", "say": "text" }, ...]  -> <outDir>/<id>.wav
param(
  [Parameter(Mandatory = $true)][string]$LinesJson,
  [Parameter(Mandatory = $true)][string]$OutDir,
  [string]$Voice = "Microsoft David Desktop",
  [int]$Rate = 1
)
Add-Type -AssemblyName System.Speech
New-Item -ItemType Directory -Force $OutDir | Out-Null
$lines = Get-Content -Raw -Encoding UTF8 $LinesJson | ConvertFrom-Json
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.SelectVoice($Voice)
$s.Rate = $Rate
$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(44100, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
foreach ($l in $lines) {
  $out = Join-Path $OutDir ("{0}.wav" -f $l.id)
  $s.SetOutputToWaveFile($out, $fmt)
  $s.Speak([string]$l.say)
  $s.SetOutputToNull()
  Write-Output ("tts {0} -> {1}" -f $l.id, $out)
}
$s.Dispose()
