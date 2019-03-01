tmux new-session 'bash --init-file <( echo "source $HOME/.bashrc; workon script-wars; cd database_servers; python run_server.py" )' \; \
 split-window 'bash --init-file <( echo "source $HOME/.bashrc; workon script-wars; cd database_servers; python admin_run_server.py" )' \; \
 split-window 'bash --init-file <( echo "cd static_files; python3 -m http.server" )' \; \
 split-window 'bash --init-file <( echo "cd modules; node connection_server.js" )'
