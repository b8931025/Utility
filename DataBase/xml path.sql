SELECT  ',' + ColumnEName  
FROM OtherCaseDetail WITH (NOLOCK) 
WHERE OtherCaseMainID = 14 
FOR XML PATH('')