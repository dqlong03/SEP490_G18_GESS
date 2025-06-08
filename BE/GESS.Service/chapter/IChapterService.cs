using GESS.Entity.Entities;
using GESS.Model.Chapter;
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
        Task<ChapterCreateDTO> CreateChapterAsync(ChapterCreateDTO chapterCreateDto);
        Task<ChapterUpdateDTO> UpdateChapterAsync(int id,ChapterUpdateDTO chapterUpdateDto);
        Task<ChapterListDTO> GetChapterById(int chapterId);

    }
}
