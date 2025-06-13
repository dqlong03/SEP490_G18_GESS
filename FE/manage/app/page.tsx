// export default function Home() {
//   return (
//     <h1 className="text-3xl font-bold underline">
//       Hello world!
//     </h1>
//   )
// }

'use client';

import React, { useState } from 'react';
import { PlusCircle, Search } from 'lucide-react'; // Thêm icon tìm kiếm
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import { showToast } from '@utils/toastUtils'; // Import the showToast utility
import "@styles/userinfo.css"; // Make sure the CSS file is imported
import { ToastContainer } from 'react-toastify'; // Import ToastContainer


export default function TestPage() {
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const v = ("Khảo thí" === "Khảo thí");

  // Handle button click
  const handleClick = () => {
    // Simulate success or failure randomly
    const success = Math.random() > 0.5;
    setIsSuccess(success);

    if (success) {
      showToast('success', 'Thành công!');
      console.log(v);
    } else {
      showToast('error', 'Thất bại!');
    }
  };
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <button
          onClick={handleClick}
          className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
        >
          {isSuccess === null ? 'Click me' : isSuccess ? 'Thành công' : 'Thất bại'}
        </button>
        <p>{v}</p>

        {/* Toast container to display notifications */}
         <ToastContainer /> {/* Add ToastContainer here */}
      </div>
    </div>
  );
}
