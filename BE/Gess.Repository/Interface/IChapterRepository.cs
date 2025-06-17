using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IChapterRepository : IBaseRepository<Chapter>
    {
        //những phương thức đặc thù cho Chapter có thể được định nghĩa ở đây và triển khia nó bên ChapterRepository
        public Task<IEnumerable<Chapter>> GetAllChaptersAsync();
        Task<IEnumerable<Chapter>> GetAllChapterAsync(string? name = null, int pageNumber = 1, int pageSize = 10);
        public Task<Chapter> GetByIdAsync(int chapterId);
        Task<IEnumerable<Chapter>> GetBySubjectIdAsync(int subjectId, string? name = null, int pageNumber = 1, int pageSize = 10);
        Task<IEnumerable<Chapter>> GetChaptersBySubjectId(int subjectId);
    }
}
