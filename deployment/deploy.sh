#!/bin/bash

if [ "$1" = "up" ]
then
    echo "- Starting edufi-main-interface and databases with docker-compose -"
    if [ "$2" = "-mock" ]
    then
        docker-compose -f docker-compose.mock.yml up -d
    else
        docker-compose up -d
    fi
    echo "- Setting up admin accounts -"
    cat ../database/admin_db_setup.txt | docker exec -i redis-admin-db redis-cli -p 8098 --pipe
elif [ "$1" = "down" ]
then
    echo "- Stopping edufi-main-interface and databases -"
    if [ "$2" = "-mock" ]
    then
        docker-compose -f docker-compose.mock.yml down
    else
        docker-compose down
    fi
elif [ "$1" = "monitor"]
then
    echo "- Monitoring main-interface . ctrl+c to exit -"
    docker logs --tail 10 --follow main-interface
else
    echo "Usage: $0 up|down|monitor"
fi
