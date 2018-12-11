#!/usr/bin/env bash

paste -d ' *$##$* ' ~/.command_cache/bash_history_dir /dev/null /dev/null /dev/null /dev/null /dev/null /dev/null /dev/null ~/.command_cache/bash_history_command | sort | uniq -c | sort