
using Gess.Repository.Infrastructures;
using GESS.Api.HandleException;
using GESS.Auth;
using GESS.Common;
using GESS.Entity.Base;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.Email;
using GESS.Repository.Implement;
using GESS.Repository.Interface;
using GESS.Repository.refreshtoken;
using GESS.Service;
using GESS.Service.authservice;
using GESS.Service.categoryExam;
using GESS.Service.chapter;
using GESS.Service.email;
using GESS.Service.examination;
using GESS.Service.GradeCompoService;
using GESS.Service.major;
using GESS.Service.otp;
using GESS.Service.semesters;
using GESS.Service.student;
using GESS.Service.subject;
using GESS.Service.teacher;
using GESS.Service.trainingProgram;
using GESS.Service.examination;
using GESS.Service.GradeCompoService;
using GESS.Service.major;
using GESS.Service.multipleExam;
using GESS.Service.multipleQuestion;
using GESS.Service.otp;
using GESS.Service.subject;
using GESS.Service.teacher;
using GESS.Service.trainingProgram;
using GESS.Service.users;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.Text;

using GESS.Service.subject;
using GESS.Service.trainingProgram;
using GESS.Service.examination;
using GESS.Service.student;
using GESS.Service.exam;

var builder = WebApplication.CreateBuilder(args);

// Google login
builder.Services.AddAuthentication()
    .AddGoogle(options =>
    {
        options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
        options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
    });

// Thêm cấu hình CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") // Thay bằng domain của frontend Next.js
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); // Nếu cần gửi cookie hoặc token
        });
});

// Add services to the container
builder.Services.AddControllers();

// Thêm logging
builder.Services.AddLogging();

// Cấu hình Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "GESS API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Đăng ký IUnitOfWork với factory delegate
builder.Services.AddScoped<IUnitOfWork>(provider =>
{
    var context = provider.GetRequiredService<GessDbContext>();
    var userManager = provider.GetRequiredService<UserManager<User>>();
    var roleManager = provider.GetRequiredService<RoleManager<IdentityRole<Guid>>>(); // Sửa thành IdentityRole<Guid>
    return new UnitOfWork(context, userManager, roleManager);
});
builder.Services.AddScoped<IBaseService<BaseEntity>, BaseService<BaseEntity>>();

// Đăng ký DbContext
builder.Services.AddDbContext<GessDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("GessDb")));

// Đăng ký Identity
builder.Services.AddIdentity<User, IdentityRole<Guid>>()
    .AddEntityFrameworkStores<GessDbContext>()
    .AddDefaultTokenProviders();

// Đăng ký Service
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IChapterService, ChapterService>();
builder.Services.AddScoped<ITeacherService, TeacherService>();
builder.Services.AddScoped<IMajorService, MajorService>();
builder.Services.AddScoped<ISubjectService, SubjectService>();
builder.Services.AddScoped<IMultipleExamService, MultipleExamService>();
builder.Services.AddScoped<ITrainingProgramService, TrainingProgramService>();
builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.AddScoped<IExaminationService, ExaminationService>();
builder.Services.AddScoped<IClassService, ClassService>();
builder.Services.AddScoped<ICategoryExamService, CategoryExamService>();
builder.Services.AddScoped<IMultipleQuestionService, MultipleQuestionService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<IExamService, GESS.Service.exam.ExamService>();

// ThaiNH_Initialize_Begin
builder.Services.AddScoped<ICateExamSubService, CateExamSubService>();
builder.Services.AddScoped<ISemestersService, SemestersService>();

// Đăng ký các repository
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IChapterRepository, ChapterRepository>();
builder.Services.AddScoped<ITeacherRepository, TeacherRepository>();
builder.Services.AddScoped<IExaminationRepository, ExaminationRepository>();
builder.Services.AddScoped<IMajorRepository, MajorRepository>();
builder.Services.AddScoped<ISubjectRepository, SubjectRepository>();
builder.Services.AddScoped<ITrainingProgramRepository, TrainingProgramRepository>();
builder.Services.AddScoped<IClassRepository, ClassRepository>();
builder.Services.AddScoped<IMultipleExamRepository, MultipleExamRepository>();
builder.Services.AddScoped<ICategoryExamRepository, CategoryExamRepository>();
builder.Services.AddScoped<IMultipleQuestionRepository, MultipleQuestionRepository>();
builder.Services.AddScoped<IStudentRepository, StudentRepository>();
builder.Services.AddScoped<ISemesterRepository, SemesterRepository>();
builder.Services.AddScoped<ICateExamSubRepository, CateExamSubRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<IExamRepository, ExamRepository>();

// Đăng ký EmailService
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddScoped<EmailService>();
builder.Services.AddMemoryCache();

// Cấu hình JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = Constants.Issuer,
        ValidAudience = Constants.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Constants.SecretKey))
    };
});

// Khởi tạo Constants
Constants.Initialize(builder.Configuration);

var app = builder.Build();

// Seed dữ liệu
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        await SeedData.InitializeAsync(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "GESS API V1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHsts();
app.UseHttpsRedirection();

// Sử dụng CORS
app.UseCors("AllowFrontend");
app.UseHttpsRedirection();

// Sử dụng CORS trước UseAuthentication/UseAuthorization
app.UseCors("AllowFrontend");

// ThaiNH_Initialize_Begin
app.UseMiddleware<ExceptionMiddleware>(); // Register Middleware Exception
// ThaiNH_Initialize_End

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

