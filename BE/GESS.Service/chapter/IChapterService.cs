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
    public interface IChapterService : IBaseService<Chapter>
    {
        //nhưeng phương thức đặc thù cho Chapter có thể được định nghĩa ở đây và triển khia nó bên ChapterService
        Task<IEnumerable<ChapterListDTO>> GetAllChaptersAsync();
        Task<ChapterCreateDTO> CreateChapterAsync(ChapterCreateDTO chapterCreateDto, int subjectId);
        Task<ChapterUpdateDTO> UpdateChapterAsync(int id,ChapterUpdateDTO chapterUpdateDto);
        Task<ChapterListDTO> GetChapterById(int chapterId);
        Task<IEnumerable<ChapterListDTO>> GetAllChapterAsync(string? name = null, int pageNumber = 1, int pageSize = 10);

        Task<IEnumerable<ChapterListDTO>> GetBySubjectIdAsync(int subjectId, string? name = null, int pageNumber = 1, int pageSize = 10);
        Task<IEnumerable<ChapterDTO>> GetChaptersBySubjectId(int subjectId);
        Task<IEnumerable<ChapterList>> GetListChapter();
    }
}
