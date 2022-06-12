Imports System.Data
Imports System.Data.SqlClient

Public Class NestedRepeater
    Inherits System.Web.UI.Page
    Protected WithEvents childRepeater As System.Web.UI.WebControls.Repeater
    Protected WithEvents parentRepeater As System.Web.UI.WebControls.Repeater

#Region " Web Form Designer Generated Code "

    'This call is required by the Web Form Designer.
    <System.Diagnostics.DebuggerStepThrough()> Private Sub InitializeComponent()

    End Sub

    Private Sub Page_Init(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Init
        'CODEGEN: This method call is required by the Web Form Designer
        'Do not modify it using the code editor.
        InitializeComponent()
    End Sub

#End Region

    Private Sub Page_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load
        Dim cnn As SqlConnection = New SqlConnection("server=(local);database=pubs;Integrated Security=SSPI")
        Dim cmd1 As SqlDataAdapter = New SqlDataAdapter("select * from authors", cnn)
        Dim ds As DataSet = New DataSet()
        cmd1.Fill(ds, "authors")

        Dim cmd2 As SqlDataAdapter = New SqlDataAdapter("select * from titleauthor", cnn)
        cmd2.Fill(ds, "titles")
        ds.Relations.Add("myrelation", _
        ds.Tables("authors").Columns("au_id"), _
        ds.Tables("titles").Columns("au_id"))
        parentRepeater.DataSource = ds.Tables("authors")

        parentRepeater.DataSource = ds.Tables("authors")
        Page.DataBind()
        cnn.Close()

    End Sub

End Class