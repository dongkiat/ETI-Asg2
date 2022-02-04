@echo off
IF "%1" == "up" (
    IF "%2" == "-mock" (
      echo - Starting edufi-main-interface and databases with docker-compose ^(mock^) -
      docker-compose -f docker-compose.mock.yml up -d
    ) ELSE IF "%2" == "-test" (
      echo - Starting edufi-main-interface and databases with docker-compose ^(test^) -
      docker-compose -f docker-compose.test.yml up -d
    ) ELSE IF "%2" == "-local" (
      echo - Starting edufi-main-interface and databases with docker-compose ^(local^) -
      docker-compose -f docker-compose.local.yml up -d
    ) ELSE (
      echo - Starting edufi-main-interface and databases with docker-compose -
      docker-compose -f docker-compose.yml up -d
    )
    echo - Setting up admin accounts -
    docker exec -i redis-admin-db redis-cli -p 8098 --pipe < ../database/admin_db_setup.txt
) ELSE IF "%1" == "down" (
    echo - Stopping edufi-main-interface and databases -
    IF "%2" == "-mock" (
      docker-compose -f docker-compose.mock.yml down
    ) ELSE IF "%2" == "-test" (
      docker-compose -f docker-compose.test.yml down
    ) ELSE IF "%2" == "-local" (
      docker-compose -f docker-compose.local.yml down
    ) ELSE (
      docker-compose -f docker-compose.yml down
    )
) ELSE IF "%1" == "monitor" (
    echo - Monitoring main-interface . ctrl+c to exit -
    IF "%2" == "-all" (
      docker logs --follow main-interface
    ) ELSE (
      docker logs --tail 20 --follow main-interface
    )
) ELSE (
    echo:
    echo Usage: %0 up ^[options^] ^| down ^[options^] ^| monitor ^[options^]
    echo:
    echo Options ^(up/down^):
    echo     default    Connect with user databases from packages 3.2 and 3.3 as supposedly intended
    echo     -mock      Create and connect with own user database containers ^(if user databases from 3.2 and 3.3 not working^)
    echo     -test      No user database connected, authentication disabled, any userID and password will work for login
    echo     -local     For testing on localhost instead of server, will create and connect with own user database containers
    echo:
    echo Options ^(monitor^):
    echo     default    Display logs for the last 20 lines
    echo     -all       Display entire logs
)