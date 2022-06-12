IF OBJECT_ID('ProductMenu', 'U') IS NOT NULL　DROP TABLE ProductMenu;
--產生資料
create TABLE　ProductMenu (
Product varchar(20),
Kind varchar(20),
Price int
);

insert into ProductMenu (Product,Kind,Price) values('Apple','Fruit',10);
insert into ProductMenu (Product,Kind,Price) values('Banana','Fruit',5);
insert into ProductMenu (Product,Kind,Price) values('Mongo','Fruit',15);
insert into ProductMenu (Product,Kind,Price) values('Beef','Meat',120);
insert into ProductMenu (Product,Kind,Price) values('Pork','Meat',100);

select * from ProductMenu;

--order用法
select ROW_NUMBER() over (order by Price desc)  SN,Product,Price from ProductMenu;

--partition用法
select ROW_NUMBER() over (partition by Kind order by Price desc)  SN,Kind,Product,Price from ProductMenu;