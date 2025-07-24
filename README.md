
netstat -ano | findstr :5173


tasklist /fi "PID eq 29344" /fo table

中止Node进程
taskkill /PID 29344 /F