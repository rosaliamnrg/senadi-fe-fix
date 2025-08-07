import React from 'react';

const ForgotPassword = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="flex w-4/5 max-w-4xl bg-white rounded-lg overflow-hidden shadow-md">
        <div className="flex-1 p-10">
          <img 
            src="../images/logo.png" 
            alt="Logo BPS" 
            className="w-48 block mb-5"
          />
          <h2 className="text-2xl font-bold text-[#06344E] font-['Epilogue']">Reset Password</h2>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <label className="mt-3 text-sm text-gray-600">Email</label>
            <input 
              type="email" 
              placeholder="Masukkan email" 
              required
              className="p-2 mt-1 border border-gray-300 rounded text-base w-full"
            />
            <div className="flex gap-3 mt-5">
              <button 
                type="submit" 
                className="bg-[#D71149] text-white border-none py-2 px-3 rounded text-base cursor-pointer hover:bg-red-700 font-['Inter']"
              >
                Reset Password
              </button>
              <a href="logincoba.html">
                <button 
                  type="button" 
                  className="bg-green-600 text-white border-none py-2 px-3 rounded text-base cursor-pointer hover:bg-green-700 font-['Inter']"
                >
                  Back
                </button>
              </a>
            </div>
          </form>
        </div>
        <div className="flex-1 bg-[#063573] flex justify-center items-center">
          <img 
            src="../images/illustration.png" 
            alt="Illustration" 
            className="w-4/5"
          />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;