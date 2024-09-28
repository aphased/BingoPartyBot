$StartBot = {
	cls
	# First check for the log.ansi file, then rename it if needed.

	if (!(Test-Path ./logs/)) {
		mkdir ./logs/ | Out-Null
	}

	if (Test-Path ./logs/log.ansi) {
		ren ./logs/log.ansi "Log $((get-date).toString('dd-MM-yyyy HH;mm;ss')).ansi" | Out-Null
		echo "[SCRIPT] Previous log file found, renaming to current date and time!" | tee -a ./logs/log.ansi
	}

	# Start the bot, then log everything.
	echo "[SCRIPT] Running bot!" | tee -a ./logs/log.ansi
	node . | tee -a ./logs/log.ansi
	# echo "Bot should run here..."
	# pause

	# Option for restarting - "-eq 7" is a no, while "-eq 6" is yes.
	echo "[SCRIPT] Bot crashed or was stopped intentionally" | tee -a ./logs/log.ansi
	$wshell = New-Object -ComObject Wscript.Shell
	$answer = $wshell.Popup("Restart bot?", 0, "bot gone", 32 + 4)
	#	if($answer -eq 7) {
	#		echo "Answer is 7"
	#		}
	if ($answer -eq 6) {
		&$StartBot
	}
 else {
		# using else instead of 2 ifs because i can't be bothered, both should work
		&$Exit
	}
}

$Exit = {
	cls
	exit
}

&$StartBot

echo "Hey, you might have run into an error! The script is not supposed to run this part!"
echo "Press any key to exit"
pause | Out-Null
exit
