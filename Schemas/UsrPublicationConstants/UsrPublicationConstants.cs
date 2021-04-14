namespace Terrasoft.Configuration
{
	using System;
	public static class UsrPublicationConstants
	{
		public static Guid Planned = new Guid("DD5A65B0-2CF5-460A-B1E6-63753BDC3590");//Запланировано в детале Выпуски
		public static Guid InProgress = new Guid("08D5DE82-A413-4F82-A8B7-CD55D832EF1E");//В процессе в детале Выпуски
		public static Guid Completed = new Guid("C23532D3-51B1-405E-B1DB-4D867ED88811");//Завершено в детале Выпуски
	}
}
