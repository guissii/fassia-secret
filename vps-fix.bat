@echo off
echo cd /root/fassia-secret/backend ^&^& node dist/index.js 2^>^&1 ^| head -30 > C:\temp\vpscmd.txt
plink -ssh root@86.48.2.102 -pw f0yHuwhi5oC1f6F2g7 -m C:\temp\vpscmd.txt
pause
