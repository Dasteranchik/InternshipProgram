namespace Terrasoft.Configuration.UsrCustomNamespace
{
    using System;
    using System.ServiceModel;
    using System.ServiceModel.Web;
    using System.ServiceModel.Activation;
    using System.Linq;
    using Terrasoft.Core;
    using Terrasoft.Web.Common;
    using Terrasoft.Core.Entities;
    using Terrasoft.Common;

    [ServiceContract]
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Required)]
    public class UsrCustomNumberScheduled: BaseService
    {
        [OperationContract]
        [WebInvoke(Method = "POST", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Wrapped,
        ResponseFormat = WebMessageFormat.Json)]
        public int GetContactIdByName(string code) {
            var result = -1;
            var esq = new EntitySchemaQuery(UserConnection.EntitySchemaManager, "UsrPeriodicalPublication")
            {
                PrimaryQueryColumn = { IsAlwaysSelect = true}
            };
            var esqFilter = esq.CreateFilterWithParameters(FilterComparisonType.Equal, "UsrCodeString", code);
            esq.Filters.Add(esqFilter);
            var entities = esq.GetEntityCollection(UserConnection);
            if (entities.Count > 0)
            {
                var esqIs = new EntitySchemaQuery(UserConnection.EntitySchemaManager, "UsrIssuesEdition");
                esqIs.AddColumn("Id");
                var id = entities.First().PrimaryColumnValue;
                var subQueryFilter1 = new EntitySchemaQueryFilterCollection(esqIs, LogicalOperationStrict.And);
                subQueryFilter1.Add(esqIs.CreateFilterWithParameters(FilterComparisonType.Equal, "UsrCodeColumn", id));
                subQueryFilter1.Add(esqIs.CreateFilterWithParameters(FilterComparisonType.Equal, "UsrReleaseStatus", UsrPublicationConstants.InProgress));
                esqIs.Filters.Add(subQueryFilter1);
                var entitiesIs = esqIs.GetEntityCollection(UserConnection);
                return entitiesIs.Count;
            } 
            return result;
        }
    }
}