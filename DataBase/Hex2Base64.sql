--{&H12, &H34, &H56, &H78, &H90, &HAB, &HCD, &HEF}

declare @source varbinary(max), @encoded varchar(max), @decoded varbinary(max)
set @source = convert(varbinary(max), 'Hello Base64')
set @encoded = cast('' as xml).value('xs:base64Binary(sql:variable("@source"))', 'varchar(max)')--16 to base 64
set @decoded = cast('' as xml).value('xs:base64Binary(sql:variable("@encoded"))', 'varbinary(max)')--base 64 to 16
select
convert(varchar(max), @source) as source_varchar,
@source as source_binary,
@encoded as encoded,
@decoded as decoded_binary,
convert(varchar(max), @decoded) as decoded_varchar;

--Âàbase64
CREATE or alter FUNCTION [dbo].[f_base64_encode] (@bin varbinary(max))
returns varchar(max) as begin
return cast(N'' as xml).value('xs:base64Binary(sql:variable("@bin"))', 'varchar(max)')
end

--ÁÙ­ìbase64
CREATE or alter FUNCTION [dbo].[f_base64_decode] (@vchar varchar(max))
returns varbinary(max) as begin
return cast(N'' as xml).value('xs:base64Binary(sql:variable("@vchar"))', 'varbinary(max)')
end

¡@
