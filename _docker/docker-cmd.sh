#!/usr/bin/env sh

function update_all_language_files() {
  find /usr/share/nginx/html/ -type f -path "*/assets/*" -name "*.json" | (
  while read line; do
    envsubst '$DATASPACE_NAME' < $line > /tmp/langf
      mv /tmp/langf $line
    done
  )
}

export THE_APP=${APPLICATION:-/auth}
export APP_BASE_PATH=${APP_BASE_PATH:-$THE_APP}
export DATASPACE_NAME=${DATASPACE_NAME:-"SIMPL"}

echo "..${THE_APP}.."
echo "..${APP_BASE_PATH}.."

envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js &&
  envsubst '$THE_APP $APP_BASE_PATH' < /nginx.conf.template > /etc/nginx/nginx.conf
update_all_language_files

# Change base href in index.html
sed '/<base/{s!href="[^"]*"!href="'"$APP_BASE_PATH"'/"!;s!//!/!}' "/usr/share/nginx/html/index.html" > "/tmp/t" &&
  cat "/tmp/t" > "/usr/share/nginx/html/index.html"


echo "start nginx"
exec nginx -g 'daemon off;'
