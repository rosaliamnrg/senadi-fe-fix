import React from 'react';

const Login = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 font-['Inter']">
      <div className="flex w-4/5 max-w-4xl bg-white rounded-lg overflow-hidden shadow-md">
        <div className="flex-1 p-10">
          <img 
            src="../images/logo.png" 
            alt="Logo BPS" 
            className="w-36 block mb-5" 
          />
          <h2 className="text-[#06344E] font-['Epilogue'] pb-0">Login</h2>
          
          <form id="loginForm" onSubmit={handleSubmit} className="flex flex-col p-0">
            <label htmlFor="email" className="mt-3 text-sm text-gray-600">Email:</label>
            <input 
              type="email" 
              id="email" 
              required 
              className="p-2 mt-1 border border-gray-300 rounded text-sm text-[#696969]" 
            />
            
            <label htmlFor="password" className="mt-3 text-sm text-gray-600">Password:</label>
            <input 
              type="password" 
              id="password" 
              required 
              className="p-2 mt-1 border border-gray-300 rounded text-sm text-[#696969]" 
            />
            
            <button 
              type="submit" 
              className="mt-5 p-2 bg-[#06344E] text-white border-none rounded text-base cursor-pointer hover:bg-[#01162a]"
            >
              Login
            </button>
          </form>
          <p className="mt-3">
            Belum punya akun? <a href="register.html" className="font-bold text-[#06344E] no-underline hover:underline">Daftar di sini</a>
          </p>
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

export default Login;