using GESS.Entity.Entities;
using GESS.Model.ExamSlot;
using GESS.Model.ExamSlotCreateDTO;
using GESS.Model.ExamSlotRoomDTO;
using GESS.Model.Major;
using GESS.Model.RoomDTO;
using GESS.Model.Subject;
using GESS.Model.Teacher;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.examSlotService
{
    public interface IExamSlotService : IBaseService<ExamSlot>
    {
        Task <IEnumerable<TeacherCreationFinalRequest>>CheckTeacherExist(List<ExistTeacherDTO> teachers);
        Task<IEnumerable<ExamSlotDTO>> GetAllExamSlotsAsync();
        Task <IEnumerable<GradeTeacherResponse>>GetAllGradeTeacher(int majorId, int subjectId);
        Task<IEnumerable<MajorDTODDL>> GetAllMajor();
        Task<IEnumerable<RoomListDTO>> GetAllRoomsAsync();
        Task<IEnumerable<SubjectDTODDL>> GetAllSubjectsByMajorId(int majorId);
        bool IsRoomAvailable(int roomId, DateTime slotStart, DateTime slotEnd);
        Task<bool> SaveExamSlotsAsync(List<GeneratedExamSlot> examSlots);
    }
}
