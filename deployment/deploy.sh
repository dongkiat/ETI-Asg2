#!/bin/bash

if [ "$1" = "up" ]
then
    if [ "$2" = "-mock" ]
    then
        echo "- Starting edufi-main-interface and databases with docker-compose (mock) -"
        docker-compose -f docker-compose.mock.yml up -d
    elif [ "$2" = "-test" ]
    then
        echo "- Starting edufi-main-interface and databases with docker-compose (test) -"
        docker-compose -f docker-compose.test.yml up -d
    elif [ "$2" = "-local" ]
    then
        echo "- Starting edufi-main-interface and databases with docker-compose (local) -"
        docker-compose -f docker-compose.local.yml up -d
    else
        docker-compose -f docker-compose.yml up -d
    fi
    echo "- Setting up admin accounts -"
    cat ../database/admin_db_setup.txt | docker exec -i redis-admin-db redis-cli -p 8098 --pipe
elif [ "$1" = "down" ]
then
    echo "- Stopping edufi-main-interface and databases -"
    if [ "$2" = "-mock" ]
    then
        docker-compose -f docker-compose.mock.yml down
    elif [ "$2" = "-test" ]
    then
        docker-compose -f docker-compose.test.yml down
    elif [ "$2" = "-local" ]
    then
        docker-compose -f docker-compose.local.yml down
    else
        docker-compose -f docker-compose.yml down
    fi
elif [ "$1" = "monitor" ]
then
    echo "- Monitoring main-interface . ctrl+c to exit -"
    if [ "$2" = "-all" ]
    then
        docker logs --follow main-interface
    else
        docker logs --tail 20 --follow main-interface
    fi
else
    echo ""
    echo "Usage: bash $0 up [options] | down [options] | monitor [options]"
    echo ""
    echo "Options (up/down):"
    echo "     default    Connect with user databases from packages 3.2 and 3.3 as supposedly intended"
    echo "     -mock      Create and connect with own user database containers (if user databases from 3.2 and 3.3 not working)"
    echo "     -test      No user database connected, authentication disabled, any userID and password will work for login"
    echo "     -local     For testing on localhost instead of server, will create and connect with own user database containers"
    echo ""
    echo "Options (monitor):"
    echo "     default    Display logs for the last 20 lines"
    echo "     -all       Display entire logs"
    echo ""
fi
