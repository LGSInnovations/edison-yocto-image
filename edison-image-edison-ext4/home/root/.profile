# ~/.profile: executed by Bourne-compatible login shells.

if [ "$BASH" ]; then
  if [ -f ~/.bashrc ]; then
    . ~/.bashrc
  fi
fi

# Setup useful aliases
alias ls='ls --color=auto'
alias ll='ls -lh'
alias l='ls -alh'
alias ..='cd ..'
alias ...='cd ../..'
