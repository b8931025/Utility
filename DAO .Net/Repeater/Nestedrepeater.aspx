<%@ Import Namespace="System.Data" %>
<%@ Page Language="vb" AutoEventWireup="false" Codebehind="NestedRepeater.aspx.vb" Inherits="yourprojectnamespace.NestedRepeater"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<HTML>
	<HEAD>
		<title>NestedRepeater</title>
		<meta name="GENERATOR" content="Microsoft Visual Studio.NET 7.0">
		<meta name="CODE_LANGUAGE" content="Visual Basic 7.0">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<asp:Repeater id="parentRepeater" runat="server">
				<itemtemplate>
					<b>
						<%# DataBinder.Eval(Container.DataItem, "au_id") %>
					</b>
					<br>
					<asp:repeater id="childRepeater" 
                                         runat="server" datasource='<%# Container.DataItem.Row.GetChildRows("myrelation") %>'>

						<itemtemplate>
							<%# Container.DataItem("title_id") %><br>	
						</itemtemplate>
					</asp:Repeater> 
				</itemtemplate>
			</asp:Repeater>
		</form>
	</body>
</HTML>