﻿using GESS.Entity.Entities;
using GESS.Model.Chapter;
using GESS.Model.GradeSchedule;
using GESS.Model.PracticeTestQuestions;
using GESS.Model.Student;
using GESS.Model.Subject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.gradeSchedule
{
    public interface IGradeScheduleService : IBaseService<ExamSlotRoom>
    {
        Task <int>CountExamNeedGradeByTeacherIdAsync(Guid teacherId, int subjectId, int statusExam, int semesterId,int year, int pagesze);
        Task<IEnumerable<ExamNeedGrade>> GetExamNeedGradeByTeacherIdAsync(Guid teacherId, int subjectId, int statusExam, int semesterId, int year, int pagesze, int pageindex);
        Task<IEnumerable<StudentGradeDTO>> GetStudentsInExamNeedGradeAsync(Guid teacherId, int examId);
        Task<IEnumerable<StudentSubmission>> GetSubmissionOfStudentInExamNeedGradeAsync(Guid teacherId, int examId, Guid studentId);
    }
}
