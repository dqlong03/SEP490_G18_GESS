'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import { Pie, Bar } from 'react-chartjs-2'; // Import chart components
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale } from 'chart.js'; // Required chart.js components

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale); // Register chart.js components

// Fake data (Student statistics, Classrooms, Departments, Courses, Teachers, Students, Examiners)
const studentData = {
  labels: ['Computer Science', 'Electrical Engineering', 'Business Administration', 'Mechanical Engineering'],
  datasets: [
    {
      label: 'Students per Department',
      data: [120, 80, 150, 60],
      backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33B8'],
      borderColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33B8'],
      borderWidth: 1,
    },
  ],
};

const classroomData = {
  labels: ['Classroom A', 'Classroom B', 'Classroom C', 'Classroom D'],
  datasets: [
    {
      label: 'Students per Classroom',
      data: [30, 25, 35, 20],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      borderWidth: 1,
    },
  ],
};

const courseData = {
  labels: ['Math 101', 'Physics 101', 'Chemistry 101', 'Computer Science 101'],
  datasets: [
    {
      label: 'Course Enrollment',
      data: [200, 150, 120, 180],
      backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33B8'],
      borderColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33B8'],
      borderWidth: 1,
    },
  ],
};

const departmentData = {
  labels: ['Department 1', 'Department 2', 'Department 3', 'Department 4'],
  datasets: [
    {
      label: 'Departments and Their Courses',
      data: [6, 4, 8, 5],
      backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33B8'],
      borderColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33B8'],
      borderWidth: 1,
    },
  ],
};

// New chart data for teachers, students, and examiners
const staffData = {
  labels: ['Teachers', 'Students', 'Examiners'],
  datasets: [
    {
      label: 'Staff Distribution',
      data: [30, 200, 10], // Example numbers for teachers, students, and examiners
      backgroundColor: ['#FF5733', '#33FF57', '#3357FF'],
      borderColor: ['#FF5733', '#33FF57', '#3357FF'],
      borderWidth: 1,
    },
  ],
};

export default function Dashboard() {
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 p-6">
       

        {/* Statistics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Student Statistics Pie Chart */}
          {/* <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Students per Department</h3>
            <Pie data={studentData} />
          </div> */}

          {/* Classroom Statistics Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Students per Classroom</h3>
            <Bar data={classroomData} />
          </div>

          {/* Course Enrollment Statistics
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Course Enrollment</h3>
            <Bar data={courseData} />
          </div> */}

          {/* Department and Courses Statistics */}
          <div className="bg-white p-6 rounded-lg shadow-md col-span-2 lg:col-span-1">
            <h3 className="text-xl font-semibold mb-4">Departments and Their Courses</h3>
            <Bar data={departmentData} />
          </div>

          {/* Staff Distribution Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md col-span-2 lg:col-span-1">
            <h3 className="text-xl font-semibold mb-4">Teachers, Students, and Examiners</h3>
            <Pie data={staffData} />
          </div>
        </div>
      </div>
    </div>
  );
}
