using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.RoomDTO;
using GESS.Model.Subject;
using GESS.Model.Teacher;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IExamSlotRepository
    {
        Task<IEnumerable<GradeTeacherResponse>> GetAllGradeTeacherAsync(int majorId, int subjectId);
        Task<IEnumerable<RoomListDTO>> GetAllRoomsAsync();
        Task<IEnumerable<SubjectDTODDL>> GetAllSubjectsByMajorIdAsync(int majorId);
        bool IsRoomAvailable(int roomId, DateTime slotStart, DateTime slotEnd);
    }
}
