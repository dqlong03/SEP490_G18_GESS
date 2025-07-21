using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Common
{
    public class PredefinedRole
    {
        public const string TEACHER_ROLE = "Giáo viên";
        public const string ADMIN_ROLE = "Quản trị viên";
        public const string STUDENT_ROLE = "Học sinh";
        public const string EXAMINATION_ROLE = "Khảo thí";
        // ThaiNH_add_UpdateMark&UserProfile_Begin
        public const string HEADOFDEPARTMENT_ROLE = "Trưởng bộ môn";
        // ThaiNH_add_UpdateMark&UserProfileEnd

        private PredefinedRole() { }
    }
}
