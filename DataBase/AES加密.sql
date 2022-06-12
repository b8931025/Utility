--IV/Key�L�k�ϥ�binary�u��ϥΦr��
declare @value varchar(max) = '��a���K', @encripted_value varbinary(max), @decripted_value varbinary(max)

--encription on server side
CREATE SYMMETRIC KEY #TempKey
    WITH ALGORITHM   = AES_128
    ,IDENTITY_VALUE  = 'abcdefgh'  --IV
    ,KEY_SOURCE      = 'zxcvzxcv'  --KEY
    ENCRYPTION BY PASSWORD = 'Pa$$w0rd1234';

OPEN SYMMETRIC KEY #TempKey DECRYPTION BY PASSWORD = 'Pa$$w0rd1234';

--�[�K
set @encripted_value = (EncryptByKey(Key_Guid('#TempKey') , @value));
--�ѱK
set @decripted_value = (DecryptByKey(@encripted_value));

select cast(@decripted_value as varchar(max));

CLOSE SYMMETRIC KEY #TempKey;
DROP SYMMETRIC KEY #TempKey;


