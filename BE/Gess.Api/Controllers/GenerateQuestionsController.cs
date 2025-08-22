using GESS.Model.APIKey;
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
    public class GenerateQuestionsController : ControllerBase
    {
        private readonly string _apiKey;

        public GenerateQuestionsController(IOptions<APIKeyOptions> apiKeyOptions)
        {
            _apiKey = apiKeyOptions.Value.Key;
        }


        [HttpPost("GenerateMultipleQuestion")]
        public async Task<IActionResult> PostGenerate([FromBody] QuestionRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.SubjectName))
                return BadRequest("SubjectName không được để trống.");
            if (string.IsNullOrWhiteSpace(request.MaterialLink))
                return BadRequest("MaterialLink không được để trống.");
            if (request.Specifications == null || !request.Specifications.Any())
                return BadRequest("Phải cung cấp ít nhất một specification cho loại/độ khó câu hỏi.");

            string materialContent = await GetMaterialContentAsync(request.MaterialLink);
            if (string.IsNullOrWhiteSpace(materialContent))
            {
                return BadRequest("Không thể lấy nội dung tài liệu từ link.");
            }

            var distinctTypes = request.Specifications.Select(s => s.Type).Distinct().ToList();
            if (distinctTypes.Count != 1)
            {
                return BadRequest("Mỗi lần tạo chỉ được phép 1 loại câu hỏi duy nhất. Vui lòng gửi Specifications cùng một Type.");
            }
            var expectedTypeEnum = distinctTypes[0];
            var expectedTypeName = expectedTypeEnum.ToString();

            var totalRequired = request.Specifications.Sum(s => s.NumberOfQuestions);
            if (totalRequired <= 0)
            {
                return BadRequest("Tổng số câu hỏi phải lớn hơn 0.");
            }

            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine($"Bạn là một chuyên gia tạo đề kiểm tra. Hãy tạo các câu hỏi kiểm tra môn {request.SubjectName} dựa trên tài liệu sau:");
            promptBuilder.AppendLine(materialContent);
            promptBuilder.AppendLine("\nYêu cầu chi tiết:");
            foreach (var spec in request.Specifications)
            {
                promptBuilder.AppendLine($"- {spec.NumberOfQuestions} câu hỏi mức độ '{spec.Difficulty}', loại '{expectedTypeName}'");
            }
            promptBuilder.AppendLine("- Dùng đúng tên trường và đúng chữ hoa/chữ thường như sau: Content, Type, Answers, Text, IsTrue.");

            if (expectedTypeEnum == QuestionType.SelectOne)
            {
                promptBuilder.AppendLine($@"
Định dạng đầu ra: MỘT MẢNG JSON gồm CHÍNH XÁC {totalRequired} phần tử. Mỗi phần tử:
{{
  ""Content"": ""Nội dung câu hỏi?"",
  ""Type"": ""SelectOne"",
  ""Answers"": [
    {{ ""Text"": ""Đáp án A"", ""IsTrue"": false }},
    {{ ""Text"": ""Đáp án B"", ""IsTrue"": true }},
    {{ ""Text"": ""Đáp án C"", ""IsTrue"": false }},
    {{ ""Text"": ""Đáp án D"", ""IsTrue"": false }}
  ]
}}
Ràng buộc:
- CHỈ tạo kiểu ""SelectOne"".
- Mỗi câu có ĐÚNG 1 đáp án IsTrue = true.
- MẢNG JSON chỉ được chứa đúng {totalRequired} phần tử (không thừa, không thiếu).
- Không thêm mô tả/tiêu đề/số thứ tự ngoài mảng JSON.
- Trả về CHỈ JSON hợp lệ; nếu có code block ```json ...```, chỉ trả phần JSON bên trong.");
            }
            else if (expectedTypeEnum == QuestionType.MultipleChoice)
            {
                promptBuilder.AppendLine($@"
Định dạng đầu ra: MỘT MẢNG JSON gồm CHÍNH XÁC {totalRequired} phần tử. Mỗi phần tử:
{{
  ""Content"": ""Nội dung câu hỏi?"",
  ""Type"": ""MultipleChoice"",
  ""Answers"": [
    {{ ""Text"": ""A"", ""IsTrue"": true }},
    {{ ""Text"": ""B"", ""IsTrue"": true }},
    {{ ""Text"": ""C"", ""IsTrue"": false }},
    {{ ""Text"": ""D"", ""IsTrue"": false }}
  ]
}}
Ràng buộc:
- CHỈ tạo kiểu ""MultipleChoice"".
- Có thể có nhiều hơn 1 đáp án IsTrue = true (ít nhất 1).
- MẢNG JSON chỉ được chứa đúng {totalRequired} phần tử (không thừa, không thiếu).
- Không thêm mô tả/tiêu đề/số thứ tự ngoài mảng JSON.
- Trả về CHỈ JSON hợp lệ; nếu có code block ```json ...```, chỉ trả phần JSON bên trong.");
            }
            else
            {
                promptBuilder.AppendLine($@"
Định dạng đầu ra: MỘT MẢNG JSON gồm CHÍNH XÁC {totalRequired} phần tử. Mỗi phần tử:
{{
  ""Content"": ""Câu hỏi True/False?"",
  ""Type"": ""TrueFalse"",
  ""Answers"": [
    {{ ""Text"": ""True"",  ""IsTrue"": false }},
    {{ ""Text"": ""False"", ""IsTrue"": true }}
  ]
}}
Ràng buộc:
- CHỈ tạo kiểu ""TrueFalse"".
- Mỗi câu LUÔN có đúng 2 đáp án: ""True"" và ""False"", chỉ 1 đáp án IsTrue = true.
- MẢNG JSON chỉ được chứa đúng {totalRequired} phần tử (không thừa, không thiếu).
- Không thêm mô tả/tiêu đề/số thứ tự ngoài mảng JSON.
- Trả về CHỈ JSON hợp lệ; nếu có code block ```json ...```, chỉ trả phần JSON bên trong.");
            }

            var prompt = promptBuilder.ToString();

            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

            var initialBody = new
            {
                model = "gpt-4o-mini",
                messages = new[]
                {
            new { role = "user", content = prompt }
        }
            };

            var jsonPayload = JsonConvert.SerializeObject(initialBody);
            var response = await httpClient.PostAsync("https://api.openai.com/v1/chat/completions",
                new StringContent(jsonPayload, Encoding.UTF8, "application/json"));

            var responseString = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                return BadRequest("Lỗi khi gọi OpenAI: " + responseString);
            }

            dynamic result;
            try
            {
                result = JsonConvert.DeserializeObject(responseString);
            }
            catch (Exception ex)
            {
                return BadRequest("Không parse được response tổng: " + ex.Message);
            }

            string output = result?.choices?[0]?.message?.content;
            if (string.IsNullOrWhiteSpace(output))
            {
                return BadRequest("Không có nội dung trả về từ AI.");
            }

            try
            {
                // Helper: extract JSON inside code block nếu có
                string ExtractJsonFromString(string s)
                {
                    var t = s?.Trim() ?? string.Empty;
                    if (t.Contains("```"))
                    {
                        var codeBlocks = Regex.Matches(t, "```(?:json)?\\s*([\\s\\S]*?)\\s*```");
                        if (codeBlocks.Count > 0)
                        {
                            return codeBlocks[0].Groups[1].Value.Trim();
                        }
                    }
                    return t;
                }

                // Helper: cố gắng deserialize thành List<Dictionary<string, object>>
                List<Dictionary<string, object>> TryDeserializeList(string s)
                {
                    try
                    {
                        return JsonConvert.DeserializeObject<List<Dictionary<string, object>>>(s);
                    }
                    catch
                    {
                        return null;
                    }
                }

                // Lần parse đầu
                var cleanedOutput = ExtractJsonFromString(output);

                // cumulative list of parsed items (unique by Content if possible)
                var cumulativeList = new List<Dictionary<string, object>>();
                var maxAttempts = 3; // lần thử bổ sung (bao gồm lần gọi ban đầu xem như attempt 1)
                var attempt = 0;
                string currentRaw = cleanedOutput;

                while (attempt < maxAttempts && cumulativeList.Count < totalRequired)
                {
                    attempt++;

                    var parsed = TryDeserializeList(currentRaw);
                    if (parsed != null && parsed.Count > 0)
                    {
                        foreach (var item in parsed)
                        {
                            // lấy field Content để khử trùng
                            string contentVal = string.Empty;
                            if (item.TryGetValue("Content", out var cobj) && cobj != null)
                                contentVal = cobj.ToString().Trim();

                            // if content empty, still add (to avoid infinite skip) but try avoid exact duplicates
                            bool duplicate = cumulativeList.Any(existing =>
                                existing.TryGetValue("Content", out var exC) && (exC?.ToString().Trim() ?? "") == contentVal);

                            if (!duplicate)
                            {
                                cumulativeList.Add(item);
                                if (cumulativeList.Count >= totalRequired) break;
                            }
                        }
                    }

                    if (cumulativeList.Count >= totalRequired) break;

                    // nếu chưa đủ và vẫn còn lượt thử, gọi AI thêm để bổ sung
                    if (attempt >= maxAttempts) break;

                    var missing = totalRequired - cumulativeList.Count;

                    // Chuẩn bị danh sách nội dung đã có để yêu cầu AI không lặp lại
                    var existingContentsPreview = string.Join("\n", cumulativeList
                        .Select(d => d.TryGetValue("Content", out var cc) ? (cc?.ToString().Replace("\n", " ").Trim() ?? "") : "")
                        .Where(s => !string.IsNullOrWhiteSpace(s))
                        .Take(30)
                        .ToList());

                    var followUpPromptBuilder = new StringBuilder();
                    followUpPromptBuilder.AppendLine($"Bạn đã từng trả về một (một phần) mảng JSON theo định dạng đã thống nhất (Type = {expectedTypeName}).");
                    followUpPromptBuilder.AppendLine($"Hiện tại tôi cần thêm **CHÍNH XÁC {missing}** câu nữa để đạt tổng {totalRequired} câu.");
                    followUpPromptBuilder.AppendLine("Yêu cầu CHÍNH: **CHỈ** trả về một mảng JSON gồm CHÍNH XÁC số phần tử vừa yêu cầu (không thêm văn bản, không thêm tiêu đề hoặc ghi chú).");
                    followUpPromptBuilder.AppendLine("Không được lặp lại các câu đã có. Dưới đây là tóm tắt các câu đã có (hãy tránh lặp lại):");
                    followUpPromptBuilder.AppendLine(existingContentsPreview);
                    followUpPromptBuilder.AppendLine($"Vui lòng đảm bảo mỗi phần tử có các trường đúng như trước: Content, Type, Answers, Text, IsTrue. CHỈ tạo Type = {expectedTypeName}.");
                    followUpPromptBuilder.AppendLine($"Nếu trả về trong code block ```json ...```, chỉ gửi phần JSON bên trong. Chỉ trả về đúng một mảng JSON có đúng {missing} phần tử.");

                    var followUpBody = new
                    {
                        model = "gpt-4o-mini",
                        messages = new[]
                        {
                    new { role = "user", content = followUpPromptBuilder.ToString() }
                }
                    };

                    var followUpJson = JsonConvert.SerializeObject(followUpBody);
                    var followResp = await httpClient.PostAsync("https://api.openai.com/v1/chat/completions",
                        new StringContent(followUpJson, Encoding.UTF8, "application/json"));

                    var followRespString = await followResp.Content.ReadAsStringAsync();
                    if (!followResp.IsSuccessStatusCode)
                    {
                        return BadRequest("Lỗi khi gọi OpenAI (lần bổ sung): " + followRespString);
                    }

                    dynamic followResult = JsonConvert.DeserializeObject(followRespString);
                    string followOutput = followResult?.choices?[0]?.message?.content;
                    if (string.IsNullOrWhiteSpace(followOutput))
                    {
                        // không có nội dung trả về từ lần bổ sung -> dừng
                        break;
                    }

                    currentRaw = ExtractJsonFromString(followOutput);
                    // vòng while sẽ parse currentRaw ở đầu vòng lặp tiếp theo và ghép vào cumulativeList
                }

                // Sau vòng lặp, kiểm tra lại
                if (cumulativeList.Count < totalRequired)
                {
                    return BadRequest($"Lỗi AI không sinh đủ câu sau {maxAttempts} lần thử (chỉ sinh được {cumulativeList.Count} / {totalRequired}). Vui lòng thử lại.");
                }

                // Lấy đúng số lượng required (nếu thừa)
                var rawList = cumulativeList.Take(totalRequired).ToList();

                var questions = new List<GeneratedQuestion>();

                foreach (var item in rawList)
                {
                    if (!item.TryGetValue("Content", out var contentObj)) continue;

                    var question = new GeneratedQuestion
                    {
                        Content = contentObj?.ToString() ?? string.Empty,
                        Type = expectedTypeEnum
                    };

                    if (item.TryGetValue("Type", out var typeObj) &&
                        Enum.TryParse<QuestionType>(typeObj?.ToString(), true, out var parsedType))
                    {
                        if (parsedType != expectedTypeEnum)
                        {
                            return BadRequest($"Phát hiện câu hỏi có Type='{parsedType}' khác với loại yêu cầu '{expectedTypeEnum}'. Vui lòng thử lại.");
                        }
                        question.Type = parsedType;
                    }

                    if (item.TryGetValue("Answers", out var answersObj))
                    {
                        try
                        {
                            var answersJson = JsonConvert.SerializeObject(answersObj);
                            question.Answers = JsonConvert.DeserializeObject<List<GeneratedAnswer>>(answersJson)
                                               ?? new List<GeneratedAnswer>();
                        }
                        catch
                        {
                            question.Answers = new List<GeneratedAnswer>();
                        }
                    }

                    if (question.Type == QuestionType.TrueFalse)
                    {
                        if (question.Answers == null || question.Answers.Count != 2 ||
                            !question.Answers.Any(a => string.Equals(a.Text, "True", StringComparison.OrdinalIgnoreCase)) ||
                            !question.Answers.Any(a => string.Equals(a.Text, "False", StringComparison.OrdinalIgnoreCase)))
                        {
                            if (item.TryGetValue("TrueFalseAnswer", out var tfAns))
                            {
                                bool isTrue = false;
                                if (bool.TryParse(tfAns.ToString(), out var b)) isTrue = b;
                                else if (string.Equals(tfAns.ToString(), "True", StringComparison.OrdinalIgnoreCase)) isTrue = true;
                                question.Answers = new List<GeneratedAnswer>
                        {
                            new() { Text = "True", IsTrue = isTrue },
                            new() { Text = "False", IsTrue = !isTrue }
                        };
                            }
                            else
                            {
                                question.Answers = new List<GeneratedAnswer>
                        {
                            new() { Text = "True", IsTrue = true },
                            new() { Text = "False", IsTrue = false }
                        };
                            }
                        }
                    }

                    questions.Add(question);
                }

                if (questions.Count != totalRequired)
                {
                    return BadRequest($"Số lượng câu hỏi sau xử lý là {questions.Count}, không khớp yêu cầu {totalRequired}.");
                }

                return Ok(questions);
            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi phân tích kết quả: " + ex.Message + "\nOutput:\n" + output);
            }
        }


        [HttpPost("GenerateEssayQuestion")]
        public async Task<IActionResult> GenerateEssay([FromBody] PracQuestionRequest request)
        {
            string materialContent = await GetMaterialContentAsync(request.MaterialLink);
            if (string.IsNullOrWhiteSpace(materialContent))
            {
                return BadRequest("Không thể lấy nội dung tài liệu từ link.");
            }

            // Build prompt: yêu cầu sinh câu hỏi tự luận + tiêu chí chấm theo trọng số phần trăm
            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine($"Hãy tạo các câu hỏi tự luận môn {request.SubjectName} dựa trên tài liệu sau:");
            promptBuilder.AppendLine(materialContent);
            promptBuilder.AppendLine("\nYêu cầu chi tiết:");
            foreach (var level in request.Levels)
            {
                promptBuilder.AppendLine($"- {level.NumberOfQuestions} câu hỏi mức độ {level.Difficulty}");
            }

            promptBuilder.AppendLine(@"
                Mỗi câu hỏi phải có định dạng JSON như sau:
                {
                  ""Content"": ""Nội dung câu hỏi tự luận rõ ràng và cụ thể."",
                  ""BandScoreGuide"": [
                    {
                      ""CriterionName"": ""Tên tiêu chí (ví dụ: Độ rõ ràng)"",
                      ""WeightPercent"": 30.0, // phần trăm trọng số của tiêu chí trên tổng (tổng các WeightPercent của một câu phải là 100)
                      ""Description"": ""Mô tả cách chấm tiêu chí này.""
                    },
                    ...
                  ]
                }

                Yêu cầu với BandScoreGuide:
                1. Cho ít nhất 3-5 tiêu chí phù hợp với loại câu hỏi và độ khó (ví dụ: Độ rõ ràng, Nội dung, Tư duy/phân tích, Ngữ pháp, Tính logic, Ví dụ minh họa...)..
                2. Tổng các WeightPercent trong mỗi BandScoreGuide phải là 100. Nếu không, điều chỉnh sao cho tương đối hợp lý và ghi rõ trong mô tả rằng đã cân chỉnh.
                3. Mỗi tiêu chí cần có mô tả ngắn (1-2 câu) giải thích việc chấm.
                4. Trả về toàn bộ danh sách câu hỏi là một mảng JSON hợp lệ, không thêm văn bản khác ngoài cấu trúc JSON. Nếu trả về trong code block như ```json ...```, chỉ lấy phần JSON bên trong.

                Ví dụ đầu ra:
                [
                  {
                    ""Content"": ""Giải thích các yếu tố ảnh hưởng tới tăng trưởng kinh tế trong ngắn hạn và dài hạn."",
                    ""BandScoreGuide"": [
                      {
                        ""CriterionName"": ""Độ rõ ràng"",
                        ""WeightPercent"": 25.0,
                        ""Description"": ""Trình bày mạch lạc, dễ hiểu.""
                      },
                      {
                        ""CriterionName"": ""Tư duy/phân tích"",
                        ""WeightPercent"": 30.0,
                        ""Description"": ""Phân tích đúng nguyên nhân và hệ quả.""
                      },
                      {
                        ""CriterionName"": ""Nội dung chuyên môn"",
                        ""WeightPercent"": 25.0,
                        ""Description"": ""Đúng các khái niệm và lý thuyết liên quan.""
                      },
                      {
                        ""CriterionName"": ""Ví dụ minh họa"",
                        ""WeightPercent"": 20.0,
                                ""Description"": ""Có ví dụ cụ thể để hỗ trợ lập luận.""
                      }
                    ]
                  }
                ]
                ");

            string prompt = promptBuilder.ToString();

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
                var cleanedOutput = output.Trim();

                if (cleanedOutput.Contains("```"))
                {
                    var codeBlocks = Regex.Matches(cleanedOutput, "```(?:json)?\\s*([\\s\\S]*?)\\s*```");
                    if (codeBlocks.Count > 0)
                    {
                        cleanedOutput = codeBlocks[0].Groups[1].Value.Trim();
                    }
                }

                var essayQuestions = JsonConvert.DeserializeObject<List<EssayQuestionResult>>(cleanedOutput);
                if (essayQuestions == null)
                    return BadRequest("Không thể deserialize kết quả thành danh sách câu hỏi.");

                // Hậu xử lý: đảm bảo mỗi BandScoreGuide có total weight ~100, nếu không thì scale lại
                foreach (var q in essayQuestions)
                {
                    var totalWeight = q.BandScoreGuide.Sum(c => c.WeightPercent);
                    if (Math.Abs(totalWeight - 100.0) > 0.1 && totalWeight > 0)
                    {
                        // scale tỷ lệ từng tiêu chí để tổng về 100
                        foreach (var crit in q.BandScoreGuide)
                        {
                            crit.WeightPercent = Math.Round(crit.WeightPercent * 100.0 / totalWeight, 2);
                        }
                        // thêm ghi chú vào mô tả tổng thể nếu cần (có thể mở rộng)
                    }
                }

                return Ok(essayQuestions);
            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi phân tích kết quả trả về: " + ex.Message + "\nOutput:\n" + output);
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

    }
}
