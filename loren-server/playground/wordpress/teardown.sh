#!/bin/sh
docker-compose > /dev/null 2>&1
exit_code=$?
if [ $exit_code -ne 0 ]; then
    docker compose > /dev/null 2>&1
    exit_code=$?
    elif [ $exit_code -ne 0 ]; then
        echo "Docker Compose is not installed"
        exit 1
    else
        alias docker-compose="docker compose"
fi

docker-compose down 1> /dev/null
current_folder=$(basename $(pwd))
docker volume rm "${current_folder}_db_data" 1> /dev/null
docker volume rm "${current_folder}_wp_data" 1> /dev/null