using GESS.Common.HandleException;
using GESS.Entity.Entities;
using GESS.Model.User;
using GESS.Service.users;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }


        [HttpGet("{userId}")]
        public async Task<ActionResult<UserListDTO>> GetUserById(Guid userId)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(userId);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateUser(Guid userId, [FromBody] UserUpdateRequest request)
        {
            if (request == null)
                return BadRequest("Request body is null.");

            try
            {
                var updatedUser = await _userService.UpdateUserAsync(userId, request);
                return Ok(updatedUser);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("{userId}")]
        public async Task<IActionResult> DeleteUser(Guid userId)
        {
            try
            {
                await _userService.DeleteUserAsync(userId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }



        [HttpGet()]
        public async Task<ActionResult<List<UserListDTO>>> GetAllUsers()
        {
            try
            {
                var users = await _userService.GetAllUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        // ThaiNH_AddFunction_Begin

        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateUserProfileAsync(Guid userId, [FromBody] UserProfileDTO dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                );
                throw new ValidationException("Dữ liệu đầu vào không hợp lệ.", errors);
            }

            await _userService.UpdateUserProfileAsync(userId, dto);
            return NoContent();
        }


        // ThaiNH_AddFunction_End
    }
}

