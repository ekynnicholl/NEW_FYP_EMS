// EventsOnDateModal.tsx
import React from 'react';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  events: any[]; // Adjust the type based on your event data structure
  selectedDate: string;
}

const EventsOnDateModal: React.FC<ModalProps> = ({ isVisible, onClose, events, selectedDate }) => {
  if (!isVisible) return null;

  const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target && (e.target as HTMLDivElement).id === 'wrapper') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center z-[100]"
      id="wrapper"
      onClick={handleClose}
    >
      <div className="w-[400px] lg:w-[600px] flex flex-col relative p-4 lg:p-6">
        <div>
          <button
            className="text-slate-100 font-medium text-xl lg:text-2xl absolute top-1 right-3 transform hover:scale-105"
            onClick={() => onClose()}
          >
            x
          </button>
          <div className="bg-white p-4 rounded lg:rounded-lg shadow-md max-h-[75vh] lg:max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl lg:text-2xl font-semibold mb-4">Events on {selectedDate}</h2>
            {events.length === 0 ? (
              <p>No events found on this date.</p>
            ) : (
              <ul>
                {events.map((event, index) => (
                  <li key={index} className="mb-4">
                    <h3 className="text-lg lg:text-xl font-semibold">{event.intFEventName}</h3>
                    <p className="text-sm lg:text-base text-gray-600">{event.intFEventDescription}</p>
                    {/* Add more event details as needed */}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsOnDateModal;