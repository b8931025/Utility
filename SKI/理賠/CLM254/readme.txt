建斌:2011/4/29 09:20上午
參考bsCLM566001Print at 300 line
或bsCLM466002Print
RINM_OSTD_SHARES是後線程式算出的結果，所以不能直接取值，而要用裡面的百分比去算
R/T應該指的就是自留，所以FMODE=R去取pri_share，每一筆pri_share應該都一樣
期末未決*pri_share=期末未決R/T

勝榮:2012/3/27 
請幫忙調整bsCLM254000Print，以未決明細表的SERVICE，
本來預估是抓比例，然後再算出自留，現在改抓金額數字(就不用先抓比例再用比例做計算了)，
請參考CLM202000火險受理預估作業的估攤按鈕的數字抓法(合約分出型態為R就是自留)
參考C:\SKERP\MARCLM\MARCLMService\REPORT\bsCLM373000Print.vb