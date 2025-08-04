using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.Subject;
using GESS.Repository.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using GESS.Model.RoomDTO;
using GESS.Model.Teacher;
using GESS.Model.ExamSlotCreateDTO;
namespace GESS.Repository.Implement
{
    public class ExamSlotRepository : IExamSlotRepository
    {
        private readonly GessDbContext _context;
        public ExamSlotRepository(GessDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TeacherCreationFinalRequest>> CheckTeacherExistAsync(List<ExistTeacherDTO> teachers)
        {
            var result = new List<TeacherCreationFinalRequest>();

            foreach (var item in teachers)
            {
                // Kiểm tra tồn tại trong DB theo Email hoặc mã giáo viên
                var exists = await _context.Teachers
                    .AnyAsync(t => t.User.Fullname == item.Fullname || t.User.Code == item.Code);

                if (!exists)
                {
                    //add new teacher 
                    var newTeacher = new Teacher
                    {
                        User = new User
                        {
                            Fullname = item.Fullname,
                            Email = item.Email,
                            PhoneNumber = item.PhoneNumber,
                            DateOfBirth = item.DateOfBirth,
                        },
                        HireDate = item.HireDate,
                        MajorId = item.MajorId,
                    };
                    _context.Teachers.Add(newTeacher);
                    await _context.SaveChangesAsync();
                }
                // Lấy thông tin giáo viên đã tồn tại hoặc mới thêm
                var teacher = await _context.Teachers
                    .Include(t => t.User)
                    .FirstOrDefaultAsync(t => t.User.Fullname == item.Fullname || t.User.Code == item.Code);
                if (teacher != null)
                {
                    result.Add(new TeacherCreationFinalRequest
                    {
                        TeacherId = teacher.TeacherId,
                        UserName = teacher.User.UserName,
                        Email = teacher.User.Email,
                        PhoneNumber = teacher.User.PhoneNumber,
                        Code = teacher.User.Code,
                        Fullname = teacher.User.Fullname,
                    });
                }
            }
            return result;
        }


        public async Task<IEnumerable<GradeTeacherResponse>> GetAllGradeTeacherAsync(int majorId, int subjectId)
        {
            var gradeTeachers = await _context.SubjectTeachers
                .Include(gt => gt.Teacher)
                .ThenInclude(t => t.User)
                .Where(gt => gt.SubjectId == subjectId
                             && gt.Teacher != null
                             && gt.Teacher.MajorId == majorId
                             && gt.Teacher.User != null)
                .Select(gt => new GradeTeacherResponse
                {
                    TeacherId = gt.TeacherId,
                    FullName = gt.Teacher.User.Fullname
                })
                .ToListAsync();

            return gradeTeachers;
        }


        public async Task<IEnumerable<RoomListDTO>> GetAllRoomsAsync()
        {
            var rooms = await _context.Rooms
                .Where(r => r.Status == "Available") 
                .Select(r => new RoomListDTO
                {
                    RoomId = r.RoomId,
                    RoomName = r.RoomName,
                    Capacity = r.Capacity
                })
                .ToListAsync();

            return rooms;
        }


        public async Task<IEnumerable<SubjectDTODDL>> GetAllSubjectsByMajorIdAsync(int majorId)
        {
            // Lấy chương trình đào tạo mới nhất theo MajorId
            var latestTrainingProgram = await _context.TrainingPrograms
                .Where(tp => tp.MajorId == majorId)
                .OrderByDescending(tp => tp.StartDate) 
                .FirstOrDefaultAsync();

            // Nếu không có chương trình nào thì trả về danh sách rỗng
            if (latestTrainingProgram == null)
            {
                return new List<SubjectDTODDL>();
            }

            // Lấy các môn học theo chương trình đào tạo mới nhất
            var subjects = await _context.SubjectTrainingPrograms
                .Where(s => s.TrainProId == latestTrainingProgram.TrainProId)
                .Select(s => new SubjectDTODDL
                {
                    SubjectId = s.SubjectId,
                    SubjectName = s.Subject.SubjectName
                })
                .ToListAsync();

            return subjects;
        }

        public bool IsRoomAvailable(int roomId, DateTime slotStart, DateTime slotEnd)
        {
            var examDate = slotStart.Date;

            var examSlotRooms = _context.ExamSlotRooms
                .Include(e => e.ExamSlot)
                .Where(e => e.RoomId == roomId)
                .ToList(); 

            return !examSlotRooms.Any(e =>
            {
                var start = examDate + e.ExamSlot.StartTime;
                var end = examDate + e.ExamSlot.EndTime;
                return start < slotEnd && end > slotStart;
            });
        }

        public async Task<bool> SaveExamSlotsAsync(List<GeneratedExamSlot> examSlots)
        {
            foreach (var item in examSlots)
            {
                // Tạo ExamSlot mới
                var examSlot = new ExamSlot
                {
                    StartTime = item.StartTime.TimeOfDay,
                    EndTime = item.EndTime.TimeOfDay,
                    SlotName = item.SlotName,
                    ExamDate = item.Date,
                    MultiOrPractice = item.MultiOrPractice,
                    Status = item.Status==""? "Chưa gán bài thi": item.Status,
                    SubjectId = item.SubjectId,
                    SemesterId = item.SemesterId
                };
                _context.ExamSlots.Add(examSlot);
                await _context.SaveChangesAsync();
                
                // Tao ExamSlotRoom cho từng phòng
                var examSlotRooms = item.Rooms.Select(room => new ExamSlotRoom
                {
                    RoomId = room.RoomId,
                    ExamSlotId = examSlot.ExamSlotId,
                    SemesterId = item.SemesterId,
                    SupervisorId = item.Proctors.FirstOrDefault()?.TeacherId,
                    ExamGradedId = item.Graders.FirstOrDefault(g => g.RoomId == room.RoomId)?.TeacherId,
                    SubjectId= item.SubjectId,
                    MultiOrPractice = item.MultiOrPractice,
                    ExamDate = item.Date,
                    IsGraded = 0,
                    Status = 0
                }).ToList();
                _context.ExamSlotRooms.AddRange(examSlotRooms);
                await _context.SaveChangesAsync();

                //Luu sinh vien vao StudentExamSlotRom
                foreach (var students in item.Rooms)
                {
                    students.Students.ForEach(student => {
                       //check xem sinh vien da ton tai trong he thong chua
                       var existingStudent = _context.Students
                           .FirstOrDefault(s => s.User.Code == student.Code);
                        if (existingStudent==null)
                        {
                            // Nếu sinh viên chưa tồn tại, thêm mới
                            var newStudent = new Student
                            {
                                User = new User
                                {
                                    Code = student.Code,
                                    Fullname = student.FullName,
                                    Email = student.Email,
                                    Gender = student.Gender == null,
                                    DateOfBirth = student.DateOfBirth,
                                }
                                

                            };
                            _context.Students.Add(newStudent);
                            _context.SaveChangesAsync();
                        }
                        // Lấy lại sinh viên sau khi đã thêm mới
                        existingStudent = _context.Students
                            .FirstOrDefault(s => s.User.Code == student.Code);
                        if (existingStudent != null)
                            {
                            // Thêm sinh viên vào ExamSlotRoom
                            var studentExamSlotRoom = new StudentExamSlotRoom
                            {
                                StudentId = existingStudent.StudentId,
                                ExamSlotRoomId = examSlotRooms.FirstOrDefault(r => r.RoomId == students.RoomId).ExamSlotRoomId
                            };
                            _context.StudentExamSlotRoom.Add(studentExamSlotRoom);
                            _context.SaveChangesAsync();
                        }
                    });
                }
            }
            return true;
        }
    }

}