using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.cloudinary
{
    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryService(Cloudinary cloudinary)
        {
            _cloudinary = cloudinary;
        }

        public async Task<string> UploadImageAsync(IFormFile file, string folder)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            await using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = folder,
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = false
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams, "Avatar");

            if (uploadResult.StatusCode != System.Net.HttpStatusCode.OK)
                throw new Exception("Upload failed: " + uploadResult.Error?.Message);

            return uploadResult.SecureUrl.ToString();
        }

        public async Task DeleteImageAsync(string publicId)
        {
            var deletionParams = new DeletionParams(publicId);
            await _cloudinary.DestroyAsync(deletionParams);
        }

        public string? GetPublicIdFromUrl(string? url)
        {
            if (string.IsNullOrEmpty(url)) return null;
            var uri = new Uri(url);
            var segments = uri.AbsolutePath.Split('/');
            if (segments.Length < 6) return null;
            var folder = segments[4];
            var file = segments[5];
            var fileName = System.IO.Path.GetFileNameWithoutExtension(file);
            return $"{folder}/{fileName}";
        }
    }
}
