using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Common
{
    public class PredefinedStatusExamInHistoryOfStudent
    {
        public const string PENDING_EXAM = "Chưa thi";
        public const string IN_PROGRESS_EXAM = "Đang thi";
        public const string COMPLETED_EXAM = "Đã thi";
        private PredefinedStatusExamInHistoryOfStudent() { }
    }
}
