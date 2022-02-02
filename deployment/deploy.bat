@echo off
IF "%1" == "up" (
    echo - Starting edufi-main-interface and databases with docker-compose -
    docker-compose -f docker-compose.mock.yml up -d
    echo - Setting up admin accounts -
    cat ../database/admin_db_setup.txt | docker exec -i redis-admin-db redis-cli -p 8098 --pipe
) ELSE IF "%1" == "down" (
    docker-compose -f docker-compose.mock.yml down
) ELSE IF "%1" == "monitor" (
    echo - Monitoring main-interface . ctrl+c to exit -
    docker logs --tail 10 --follow main-interface
) ELSE (
    echo Usage: "%0" up^|down^|monitor
)