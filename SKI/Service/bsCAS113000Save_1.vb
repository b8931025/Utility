Imports CASEntity
Imports CASEntity01
Public Class bsCAS113000Save
    Inherits BaseAppUpdateService

    Protected Overloads Overrides Sub DoRequest(ByVal param As DataSet,ByVal result As DataSet,ByVal trans As IDbTransaction)
        DataSetUtils.SetStringColumnsDefaultMaxLength(result, 100)
        MyBase.DoRequest(param, result, trans)
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
End Class
