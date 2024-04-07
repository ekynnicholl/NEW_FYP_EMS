import React, { ReactNode, MouseEvent } from 'react';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isVisible, onClose, children }) => {
  if (!isVisible) return null;

  const handleClose = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLDivElement).id === 'wrapper') onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center z-[999]" id="wrapper" onClick={handleClose}>
      <div className="lg:w-[1750px] w-[450px] flex flex-col relative p-10 lg:p-0">
        <div>
          <div className="bg-white rounded-lg border border-slate-200 shadow-md dark:text-dark_textbox_title dark:bg-dark_mode_card dark:border-[#253345]">
            <div className="h-2 w-full bg-red-500 rounded-t-lg"></div>
            <button className="text-slate-500 text-md md:text-lg lg:text-[40px] absolute top-3 right-3 lg:right-1 hover:font-medium mt-10 lg:mt-0 mr-[44px] lg:mr-[44px] z-[150] " onClick={() => onClose()}>x</button>
            <div className="p-5">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal;
