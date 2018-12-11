#!/usr/bin/env bash

osascript <<END 
tell application "Terminal"
    do script "cd \"$1\";$2"
end tell
END


#cd "$1"
#"$2"
#bash -l
#bash --init-file "$HOME/.bash_profile"
