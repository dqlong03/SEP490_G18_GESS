namespace GESS.Api.HandleException
{
 
    // ThaiNH_Create_UserProfile
    public class ErrorResponse
    {
        public string Message { get; set; }
        public string Details { get; set; }
        public IDictionary<string, string[]> Errors { get; set; }
    }
}
