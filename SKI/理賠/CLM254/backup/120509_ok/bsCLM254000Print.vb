Imports System
Imports IntelliSys.NetExpress.Entity
Imports IntelliSys.NetExpress.Service
Imports CLMEntity
Imports System.Data
Imports System.Data.SqlClient
Imports CommonLib.Service
Imports IntelliSys.NetExpress.DAO
Imports System.Text
Imports IntelliSys.NetExpress.Web
Imports PUBEntity
Imports PUBService
Public Class bsCLM254000Print
    Inherits BaseAppService
    Private msMsg As String
    Private mGetRinOstdValue As bsGetRinOstdValue = New bsGetRinOstdValue    '再保預估
    Private mGetRinLossValue As bsGetRinLossValue = New bsGetRinLossValue    '再保攤賠
    Private trans As IDbTransaction
    Private bTest As Boolean = True
    Protected Overloads Overrides Sub DoRequest(ByVal param As System.Data.DataSet, ByVal result As System.Data.DataSet, ByVal _trans As System.Data.IDbTransaction)
        Dim ds As beParameters = CType(param, beParameters)
        Dim sReport As String = ds.Parameters(0).Parameter
        Dim dTClaimBgn As Date = CDate(ds.Parameters(1).Parameter)
        Dim dTClaimEnd As Date = CDate(ds.Parameters(2).Parameter)
        Dim UserName As String = ds.Parameters(3).Parameter
        Dim Dcreate As String = ds.Parameters(4).Parameter
        Dim sChkDgs As String = ds.Parameters(6).Parameter
        Dim sDGSDate As String = ""
        Dim sb As New SqlStringBuilder
        Dim dr As DataRow
        Dim dsPrint As New beCLM254000
        Dim dsDGS As New PUBEntity.beDGSdataaccess
        ''2011/3/2 Ben 期初期末要分開判斷以結未結
        Dim sFSettle1 As String = "0"    ''期初是否已結案
        Dim sFSettle3 As String = "0"    ''期末是否已結案
        DataSetUtils.SetStringColumnsDefaultMaxLength(dsPrint, 500)
        trans = _trans

        If sChkDgs.ToUpper.Equals("Y") Then
            ' 將決算年月由5碼的民國轉西元年的年月....
            sDGSDate = CType(CType(ds.Parameters(5).Parameter.Substring(0, 3), Integer) + 1911, String) & ds.Parameters(5).Parameter.Substring(3, 2)
        End If

        Dim bRunOld As Boolean = False
        Dim sICLM_Test As String = ""
        Dim dsSing As DataSet = InvokeCommonService("CLMService.bsSingleSQL", New String() {"CMNP_COMMONCODE", "TYPE = 'CLM254' AND CODE='IF_OLD_CODE'", "NAME"})
        If Not IsNothing(dsSing) AndAlso dsSing.Tables.Count > 0 AndAlso dsSing.Tables(0).Rows.Count > 0 Then
            bRunOld = dsSing.Tables(0).Rows(0)(0).ToString = "1"
        End If
        dsSing = InvokeCommonService("CLMService.bsSingleSQL", New String() {"CMNP_COMMONCODE", "TYPE = 'CLM254' AND CODE='ICLAIM'", "NAME"})
        If Not IsNothing(dsSing) AndAlso dsSing.Tables.Count > 0 AndAlso dsSing.Tables(0).Rows.Count > 0 Then
            sICLM_Test = dsSing.Tables(0).Rows(0)(0).ToString
        End If

        ''取得主檔在畫面上UI所key 的迄日之前的所有資料....
        sb.Reset()
        sb.Append("SELECT   A.ICLAIM, A.IPOLICY, A.TCLAIM, A.DPLY_BGN, A.DCLOSE, A.IOFFICER, ")
        sb.Append("         A.TACDENT, TO_CHAR (A.TACDENT, 'YYYY') AS YY, ")
        sb.Append("         NVL (SUM (B.MTOT_AMT), 0) AS A1, B.IINSKIND29, A.NISSUE ")
        sb.Append("  FROM   CLMM_CM_CLAIM A, CLMM_CM_APPDTL B ")
        sb.Append(getWhere())
        sb.Append("   AND   A.OID = B.ICLAIM_OID ")
        sb.Append("   AND   TRUNC(A.TCLAIM) <= TO_DATE ('" & dTClaimEnd.ToShortDateString & "','YYYY/MM/DD') ")
        If sICLM_Test.Trim.Length > 0 Then sb.Append(" and a.iclaim = '" & sICLM_Test & "' ") 'for Testing
        'sb.Append(" and a.iclaim in ('0096FBF0026400','0098FBF0036200','0098FBF0038400') ") 'for Testing
        sb.Append("   AND   A.IINSCLS = 'F' ")
        sb.Append("GROUP BY A.ICLAIM, A.IPOLICY, A.TCLAIM, A.DPLY_BGN, A.DCLOSE, A.IOFFICER, A.TACDENT, TO_CHAR (A.TACDENT, 'YYYY'), B.IINSKIND29, A.NISSUE HAVING SUM(B.MAPP) <> 0")
        Dim dsTmp As New DataSet
        Me.LoadDataSet(sb.ToSqlString, dsTmp, "T1", trans)
        '進行運算
        For Each dr In dsTmp.Tables("T1").Rows
            Dim drTemp As beCLM254000.CLMR_254000Row = dsPrint.CLMR_254000.NewCLMR_254000Row
            drTemp("ireport") = sReport
            drTemp("icreate") = UserName
            drTemp("dcreate") = Dcreate
            drTemp("iclaim") = dr("iclaim")
            drTemp("ipolicy") = dr("ipolicy")
            drTemp("tclaim") = dr("tclaim")
            drTemp("dply_bgn") = dr("dply_bgn")
            drTemp("tacdent") = dr("tacdent")
            drTemp("Iofficer") = dr("Iofficer")
            drTemp("year") = dr("YY")
            drTemp("iinskind29") = dr("iinskind29")
            '取得最大sum(MTOT_AMT)的IProd
            drTemp("iprod") = getIProd(dr("iclaim").ToString, trans)
            drTemp("NISSUE") = dr("NISSUE")
            ''===========================================================================================
            ''改寫以決未決金額部分程式碼
            ''↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
            Dim sICLAIM As String = dr("iclaim")
            Dim idr As IDataReader
            Dim idrRin As IDataReader
            Dim sFSettle As String    '空白=未結案, 0=部分結案, 1=完全結案, 2=追償 only
            Dim bClose As Boolean
            Dim dQBeginNextDate, dQEndNextDate As DateTime
            dQBeginNextDate = dTClaimBgn.AddDays(1)
            dQEndNextDate = dTClaimEnd.AddDays(1)
            'mdAPP_B
            Dim mdAPP_E As Decimal = 0
            Dim mdAPP_B As Decimal = 0
            Dim mdSTL_E As Decimal = 0
            Dim mdSTL_B As Decimal = 0
            Dim mdRIN_APP_E As Decimal = 0
            Dim mdRIN_APP_B As Decimal = 0
            Dim mdRIN_STL_E As Decimal = 0 '期末再保已結 from ReadRinSTL
            Dim mdRIN_STL_B As Decimal = 0 '期初再保已結 from ReadRinSTL
            '新加一組自留額 '2010.09.08
            '--------------------------------
            Dim mdRIN_APP_E1 As Decimal = 0
            Dim mdRIN_APP_B1 As Decimal = 0
            Dim mdRIN_STL_E1 As Decimal = 0 '期末再保已結 from RIN
            Dim mdRIN_STL_B1 As Decimal = 0 '期初再保已結 from RIN
            '--------------------------------
            Dim chkRIN_APP_B1 As Boolean
            Dim chkRIN_APP_E1 As Boolean
            Dim chkRIN_STL_B1 As Boolean
            Dim chkRIN_STL_E1 As Boolean

            ''期初結案判斷
            sb.Reset()
            sb.Append("select MAX(FSETTLE)")
            sb.Append(" FROM CLMM_CM_SETTLE")
            sb.Append("where ICLAIM = '" & sICLAIM & "' ")
            sb.Append("AND DVOUCH < TO_DATE('" & dTClaimBgn.ToString("yyyy/MM/dd") & "','YYYY/MM/DD')")
            sb.Append("AND FSETTLE IN ('0', '1','2')")
            Dim nFSettle1 As Decimal = CLMEntityCommon.Obj2Decimal(Me.DefaultRunner.ExecuteScalar(sb.ToSqlString, trans))
            If nFSettle1 > 0 Then
                sFSettle1 = "1"       ''期初已結，金額為0
            Else
                sFSettle1 = "0"
            End If

            '截止日前已結案否?
            sb.Reset()
            sb.Append(" SELECT MAX(FSETTLE)")
            sb.Append(" FROM CLMM_CM_SETTLE")
            sb.Append("WHERE ICLAIM='" & sICLAIM & "' ")
            sb.Append("AND DVOUCH<TO_DATE('" & dQEndNextDate.ToString("yyyy/MM/dd") & "','YYYY/MM/DD')")
            sb.Append("AND FSETTLE IN ('0', '1','2')")
            sFSettle = CLMEntityCommon.Obj2String(Me.DefaultRunner.ExecuteScalar(sb.ToSqlString, trans))
            Select Case sFSettle
                Case "1", "2"
                    bClose = True
                    sFSettle3 = "1"       ''期末已結，金額為0
                Case Else
                    bClose = False
                    sFSettle3 = "0"
            End Select

            If bClose Then
                ' 已結案者，必須在查詢期間內結案者，才處理。
                sb.Reset()
                sb.Append(" SELECT MAX(FSETTLE)")
                sb.Append("   FROM CLMM_CM_SETTLE")
                sb.Append(getWhere())
                sb.Append("AND ICLAIM='" & sICLAIM.ToString & "'")
                sb.Append("AND DVOUCH >=TO_DATE('" & dTClaimBgn.ToShortDateString & "','YYYY/MM/DD')")
                sb.Append("AND DVOUCH < TO_DATE('" & dQEndNextDate.ToString("yyyy/MM/dd") & "','YYYY/MM/DD')")
                sb.Append("AND FSETTLE IN ('1','2')")
                sFSettle = CLMEntityCommon.Obj2String(Me.DefaultRunner.ExecuteScalar(sb.ToSqlString, trans))
                Select Case sFSettle
                    Case "1", "2"
                        bClose = True
                    Case Else
                        GoTo NextCLAIM
                End Select
            End If
            'QMWJ1:期末未決
            'BQYJ1:本期已決
            'QCWJ1:期初未決
            'QMWJ2:期末未決(R/T)
            'BQYJ2:本期已決(R/T)
            'QCWJ2:期初未決(R/T)
            drTemp.QCWJ1 = 0
            drTemp.BQYJ1 = 0
            drTemp.QMWJ1 = 0
            drTemp.QCWJ2 = 0
            drTemp.BQYJ2 = 0
            drTemp.QMWJ2 = 0

            Dim dsRIN As New beCLM466000
            Dim mInsTypes As Hashtable = New Hashtable   '同一賠案下, 29險種的彙總資料
            Dim Item1 As Item_InsType
            ''================================================================
            ''2011/3/29 Ben
            ''前置工作處理完畢，開始計算
            ''1.抓CLMM_CM_APPHIST，DAPP大於起日前最大財會日結日、小於日期迄
            ''2.抓CLMM_CM_SETTLE，DVOUCH小於日期迄、FSETTLE in (0,1,2)
            ''3.自留，先抓_RIN(ICLAIM+DAPP 或 ICLAIM+ICLAIM_TYPE)，沒有的話才跑service
            ''================================================================

            ''計算期初/期末/本期
            mInsTypes.Clear()
            Item1 = New Item_InsType
            Item1.msKey = "0000"
            ''取得29險種代號 (CAS、HAS、FIR理賠29險種都只有唯一值)
            sb.Reset()
            sb.Append("select IINSKIND29 from CLMM_CM_APPHIST ")
            sb.Append(" WHERE '" & Me.ProgramID & "_" & Me.OfficerID & "' = '" & Me.ProgramID & "_" & Me.OfficerID & "'")
            sb.Append(" AND ICLAIM= '" & sICLAIM & "' AND MAPP <> 0")
            sb.Append(" and rownum = 1 ")
            idr = Me.DefaultRunner.ExecuteReader(sb.ToSqlString, trans)
            If idr.Read Then
                Item1.msKey = idr(0).ToString
            End If
            idr.Close()
            mInsTypes.Add(Item1.msKey, Item1)


            If bRunOld Then '舊程式碼
                ''1.抓CLMM_CM_APPHIST，DAPP小於日期迄
                sb.Reset()
                sb.Append("SELECT A.IADRSEQ, A.IAREASEQ,                      ")
                sb.Append("       A.IOBJSEQ, A.IINSTYPE,                      ")
                sb.Append("       B.DAPP,SUM(B.MAPP) AS MAPP                  ")
                sb.Append("  FROM CLMM_CM_APPDTL A                            ")
                sb.Append("  JOIN CLMM_CM_APPHIST B                           ")
                sb.Append("    ON A.OID = B.APPDTL_OID                        ")
                sb.Append(getWhere)
                sb.Append("   AND A.ICLAIM = '" & sICLAIM & "'                ")
                sb.Append("   AND B.DAPP<TO_DATE('" & dQEndNextDate.ToString("yyyy/MM/dd") & "','YYYY/MM/DD')")
                sb.Append(" GROUP BY A.IADRSEQ,A.IAREASEQ,A.IOBJSEQ,A.IINSTYPE,B.DAPP")
                idr = DefaultRunner.ExecuteReader(sb.ToSqlString, trans)
                While idr.Read
                    '預估自留
                    '先抓_RIN
                    Dim dRin As Decimal = 0
                    Dim IADRSEQ As Integer = CInt(idr("IADRSEQ"))
                    Dim IAREASEQ As Integer = CInt(idr("IAREASEQ"))
                    Dim IOBJSEQ As Integer = CInt(idr("IOBJSEQ"))
                    Dim IINSTYPE As String = idr("IINSTYPE").ToString
                    sb.Reset()
                    sb.Append(" select ICLAIM,sum(NVL(b.mret,0)) as MRET ")
                    sb.Append(" From CLMM_CM_APPHIST_RIN b")
                    sb.Append(getWhere)
                    sb.Append(" AND b.ICLAIM= '" & sICLAIM & "' ")
                    sb.Append(" AND b.DAPP = TO_DATE('" & CDate(idr("DAPP")).ToString("yyyy/MM/dd") & "','YYYY/MM/DD')")
                    sb.Append(" GROUP BY b.ICLAIM ")
                    Dim idrMRET As IDataReader = DefaultRunner.ExecuteReader(sb.ToSqlString, trans)
                    If idrMRET.Read Then
                        dRin = CDec(idrMRET("MRET"))
                    Else
                        '2011/4/9 Ben 沒有RIN，抓比例自行計算(SQL由承宇提供)(由於預估攤賠沒有日期之分，因此必須由比例自行計算)
                        dRin = getShareRate(sICLAIM, "R", "T", IADRSEQ, IAREASEQ, IOBJSEQ, IINSTYPE) * CDec(idr("MAPP"))
                        If dr("iclaim").ToString = "0000FBC0000115" Then
                            dRin = dRin - 1
                        End If
                    End If
                    idrMRET.Close()
                    ''計算
                    ''期末預估
                    Item1.mdAPP_E += CDec(idr("MAPP"))
                    Item1.mdRIN_APP_E += dRin
                    If CDate(idr("DAPP")) < dTClaimBgn Then
                        ''期初預估
                        Item1.mdAPP_B += CDec(idr("MAPP"))
                        Item1.mdRIN_APP_B += dRin
                    End If
                End While
                If Not IsNothing(idr) Then idr.Close()
            Else '新程式碼
                ''1.抓CLMM_CM_APPHIST，DAPP小於日期迄
                sb.Reset()
                sb.Append("SELECT * FROM (                                        ")
                sb.Append("  SELECT B.DAPP, SUM(B.MAPP) AS MAPP                   ")
                sb.Append("    FROM CLMM_CM_APPHIST B                             ")
                sb.Append(getWhere)
                sb.Append("     AND B.ICLAIM = '" & sICLAIM & "'                   ")
                sb.Append("     AND B.DAPP < TO_DATE('" & dQEndNextDate.ToString("yyyy/MM/dd") & "', 'YYYY/MM/DD')  ")
                sb.Append("   GROUP BY B.DAPP                                     ")
                sb.Append(" )WHERE MAPP <> 0 ")
                idr = DefaultRunner.ExecuteReader(sb.ToSqlString, trans)
                While idr.Read
                    '先抓_RIN
                    Dim dRin As Decimal = 0
                    Dim bHaveData As Boolean = False
                    sb.Reset()
                    sb.Append(" select ICLAIM,sum(NVL(b.mret,0)) as MRET ")
                    sb.Append(" From CLMM_CM_APPHIST_RIN b")
                    sb.Append(getWhere)
                    sb.Append(" AND b.ICLAIM= '" & sICLAIM & "' ")
                    sb.Append(" AND b.DAPP = TO_DATE('" & CDate(idr("DAPP")).ToString("yyyy/MM/dd") & "','YYYY/MM/DD')")
                    sb.Append(" GROUP BY b.ICLAIM ")
                    Dim idrMRET As IDataReader = DefaultRunner.ExecuteReader(sb.ToSqlString, trans)
                    If idrMRET.Read Then
                        dRin = CDec(idrMRET("MRET"))
                    Else
                        'bHaveData的用途，是因為有的賠案，在CLMM_CM_APPHIST_RIN和getRTNum都有資料
                        '但CLMM_CM_APPHIST_RIN的自留，是每一筆的加總，而getRTNum是以最後一次為準
                        '所以如果一賠案在CLMM_CM_APPHIST_RIN取到一半沒資料，又去getRTNum找，自留額就會重覆
                        '這時就要判斷getRTNum是否有取出自留額，如果有就要把之前CLMM_CM_APPHIST_RIN取出的資料蓋掉
                        bHaveData = getRTNum(sICLAIM, CDate(idr("DAPP")), drin)
                    End If
                    idrMRET.Close()

                    '期末預估
                    Item1.mdAPP_E += CDec(idr("MAPP"))
                    If bHaveData Then
                        Item1.mdRIN_APP_E = dRin
                    Else
                        Item1.mdRIN_APP_E += dRin
                    End If
                    If CDate(idr("DAPP")) < dTClaimBgn Then
                        '期初預估
                        Item1.mdAPP_B += CDec(idr("MAPP"))
                        If bHaveData Then
                            Item1.mdRIN_APP_B = dRin
                        Else
                            Item1.mdRIN_APP_B += dRin
                        End If
                    End If
                End While
                If Not IsNothing(idr) Then idr.Close()
            End If

            ''2.抓CLMM_CM_SETTLE，DVOUCH小於日期迄、FSETTLE in (0,1,2)
            sb.Reset()
            sb.Append(" select A.ICLAIM,A.DVOUCH,A.ICLAIM_TYPE,SUM(NVL(B.mstl,0)+NVL(B.MNOTARY,0)+NVL(B.MFEE,0)) as MSTL,0 as RIN ")
            sb.Append(" from CLMM_CM_SETTLE A ")
            sb.Append(" inner join clmm_cm_stldtl B on a.OID = B.settle_oid")
            sb.Append(" WHERE '" & Me.ProgramID & "_" & Me.OfficerID & "' = '" & Me.ProgramID & "_" & Me.OfficerID & "'")
            sb.Append(" AND A.ICLAIM= '" & sICLAIM & "' ")
            sb.Append(" AND A.DVOUCH < TO_DATE('" & dQEndNextDate.ToString("yyyy/MM/dd") & "','YYYY/MM/DD')")
            sb.Append(" AND FSETTLE in ('0','1','2')")
            sb.Append(" group by  A.ICLAIM,A.DVOUCH,A.ICLAIM_TYPE ")
            Me.DefaultRunner.LoadDataSet(sb.ToSqlString, dsRIN, "STL", trans)
            ''處理理賠自留
            For Each drR As beCLM466000.STLRow In dsRIN.STL.Rows
                ''先抓_RIN
                sb.Reset()
                sb.Append(" select ICLAIM,sum(NVL(b.mret,0)) as MRET ")
                sb.Append(" From clmm_cm_stldtl_rin b")
                sb.Append(" WHERE '" & Me.ProgramID & "_" & Me.OfficerID & "' = '" & Me.ProgramID & "_" & Me.OfficerID & "'")
                sb.Append(" AND b.ICLAIM= '" & drR.ICLAIM & "' ")
                sb.Append(" AND b.ICLAIM_TYPE = " & drR.ICLAIM_TYPE.ToString)
                sb.Append(" GROUP BY b.ICLAIM ")
                idr = Me.DefaultRunner.ExecuteReader(sb.ToSqlString, trans)
                If idr.Read Then
                    drR.RIN = CDec(idr("MRET"))
                Else
                    ''沒有_RIN，抓bsGetRinLossValue. GetLossValue (ICLAIM+ICLAIM_TYPE)
                    Dim dsRIN213 As beRIN213000
                    If Me.ReadRinSTL(drR.ICLAIM, drR.ICLAIM_TYPE.ToString, trans, dsRIN213) > 0 Then
                        For Each drRin213 As beRIN213000.LOSS_SHARESRow In dsRIN213.LOSS_SHARES.Rows
                            If drRin213.FMODE = "R" Then
                                drR.RIN += drRin213.MLOSS_NT_S
                            End If
                        Next
                    End If
                End If
                idr.Close()
                ''計算
                ''期末預估
                Item1.mdSTL_E += drR.MSTL
                Item1.mdRIN_STL_E += drR.RIN
                If drR.DVOUCH < dTClaimBgn Then
                    ''期初預估
                    Item1.mdSTL_B += drR.MSTL
                    Item1.mdRIN_STL_B += drR.RIN
                End If
            Next

            ''================================================================
            ''2011/3/29 Ben	''計算完畢
            ''================================================================

            If chkRIN_STL_E1 = False Then mdRIN_STL_E1 = mdRIN_STL_E
            If chkRIN_STL_B1 = False Then mdRIN_STL_B1 = mdRIN_STL_B

            '期初未決
            If sFSettle1 = "1" Then
                drTemp.QCWJ1 = 0
            Else
                drTemp.QCWJ1 = Item1.mdAPP_B - Item1.mdSTL_B
            End If
            '如果是負值，就設為0
            'If drTemp.QCWJ1 < 0 Then drTemp.QCWJ1 = 0

            '本期已決
            drTemp.BQYJ1 = Item1.mdSTL_E - Item1.mdSTL_B

            ''期末未決
            If sFSettle3 = "1" Then
                drTemp.QMWJ1 = 0
            Else
                drTemp.QMWJ1 = Item1.mdAPP_E - Item1.mdSTL_E
            End If
            '如果是負值，就設為0
            'If drTemp.QMWJ1 < 0 Then drTemp.QMWJ1 = 0

            '期初未結自留
            If sFSettle1 = "1" Then
                drTemp.QCWJ2 = 0
            Else
                drTemp.QCWJ2 = Item1.mdRIN_APP_B - Item1.mdRIN_STL_B
            End If
            '如果是負值，就設為0
            'If drTemp.QCWJ2 < 0 Then drTemp.QCWJ2 = 0

            ''本期已結自留
            drTemp.BQYJ2 = Item1.mdRIN_STL_E - Item1.mdRIN_STL_B

            ''自留期末未決=預估期末未決-本期已決
            If sFSettle3 = "1" Then
                drTemp.QMWJ2 = 0
            Else
                drTemp.QMWJ2 = Item1.mdRIN_APP_E - Item1.mdRIN_STL_E
            End If
            '如果是負值，就設為0
            'If drTemp.QMWJ2 < 0 Then drTemp.QMWJ2 = 0

            '如果[期初未決],[本期已決],[期末未決],[期初未決自留],[本期已決自留],[期末未決自留]
            If drTemp.QCWJ1 = 0 AndAlso drTemp.BQYJ1 = 0 AndAlso drTemp.QMWJ1 = 0 _
            AndAlso drTemp.QCWJ2 = 0 AndAlso drTemp.BQYJ2 = 0 AndAlso drTemp.QMWJ2 = 0 Then GoTo NextCLAIM

            '10010247 Hermit=>因為理賠要求，將損失超過預估但是還是未決的資料，也要SHOW出來，但是[期初][本期][期末]都SHOW零，所以將負數歸0的程式碼搬到這邊
            If drTemp.QCWJ1 < 0 Then drTemp.QCWJ1 = 0
            If drTemp.QMWJ1 < 0 Then drTemp.QMWJ1 = 0
            If drTemp.QCWJ2 < 0 Then drTemp.QCWJ2 = 0
            If drTemp.QMWJ2 < 0 Then drTemp.QMWJ2 = 0

            '四捨五入
            drTemp.QCWJ1 = CInt(drTemp.QCWJ1)
            drTemp.BQYJ1 = CInt(drTemp.BQYJ1)
            drTemp.QMWJ1 = CInt(drTemp.QMWJ1)
            drTemp.QCWJ2 = CInt(drTemp.QCWJ2)
            drTemp.BQYJ2 = CInt(drTemp.BQYJ2)
            drTemp.QMWJ2 = CInt(drTemp.QMWJ2)

            '出險原因(clmm_cm_claim.iacdresn)如果為40，則R/T三個欄位數字都歸0
            If isIACDRESN_40(dr("ICLAIM").ToString) Then
                drTemp.QCWJ2 = 0
                drTemp.BQYJ2 = 0
                drTemp.QMWJ2 = 0
            End If

            ' LYEARM     : 曆年制賠款
            drTemp("LYEARM") = TransTONum(drTemp("BQYJ1")) + TransTONum(drTemp("QMWJ1")) - TransTONum(drTemp("QCWJ1"))
            '　ACCIDENTM : 事故制賠款
            drTemp("ACCIDENTM") = TransTONum(drTemp("BQYJ1")) + TransTONum(drTemp("QMWJ1"))

            '取得「結案日」
            Try
                sb.Reset()
                sb.Append(" SELECT  NVL(MAX(DVOUCH), to_date('1911/01/01','yyyy/mm/dd')) AS DVOUCH ")
                sb.Append("   FROM  CLMM_CM_SETTLE ")
                sb.Append(getWhere())
                If Not isNull(dr("ICLAIM")) Then sb.Append("AND  ICLAIM = '" + dr("ICLAIM").ToString.Trim + "'")
                Dim drDV As IDataReader = DefaultRunner.ExecuteReader(sb.ToSqlString, trans)
                Dim DVouch As Object
                If drDV.Read Then DVouch = drDV("DVOUCH")
                '在統計期間內才顯示
                If Not isNull(DVouch) AndAlso dTClaimBgn <= DVouch AndAlso DVouch <= dTClaimEnd Then
                    drTemp("DCLOSE") = CDate(DVouch)
                End If
            Catch ex As Exception
                Throw ex
            End Try

            sb.Reset()
            sb.Append(" SELECT UNITNO || DEPTNO AS SUBJNO ")
            sb.Append("   FROM SAMP_OFFICER ")
            sb.Append(getWhere())
            If Not dr("IOFFICER") Is DBNull.Value AndAlso dr("IOFFICER").ToString.Trim.Length > 0 Then
                sb.Append("AND IOFFICER='" + dr("IOFFICER") + "'")
            End If
            Dim sSubjno As DataSet = Me.DefaultRunner.ExecuteDataSet(sb.ToSqlString, trans)
            If sSubjno.Tables(0).Rows.Count > 0 Then
                drTemp("IKEYUNIT") = sSubjno.Tables(0).Rows(0)("SUBJNO")
            End If
            dsPrint.CLMR_254000.AddCLMR_254000Row(drTemp)
NextCLAIM:
        Next
        If Not dsTmp.Tables("T1").Rows.Count > 0 Then
            Throw New Exception("無資料列印")
        End If
        Me.DefaultRunner.UpdateDataSet(dsPrint, "CLMR_254000", trans)

        'Rendering Report
        Dim dsResultA As beRSReports = CType(result, beRSReports)
        Dim drReportItem As beRSReports.ReportItemsRow = dsResultA.ReportItems.AddReportItemsRow("/CLMReport/CLM254000", "火險已未決明細表")
        dsResultA.PublicParameters.AddPublicParametersRow(drReportItem, "iReport", sReport)
        dsResultA.PublicParameters.AddPublicParametersRow(drReportItem, "PrintUser", UserName)
        dsResultA.PublicParameters.AddPublicParametersRow(drReportItem, "sTclaim_Bgn", dTClaimBgn.ToShortDateString)
        dsResultA.PublicParameters.AddPublicParametersRow(drReportItem, "sTclaim_End", dTClaimEnd.ToShortDateString)
        '指定Render 指令，免除Reporting Service 偵測的Loading
        dsResultA.PublicParameters.AddPublicParametersRow(drReportItem, "rs:Command", "Render")
        '隱藏參數輸入區塊
        dsResultA.PublicParameters.AddPublicParametersRow(drReportItem, "rc:Parameters", "False")

        ' 決算系統需求 
        If sChkDgs = "Y" Then
            ' [浚] 0990419 Update Note : 
            sb.Reset()
            sb.Append(" SELECT   IINSKIND29, SUM (NVL (QMWJ1, 0)) AS QMWJ1, SUM (NVL (QMWJ2, 0)) AS QMWJ2 ")
            sb.Append("   FROM CLMR_254000 ")
            sb.Append("  WHERE IREPORT = '" & sReport & "'")
            sb.Append("  GROUP BY IINSKIND29 ")
            Dim dsOut As New DataSet
            Me.LoadDataSet(sb.ToSqlString, dsOut, "DGS", trans)
            ' 針對每一個29險種所SUM起來的 QMWJ1 未決保險賠款 及 QMWJ1 - QMWJ2 的未決攤回再保賠款
            For Each drOut As DataRow In dsOut.Tables("DGS").Rows
                Dim drDGS5 As beDGSdataaccess.InputRow = dsDGS.Input.NewInputRow
                drDGS5.ACCESS = "1"
                drDGS5.DCLOSE = Mid(sDGSDate, 5, 2) & "/01/" & Mid(sDGSDate, 1, 4)  ' 決算年月
                drDGS5.SSOURCE = "CLM254000"
                drDGS5.IINSCLS = "F"
                drDGS5.IBUSS_TYPE = drOut.Item("IINSKIND29").ToString  ' 會計２９險種
                drDGS5.STYPE = "5"  ' 未決保險賠款
                drDGS5.MAMOUNT = CDec(drOut.Item("QMWJ1"))   ' 期末未決(這已經SUM過)
                dsDGS.Input.Rows.Add(drDGS5)
                Dim drDGS6 As beDGSdataaccess.InputRow = dsDGS.Input.NewInputRow
                drDGS6.ACCESS = "1"
                drDGS6.DCLOSE = Mid(sDGSDate, 5, 2) & "/01/" & Mid(sDGSDate, 1, 4) ' 決算年月
                drDGS6.SSOURCE = "CLM254000"
                drDGS6.IINSCLS = "F"
                drDGS6.IBUSS_TYPE = drOut.Item("IINSKIND29").ToString  ' 會計２９險種
                drDGS6.STYPE = "6"  ' 未決保險賠款
                drDGS6.MAMOUNT = CDec(drOut.Item("QMWJ1")) - CDec(drOut.Item("QMWJ2"))   ' 未決攤回再保賠款 =>  
                dsDGS.Input.Rows.Add(drDGS6)
            Next
            ' 呼叫決算系統, 將 dsDGS傳入決算系統中.....
            Dim dsRtn As DataSet = Me.InvokeBusinessService("PUBService.bsDGSdataaccess", dsDGS)
            Dim aryNG() As DataRow = dsRtn.Tables("Output").Select("fresult='N'")
            Dim strMsg As String = ""
            For Each dr In aryNG
                strMsg &= dr("smsag").ToString.Trim & vbNewLine
            Next
            If strMsg <> "" Then Throw New Exception(strMsg)
            ' 決算系統需求 ============================================================================
            'Rendering Report
            Dim dsResultT As beRSReports = CType(result, beRSReports)
            Dim drReportItemT As beRSReports.ReportItemsRow = dsResultT.ReportItems.AddReportItemsRow("/CLMReport/CLM254000T", "火險已未決總表")
            dsResultT.PublicParameters.AddPublicParametersRow(drReportItemT, "iReport", sReport)
            dsResultT.PublicParameters.AddPublicParametersRow(drReportItemT, "PrintUser", UserName)
            dsResultT.PublicParameters.AddPublicParametersRow(drReportItemT, "sTclaim_Bgn", dTClaimBgn.ToShortDateString)
            dsResultT.PublicParameters.AddPublicParametersRow(drReportItemT, "sTclaim_End", dTClaimEnd.ToShortDateString)
            '指定Render 指令，免除Reporting Service 偵測的Loading
            dsResultT.PublicParameters.AddPublicParametersRow(drReportItemT, "rs:Command", "Render")
            '隱藏參數輸入區塊
            dsResultT.PublicParameters.AddPublicParametersRow(drReportItemT, "rc:Parameters", "False")
        End If
        ' 決算系統需求 ============================================================================
    End Sub

    Protected Overrides ReadOnly Property ResultType() As System.Type
        Get
            Return GetType(beRSReports)
        End Get
    End Property

    Protected Overrides ReadOnly Property DefaultInstanceName() As String
        Get
            Return "skerp_bk"
        End Get
    End Property

#Region "自定義Function"
    Public Function ReadSTLVouchedStringList(ByVal sIClaim As String, ByVal dBegin As DateTime, ByVal dEnd As DateTime, ByRef sListBegin As String, ByRef sListEnd As String, ByVal trans As System.Data.IDbTransaction) As Integer
        'Return: Count, -1=exception.
        '(期初)與(期末)再保已結, 必須逐筆依照(賠次)計算
        '再保系統程式介面僅有(賠案號碼+賠次)該次的金額。
        '因此必須自行計算所有賠次(且經財務確認)的彙總再保數據
        Dim dsRIN213000 As beRIN213000
        Dim sb As New SqlStringBuilder
        Dim dEndNextDate As DateTime
        Dim idr As IDataReader
        Dim i1 As Integer
        Dim iCount As Integer
        'Dim sListBegin, sListEnd As String
        sListBegin = ""
        sListEnd = ""
        If sIClaim.Length < 1 Then Return 0
        If dEnd = DateTime.MinValue Then Return 0
        dEndNextDate = dEnd.AddDays(1)
        sb.Reset()
        sb.Append(" SELECT ICLAIM_TYPE, DVOUCH")
        sb.Append(" FROM CLMM_CM_SETTLE")
        sb.Append(" WHERE ICLAIM='" & sIClaim.ToString & "'")
        sb.Append(" and DVOUCH < TO_DATE('" & dEndNextDate.ToString("yyyy/MM/dd") & "','YYYY/MM/DD')")
        sb.Append(" and FSETTLE IN ('0','1','2')")
        sb.Append(" ORDER BY DVOUCH")
        idr = Me.DefaultRunner.ExecuteReader(sb.ToSqlString, trans)
        iCount = 0
        Do While idr.Read
            iCount = iCount + 1
            i1 = CLMEntityCommon.Obj2Integer(idr("ICLAIM_TYPE"))
            If CLMEntityCommon.Obj2DateTime(idr("DVOUCH")) <= dBegin Then
                sListBegin = sListBegin & i1.ToString & ","
            End If
            sListEnd = sListEnd & i1.ToString & ","
        Loop
        idr.Close()
        If sListBegin.Length > 0 Then
            sListBegin = sListBegin.Substring(0, sListBegin.Length - 1)
        End If
        If sListEnd.Length > 0 Then
            sListEnd = sListEnd.Substring(0, sListEnd.Length - 1)
        End If
        Return iCount
    End Function
    Public Function ReadRinAPP(ByVal sICLAIM As String, ByVal dEnd As DateTime, ByVal trans As System.Data.IDbTransaction, ByRef dsOut As beRIN212000) As Integer
        '再保預估: 以賠案號碼+預估日期. 再保攤賠: 以賠案號碼+理賠次數
        'Reurn: 1=OK, 0=APP error, -1=exception.
        Dim ds As beRIN212000 = New beRIN212000
        Dim dt As beRIN212000.CALCU_MAINDataTable
        Dim dr As beRIN212000.CALCU_MAINRow
        msMsg = ""
        dsOut = Nothing
        If dEnd = DateTime.MinValue Then Return 0
        dt = ds.CALCU_MAIN
        dr = dt.NewCALCU_MAINRow
        dr.ICLAIM = sICLAIM
        dr.DAPPRAISAL = dEnd
        dt.AddCALCU_MAINRow(dr)
        Try
            dsOut = mGetRinOstdValue.GetOstrdValue(ds, trans)
            Return 1
        Catch ex As Exception
            'Throw New Exception("呼叫再保程式錯誤:" & ex.Message)
            'msMsg = "呼叫再保程式錯誤:" & ex.Message
            msMsg = String.Format("error:呼叫再保未決ICLAIM={0}, date={1}, Message={2}", sICLAIM, dEnd, ex.Message)
            Return -1
        End Try
    End Function
    Public Function ReadRinSTL(ByVal sICLAIM As String, ByVal sINList As String, ByVal trans As System.Data.IDbTransaction, ByRef dsOut As beRIN213000) As Integer
        '再保預估: 以賠案號碼+預估日期. 再保攤賠: 以賠案號碼+理賠次數
        'Reurn: 1=OK, 0=APP error, -1=exception.
        Dim ds As beRIN213000 = New beRIN213000
        Dim dt As beRIN213000.CALCU_MAINDataTable
        Dim dr As beRIN213000.CALCU_MAINRow
        msMsg = ""
        dsOut = Nothing
        If sICLAIM.Length < 1 Then Return 0
        If sINList.Length < 1 Then Return 0
        '未指定ICLAIM_SEQ代表查詢賠案全部
        dt = ds.CALCU_MAIN
        dr = dt.NewCALCU_MAINRow
        If sINList = "*" Then
            UTF.SetColumnValue(dr, "ICLAIM_SEQ", DBNull.Value)
        Else
            dr.ICLAIM_SEQ = sINList
        End If
        dr.ICLAIM = sICLAIM
        dt.AddCALCU_MAINRow(dr)
        Try
            dsOut = Me.mGetRinLossValue.GetLossValue(ds, trans)
            Return 1
        Catch ex As Exception
            'Throw New Exception("呼叫再保程式錯誤:" & ex.Message)
            msMsg = String.Format("error: 呼叫再保已決ICLAIM={0}, SEQ={1}, Message={2}", sICLAIM, sINList, ex.Message)
            Return -1
        End Try
    End Function
    Function GetString(ByVal d As Object) As String
        If d Is Nothing Then
            Return " "
        ElseIf d Is DBNull.Value Then
            Return " "
        ElseIf d.ToString.Trim.Length = 0 Then
            Return " "
        Else
            Return d.ToString.Trim()
        End If
    End Function
    Function TransTONum(ByVal d As Object) As Decimal
        If d Is Nothing Then
            Return 0
        End If
        If d Is DBNull.Value Then
            Return 0
        End If
        If d.ToString.Trim.Length = 0 Then
            Return 0
        End If
        Return CType(d, Decimal)
    End Function
    Function TransToDate(ByVal d As Object, ByVal c As Object) As String
        Dim defaultValue As String = " 年  月  日 "
        If d Is Nothing Then
            Return defaultValue
        End If
        If d Is DBNull.Value Then
            Return defaultValue
        End If
        If d.ToString.Trim = "" Then
            Return defaultValue
        End If

        If IsDate(d) Then
            Return (CDate(d).Year - 1911).ToString("00") & " 年 " & CDate(d).Month.ToString("00") & " 月 " & CDate(d).Day.ToString("00") & " 日 "
        Else
            Throw New Exception("欄位（" + c.ToString + "）應為日期格式!")
        End If
    End Function
    Function TransToDate2(ByVal d As Object, ByVal c As Object) As Date
        If IsDate(d) Then
            Return CDate((CDate(d).Year).ToString("00") & "/" & CDate(d).Month.ToString("00") & "/" & CDate(d).Day.ToString("00"))
        Else
            Throw New Exception("欄位（" + c.ToString + "）應為日期格式!")
        End If
    End Function
    Private Function getWhere() As String
        Return "WHERE '" & Me.ProgramID & "_" & Me.OfficerID & "' = '" & Me.ProgramID & "_" & Me.OfficerID & "'"
    End Function

    Private Function nvl(ByVal input As Object, Optional ByVal sDefault As String = "") As String
        If IsNothing(input) OrElse IsDBNull(input) OrElse CStr(input).Trim = "" Then Return sDefault
        Return CStr(input)
    End Function

    Private Function isNull(ByVal input As Object) As Boolean
        If IsNothing(input) OrElse IsDBNull(input) OrElse input.ToString.Trim = "" Then Return True
        Return False
    End Function

    '取得IPROD，如果不一樣，就找金額最大的那一筆
    Function getIProd(ByVal sIClaim As String, ByVal trans As IDbTransaction) As String
        Dim sb As New SqlStringBuilder
        Dim IProd As Object
        sb.Append("SELECT IPROD,SUM(MTOT_AMT) AS TOTAL  ")
        sb.Append("FROM CLMM_CM_APPDTL B                ")
        sb.Append("WHERE B.ICLAIM ='" & sIClaim & "'     ")
        sb.Append("GROUP BY IPROD                       ")
        sb.Append("ORDER BY TOTAL DESC                  ")
        IProd = DefaultRunner.ExecuteScalar(sb.ToSqlString, trans)
        If Not isNull(IProd) Then Return IProd.ToString
        Return ""
    End Function

    '出險原因(clmm_cm_claim.iacdresn)是否為40
    Private Function isIACDRESN_40(ByVal sICLAIM As String) As Boolean
        Dim sb As New SqlStringBuilder
        Dim IACDRESN As Object
        sb.Append("SELECT IACDRESN         ")
        sb.Append("FROM CLMM_CM_CLAIM      ")
        sb.Append(getWhere)
        sb.Append("AND ICLAIM='" & sICLAIM & "'")

        IACDRESN = DefaultRunner.ExecuteScalar(sb.ToSqlString, trans)
        If isNull(IACDRESN) OrElse Not IACDRESN.ToString.Equals("40") Then Return False
        Return True
    End Function

#End Region

    Private Class Item_InsType
        Public msKey As String     '簡化程式處理for hashtable
        Public mdAPP_B As Decimal = 0   '期初理賠預估
        Public mdAPP_E As Decimal = 0   '期末理賠預估
        Public mdSTL_B As Decimal = 0   '期初理賠已結
        Public mdSTL_E As Decimal = 0   '期末理賠已結
        Public mdRIN_APP_B As Decimal = 0   '期初再保預估
        Public mdRIN_APP_E As Decimal = 0   '期末再保預估
        Public mdRIN_STL_B As Decimal = 0   '期初再保已結
        Public mdRIN_STL_E As Decimal = 0   '期末再保已結
        '============================================
        '新增一組 ADD BY Tereus 99.09.10
        Public mdRIN_APP_B1 As Decimal = 0   '自留期初再保預估
        Public mdRIN_APP_E1 As Decimal = 0   '自留期末再保預估
        Public mdRIN_STL_B1 As Decimal = 0   '自留期初再保已結
        Public mdRIN_STL_E1 As Decimal = 0   '自留期末再保已結
        '============================================
        Public mdCLM1 As Decimal = 0
        Public mdCLM2 As Decimal = 0
        Public mdCLM3 As Decimal = 0
        Public mdCLMYear As Decimal = 0
        Public mdRIN1 As Decimal = 0
        Public mdRIN2 As Decimal = 0
        Public mdRIN3 As Decimal = 0
    End Class

    '取得分攤/再保比例
    Private Function getShareRate(ByVal sIClaim As String, _
    ByVal sFMode As String, _
    ByVal sFtreaty As String, _
    ByVal iAdrseq As Integer, _
    ByVal iAreaseq As Integer, _
    ByVal iObjseq As Integer, _
    ByVal sIinstyp As String) As Decimal
        Dim sb As New SqlStringBuilder
        Dim PRI_SHARE As Object
        '自留:FMODE=R AND FTREATY=T
        '中再:FMODE=C AND FTREATY=T
        'Q\S :FMODE=Q AND FTREATY=T
        '臨分:FTREATY=F

        sb.Append("SELECT * FROM (                                    ")
        sb.Append("SELECT SUM(PRI_SHARE), FMODE, FTREATY,DAPPRAISAL   ")
        sb.Append("  FROM RINM_OSTD_SHARES                            ")
        sb.Append(" WHERE ICLAIM = '" & sIClaim & "'                  ")
        sb.Append("   AND IADRSEQ = " & iAdrseq & "                   ")
        sb.Append("   AND IAREASEQ = " & iAreaseq & "                 ")
        sb.Append("   AND IOBJSEQ = " & iObjseq & "                   ")
        sb.Append("   AND IINSTYP = '" & sIinstyp & "'                ")
        If Not isNull(sFMode) Then sb.Append("   AND FMODE = '" & sFMode & "'    ")
        sb.Append("   AND FTREATY = '" & sFtreaty & "'                ")
        sb.Append(" GROUP BY FMODE, FTREATY,DAPPRAISAL                ")
        sb.Append(" ORDER BY DAPPRAISAL DESC /*預估調整會造成多筆，所以要取最新的那一筆*/")
        sb.Append(" ) WHERE ROWNUM=1                                  ")
        PRI_SHARE = DefaultRunner.ExecuteScalar(sb.ToSqlString, trans)
        Return CDec(nvl(PRI_SHARE, "0")) / 100
    End Function

    '取得自留額
    Private Function getRTNum(ByVal sIClaim As String, ByVal DAPP As Date, ByRef dRT As Decimal) As Boolean
        Dim dsParam As New beRIN212000
        Dim temp212DS As beRIN212000
        Dim drParam As beRIN212000.CALCU_MAINRow = dsParam.CALCU_MAIN.NewCALCU_MAINRow
        drParam.Item("ICLAIM") = sIClaim
        drParam.Item("DAPPRAISAL") = DAPP
        drParam.Item("RESULT_EXCEPTION") = False
        dsParam.CALCU_MAIN.AddCALCU_MAINRow(drParam)
        temp212DS = CType(Me.RequestLocalService("PUBService.bsRIN212000Load", dsParam, trans), beRIN212000)
        If Not CBool(DataSetUT.GetColumnValue(temp212DS.RESULT_MSG.Rows(0), "NOT_FIND", False)) _
          AndAlso temp212DS.Tables("OSTD_SHARES").Rows.Count > 0 Then
            For Each drRIN212 As DataRow In temp212DS.Tables("OSTD_SHARES").Rows
                If drRIN212.Item("FMODE").ToString.Trim = "R" Then
                    dRT += CType(drRIN212.Item("MAPP_NT_S"), Decimal) '期末預估自留
                End If
            Next
            Return True
        Else
            '預估日(CLMM_CM_APPHIST.DAPP)如果跟再保審核日(RINM_OSTD_SHARES.DAPPRAISAL)不相等，就會撈不到資料
            '這時就要到RINM_OSTD_SHARES取得跟DAPP最近的DAPPRAISAL且大於等於DAPP(送再保審核都在預估之後)的日期
            '並排除跟其他預估日對應的日期，然後再撈一次
            Dim sb As New SqlStringBuilder
            sb.Append("SELECT MIN( x.DAPPRAISAL )                               ")
            sb.Append("FROM (                                                   ")
            sb.Append("  SELECT DISTINCT ICLAIM,DAPPRAISAL                      ")
            sb.Append("  FROM RINM_OSTD_SHARES S                                ")
            sb.Append("  WHERE S.ICLAIM = '" & sIClaim & "'                      ")
            sb.Append("  AND S.DAPPRAISAL >= TO_DATE('" & DAPP.ToString("yyyy/MM/dd") & "','yyyy/mm/dd')   ")
            sb.Append("  MINUS                                                  ")
            sb.Append("  SELECT DISTINCT ICLAIM,B.DAPP AS DAPPRAISAL            ")
            sb.Append("  FROM CLMM_CM_APPHIST B                                 ")
            sb.Append("  WHERE B.ICLAIM = '" & sIClaim & "'                      ")
            sb.Append("  AND B.DAPP <>  TO_DATE('" & DAPP.ToString("yyyy/MM/dd") & "','yyyy/mm/dd')        ")
            sb.Append(")X WHERE 1=1                                             ")
            sb.Append("  AND X.ICLAIM = '" & sIClaim & "'                        ")
            sb.Append("  AND X.DAPPRAISAL >= TO_DATE('" & DAPP.ToString("yyyy/MM/dd") & "','yyyy/mm/dd')   ")
            Dim DAPPRAISAL As Object = DefaultRunner.ExecuteScalar(sb.ToSqlString, trans)
            If Not isNull(DAPPRAISAL) AndAlso IsDate(DAPPRAISAL) Then
                dsParam.CALCU_MAIN(0).DAPPRAISAL = CDate(DAPPRAISAL)
                temp212DS = CType(Me.RequestLocalService("PUBService.bsRIN212000Load", dsParam, trans), beRIN212000)
                If Not CBool(DataSetUT.GetColumnValue(temp212DS.RESULT_MSG.Rows(0), "NOT_FIND", False)) _
                  AndAlso temp212DS.Tables("OSTD_SHARES").Rows.Count > 0 Then
                    For Each drRIN212 As DataRow In temp212DS.Tables("OSTD_SHARES").Rows
                        If drRIN212.Item("FMODE").ToString.Trim = "R" Then
                            dRT += CType(drRIN212.Item("MAPP_NT_S"), Decimal) '期末預估自留
                        End If
                    Next
                End If
                Return True
            End If
        End If
        Return False
    End Function
End Class