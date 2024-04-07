import TimelineGraph from '@/components/analytics/timeline_graph'
import { useState } from 'react';

const TimelineNTF = () => {
    const [formStatus, setFormStatus] = useState<string>("revert");
    return (
        <div>
            {/* <TimelineGraph /> */}
            <div className="timeline-container">
                <div className="timeline">
                    <div
                        className={`timeline-item ${formStatus === 'revert' ? 'bg-yellow-200 animate-flash' : 'bg-gray-200'}`}
                        style={{ animationDuration: '1s', animationIterationCount: 'infinite', animationDirection: 'alternate' }}
                    >
                        <div className="timeline-content">
                            <h3>Reverted to Staff</h3>
                            <p>Timestamp: [Insert timestamp]</p>
                        </div>
                    </div>
                    {/* Add other timeline items here */}
                </div>
            </div>
        </div>
    )
};

export default TimelineNTF;