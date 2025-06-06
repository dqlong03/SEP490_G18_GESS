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
        [HttpPost("CreateChapter")]
        public async Task<ActionResult<ChapterCreateDTO>> CreateChapter([FromBody] ChapterCreateDTO chapterCreateDto)
        {
            try
            {
                var createdChapter = await _chapterService.CreateChapterAsync(chapterCreateDto);
                return CreatedAtAction(nameof(GetAllChapters), new { chaptername = createdChapter.ChapterName }, createdChapter);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }
        [HttpPut("UpdateChapter")]
        public async Task<ActionResult<ChapterUpdateDTO>> UpdateChapter([FromBody] ChapterUpdateDTO chapterUpdateDto)
        {
            try
            {
                var updatedChapter = await _chapterService.UpdateChapterAsync(chapterUpdateDto);
                return Ok(updatedChapter);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}