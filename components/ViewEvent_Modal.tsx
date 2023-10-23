import React from 'react';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isVisible, onClose, children }) => {
  if (!isVisible) return null;

  const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target && (e.target as HTMLDivElement).id === 'wrapper') {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center z-[100]" id="wrapper" onClick={handleClose}>
      <div className="w-[400px] lg:w-[530px] flex flex-col relative p-10 lg:p-0">
        <div>
          <button className="text-slate-500 text-md md:text-lg lg:text-xl absolute top-1 right-3 hover:font-medium mt-10 lg:mt-0 mr-[44px] lg:mr-[10px] z-[150]" onClick={() => onClose()}>x</button>
          <div className="bg-white p-2 rounded-lg shadow-md max-h-[70vh] lg:max-h-[90vh] overflow-y-auto overflow-x-hidden pr-3 lg-pr-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

{/* <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-md max-h-[90vh] overflow-y-auto"> */ }

export default Modal;
