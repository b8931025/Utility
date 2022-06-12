--IV/Key無法使用binary只能使用字串
declare @value varchar(max) = '國家機密', @encripted_value varbinary(max), @decripted_value varbinary(max)

--encription on server side
CREATE SYMMETRIC KEY #TempKey
    WITH ALGORITHM   = AES_128
    ,IDENTITY_VALUE  = 'abcdefgh'  --IV
    ,KEY_SOURCE      = 'zxcvzxcv'  --KEY
    ENCRYPTION BY PASSWORD = 'Pa$$w0rd1234';

OPEN SYMMETRIC KEY #TempKey DECRYPTION BY PASSWORD = 'Pa$$w0rd1234';

--加密
set @encripted_value = (EncryptByKey(Key_Guid('#TempKey') , @value));
--解密
set @decripted_value = (DecryptByKey(@encripted_value));

select cast(@decripted_value as varchar(max));

CLOSE SYMMETRIC KEY #TempKey;
DROP SYMMETRIC KEY #TempKey;


