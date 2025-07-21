using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Chapter;
using GESS.Model.Subject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.chapter
{
    public class ChapterService : BaseService<Chapter>, IChapterService
    {
        private readonly IUnitOfWork _unitOfWork;
        public ChapterService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ChapterCreateDTO> CreateChapterAsync(ChapterCreateDTO chapterCreateDto, int subjectId)
        {
            bool chapterExists =  _unitOfWork.ChapterRepository.ExistsAsync(c => c.ChapterName == chapterCreateDto.ChapterName).Result;
            if (chapterExists)
            {
                throw new InvalidOperationException("Chapter with the same name already exists.");
            }
            var chapter = new Chapter
            {
               
                ChapterName = chapterCreateDto.ChapterName,
                Description = chapterCreateDto.Description,
                //Course = chapterCreateDto.Curriculum,
                SubjectId = subjectId
            };

            _unitOfWork.ChapterRepository.Create(chapter);
            await _unitOfWork.SaveChangesAsync();

            return chapterCreateDto;
        }

        public async Task<IEnumerable<ChapterListDTO>> GetAllChaptersAsync()
        {
            var chapters = await _unitOfWork.ChapterRepository.GetAllChaptersAsync();

            return chapters.Select(chapter => new ChapterListDTO
            {
                Id = chapter.ChapterId,
                ChapterName = chapter.ChapterName,
                Description = chapter.Description,
                SubjectName = chapter.Subject?.SubjectName ?? "N/A"
            }).ToList();
        }

        
        public async Task<IEnumerable<ChapterListDTO>> GetAllChapterAsync(string? name, int pageNumber, int pageSize)
        {
            var chapter = await _unitOfWork.ChapterRepository.GetAllChapterAsync(name, pageNumber, pageSize);

            var chapterDtos = chapter.Select(chapter => new ChapterListDTO
            {
                Id = chapter.ChapterId,
                ChapterName = chapter.ChapterName,
                Description = chapter.Description,
                SubjectName = chapter.Subject?.SubjectName ?? "N/A"
            });

            return chapterDtos;
        }
        public async Task<ChapterListDTO> GetChapterById(int chapterId)
        {
            var chapter = await _unitOfWork.ChapterRepository.GetByIdAsync(chapterId);
            if (chapter == null)
            {
                throw new InvalidOperationException("Không tìm thấy chương.");
            }
            return new ChapterListDTO
            {
                Id = chapter.ChapterId,
                ChapterName = chapter.ChapterName,
                Description = chapter.Description,
                SubjectName = chapter.Subject?.SubjectName ?? "N/A"
            };
        }
        public async Task<ChapterUpdateDTO> UpdateChapterAsync(int chapterId, ChapterUpdateDTO chapterUpdateDTO)
        {
            var chapter = await _unitOfWork.ChapterRepository.GetByIdAsync(chapterId);
            if (chapter == null)
            {
                throw new InvalidOperationException("Không tìm thấy chương.");
            }

            chapter.ChapterName = chapterUpdateDTO.ChapterName;
            chapter.Description = chapterUpdateDTO.Description;
            chapter.SubjectId = chapterUpdateDTO.SubjectId;

            _unitOfWork.ChapterRepository.Update(chapter);
            await _unitOfWork.SaveChangesAsync();

            return chapterUpdateDTO;
        }

        public async Task<IEnumerable<ChapterListDTO>> GetBySubjectIdAsync(int subjectId, string? name = null, int pageNumber = 1, int pageSize = 10)
        {
            var chapter = await _unitOfWork.ChapterRepository.GetBySubjectIdAsync(subjectId, name, pageNumber, pageSize);

            var chapterDtos = chapter.Select(chapter => new ChapterListDTO
            {
                Id = chapter.ChapterId,
                ChapterName = chapter.ChapterName,
                Description = chapter.Description,
                SubjectName = chapter.Subject?.SubjectName ?? "N/A"
            });

            return chapterDtos;
        }

        public async Task<IEnumerable<ChapterDTO>> GetChaptersBySubjectId(int subjectId)
        {
            var chapters = await _unitOfWork.ChapterRepository.GetChaptersBySubjectId(subjectId);
            if (chapters == null || !chapters.Any())
            {
                throw new InvalidOperationException("Không tìm thấy chương nào cho môn học này.");
            }
            return chapters.Select(chapter => new ChapterDTO
            {
                Id = chapter.ChapterId,
                ChapterName = chapter.ChapterName,
                // ThaiNH_add_UpdateMark&UserProfile_Begin
                Curriculum = chapter.Course,
                // ThaiNH_add_UpdateMark&UserProfile_End
                Description = chapter.Description,
            }).ToList();
        }

        public async Task<IEnumerable<ChapterList>> GetListChapter()
        {
            var chapters = await _unitOfWork.ChapterRepository.GetAllAsync(); // giả định bạn có GetAllAsync()

            return chapters.Select(p => new ChapterList
            {
                Id = p.ChapterId,
                ChapterName = p.ChapterName
            });
        }



        // Implement any specific methods for Chapter here
    }

}
