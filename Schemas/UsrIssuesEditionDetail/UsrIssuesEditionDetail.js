define("UsrIssuesEditionDetail", ["ConfigurationGrid", "ConfigurationGridGenerator",
    "ConfigurationGridUtilities"], function() {
	return {
		entitySchemaName: "UsrIssuesEdition",
		attributes: {
            // Признак возможности редактирования.
            "IsEditable": {
                // Тип данных — логический.
                dataValueType: Terrasoft.DataValueType.BOOLEAN,
                // Тип атрибута — виртуальная колонка модели представления.
                type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
                // Устанавливаемое значение.
                value: true
            }
        },
        mixins: {
            ConfigurationGridUtilities: "Terrasoft.ConfigurationGridUtilities"
        },
		details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
		diff: /**SCHEMA_DIFF*/[
            {
                // Тип операции — слияние.
                "operation": "merge",
                // Название элемента схемы, над которым производится действие.
                "name": "DataGrid",
                // Объект, свойства которого будут объединены со свойствами элемента схемы.
                "values": {
                    // Имя класса
                    "className": "Terrasoft.ConfigurationGrid",
                    // Генератор представления должен генерировать только часть представления.
                    "generator": "ConfigurationGridGenerator.generatePartial",
                    // Привязка события получения конфигурации элементов редактирования
                    // активной строки к методу-обработчику.
                    "generateControlsConfig": {"bindTo": "generateActiveRowControlsConfig"},
                    // Привязка события смены активной записи к методу-обработчику.
                    "changeRow": {"bindTo": "changeRow"},
                    // Привязка события отмены выбора записи к методу-обработчику.
                    "unSelectRow": {"bindTo": "unSelectRow"},
                    "onGridClick": {"bindTo": "onGridClick"},
                    "activeRowActions": [
                        {
                            "className": "Terrasoft.Button",
                            "style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
                            "tag": "save",
                            "markerValue": "save",
                            "imageConfig": {"bindTo": "Resources.Images.SaveIcon"}
                        },
                        {
                            "className": "Terrasoft.Button",
                            "style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
                            "tag": "cancel",
                            "markerValue": "cancel",
                            "imageConfig": {"bindTo": "Resources.Images.CancelIcon"}
                        },
                        {
                            "className": "Terrasoft.Button",
                            "style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
                            "tag": "remove",
                            "markerValue": "remove",
                            "imageConfig": {"bindTo": "Resources.Images.RemoveIcon"}
                        }
                    ],
                    "initActiveRowKeyMap": {"bindTo": "initActiveRowKeyMap"},
                    "activeRowAction": {"bindTo": "onActiveRowAction"},
                    "multiSelect": {"bindTo": "MultiSelect"}
                }
            }
        ]/**SCHEMA_DIFF*/,
		methods: {
			init: function () {
			this.callParent(arguments);
			this.subscriptionFunction();
		},
		subscriptionFunction: function() {
			Terrasoft.ServerChannel.on(Terrasoft.EventName.ON_MESSAGE,
			this.bpListenerMessage, this);
		},
		bpListenerMessage: function(scope, message) {
			if (!message || message.Header.Sender !== "ReloadDetailConcert") {
				return;
			}
			var message2 = message.Body;
			if (!this.Ext.isEmpty(message2) && message2 === "UpdateDetail") {
				this.updateDetail();
			}
		},
		}
	};
});
