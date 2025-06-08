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
        public Task<Chapter> GetByIdAsync(int chapterId);
    }
}
