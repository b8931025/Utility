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
    Private mGetRinOstdValue As bsGetRinOstdValue = New bsGetRinOstdValue    '�A�O�w��
    Private mGetRinLossValue As bsGetRinLossValue = New bsGetRinLossValue    '�A�O�u��
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
        ''2011/3/2 Ben ��������n���}�P�_�H������
        Dim sFSettle1 As String = "0"    ''����O�_�w����
        Dim sFSettle3 As String = "0"    ''�����O�_�w����
        DataSetUtils.SetStringColumnsDefaultMaxLength(dsPrint, 500)
        trans = _trans

        If sChkDgs.ToUpper.Equals("Y") Then
            ' �N�M��~���5�X��������褸�~���~��....
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

        ''���o�D�ɦb�e���WUI��key �����餧�e���Ҧ����....
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
        '�i��B��
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
            '���o�̤jsum(MTOT_AMT)��IProd
            drTemp("iprod") = getIProd(dr("iclaim").ToString, trans)
            drTemp("NISSUE") = dr("NISSUE")
            ''===========================================================================================
            ''��g�H�M���M���B�����{���X
            ''��������������������������������������������������������������������������
            Dim sICLAIM As String = dr("iclaim")
            Dim idr As IDataReader
            Dim idrRin As IDataReader
            Dim sFSettle As String    '�ť�=������, 0=��������, 1=��������, 2=�l�v only
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
            Dim mdRIN_STL_E As Decimal = 0 '�����A�O�w�� from ReadRinSTL
            Dim mdRIN_STL_B As Decimal = 0 '����A�O�w�� from ReadRinSTL
            '�s�[�@�զۯd�B '2010.09.08
            '--------------------------------
            Dim mdRIN_APP_E1 As Decimal = 0
            Dim mdRIN_APP_B1 As Decimal = 0
            Dim mdRIN_STL_E1 As Decimal = 0 '�����A�O�w�� from RIN
            Dim mdRIN_STL_B1 As Decimal = 0 '����A�O�w�� from RIN
            '--------------------------------
            Dim chkRIN_APP_B1 As Boolean
            Dim chkRIN_APP_E1 As Boolean
            Dim chkRIN_STL_B1 As Boolean
            Dim chkRIN_STL_E1 As Boolean

            ''���쵲�קP�_
            sb.Reset()
            sb.Append("select MAX(FSETTLE)")
            sb.Append(" FROM CLMM_CM_SETTLE")
            sb.Append("where ICLAIM = '" & sICLAIM & "' ")
            sb.Append("AND DVOUCH < TO_DATE('" & dTClaimBgn.ToString("yyyy/MM/dd") & "','YYYY/MM/DD')")
            sb.Append("AND FSETTLE IN ('0', '1','2')")
            Dim nFSettle1 As Decimal = CLMEntityCommon.Obj2Decimal(Me.DefaultRunner.ExecuteScalar(sb.ToSqlString, trans))
            If nFSettle1 > 0 Then
                sFSettle1 = "1"       ''����w���A���B��0
            Else
                sFSettle1 = "0"
            End If

            '�I���e�w���ק_?
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
                    sFSettle3 = "1"       ''�����w���A���B��0
                Case Else
                    bClose = False
                    sFSettle3 = "0"
            End Select

            If bClose Then
                ' �w���ת̡A�����b�d�ߴ��������ת̡A�~�B�z�C
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
            'QMWJ1:�������M
            'BQYJ1:�����w�M
            'QCWJ1:���쥼�M
            'QMWJ2:�������M(R/T)
            'BQYJ2:�����w�M(R/T)
            'QCWJ2:���쥼�M(R/T)
            drTemp.QCWJ1 = 0
            drTemp.BQYJ1 = 0
            drTemp.QMWJ1 = 0
            drTemp.QCWJ2 = 0
            drTemp.BQYJ2 = 0
            drTemp.QMWJ2 = 0

            Dim dsRIN As New beCLM466000
            Dim mInsTypes As Hashtable = New Hashtable   '�P�@�߮פU, 29�I�ت��J�`���
            Dim Item1 As Item_InsType
            ''================================================================
            ''2011/3/29 Ben
            ''�e�m�u�@�B�z�����A�}�l�p��
            ''1.��CLMM_CM_APPHIST�ADAPP�j��_��e�̤j�]�|�鵲��B�p������
            ''2.��CLMM_CM_SETTLE�ADVOUCH�p�������BFSETTLE in (0,1,2)
            ''3.�ۯd�A����_RIN(ICLAIM+DAPP �� ICLAIM+ICLAIM_TYPE)�A�S�����ܤ~�]service
            ''================================================================

            ''�p�����/����/����
            mInsTypes.Clear()
            Item1 = New Item_InsType
            Item1.msKey = "0000"
            ''���o29�I�إN�� (CAS�BHAS�BFIR�z��29�I�س��u���ߤ@��)
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


            If bRunOld Then '�µ{���X
                ''1.��CLMM_CM_APPHIST�ADAPP�p������
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
                    '�w���ۯd
                    '����_RIN
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
                        '2011/4/9 Ben �S��RIN�A���Ҧۦ�p��(SQL�ѩӦt����)(�ѩ�w���u�ߨS����������A�]�������Ѥ�Ҧۦ�p��)
                        dRin = getShareRate(sICLAIM, "R", "T", IADRSEQ, IAREASEQ, IOBJSEQ, IINSTYPE) * CDec(idr("MAPP"))
                        If dr("iclaim").ToString = "0000FBC0000115" Then
                            dRin = dRin - 1
                        End If
                    End If
                    idrMRET.Close()
                    ''�p��
                    ''�����w��
                    Item1.mdAPP_E += CDec(idr("MAPP"))
                    Item1.mdRIN_APP_E += dRin
                    If CDate(idr("DAPP")) < dTClaimBgn Then
                        ''����w��
                        Item1.mdAPP_B += CDec(idr("MAPP"))
                        Item1.mdRIN_APP_B += dRin
                    End If
                End While
                If Not IsNothing(idr) Then idr.Close()
            Else '�s�{���X
                ''1.��CLMM_CM_APPHIST�ADAPP�p������
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
                    '����_RIN
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
                        'bHaveData���γ~�A�O�]�������߮סA�bCLMM_CM_APPHIST_RIN�MgetRTNum�������
                        '��CLMM_CM_APPHIST_RIN���ۯd�A�O�C�@�����[�`�A��getRTNum�O�H�̫�@������
                        '�ҥH�p�G�@�߮צbCLMM_CM_APPHIST_RIN����@�b�S��ơA�S�hgetRTNum��A�ۯd�B�N�|����
                        '�o�ɴN�n�P�_getRTNum�O�_�����X�ۯd�B�A�p�G���N�n�⤧�eCLMM_CM_APPHIST_RIN���X����ƻ\��
                        bHaveData = getRTNum(sICLAIM, CDate(idr("DAPP")), drin)
                    End If
                    idrMRET.Close()

                    '�����w��
                    Item1.mdAPP_E += CDec(idr("MAPP"))
                    If bHaveData Then
                        Item1.mdRIN_APP_E = dRin
                    Else
                        Item1.mdRIN_APP_E += dRin
                    End If
                    If CDate(idr("DAPP")) < dTClaimBgn Then
                        '����w��
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

            ''2.��CLMM_CM_SETTLE�ADVOUCH�p�������BFSETTLE in (0,1,2)
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
            ''�B�z�z�ߦۯd
            For Each drR As beCLM466000.STLRow In dsRIN.STL.Rows
                ''����_RIN
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
                    ''�S��_RIN�A��bsGetRinLossValue. GetLossValue (ICLAIM+ICLAIM_TYPE)
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
                ''�p��
                ''�����w��
                Item1.mdSTL_E += drR.MSTL
                Item1.mdRIN_STL_E += drR.RIN
                If drR.DVOUCH < dTClaimBgn Then
                    ''����w��
                    Item1.mdSTL_B += drR.MSTL
                    Item1.mdRIN_STL_B += drR.RIN
                End If
            Next

            ''================================================================
            ''2011/3/29 Ben	''�p�⧹��
            ''================================================================

            If chkRIN_STL_E1 = False Then mdRIN_STL_E1 = mdRIN_STL_E
            If chkRIN_STL_B1 = False Then mdRIN_STL_B1 = mdRIN_STL_B

            '���쥼�M
            If sFSettle1 = "1" Then
                drTemp.QCWJ1 = 0
            Else
                drTemp.QCWJ1 = Item1.mdAPP_B - Item1.mdSTL_B
            End If
            '�p�G�O�t�ȡA�N�]��0
            'If drTemp.QCWJ1 < 0 Then drTemp.QCWJ1 = 0

            '�����w�M
            drTemp.BQYJ1 = Item1.mdSTL_E - Item1.mdSTL_B

            ''�������M
            If sFSettle3 = "1" Then
                drTemp.QMWJ1 = 0
            Else
                drTemp.QMWJ1 = Item1.mdAPP_E - Item1.mdSTL_E
            End If
            '�p�G�O�t�ȡA�N�]��0
            'If drTemp.QMWJ1 < 0 Then drTemp.QMWJ1 = 0

            '���쥼���ۯd
            If sFSettle1 = "1" Then
                drTemp.QCWJ2 = 0
            Else
                drTemp.QCWJ2 = Item1.mdRIN_APP_B - Item1.mdRIN_STL_B
            End If
            '�p�G�O�t�ȡA�N�]��0
            'If drTemp.QCWJ2 < 0 Then drTemp.QCWJ2 = 0

            ''�����w���ۯd
            drTemp.BQYJ2 = Item1.mdRIN_STL_E - Item1.mdRIN_STL_B

            ''�ۯd�������M=�w���������M-�����w�M
            If sFSettle3 = "1" Then
                drTemp.QMWJ2 = 0
            Else
                drTemp.QMWJ2 = Item1.mdRIN_APP_E - Item1.mdRIN_STL_E
            End If
            '�p�G�O�t�ȡA�N�]��0
            'If drTemp.QMWJ2 < 0 Then drTemp.QMWJ2 = 0

            '�p�G[���쥼�M],[�����w�M],[�������M],[���쥼�M�ۯd],[�����w�M�ۯd],[�������M�ۯd]
            If drTemp.QCWJ1 = 0 AndAlso drTemp.BQYJ1 = 0 AndAlso drTemp.QMWJ1 = 0 _
            AndAlso drTemp.QCWJ2 = 0 AndAlso drTemp.BQYJ2 = 0 AndAlso drTemp.QMWJ2 = 0 Then GoTo NextCLAIM

            '10010247 Hermit=>�]���z�߭n�D�A�N�l���W�L�w�����O�٬O���M����ơA�]�nSHOW�X�ӡA���O[����][����][����]��SHOW�s�A�ҥH�N�t���k0���{���X�h��o��
            If drTemp.QCWJ1 < 0 Then drTemp.QCWJ1 = 0
            If drTemp.QMWJ1 < 0 Then drTemp.QMWJ1 = 0
            If drTemp.QCWJ2 < 0 Then drTemp.QCWJ2 = 0
            If drTemp.QMWJ2 < 0 Then drTemp.QMWJ2 = 0

            '�|�ˤ��J
            drTemp.QCWJ1 = CInt(drTemp.QCWJ1)
            drTemp.BQYJ1 = CInt(drTemp.BQYJ1)
            drTemp.QMWJ1 = CInt(drTemp.QMWJ1)
            drTemp.QCWJ2 = CInt(drTemp.QCWJ2)
            drTemp.BQYJ2 = CInt(drTemp.BQYJ2)
            drTemp.QMWJ2 = CInt(drTemp.QMWJ2)

            '�X�I��](clmm_cm_claim.iacdresn)�p�G��40�A�hR/T�T�����Ʀr���k0
            If isIACDRESN_40(dr("ICLAIM").ToString) Then
                drTemp.QCWJ2 = 0
                drTemp.BQYJ2 = 0
                drTemp.QMWJ2 = 0
            End If

            ' LYEARM     : ��~��ߴ�
            drTemp("LYEARM") = TransTONum(drTemp("BQYJ1")) + TransTONum(drTemp("QMWJ1")) - TransTONum(drTemp("QCWJ1"))
            '�@ACCIDENTM : �ƬG��ߴ�
            drTemp("ACCIDENTM") = TransTONum(drTemp("BQYJ1")) + TransTONum(drTemp("QMWJ1"))

            '���o�u���פ�v
            Try
                sb.Reset()
                sb.Append(" SELECT  NVL(MAX(DVOUCH), to_date('1911/01/01','yyyy/mm/dd')) AS DVOUCH ")
                sb.Append("   FROM  CLMM_CM_SETTLE ")
                sb.Append(getWhere())
                If Not isNull(dr("ICLAIM")) Then sb.Append("AND  ICLAIM = '" + dr("ICLAIM").ToString.Trim + "'")
                Dim drDV As IDataReader = DefaultRunner.ExecuteReader(sb.ToSqlString, trans)
                Dim DVouch As Object
                If drDV.Read Then DVouch = drDV("DVOUCH")
                '�b�έp�������~���
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
            Throw New Exception("�L��ƦC�L")
        End If
        Me.DefaultRunner.UpdateDataSet(dsPrint, "CLMR_254000", trans)

        'Rendering Report
        Dim dsResultA As beRSReports = CType(result, beRSReports)
        Dim drReportItem As beRSReports.ReportItemsRow = dsResultA.ReportItems.AddReportItemsRow("/CLMReport/CLM254000", "���I�w���M���Ӫ�")
        dsResultA.PublicParameters.AddPublicParametersRow(drReportItem, "iReport", sReport)
        dsResultA.PublicParameters.AddPublicParametersRow(drReportItem, "PrintUser", UserName)
        dsResultA.PublicParameters.AddPublicParametersRow(drReportItem, "sTclaim_Bgn", dTClaimBgn.ToShortDateString)
        dsResultA.PublicParameters.AddPublicParametersRow(drReportItem, "sTclaim_End", dTClaimEnd.ToShortDateString)
        '���wRender ���O�A�K��Reporting Service ������Loading
        dsResultA.PublicParameters.AddPublicParametersRow(drReportItem, "rs:Command", "Render")
        '���ðѼƿ�J�϶�
        dsResultA.PublicParameters.AddPublicParametersRow(drReportItem, "rc:Parameters", "False")

        ' �M��t�λݨD 
        If sChkDgs = "Y" Then
            ' [�C] 0990419 Update Note : 
            sb.Reset()
            sb.Append(" SELECT   IINSKIND29, SUM (NVL (QMWJ1, 0)) AS QMWJ1, SUM (NVL (QMWJ2, 0)) AS QMWJ2 ")
            sb.Append("   FROM CLMR_254000 ")
            sb.Append("  WHERE IREPORT = '" & sReport & "'")
            sb.Append("  GROUP BY IINSKIND29 ")
            Dim dsOut As New DataSet
            Me.LoadDataSet(sb.ToSqlString, dsOut, "DGS", trans)
            ' �w��C�@��29�I�ة�SUM�_�Ӫ� QMWJ1 ���M�O�I�ߴ� �� QMWJ1 - QMWJ2 �����M�u�^�A�O�ߴ�
            For Each drOut As DataRow In dsOut.Tables("DGS").Rows
                Dim drDGS5 As beDGSdataaccess.InputRow = dsDGS.Input.NewInputRow
                drDGS5.ACCESS = "1"
                drDGS5.DCLOSE = Mid(sDGSDate, 5, 2) & "/01/" & Mid(sDGSDate, 1, 4)  ' �M��~��
                drDGS5.SSOURCE = "CLM254000"
                drDGS5.IINSCLS = "F"
                drDGS5.IBUSS_TYPE = drOut.Item("IINSKIND29").ToString  ' �|�p�����I��
                drDGS5.STYPE = "5"  ' ���M�O�I�ߴ�
                drDGS5.MAMOUNT = CDec(drOut.Item("QMWJ1"))   ' �������M(�o�w�gSUM�L)
                dsDGS.Input.Rows.Add(drDGS5)
                Dim drDGS6 As beDGSdataaccess.InputRow = dsDGS.Input.NewInputRow
                drDGS6.ACCESS = "1"
                drDGS6.DCLOSE = Mid(sDGSDate, 5, 2) & "/01/" & Mid(sDGSDate, 1, 4) ' �M��~��
                drDGS6.SSOURCE = "CLM254000"
                drDGS6.IINSCLS = "F"
                drDGS6.IBUSS_TYPE = drOut.Item("IINSKIND29").ToString  ' �|�p�����I��
                drDGS6.STYPE = "6"  ' ���M�O�I�ߴ�
                drDGS6.MAMOUNT = CDec(drOut.Item("QMWJ1")) - CDec(drOut.Item("QMWJ2"))   ' ���M�u�^�A�O�ߴ� =>  
                dsDGS.Input.Rows.Add(drDGS6)
            Next
            ' �I�s�M��t��, �N dsDGS�ǤJ�M��t�Τ�.....
            Dim dsRtn As DataSet = Me.InvokeBusinessService("PUBService.bsDGSdataaccess", dsDGS)
            Dim aryNG() As DataRow = dsRtn.Tables("Output").Select("fresult='N'")
            Dim strMsg As String = ""
            For Each dr In aryNG
                strMsg &= dr("smsag").ToString.Trim & vbNewLine
            Next
            If strMsg <> "" Then Throw New Exception(strMsg)
            ' �M��t�λݨD ============================================================================
            'Rendering Report
            Dim dsResultT As beRSReports = CType(result, beRSReports)
            Dim drReportItemT As beRSReports.ReportItemsRow = dsResultT.ReportItems.AddReportItemsRow("/CLMReport/CLM254000T", "���I�w���M�`��")
            dsResultT.PublicParameters.AddPublicParametersRow(drReportItemT, "iReport", sReport)
            dsResultT.PublicParameters.AddPublicParametersRow(drReportItemT, "PrintUser", UserName)
            dsResultT.PublicParameters.AddPublicParametersRow(drReportItemT, "sTclaim_Bgn", dTClaimBgn.ToShortDateString)
            dsResultT.PublicParameters.AddPublicParametersRow(drReportItemT, "sTclaim_End", dTClaimEnd.ToShortDateString)
            '���wRender ���O�A�K��Reporting Service ������Loading
            dsResultT.PublicParameters.AddPublicParametersRow(drReportItemT, "rs:Command", "Render")
            '���ðѼƿ�J�϶�
            dsResultT.PublicParameters.AddPublicParametersRow(drReportItemT, "rc:Parameters", "False")
        End If
        ' �M��t�λݨD ============================================================================
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

#Region "�۩w�qFunction"
    Public Function ReadSTLVouchedStringList(ByVal sIClaim As String, ByVal dBegin As DateTime, ByVal dEnd As DateTime, ByRef sListBegin As String, ByRef sListEnd As String, ByVal trans As System.Data.IDbTransaction) As Integer
        'Return: Count, -1=exception.
        '(����)�P(����)�A�O�w��, �����v���̷�(�ߦ�)�p��
        '�A�O�t�ε{�������Ȧ�(�߮׸��X+�ߦ�)�Ӧ������B�C
        '�]�������ۦ�p��Ҧ��ߦ�(�B�g�]�ȽT�{)���J�`�A�O�ƾ�
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
        '�A�O�w��: �H�߮׸��X+�w�����. �A�O�u��: �H�߮׸��X+�z�ߦ���
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
            'Throw New Exception("�I�s�A�O�{�����~:" & ex.Message)
            'msMsg = "�I�s�A�O�{�����~:" & ex.Message
            msMsg = String.Format("error:�I�s�A�O���MICLAIM={0}, date={1}, Message={2}", sICLAIM, dEnd, ex.Message)
            Return -1
        End Try
    End Function
    Public Function ReadRinSTL(ByVal sICLAIM As String, ByVal sINList As String, ByVal trans As System.Data.IDbTransaction, ByRef dsOut As beRIN213000) As Integer
        '�A�O�w��: �H�߮׸��X+�w�����. �A�O�u��: �H�߮׸��X+�z�ߦ���
        'Reurn: 1=OK, 0=APP error, -1=exception.
        Dim ds As beRIN213000 = New beRIN213000
        Dim dt As beRIN213000.CALCU_MAINDataTable
        Dim dr As beRIN213000.CALCU_MAINRow
        msMsg = ""
        dsOut = Nothing
        If sICLAIM.Length < 1 Then Return 0
        If sINList.Length < 1 Then Return 0
        '�����wICLAIM_SEQ�N��d�߽߮ץ���
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
            'Throw New Exception("�I�s�A�O�{�����~:" & ex.Message)
            msMsg = String.Format("error: �I�s�A�O�w�MICLAIM={0}, SEQ={1}, Message={2}", sICLAIM, sINList, ex.Message)
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
        Dim defaultValue As String = " �~  ��  �� "
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
            Return (CDate(d).Year - 1911).ToString("00") & " �~ " & CDate(d).Month.ToString("00") & " �� " & CDate(d).Day.ToString("00") & " �� "
        Else
            Throw New Exception("���]" + c.ToString + "�^��������榡!")
        End If
    End Function
    Function TransToDate2(ByVal d As Object, ByVal c As Object) As Date
        If IsDate(d) Then
            Return CDate((CDate(d).Year).ToString("00") & "/" & CDate(d).Month.ToString("00") & "/" & CDate(d).Day.ToString("00"))
        Else
            Throw New Exception("���]" + c.ToString + "�^��������榡!")
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

    '���oIPROD�A�p�G���@�ˡA�N����B�̤j�����@��
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

    '�X�I��](clmm_cm_claim.iacdresn)�O�_��40
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
        Public msKey As String     '²�Ƶ{���B�zfor hashtable
        Public mdAPP_B As Decimal = 0   '����z�߹w��
        Public mdAPP_E As Decimal = 0   '�����z�߹w��
        Public mdSTL_B As Decimal = 0   '����z�ߤw��
        Public mdSTL_E As Decimal = 0   '�����z�ߤw��
        Public mdRIN_APP_B As Decimal = 0   '����A�O�w��
        Public mdRIN_APP_E As Decimal = 0   '�����A�O�w��
        Public mdRIN_STL_B As Decimal = 0   '����A�O�w��
        Public mdRIN_STL_E As Decimal = 0   '�����A�O�w��
        '============================================
        '�s�W�@�� ADD BY Tereus 99.09.10
        Public mdRIN_APP_B1 As Decimal = 0   '�ۯd����A�O�w��
        Public mdRIN_APP_E1 As Decimal = 0   '�ۯd�����A�O�w��
        Public mdRIN_STL_B1 As Decimal = 0   '�ۯd����A�O�w��
        Public mdRIN_STL_E1 As Decimal = 0   '�ۯd�����A�O�w��
        '============================================
        Public mdCLM1 As Decimal = 0
        Public mdCLM2 As Decimal = 0
        Public mdCLM3 As Decimal = 0
        Public mdCLMYear As Decimal = 0
        Public mdRIN1 As Decimal = 0
        Public mdRIN2 As Decimal = 0
        Public mdRIN3 As Decimal = 0
    End Class

    '���o���u/�A�O���
    Private Function getShareRate(ByVal sIClaim As String, _
    ByVal sFMode As String, _
    ByVal sFtreaty As String, _
    ByVal iAdrseq As Integer, _
    ByVal iAreaseq As Integer, _
    ByVal iObjseq As Integer, _
    ByVal sIinstyp As String) As Decimal
        Dim sb As New SqlStringBuilder
        Dim PRI_SHARE As Object
        '�ۯd:FMODE=R AND FTREATY=T
        '���A:FMODE=C AND FTREATY=T
        'Q\S :FMODE=Q AND FTREATY=T
        '�{��:FTREATY=F

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
        sb.Append(" ORDER BY DAPPRAISAL DESC /*�w���վ�|�y���h���A�ҥH�n���̷s�����@��*/")
        sb.Append(" ) WHERE ROWNUM=1                                  ")
        PRI_SHARE = DefaultRunner.ExecuteScalar(sb.ToSqlString, trans)
        Return CDec(nvl(PRI_SHARE, "0")) / 100
    End Function

    '���o�ۯd�B
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
                    dRT += CType(drRIN212.Item("MAPP_NT_S"), Decimal) '�����w���ۯd
                End If
            Next
            Return True
        Else
            '�w����(CLMM_CM_APPHIST.DAPP)�p�G��A�O�f�֤�(RINM_OSTD_SHARES.DAPPRAISAL)���۵��A�N�|��������
            '�o�ɴN�n��RINM_OSTD_SHARES���o��DAPP�̪�DAPPRAISAL�B�j�󵥩�DAPP(�e�A�O�f�ֳ��b�w������)�����
            '�ñư����L�w�������������A�M��A���@��
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
                            dRT += CType(drRIN212.Item("MAPP_NT_S"), Decimal) '�����w���ۯd
                        End If
                    Next
                End If
                Return True
            End If
        End If
        Return False
    End Function
End Class