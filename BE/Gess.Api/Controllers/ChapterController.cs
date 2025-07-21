using GESS.Model.Chapter;
using GESS.Service.chapter;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChapterController : ControllerBase
    {
        private readonly IChapterService _chapterService;
        public ChapterController(IChapterService chapterService)
        {
            _chapterService = chapterService;
        }
        [HttpGet("GetAllChapter/{subjectId}")]
        public async Task<IActionResult> GetAllchapterAsync(int subjectId ,string? name = null, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var chapter = await _chapterService.GetBySubjectIdAsync(subjectId, name, pageNumber, pageSize);
                return Ok(chapter);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpGet("")]
        public async Task<ActionResult<IEnumerable<ChapterListDTO>>> GetAllChapters()
        {
            try
            {
                var chapters = await _chapterService.GetAllChaptersAsync();
                return Ok(chapters);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        // ThaiNH_add_UpdateMark&UserProfile_Begin

        [HttpGet("GetAllChapterBySub/{subjectId}")]
        public async Task<IActionResult> GetAllchapterBySubIdAsync(int subjectId)
        {
            try
            {
                var chapter = await _chapterService.GetChaptersBySubjectId(subjectId);
                return Ok(chapter);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        // ThaiNH_add_UpdateMark&UserProfile_End
        [HttpPost("{subjectId}/CreateChapter")]
        public async Task<ActionResult<ChapterCreateDTO>> CreateChapter([FromBody] ChapterCreateDTO chapterCreateDto, int subjectId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var createdChapter = await _chapterService.CreateChapterAsync(chapterCreateDto, subjectId);
                return CreatedAtAction(nameof(GetAllChapters), new { chaptername = createdChapter.ChapterName }, createdChapter);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }
        [HttpPut("{id}")]
        public async Task<ActionResult<ChapterUpdateDTO>> UpdateChapter(int id, [FromBody] ChapterUpdateDTO chapterUpdateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                
                var updatedChapter = await _chapterService.UpdateChapterAsync(id, chapterUpdateDto);
                return Ok(updatedChapter);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ChapterListDTO>> GetChapterById(int id)
        {
            try
            {
                var chapterDto = await _chapterService.GetChapterById(id);
                return Ok(chapterDto);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
        //API Delete Chapter by Id
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteChapter(int id)
        {
            try
            {
                await _chapterService.DeleteAsync(id);
                return Ok("Delete chapter success"); // Trả về 204 No Content nếu xóa thành công
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message); // Trả về 404 Not Found nếu không tìm thấy chương
            }
        }
    }
}