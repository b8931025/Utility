徐建斌:

用保單號去查損率

select CLM_GETSTL('0799FXP0001784') as stl 
from dual;

因為傷健最近很常查詢保單損率，
因此我將”保單號查詢損失金額”做成function以便使用，若有需要的話可以直接叫用

PS.計算公式僅適用傷健新種(火險應該也可以)，其他險可參考，但需修改

1.  損失金額不等於實際賠付金額
2.  會抓查詢時的最新狀況
3.  當賠案尚未已決時(包括 未決/部分決)，只抓預估金額(APPDTL)
4.  當賠案已決時，只抓理賠損失金額(STLDTL)(已經財會日結)
5.	損失金額包括處理費、公證費
6.	沒有理賠紀錄的話，傳回值為null (理算結0的話會傳回0)
