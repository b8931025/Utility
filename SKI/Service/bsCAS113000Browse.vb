Imports CASEntity
Imports CASEntity01
Public Class bsCAS113000Browse
    Inherits BaseAppService

    Protected Overloads Overrides Sub DoRequest(ByVal param As System.Data.DataSet, ByVal result As System.Data.DataSet, ByVal trans As System.Data.IDbTransaction)
        Dim sb As New SqlStringBuilder
        Dim dr As DataRow
        Dim sPechk As String

        If param.Tables.Count > 0 AndAlso param.Tables(0).Rows.Count > 0 Then
            dr = param.Tables(0).Rows(0)
            sPechk = DataSetUtils.GetColumnText(dr, "PECHK")

            sb.Append("SELECT *")
            sb.Append("FROM CASP_EIA WHERE 1=1")
            If sPechk.Trim.Length > 0 Then sb.Append("AND PECHK='" & sPechk & "'")
            Me.LoadDataSet(sb.ToSqlString, result, trans)
        End If
    End Sub

    Public Overrides Function RequestParameterEntity() As System.Data.DataSet
        Return New beCAS113000Query
    End Function

    Protected Overrides ReadOnly Property ResultType() As System.Type
        Get
            Return GetType(beCAS113000Query)
        End Get
    End Property

    Protected Overrides ReadOnly Property DefaultInstanceName() As String
        Get
            Return CASService.SR.DefaultInstanceName
        End Get
    End Property
End Class
