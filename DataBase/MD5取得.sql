declare @newPW varchar(90) = 'newPassWord';
select SUBSTRING(UPPER(sys.fn_VarBinToHexStr(HASHBYTES('MD5',@newPW))),3,32) s2;