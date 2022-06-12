select * from PSNV_OFFICER_ALL;

--or 

select a.kmarriage,
       a.nbirthplace,
       a.iofficer,
       a.nname,
       a.dbirthday,
       e.nschool,
       e.nmajor,
       off_ndept(a.iofficer),
       a.iunitori,
       a.ideptori, 
       o.ncname,
       o.NCNAMESHORT,
       s.nskill,
       m.ncname,
       m.ncnameshort
from psnv_officer_all a
left join psnv_hr_educ e on e.iofficer=a.iofficer
left join psnv_hr_skill s on s.iofficer=a.iofficer
left join psnv_hr_org3 o on o.iofficer=a.iofficer
left join psnv_orginfo m on m.iofficer=a.iofficer
where (
a.iofficer='x' or 
a.nname='x' or
a.iemail='x' or
a.ksex='F' and
a.iunitori='00'
)  and a.xdayquit is null;

