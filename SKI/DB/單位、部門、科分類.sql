select unitno ,deptno, c.DEPTNAMESHORT
from psnv_org c
where korg = 2  -- 1:公司 2:部門 3:科
and depttype = 2 --0:營業單位1:業務單位2:支援單位

/*顯示報表時，部門排序用 */
select * 
from PSNV_FRM_MODULE
where 1=1
order by iarea
