using GESS.Entity.Entities;
using GESS.Service.subject;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubjectController : ControllerBase
    {
        private readonly ISubjectService _subjectService;
        public SubjectController(ISubjectService subjectService)
        {
            _subjectService = subjectService;
        }
        [HttpGet("")]
        public async Task<ActionResult<IEnumerable<Subject>>> GetAllSubjects()
        {
            try
            {
                var subjects =  _subjectService.GetAll();
                return Ok(subjects);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
    } 
}