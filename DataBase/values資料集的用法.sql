SELECT TableName.column_a,TableName.column_b
FROM (VALUES (1, 2), (3, 4), (5, 6)) --每個括號代表一個row
AS TableName(column_a, column_b);    --定義table名稱和欄位名稱