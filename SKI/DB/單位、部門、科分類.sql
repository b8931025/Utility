select unitno ,deptno, c.DEPTNAMESHORT
from psnv_org c
where korg = 2  -- 1:���q 2:���� 3:��
and depttype = 2 --0:��~���1:�~�ȳ��2:�䴩���

/*��ܳ���ɡA�����Ƨǥ� */
select * 
from PSNV_FRM_MODULE
where 1=1
order by iarea
