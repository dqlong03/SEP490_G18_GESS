using GESS.Model.APIKey;
using GESS.Model.CheckDup;
using GESS.Model.MultipleQuestionDTO;
using GESS.Model.PracticeQuestionDTO;
using GESS.Service.multipleQuestion;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Text;
using System.Text.RegularExpressions;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AIGradePracExamController : ControllerBase
    {
        private readonly string _apiKey;

        public AIGradePracExamController(IOptions<APIKeyOptions> apiKeyOptions)
        {
            _apiKey = apiKeyOptions.Value.Key;
        }
        [HttpPost("GradeEssayAnswer")]
        public async Task<IActionResult> GradeEssayAnswer([FromBody] EssayGradingRequest request)
        {
            string materialContent = await GetMaterialContentAsync(request.MaterialLink);
            if (string.IsNullOrWhiteSpace(materialContent))
            {
                return BadRequest("Không thể lấy nội dung tài liệu từ link.");
            }

            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine("Bạn là một giáo viên giỏi, hãy chấm điểm một câu trả lời tự luận như sau:");
            promptBuilder.AppendLine($"\n---\nNội dung tài liệu tham khảo:\n{materialContent}");
            promptBuilder.AppendLine($"\n---\nCâu hỏi:\n{request.QuestionContent}");
            promptBuilder.AppendLine($"\n---\nCâu trả lời của học sinh:\n{request.AnswerContent}");
            promptBuilder.AppendLine($"\n---\nHướng dẫn chấm điểm theo tiêu chí. Mỗi tiêu chí có trọng số (%) trên tổng điểm của câu:");
            foreach (var crit in request.BandScoreGuide)
            {
                promptBuilder.AppendLine($"- {crit.CriterionName} (trọng số {crit.WeightPercent}%): {crit.Description?.Trim() ?? "[Không có mô tả]"}");
            }
            promptBuilder.AppendLine($"\n---\nYêu cầu:");
            promptBuilder.AppendLine("1. Với mỗi tiêu chí, cho biết mức độ đạt được dưới dạng phần trăm (0–100) và giải thích ngắn gọn (tối đa 10 từ).");
            promptBuilder.AppendLine("2. Tính điểm đóng góp của từng tiêu chí bằng: (AchievementPercent * WeightPercent) / 100, rồi cộng lại để ra tổng % đạt được.");
            promptBuilder.AppendLine($"3. Quy đổi tổng % đó sang điểm thực tế trên thang {request.MaxScore} (ví dụ nếu tổng đạt 80% thì điểm là 0.8 * {request.MaxScore}).");
            promptBuilder.AppendLine("4. Trả về kết quả đúng định dạng JSON như mẫu sau:");
            promptBuilder.AppendLine(@"{
                          ""CriterionScores"": [
                            {
                              ""CriterionName"": ""Độ rõ ràng"",
                              ""AchievementPercent"": 90.0,
                              ""WeightedScore"": 36.0, // ví dụ: 90% * 40% = 36%
                              ""Explanation"": ""Trình bày rõ ràng, dễ hiểu.""
                            },
                            {
                              ""CriterionName"": ""Nội dung"",
                              ""AchievementPercent"": 70.0,
                              ""WeightedScore"": 21.0, // 70% * 30% = 21%
                              ""Explanation"": ""Thiếu dẫn chứng cụ thể.""
                            }
                          ],
                          ""TotalScore"": 57.0, // (36 + 21)=57% của tổng, scale theo MaxScore nếu MaxScore != 100
                          ""OverallExplanation"": ""Câu trả lời khá tốt ở phần rõ ràng nhưng nội dung còn thiếu.""
                        }");
            promptBuilder.AppendLine("Nếu trả về trong code block (ví dụ ```json ... ```), chỉ lấy phần JSON bên trong, không thêm văn bản thừa ngoài cấu trúc.");

            var prompt = promptBuilder.ToString();

            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

            var body = new
            {
                model = "gpt-4o-mini",
                messages = new[]
                {
            new { role = "user", content = prompt }
        }
            };

            var json = JsonConvert.SerializeObject(body);
            var response = await httpClient.PostAsync("https://api.openai.com/v1/chat/completions",
                new StringContent(json, Encoding.UTF8, "application/json"));

            var responseString = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                return BadRequest("Lỗi khi gọi OpenAI: " + responseString);
            }

            dynamic result = JsonConvert.DeserializeObject(responseString);
            string output = result.choices[0].message.content;

            try
            {
                // Làm sạch output: loại bỏ phần ```json hoặc ``` nếu có
                var cleanedOutput = output.Trim();
                if (cleanedOutput.StartsWith("```"))
                {
                    int firstBrace = cleanedOutput.IndexOf('{');
                    int lastBrace = cleanedOutput.LastIndexOf('}');
                    if (firstBrace >= 0 && lastBrace > firstBrace)
                    {
                        cleanedOutput = cleanedOutput.Substring(firstBrace, lastBrace - firstBrace + 1);
                    }
                }

                // Nếu vẫn còn ký tự thừa, dùng Regex lấy đoạn JSON đầu tiên
                var match = System.Text.RegularExpressions.Regex.Match(cleanedOutput, @"\{[\s\S]*\}");
                if (match.Success)
                {
                    cleanedOutput = match.Value;
                }

                var gradeResult = JsonConvert.DeserializeObject<EssayGradingResult>(cleanedOutput);

                // Tính lại WeightedScore và TotalScore dựa trên AchievementPercent và WeightPercent để đảm bảo nhất quán
                double totalWeightContribution = 0;
                foreach (var critScore in gradeResult.CriterionScores)
                {
                    // Tìm trọng số tương ứng từ request
                    var critDef = request.BandScoreGuide.FirstOrDefault(c => c.CriterionName == critScore.CriterionName);
                    if (critDef != null)
                    {
                        double expectedWeightedPercent = critScore.AchievementPercent * critDef.WeightPercent / 100.0;
                        critScore.WeightedScore = expectedWeightedPercent; // đây là phần trăm của tổng (chưa scale)
                        totalWeightContribution += expectedWeightedPercent;
                    }
                }

                // totalWeightContribution là tổng % đạt được trên thang 100.
                // Quy đổi sang điểm thực tế:
                gradeResult.TotalScore = Math.Round(totalWeightContribution * request.MaxScore / 100.0, 2);

                // Nếu AI đã trả TotalScore khác và bạn muốn lưu ý:
                if (Math.Abs(gradeResult.TotalScore - (double)gradeResult.TotalScore) > 0.001)
                {
                    // có thể thêm ghi chú vào OverallExplanation nếu cần
                }

                // Trả về
                return Ok(gradeResult);

            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi phân tích kết quả: " + ex.Message + "\nOutput:\n" + output);
            }
        }
        private async Task<string> GetMaterialContentAsync(string link)
        {
            using var httpClient = new HttpClient();

            if (link.Contains("docs.google.com/document"))
            {
                var fileId = ExtractGoogleDocId(link);
                if (fileId != null)
                {
                    var exportUrl = $"https://docs.google.com/document/d/{fileId}/export?format=txt";
                    return await httpClient.GetStringAsync(exportUrl);
                }
            }
            else if (link.StartsWith("http"))
            {
                return await httpClient.GetStringAsync(link);
            }
            else if (System.IO.File.Exists(link))
            {
                return await System.IO.File.ReadAllTextAsync(link);
            }

            return null;
        }

        private string ExtractGoogleDocId(string url)
        {
            var match = Regex.Match(url, @"document/d/([a-zA-Z0-9-_]+)");
            return match.Success ? match.Groups[1].Value : null;
        }
        [HttpPost("FindSimilar")]
        public async Task<IActionResult> FindSimilar([FromBody] FindDuplicatesRequest request)
        {
            if (request.Questions == null || request.Questions.Count < 2)
                return BadRequest("Phải gửi ít nhất 2 câu hỏi để so sánh.");

            if (request.SimilarityThreshold < 0 || request.SimilarityThreshold > 1)
                return BadRequest("SimilarityThreshold phải nằm trong [0,1].");

            // Build the input JSON string for prompt (compact)
            string questionsJson = JsonConvert.SerializeObject(request.Questions, Formatting.Indented);

            // Build prompt
            var prompt = new StringBuilder();
            prompt.AppendLine("Bạn là một bộ phân tích câu hỏi.");
            prompt.AppendLine("Đầu vào là một mảng JSON các câu hỏi, mỗi câu gồm QuestionID (số) và Content (chuỗi).");
            prompt.AppendLine("Nhiệm vụ của bạn:");
            prompt.AppendLine("- Nhóm các câu hỏi có nội dung giống hoặc gần giống nhau về nghĩa.");
            prompt.AppendLine("- Không phân biệt chữ hoa/chữ thường, bỏ dấu tiếng Việt, bỏ dấu câu, bỏ khoảng trắng thừa.");
            prompt.AppendLine("- Chấp nhận khác biệt nhỏ về diễn đạt, từ đồng nghĩa, hoặc sắp xếp câu từ.");
            prompt.AppendLine($"- Chỉ nhóm nếu tất cả câu trong nhóm có mức độ tương đồng >= {request.SimilarityThreshold:0.00} (0..1).");
            prompt.AppendLine("- Tính SimilarityScore của nhóm = trung bình điểm tương đồng của các cặp câu trong nhóm.");
            prompt.AppendLine("- Chỉ output JSON hợp lệ, KHÔNG viết giải thích, KHÔNG sử dụng ```json``` trong output.");
            prompt.AppendLine();
            prompt.AppendLine("Input JSON:");
            prompt.AppendLine(questionsJson);
            prompt.AppendLine();
            prompt.AppendLine("Output JSON format:");
            prompt.AppendLine(@"[
            {
                ""SimilarityScore"": 0.92,
                ""Questions"": [
                    { ""QuestionID"": 1, ""Content"": ""Câu hỏi A..."" },
                    { ""QuestionID"": 2, ""Content"": ""Câu hỏi B..."" }
                ]
             }
            ]");
            prompt.AppendLine("Nếu không có nhóm nào đạt ngưỡng, trả về []");

            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

            var body = new
            {
                model = "gpt-4o-mini",
                messages = new[]
                {
                    new { role = "user", content = prompt.ToString() }
                },
                temperature = 0.0
            };

            var payload = JsonConvert.SerializeObject(body);
            var response = await httpClient.PostAsync("https://api.openai.com/v1/chat/completions",
                new StringContent(payload, Encoding.UTF8, "application/json"));

            var responseString = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                return BadRequest(new { error = "Lỗi khi gọi OpenAI", detail = responseString });
            }

            dynamic? result;
            try
            {
                result = JsonConvert.DeserializeObject(responseString);
            }
            catch (Exception ex)
            {
                return BadRequest($"Không parse được response tổng: {ex.Message}");
            }

            string? output = result?.choices?[0]?.message?.content;
            if (string.IsNullOrWhiteSpace(output))
                return BadRequest("AI không trả về nội dung.");

            try
            {
                // Clean code block if any
                var cleaned = output.Trim();
                if (cleaned.Contains("```"))
                {
                    var m = Regex.Matches(cleaned, "```(?:json)?\\s*([\\s\\S]*?)\\s*```");
                    if (m.Count > 0)
                        cleaned = m[0].Groups[1].Value.Trim();
                }

                // Deserialize to expected groups
                var groups = JsonConvert.DeserializeObject<List<DuplicateGroup>>(cleaned);
                if (groups == null)
                {
                    // fallback: trả về rỗng
                    return Ok(new List<DuplicateGroup>());
                }

                return Ok(groups);
            }
            catch (Exception ex)
            {
                // Nếu AI trả ra form khác: trả về lỗi kèm raw để debug
                return BadRequest(new
                {
                    message = "Lỗi phân tích kết quả từ AI",
                    exception = ex.Message,
                    rawOutput = output
                });
            }
        }

    }
}
