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
using GESS.Model.ExamSlot;
using GESS.Model.Student;
namespace GESS.Repository.Implement
{
    public class ExamSlotRepository : IExamSlotRepository
    {
        private readonly GessDbContext _context;
        public ExamSlotRepository(GessDbContext context)
        {
            _context = context;
        }

        public async Task<bool> AddExamToExamSlotAsync(int examSlotId, int examId, string examType)
        {
            var examSlot = await _context.ExamSlots
                .Include(es => es.ExamSlotRooms)
                .FirstOrDefaultAsync(es => es.ExamSlotId == examSlotId);
            if (examSlot == null)
                {
                return false; // Không tìm thấy ExamSlot
            }
            // Kiểm tra xem ExamSlot đã có bài thi nào chưa
            if (examType == "Multiple")
            {
                if (examSlot.MultiExamId.HasValue)
                {
                    return false; // ExamSlot đã có bài thi nhiều lựa chọn
                }
                examSlot.Status = "Chưa mở ca";
                examSlot.MultiExamId = examId;
            }
            else if (examType == "Practice")
            {
                if (examSlot.PracticeExamId.HasValue)
                {
                    return false; // ExamSlot đã có bài thi thực hành
                }
                examSlot.Status = "Chưa mở ca";
                examSlot.PracticeExamId = examId;
            }
            else
            {
                return false; // Loại bài thi không hợp lệ
            }
            var examSlotRooms = await _context.ExamSlotRooms
                .Where(esr => esr.ExamSlotId == examSlotId&&esr.MultiOrPractice==examType)
                .ToListAsync();
            // Cập nhật các phòng thi
            foreach (var room in examSlotRooms)
            {
                if(examType== "Multiple")
                {
                    room.MultiExamId = examId;
                }
                else if(examType == "Practice")
                {
                    room.PracticeExamId = examId;
                }
            }
            //Them bai lam cho sinh vien
            if (examType == "Multiple")
            {
                //lay danh sach sinh vien trong examSlotRoom
                var studentExamSlotRooms = await _context.StudentExamSlotRoom
                    .Where(ser => ser.ExamSlotRoom.ExamSlotId == examSlotId)
                    .ToListAsync();
                foreach (var studentExamSlotRoom in studentExamSlotRooms)
                {
                    //check xem sinh vien da ton tai trong MultiExamHistory chua
                    var existingMultiExamHistory = await _context.MultiExamHistories
                        .FirstOrDefaultAsync(meh => meh.StudentId == studentExamSlotRoom.StudentId && meh.MultiExamId == examId);
                    if (existingMultiExamHistory == null)
                    {
                        // Nếu chưa tồn tại, thêm mới
                        var newMultiExamHistory = new MultiExamHistory
                        {
                            StudentId = studentExamSlotRoom.StudentId,
                            MultiExamId = examId,
                            ExamSlotRoomId = studentExamSlotRoom.ExamSlotRoomId,
                            IsGrade = false,
                            Score = 0,
                            CheckIn = false,
                            StatusExam = "Chưa thi"
                        };
                        _context.MultiExamHistories.Add(newMultiExamHistory);
                    }
                }
            }
            else if (examType == "Practice")
            {
                //lay danh sach sinh vien trong examSlotRoom
                var studentExamSlotRooms = await _context.StudentExamSlotRoom
                    .Where(ser => ser.ExamSlotRoom.ExamSlotId == examSlotId)
                    .ToListAsync();
                foreach (var studentExamSlotRoom in studentExamSlotRooms)
                {
                    //check xem sinh vien da ton tai trong MultiExamHistory chua
                    var existingPracExamHistory = await _context.PracticeExamHistories
                        .FirstOrDefaultAsync(meh => meh.StudentId == studentExamSlotRoom.StudentId && meh.PracExamId == examId);
                    if (existingPracExamHistory == null)
                    {
                        // Nếu chưa tồn tại, thêm mới
                        var newPracticeExamHistory = new PracticeExamHistory
                        {
                            StudentId = studentExamSlotRoom.StudentId,
                            PracExamId = examId,
                            ExamSlotRoomId = studentExamSlotRoom.ExamSlotRoomId,
                            IsGraded = false,
                            Score = 0,
                            CheckIn = false,
                            StatusExam = "Chưa thi"
                        };
                        _context.PracticeExamHistories.Add(newPracticeExamHistory);
                    }
                }
            }
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ChangeStatusExamSlot(int examSlotId, string examType)
        {
            var examSlot = await _context.ExamSlots
                .FirstOrDefaultAsync(es => es.ExamSlotId == examSlotId);
            if (examSlot == null)
                { return false; }
            // Chuyển trạng thái của ExamSlot
            if (examSlot.Status == "Chưa gán bài thi")
            {
                examSlot.Status = "Chưa mở ca";
            }
            else if (examSlot.Status == "Chưa mở ca")
            {
                //if(examSlot.ExamDate != DateTime.Now.Date)
                //{
                //    return false;
                //}
                examSlot.Status = "Đang mở ca";
            }
            else if (examSlot.Status == "Đang mở ca")
            {
                if(examType=="Multiple")
                {
                    examSlot.Status = "Đã kết thúc";
                }
                else if (examType == "Practice")
                {
                    examSlot.Status = "Đang chấm thi";
                }
            }
            else if (examSlot.Status == "Đang chấm thi")
            {
                examSlot.Status = "Đã kết thúc";
            }
            else
            {
                return false;
            }
            _context.ExamSlots.Update(examSlot);
            await _context.SaveChangesAsync();
            return true;
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

        public async Task<int> CountPageExamSlotsAsync(ExamSlotFilterRequest filterRequest, int pageSize)
        {
            var examSlots = _context.ExamSlots.AsQueryable();
            // Lọc theo SemesterId, SubjectId, Year, Status, SlotName, ExamType, FromDate, ToDate
            if (filterRequest.SemesterId.HasValue)
            {
                examSlots = examSlots.Where(es => es.SemesterId == filterRequest.SemesterId.Value);
            }
            if (filterRequest.SubjectId.HasValue)
            {
                examSlots = examSlots.Where(es => es.SubjectId == filterRequest.SubjectId.Value);
            }
            if (filterRequest.Year.HasValue)
            {
                examSlots = examSlots.Where(es => es.ExamDate.Year == filterRequest.Year.Value);
            }
            if (!string.IsNullOrEmpty(filterRequest.Status))
            {
                examSlots = examSlots.Where(es => es.Status == filterRequest.Status);
            }
            if (!string.IsNullOrEmpty(filterRequest.ExamType))
            {
                examSlots = examSlots.Where(es => es.MultiOrPractice == filterRequest.ExamType);
            }
            if (filterRequest.FromDate.HasValue)
            {
                examSlots = examSlots.Where(es => es.ExamDate >= filterRequest.FromDate.Value);
            }
            if (filterRequest.ToDate.HasValue)
            {
                examSlots = examSlots.Where(es => es.ExamDate <= filterRequest.ToDate.Value);
            }
            var totalCount = await examSlots.CountAsync();
            if (totalCount == 0)
            {
                return 0; // Không có exam slots nào
            }
            return (int)Math.Ceiling((double)totalCount / pageSize); // Trả về tổng số trang

        }

        public async Task<IEnumerable<ExamDTO>> GetAllExamsAsync(int semesterId, int subjectId, string examType, int year)
        {
            if(examType == "Multiple")
            {
                return await _context.MultiExams
                    .Where(e => e.SemesterId == semesterId && e.SubjectId == subjectId&&e.CreateAt.Year==year&&e.CategoryExam.CategoryExamName.ToLower().Equals("thi cuối kỳ"))
                    .Select(e => new ExamDTO
                    {
                        ExamId = e.MultiExamId,
                        ExamName = e.MultiExamName,
                        ExamType = "Multiple",
                    })
                    .ToListAsync();
            }
            else if (examType == "Practice")
            {
                return await _context.PracticeExams
                    .Where(e => e.SemesterId == semesterId && e.SubjectId == subjectId && e.CreateAt.Year == year && e.CategoryExam.CategoryExamName.ToLower().Equals("thi cuối kỳ"))
                    .Select(e => new ExamDTO
                    {
                        ExamId = e.PracExamId,
                        ExamName = e.PracExamName,
                        ExamType = "Practice"
                    })
                    .ToListAsync();
            }
            else
            {
                return new List<ExamDTO>(); 
            }
        }

        public async Task<IEnumerable<ExamSlotResponse>> GetAllExamSlotsPaginationAsync(ExamSlotFilterRequest filterRequest, int pageIndex, int pageSize)
        {
            var examSlots = _context.ExamSlots.AsQueryable();
            // Lọc theo SemesterId, SubjectId, Year, Status, SlotName, ExamType, FromDate, ToDate
            if (filterRequest.SemesterId.HasValue)
            {
                examSlots = examSlots.Where(es => es.SemesterId == filterRequest.SemesterId.Value);
            }
            if (filterRequest.SubjectId.HasValue)
            {
                examSlots = examSlots.Where(es => es.SubjectId == filterRequest.SubjectId.Value);
            }
            if (filterRequest.Year.HasValue)
            {
                examSlots = examSlots.Where(es => es.ExamDate.Year == filterRequest.Year.Value);
            }
            if (!string.IsNullOrEmpty(filterRequest.Status))
            {
                examSlots = examSlots.Where(es => es.Status == filterRequest.Status);
            }
            if (!string.IsNullOrEmpty(filterRequest.ExamType))
            {
                examSlots = examSlots.Where(es => es.MultiOrPractice == filterRequest.ExamType);
            }
            if (filterRequest.FromDate.HasValue)
            {
                examSlots = examSlots.Where(es => es.ExamDate >= filterRequest.FromDate.Value);
            }
            if (filterRequest.ToDate.HasValue)
            {
                examSlots = examSlots.Where(es => es.ExamDate <= filterRequest.ToDate.Value);
            }
            examSlots.OrderBy(examSlots => examSlots.SubjectId)
                .ThenBy(examSlots => examSlots.ExamDate);
            var examSlotList = await examSlots
                .Include(es => es.Subject)
                .Select(es => new ExamSlotResponse
                {
                    ExamSlotId = es.ExamSlotId,
                    SlotName = es.SlotName,
                    SubjectId= es.SubjectId,
                    Status = es.Status,
                    ExamType = es.MultiOrPractice,
                    SubjectName = es.Subject.SubjectName,
                    SemesterId = es.SemesterId,
                    SemesterName = es.Semester.SemesterName,
                    ExamDate = es.ExamDate
                })
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            if (examSlotList == null || !examSlotList.Any())
            {
                return new List<ExamSlotResponse>();
            }
            return examSlotList;
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

            if (latestTrainingProgram == null)
                return new List<SubjectDTODDL>();

            // Lấy SubjectId và SubjectName thông qua liên kết
            var subjects = await _context.SubjectTrainingPrograms
                .Where(stp => stp.TrainProId == latestTrainingProgram.TrainProId)
                .Include(stp => stp.Subject)
                .Select(stp => new SubjectDTODDL
                {
                    SubjectId = stp.Subject.SubjectId,
                    SubjectName = stp.Subject.SubjectName
                })
                .Distinct()
                .ToListAsync();

            return subjects;
        }



        public async Task<ExamSlotDetail> GetExamSlotByIdAsync(int examSlotId)
        {
            var examSlot = await _context.ExamSlots
                .Include(es => es.Subject)
                .Include(es => es.Semester)
                .FirstOrDefaultAsync(es => es.ExamSlotId == examSlotId);
            if (examSlot == null)
            {
                return null;
            }
            var examSlotDetail = new ExamSlotDetail
            {
                ExamSlotId = examSlot.ExamSlotId,
                SlotName = examSlot.SlotName,
                StartTime = examSlot.StartTime,
                EndTime = examSlot.EndTime,
                Status = examSlot.Status,
                ExamType = examSlot.MultiOrPractice,
                ExamDate = examSlot.ExamDate,
                SubjectName = examSlot.Subject.SubjectName,
                SemesterName = examSlot.Semester.SemesterName
            };
            
            // Lấy danh sách phòng thi cho ca thi này
            var examSlotRooms = await _context.ExamSlotRooms
                .Where(esr => esr.ExamSlotId == examSlotId)
                .Include(esr => esr.Room)
                .Include(esr => esr.Supervisor)
                .Include(esr => esr.ExamGrader)
                .Select(esr => new ExamSlotRoomDetail
                {
                    ExamSlotRoomId = esr.ExamSlotRoomId,
                    RoomId = esr.RoomId,
                    RoomName = esr.Room.RoomName,
                    GradeTeacherName = esr.Supervisor.User.Fullname,
                    ProctorName = esr.ExamGrader.User.Fullname,
                    Status = esr.Status,
                    ExamType = esr.MultiOrPractice,
                    ExamDate = esr.ExamDate,
                    SubjectName = examSlot.Subject.SubjectName,
                    SemesterName = examSlot.Semester.SemesterName,
                    ExamName = esr.MultiOrPractice == "Multiple"
                    ? (esr.MultiExam != null ? esr.MultiExam.MultiExamName : null)
                    : (esr.PracticeExam != null ? esr.PracticeExam.PracExamName : null),
                })
                .ToListAsync();
            //Lay danh sách sinh viên trong từng phòng thi
            foreach (var room in examSlotRooms)
            {
                room.Students = await _context.StudentExamSlotRoom
                    .Where(ser => ser.ExamSlotRoomId == room.ExamSlotRoomId)
                    .Include(ser => ser.Student)
                    .Select(ser => new StudentAddDto
                    {
                        Code = ser.Student.User.Code,
                        FullName = ser.Student.User.Fullname,
                        Email = ser.Student.User.Email,
                        DateOfBirth = ser.Student.User.DateOfBirth,
                        Gender = ser.Student.User.Gender
                    })
                .ToListAsync();
                room.Students = room.Students.OrderBy(s => s.FullName).ToList();
            }
            examSlotDetail.ExamSlotRoomDetails = examSlotRooms;
            return examSlotDetail;
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
                // 1. Tạo ExamSlot
                var examSlot = new ExamSlot
                {
                    StartTime = item.StartTime.TimeOfDay,
                    EndTime = item.EndTime.TimeOfDay,
                    SlotName = item.SlotName,
                    ExamDate = item.Date,
                    MultiOrPractice = item.MultiOrPractice,
                    Status = string.IsNullOrEmpty(item.Status) ? "Chưa gán bài thi" : item.Status,
                    SubjectId = item.SubjectId,
                    SemesterId = item.SemesterId
                };
                _context.ExamSlots.Add(examSlot);
                await _context.SaveChangesAsync();

                // 2. Tạo ExamSlotRoom
                var examSlotRooms = item.Rooms.Select(room => new ExamSlotRoom
                {
                    RoomId = room.RoomId,
                    ExamSlotId = examSlot.ExamSlotId,
                    SemesterId = item.SemesterId,
                    SupervisorId = item.Proctors.FirstOrDefault()?.TeacherId,
                    ExamGradedId = item.Graders.FirstOrDefault(g => g.RoomId == room.RoomId)?.TeacherId,
                    SubjectId = item.SubjectId,
                    MultiOrPractice = item.MultiOrPractice,
                    ExamDate = item.Date,
                    IsGraded = 0,
                    Status = 0
                }).ToList();
                _context.ExamSlotRooms.AddRange(examSlotRooms);
                await _context.SaveChangesAsync();

                // 3. Lưu sinh viên
                foreach (var room in item.Rooms)
                {
                    foreach (var student in room.Students)
                    {
                        var existingStudent = await _context.Students
                            .FirstOrDefaultAsync(s => s.User.Code == student.Code);

                        if (existingStudent == null)
                        {
                            var newStudent = new Student
                            {
                                User = new User
                                {
                                    Code = student.Code,
                                    Fullname = student.FullName,
                                    Email = student.Email,
                                    Gender = student.Gender == null,
                                    DateOfBirth = student.DateOfBirth,
                                    
                                },
                                AvatarURL = student.URLAvatar,
                                EnrollDate = DateTime.Now

                            };
                            _context.Students.Add(newStudent);
                            try
                            {
                                await _context.SaveChangesAsync();
                            }
                            catch (DbUpdateException ex)
                            {
                                Console.WriteLine(ex.InnerException?.Message);
                                throw;
                            }
                            existingStudent = newStudent; 
                        }

                        var examSlotRoomId = examSlotRooms
                            .First(r => r.RoomId == room.RoomId).ExamSlotRoomId;

                        var studentExamSlotRoom = new StudentExamSlotRoom
                        {
                            StudentId = existingStudent.StudentId,
                            ExamSlotRoomId = examSlotRoomId
                        };
                        _context.StudentExamSlotRoom.Add(studentExamSlotRoom);
                        await _context.SaveChangesAsync();
                    }
                }
            }
            return true;
        }
    }

}