Imports CASEntity
Imports CASEntity01
Public Class bsCAS113000Save
    Inherits BaseAppUpdateService

    Protected Overloads Overrides Sub DoRequest(ByVal param As DataSet,ByVal result As DataSet,ByVal trans As IDbTransaction )
        DataSetUtils.SetStringColumnsDefaultMaxLength(result, 100)
        MyBase.DefaultRunner.UpdateDataSet(result, "CASP_EIA", Me.GetInsertCmd(param, result), Me.GetUpdateCmd(param, result), Me.GetDeleteCmd(param, result), trans)
    End Sub

    Protected Overrides ReadOnly Property DefaultInstanceName() As String
        Get
            Return CASService.SR.DefaultInstanceName
        End Get
    End Property

    Public Overrides Function RequestParameterEntity() As System.Data.DataSet
        Return New beCAS113000
    End Function

    Protected Overrides Function PrepareResult(ByVal param As System.Data.DataSet) As System.Data.DataSet
        Return param
    End Function

    Protected Overrides ReadOnly Property DefaultTableName() As String
        Get
            Return "CASP_EIA"
        End Get
    End Property

    Protected Function GetInsertCmd(ByVal param As DataSet, ByVal result As DataSet) As SqlString
        Return DataSetUtils.GetInsertSqlString(CType(param, beCAS113000).CASP_EIA, Me.DefaultRunner)
    End Function

    Protected Function GetUpdateCmd(ByVal param As DataSet, ByVal result As DataSet) As SqlString
        Return DataSetUtils.GetUpdateSqlString(CType(param, beCAS113000).CASP_EIA, Me.DefaultRunner)
    End Function

    Protected Function GetDeleteCmd(ByVal param As DataSet, ByVal result As DataSet) As SqlString
        Return DataSetUtils.GetDeleteSqlString(CType(param, beCAS113000).CASP_EIA, Me.DefaultRunner)
    End Function
End Class