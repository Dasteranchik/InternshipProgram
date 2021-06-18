using System;
using System.Web;
using Terrasoft.Core;
using Terrasoft.Core.Entities;
using Terrasoft.Core.Entities.Events;
using Terrasoft.Core.Factories;
using SystemSettings = Terrasoft.Core.Configuration.SysSettings;
using global::Common.Logging;
namespace Terrasoft.Configuration
{
    [EntityEventListener(SchemaName = "UsrPeriodicalPublication")]
    public class UsrPeriodicalPublicationEventListener : BaseEntityEventListener
    {
        public string GenerateCode(UserConnection userConnection)
        {
            var codeMask = SystemSettings.GetValue(userConnection, "UsrPeriodicalPublicationCodeMask").ToString();
            var lastNumber = SystemSettings.GetValue(userConnection, "UsrPeriodicalPublicationLastNumber").ToString();
            SystemSettings.SetValue(userConnection, "UsrPeriodicalPublicationLastNumber", int.Parse(lastNumber)+1);
            return string.Format(codeMask, int.Parse(lastNumber));
        }
        public override void OnInserting(object sender, EntityBeforeEventArgs e)
        {
            var entity = (Entity)sender;
            var userConnection = entity.UserConnection;
            var entitySchema = entity.Schema;
            var numberGeneration = GenerateCode(userConnection);
            if(string.IsNullOrEmpty(entity.GetTypedColumnValue<string>("UsrCodeString")))
            {
                entity.SetColumnValue("UsrCodeString", numberGeneration);
            }
            base.OnInserting(sender, e);
        }
    }
}