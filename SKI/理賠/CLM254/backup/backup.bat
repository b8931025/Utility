@echo off

rem ==================================使用方法==================================
rem 1.將要備份的清單，寫入list.txt檔，一定要完整的絕對路徑，但檔名可是萬用字元 
rem 	ex:C:\SKERP\CAS\CASEntity01\beCAS111000Query.*
rem 	
rem 2.執行backup.bat，輸入要備份到哪個目錄名稱
rem ==================================使用方法==================================

set /p fname=Please type the backup folder name:
mkdir %fname%
rem cd %fname%
for /f %%a in ('type list.txt') do xcopy /y %%a  %fname%
pause