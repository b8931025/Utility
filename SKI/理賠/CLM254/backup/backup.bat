@echo off

rem ==================================�ϥΤ�k==================================
rem 1.�N�n�ƥ����M��A�g�Jlist.txt�ɡA�@�w�n���㪺������|�A���ɦW�i�O�U�Φr�� 
rem 	ex:C:\SKERP\CAS\CASEntity01\beCAS111000Query.*
rem 	
rem 2.����backup.bat�A��J�n�ƥ�����ӥؿ��W��
rem ==================================�ϥΤ�k==================================

set /p fname=Please type the backup folder name:
mkdir %fname%
rem cd %fname%
for /f %%a in ('type list.txt') do xcopy /y %%a  %fname%
pause