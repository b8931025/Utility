if OBJECT_ID('[dbo].[uf_Rand2CWord]') is not null drop function [dbo].[uf_Rand2CWord];
GO

create function [dbo].[uf_Rand2CWord]() RETURNS nvarchar(2) 
as
/** 隨機取得2個中文字 **/
--'１２３４５６７８９０一二三四五六七八九十壹貳參肆伍陸柒捌玖拾甲乙丙丁戊已庚辛壬癸子丑寅卯辰巳午未申酉戍亥乾坤坎離震巽艮兌佰仟萬億兆胖瘦矮病衰凶死瘟疫苦雞鴨魚牛羊豬狗馬熊鼠兔狗蟲蛇醜鬼妖怪魔ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＳＴＵＶＷＸＹＺ';
begin
declare @cword nvarchar(200) = '１２３４５６７８９０一二三四五六七八九十壹貳參肆伍陸柒捌玖拾甲乙丙丁戊已庚辛壬癸子丑寅卯辰巳午未申酉戍亥ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ';
declare @idxRandX int = dbo.uf_Rand()*len(RTrim(@cword)) + 1;
declare @idxRandY int = dbo.uf_Rand()*len(RTrim(@cword)) + 1;
--中文字種類  1~5:XX 6~10:X仔 11~15:小X 16~20:阿X 21~25:老Ｘ 26~100:XY
declare @iType int = (dbo.uf_Rand() * 100) + 1;

if @iType <= 5 begin 
	return SUBSTRING(@cword,@idxRandX,1) + SUBSTRING(@cword,@idxRandX,1);
end if @iType <= 10 begin 
	return SUBSTRING(@cword,@idxRandX,1) + '仔';
end if @iType <= 15 begin 
	return '小' + SUBSTRING(@cword,@idxRandX,1);
end if @iType <= 20 begin 
	return '阿' + SUBSTRING(@cword,@idxRandX,1);
end if @iType <= 25 begin 
	return '老' + SUBSTRING(@cword,@idxRandX,1);
end

--21~100 XY
return SUBSTRING(@cword,@idxRandY,1) + SUBSTRING(@cword,@idxRandX,1);
end 
GO



