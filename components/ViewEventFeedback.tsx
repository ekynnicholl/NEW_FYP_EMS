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
      <div className="w-[1200px] lg:w-[1200px] flex flex-col relative p-10 lg:p-0">
        <div>
          <div className="bg-white rounded-lg border border-slate-200 shadow-md">
            <div className="h-2 w-full bg-red-500 rounded-t-lg"></div>
            <button className="text-slate-500 text-sm md:text-sm lg:text-base absolute top-3 right-3 lg:right-1 hover:font-medium mt-10 lg:mt-1 mr-[44px] lg:mr-[10px] z-[150] dark:text-dark_textbox_title" onClick={() => onClose()}>X</button>
            <div className="p-5 dark:bg-dark_mode_card dark:border-[#253345]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal;
