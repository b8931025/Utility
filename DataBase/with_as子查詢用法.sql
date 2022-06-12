--一般資料表運算式 CTE (Common Table Expression)
with table_a as (
  select * from (values (1),(2),(3)) x(x_column)
) ,table_b as (
  select * from (values ('a'),('b'),('c')) y(y_column)
)
select * from table_a,table_b;