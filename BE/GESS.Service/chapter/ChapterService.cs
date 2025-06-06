﻿using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Chapter;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.chapter
{
    public class ChapterService : BaseService<Chapter>, IChapterService
    {
        private readonly IUnitOfWork _unitOfWork;
        public ChapterService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ChapterCreateDTO> CreateChapterAsync(ChapterCreateDTO chapterCreateDto)
        {
            bool chapterExists = _unitOfWork.ChapterRepository.ExistsAsync(c => c.ChapterName == chapterCreateDto.ChapterName).Result;
            if (chapterExists)
            {
                throw new InvalidOperationException("Chapter with the same name already exists.");
            }
            var chapter = new Chapter
            {
               
                ChapterName = chapterCreateDto.ChapterName,
                Description = chapterCreateDto.Description,
                SubjectId = chapterCreateDto.SubjectId
            };

            _unitOfWork.ChapterRepository.Create(chapter);
            await _unitOfWork.SaveChangesAsync();

            return chapterCreateDto;
        }

        public async Task<IEnumerable<ChapterListDTO>> GetAllChaptersAsync()
        {
            var chapters = await _unitOfWork.ChapterRepository.GetAllChaptersAsync();

            return chapters.Select(chapter => new ChapterListDTO
            {
                Id = chapter.ChapterId,
                ChapterName = chapter.ChapterName,
                Description = chapter.Description,
                SubjectName = chapter.Subject?.SubjectName ?? "N/A"
            }).ToList();
        }

        public async Task<ChapterUpdateDTO> UpdateChapterAsync(ChapterUpdateDTO chapterUpdateDTO)
        {
            var chapter = await _unitOfWork.ChapterRepository.GetByIdAsync(chapterUpdateDTO.ChapterId);
            if (chapter == null)
            {
                throw new InvalidOperationException("Không tìm thấy chương.");
            }
            chapter.ChapterName = chapterUpdateDTO.ChapterName;
            chapter.Description = chapterUpdateDTO.Description;
            chapter.SubjectId = chapterUpdateDTO.SubjectId;

            _unitOfWork.ChapterRepository.Update(chapter);
            await _unitOfWork.SaveChangesAsync();

            return chapterUpdateDTO;
        }

        // Implement any specific methods for Chapter here
    }

}
