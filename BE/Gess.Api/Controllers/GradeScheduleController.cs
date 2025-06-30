using GESS.Service.examSchedule;
using GESS.Service.examSlotService;
using GESS.Service.gradeSchedule;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GradeScheduleController : ControllerBase
    {
        private readonly IGradeScheduleService _gradeScheduleService;
        public GradeScheduleController(IGradeScheduleService gradeScheduleService)
        {
            _gradeScheduleService = gradeScheduleService;
        }
        
    }
}