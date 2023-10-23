import React, { ReactNode, MouseEvent } from 'react';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isVisible, onClose, children }) => {
  if (!isVisible) return null;

  // const handleClose = (e: MouseEvent<HTMLDivElement>) => {
  //   if ((e.target as HTMLDivElement).id === 'wrapper') onClose();
  // };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center z-[999]" id="wrapper">
      <div className="w-[400px] lg:w-[525px] flex flex-col relative p-10 lg:p-0">
        <div>
          <button className="text-slate-500 text-md md:text-lg lg:text-xl absolute top-1 right-3 hover:font-medium mt-10 lg:mt-0 mr-[44px] lg:mr-3" onClick={() => onClose()}>x</button>
          <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
