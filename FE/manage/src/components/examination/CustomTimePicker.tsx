"use client";

import React, { useState } from "react";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
};

const CustomTimePicker: React.FC<Props> = ({ value, onChange }) => {
  const [time, setTime] = useState<string | null>(value || null);

  const handleChange = (val: string | null) => {
    setTime(val);
    if (onChange && val) onChange(val);
  };

  return (
    <div className="relative">
      <TimePicker
        onChange={handleChange}
        value={time}
        disableClock={true}
        format="HH:mm"
        clearIcon={null}
        className="w-full custom-timepicker"
      />
      {/* Clock icon bên phải */}
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <style jsx global>{`
        .custom-timepicker .react-time-picker__inputGroup {
          width: 100%;
        }
        .custom-timepicker .react-time-picker__wrapper {
          border-radius: 0.75rem;
          border: 1px solid #d1d5db;
          background: #fff;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          box-shadow: 0 1px 2px 0 #0000000d;
          transition: border 0.2s;
        }
        .custom-timepicker .react-time-picker__wrapper:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px #3b82f633;
        }
        .custom-timepicker .react-time-picker__inputGroup__input {
          font-size: 1rem;
          color: #1e293b;
          background: transparent;
          border: none;
          outline: none;
          width: 2.5rem;
          text-align: center;
        }
        .custom-timepicker .react-time-picker__inputGroup__divider {
          color: #64748b;
          font-size: 1.1rem;
          margin: 0 2px;
        }
        .custom-timepicker .react-time-picker__clear-button,
        .custom-timepicker .react-time-picker__clock-button {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default CustomTimePicker;