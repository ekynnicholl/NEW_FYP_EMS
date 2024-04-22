import React, { ReactNode, MouseEvent } from 'react';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isVisible, onClose, children }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center z-[999]" id="wrapper">
      <div className="lg:w-[1170px] flex flex-col relative p-10 lg:p-0 dark:bg-dark_mode_card">
        <div>
          <button className="text-slate-500 text-xl md:text-xl lg:text-2xl absolute top-1 right-3 hover:font-medium lg:inline mt-10 lg:mt-0 mr-[53px] lg:mr-1 dark:text-dark_textbox_title" onClick={() => onClose()}>x</button>
          <div className="bg-white p-2 rounded lg:rounded-lg border border-slate-200 shadow-md h-[550px] lg:h-[460px] overflow-y-hidden overflow-x-hidden dark:bg-dark_mode_card dark:border-[#253345]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
