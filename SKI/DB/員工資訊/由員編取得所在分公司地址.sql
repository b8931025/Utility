select distinct iofficer,
                nname,
                unitno,
                deptno,
                subjno,
                unitname,
                deptname,
                subjname,
                dept_add
  from psnv_psn_org
 where iofficer = '100245'
