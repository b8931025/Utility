select (select count(distinct table_name)
          from user_tables
         where table_name like 'PR_%') -
       (select count(distinct table_name)
          from user_constraints
         where owner = 'BOT1'
           and table_name like 'PR_%') �O��
  from dual;/*�O�ʨSprimary key��Table*/
  
select (select count(distinct table_name)
          from user_tables
         where table_name like 'EN_%') -
       (select count(distinct table_name)
          from user_constraints
         where owner = 'BOT1'
           and table_name like 'EN_%') ����
  from dual;/*�����Sprimary key��Table*/  
  
select (select count(distinct table_name)
          from user_tables
         where table_name like 'AP_%') -
       (select count(distinct table_name)
          from user_constraints
         where owner = 'BOT1'
           and table_name like 'AP_%') AP
  from dual;/*AP�Sprimary key��Table*/ 
  
select (select count(distinct table_name)
          from user_tables
         where table_name like 'GA_%') -
       (select count(distinct table_name)
          from user_constraints
         where owner = 'BOT1'
           and table_name like 'GA_%') ��O�~
  from dual;/*��O�~�Sprimary key��Table*/   
