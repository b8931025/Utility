自留額:再分保後，本公司要承擔的額度
攤回額:再分保後，再保公司承擔的額度
損失金額=自留額+攤回額

已決/預估，如果在rin裡面有資料，那CRC,Q/S,FAC就是0，因為rin裡面沒有這三個值
那如果rin找不到，那就要用ReadRinSTL(已決)和ReadRinAPP(預估)
※rin的資料，是上線後的資料

預估:
用clmm_cm_apphist的IClaim和Dapp去撈clmm_cm_apphist_rin的自留額，撈不到就用function ReadRinAPP

已決:
用clmm_cm_stldtl的IClaim和IClaim_Type去撈clmm_cm_stldtl_rin的自留額，撈不到就用function ReadRinSTL

※建斌:其實預估/已決，在撈自留額，的key應該是IINSKIND29,IClaim,Dapp只是傷健險、新種險的29險種都只有一個
所以可以忽略，火險就不知道了

正確的寫法可以參考C:\SKERP\CLM\ClmService\HAS\bsCLM566000Print.vb