--檔案匯入
/*
調整系統COMPATIBILITY_LEVEL到130以上
*/
SELECT compatibility_level into #tmpCL FROM sys.databases WHERE name = 'EXM';
select * from #tmpCL;

--ALTER DATABASE EXM SET COMPATIBILITY_LEVEL = 130;  

--json字串
declare @json varchar(1000) ='{"name":"John","surname":"Doe","age":45,"skills":["SQL","C#","MVC"]}';

/*預設格式*/
Select * FROM OPENJSON(@json)  ;

/*自定欄位*/
set @json = N'[{"name":"Judy","age":"20","height":"160"}
,{"name":"Willy","age":"40","height":"166"}
,{"name":"John","age":"50","height":"180"}
]';

Select * into #testTable FROM OPENJSON(@json) with ( col1 varchar(90) '$.name'
　　　　　　　　　　　　　　　　　　,col2 varchar(90) '$.age'
　　　　　　　　　　　　　　　　　　,col3 varchar(90) '$.height'
) ;

/*自定欄位*/
SET @json =   
  N'[  
       {  
         "Order": {  
           "Number":"SO43659",  
           "Date":"2011-05-31T00:00:00"  
         },  
         "AccountNumber":"AW29825",  
         "Item": {  
           "Price":2024.9940,  
           "Quantity":1  
         }  
       },  
       {  
         "Order": {  
           "Number":"SO43661",  
           "Date":"2011-06-01T00:00:00"  
         },  
         "AccountNumber":"AW73565",  
         "Item": {  
           "Price":2024.9940,  
           "Quantity":3  
         }  
      }  
 ]'  
   
SELECT * FROM OPENJSON ( @json )  
WITH (   
              Number   varchar(200) '$.Order.Number' ,  
              Date     datetime     '$.Order.Date',  
              Customer varchar(200) '$.AccountNumber',  
              Quantity int          '$.Item.Quantity'  
 ) ;

/*
https://www.pauric.blog/How-To-Import-JSON-To-SQL-Server/
https://docs.microsoft.com/zh-tw/sql/relational-databases/json/solve-common-issues-with-json-in-sql-server?view=sql-server-ver15
https://docs.microsoft.com/zh-tw/sql/relational-databases/databases/view-or-change-the-compatibility-level-of-a-database?view=sql-server-ver15
*/