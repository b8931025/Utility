/*取得科別科長email*/
select subjname,iinternetmail
from psnv_org
where korg = 3
and deptno = '77'
and denddate is  null;

/*取得部門群組email*/
select deptname, iintranetmail
from psnv_org
where korg = 2
and denddate is  null;
