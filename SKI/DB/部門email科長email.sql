/*���o��O���email*/
select subjname,iinternetmail
from psnv_org
where korg = 3
and deptno = '77'
and denddate is  null;

/*���o�����s��email*/
select deptname, iintranetmail
from psnv_org
where korg = 2
and denddate is  null;
