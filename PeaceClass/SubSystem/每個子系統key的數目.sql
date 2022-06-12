select (select count(distinct table_name)
          from user_tables
         where table_name like 'PR_%') -
       (select count(distinct table_name)
          from user_constraints
         where owner = 'BOT1'
           and table_name like 'PR_%') 逾催
  from dual;/*逾催沒primary key的Table*/
  
select (select count(distinct table_name)
          from user_tables
         where table_name like 'EN_%') -
       (select count(distinct table_name)
          from user_constraints
         where owner = 'BOT1'
           and table_name like 'EN_%') 企金
  from dual;/*企金沒primary key的Table*/  
  
select (select count(distinct table_name)
          from user_tables
         where table_name like 'AP_%') -
       (select count(distinct table_name)
          from user_constraints
         where owner = 'BOT1'
           and table_name like 'AP_%') AP
  from dual;/*AP沒primary key的Table*/ 
  
select (select count(distinct table_name)
          from user_tables
         where table_name like 'GA_%') -
       (select count(distinct table_name)
          from user_constraints
         where owner = 'BOT1'
           and table_name like 'GA_%') 擔保品
  from dual;/*擔保品沒primary key的Table*/   
