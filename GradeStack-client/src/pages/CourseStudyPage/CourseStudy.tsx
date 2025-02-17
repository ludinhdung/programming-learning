import React from "react"
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
const CourseStudy: React.FC = () => { 
   return (
      <>
         <Header />
         <div className="relative flex justify-center items-center bg-gray-900 h-[800px]">
            <div className="absolute bg-slate-800/90 rounded-3xl w-[80%] h-[80%]">

            </div>
         </div>
         <Footer />
      </>
   );
};
export default CourseStudy;
