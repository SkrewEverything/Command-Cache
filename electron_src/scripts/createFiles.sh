#!/usr/bin/env bash

DIRECTORY="$HOME/.command_cache"
HIST_DIR="$HOME/.command_cache/bash_history_dir"
HIST_TIME="$HOME/.command_cache/bash_history_time"
HIST_COMMAND="$HOME/.command_cache/bash_history_command"
HIST_SAVED="$HOME/.command_cache/bash_history_saved"

if [ ! -d  "$DIRECTORY" ] 
then
  # Control will enter here if $DIRECTORY doesn't exist.
  mkdir "$DIRECTORY"
  touch "$HIST_TIME"; touch "$HIST_COMMAND"; touch "HIST_SAVED"; touch "HIST_DIR"

fi

if [ ! -f "$HIST_DIR" ]
then
    touch "$HIST_DIR"
fi

if [ ! -f "$HIST_TIME" ]
then
    touch "$HIST_TIME"
fi

if [ ! -f "$HIST_COMMAND" ]
then
    touch "$HIST_COMMAND"
fi

APPEND_HIST="shopt -s histappend"

if cat "$HOME/.bashrc" | grep -q "$APPEND_HIST"
then 
    echo "matched" | cat > /dev/null
else
    echo "$APPEND_HIST" | cat >> "$HOME/.bashrc"
fi

COMMAND_VAR='CUSTOM_HISTFILE_TIME="~/.command_cache/bash_history_time"; CUSTOM_HISTFILE_DIR="~/.command_cache/bash_history_dir"; CUSTOM_HISTFILE_COMMAND="~/.command_cache/bash_history_command"'

if cat "$HOME/.bashrc" | grep -q "$COMMAND_VAR"
then
    echo "matched" | cat > /dev/null
else
    echo "$COMMAND_VAR" | cat >> "$HOME/.bashrc"
fi


COMMAND='PROMPT_COMMAND="history -a; date | xargs echo >>$CUSTOM_HISTFILE_TIME; pwd | xargs echo >>$CUSTOM_HISTFILE_DIR; tail -n 1 $HISTFILE >>$CUSTOM_HISTFILE_COMMAND; $PROMPT_COMMAND"'

if cat "$HOME/.bashrc" | grep -q 'PROMPT_COMMAND="history -a; date | xargs echo >>$CUSTOM_HISTFILE_TIME; pwd | xargs echo >>$CUSTOM_HISTFILE_DIR; tail -n 1 $HISTFILE >>$CUSTOM_HISTFILE_COMMAND; $PROMPT_COMMAND"'
then
    echo "matched" | cat > /dev/null
else
    echo "$COMMAND" | cat >> "$HOME/.bashrc"
fi