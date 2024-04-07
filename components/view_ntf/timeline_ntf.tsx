import { useEffect, useState } from 'react';
import { MdKeyboardDoubleArrowRight } from 'react-icons/md';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';

interface TimelineNTFProps {
    formStage: number;
    selectedFormId: string;
}

const TimelineNTF: React.FC<TimelineNTFProps> = ({ selectedFormId, formStage }) => {
    const [flashStage, setFlashStage] = useState<number>(-1);

    useEffect(() => {
        switch (formStage) {
            case 1:
                setFlashStage(1);
                break;
            case 2:
                setFlashStage(2);
                break;
            case 3:
                setFlashStage(3);
                break;
            case 4:
                setFlashStage(4);
                break;
            case 5:
                setFlashStage(5);
                break;
            case 6:
                setFlashStage(6);
                break;
            default:
                setFlashStage(-1);
                break;
        }
    }, [formStage]);

    return (
        <div>
            <div className="ml-5 mr-5 text-left">
                <a
                    href={`/form/external/${selectedFormId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center bg-slate-900 text-white font-bold py-[11px] lg:py-3 pl-8 pr-6 rounded focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-sm lg:text-base`}
                >
                    View Actual Forms
                    <MdKeyboardDoubleArrowRight className="ml-2" />
                </a>
            </div>
            <VerticalTimeline lineColor={'black'}>
                <VerticalTimelineElement
                    className={`vertical-timeline-element ${flashStage === 1 ? 'flash-timeline' : ''}`}
                    contentStyle={{ background: flashStage === 1 ? 'red' : flashStage > 1 ? 'green' : 'orange', color: '#fff' }}
                    contentArrowStyle={{ borderRight: `7px solid ${flashStage === 1 ? 'red' : flashStage > 1 ? 'green' : 'orange'}` }}
                    date="Stage 1"
                    iconStyle={{ background: flashStage === 1 ? 'red' : flashStage > 1 ? 'green' : 'orange', color: '#fff' }}
                    icon={<i className="fas fa-briefcase"></i>}
                    visible={true}
                >
                    <h3 className="vertical-timeline-element-title font-bold">Reverted to Staff (If Applicable)</h3>
                </VerticalTimelineElement>

                <VerticalTimelineElement
                    className={`vertical-timeline-element ${flashStage === 2 ? 'flash-timeline' : ''}`}
                    contentStyle={{ background: flashStage === 2 ? 'red' : flashStage > 2 ? 'green' : 'orange', color: '#fff' }}
                    contentArrowStyle={{ borderRight: `7px solid ${flashStage === 2 ? 'red' : flashStage > 2 ? 'green' : 'orange'}` }}
                    date="Stage 2"
                    iconStyle={{ background: flashStage === 2 ? 'red' : flashStage > 2 ? 'green' : 'orange', color: '#fff' }}
                    icon={<i className="fas fa-check-circle"></i>}
                    visible={true}
                >
                    <h3 className="vertical-timeline-element-title font-bold">Submitted Successfully (Under AAO Review)</h3>
                </VerticalTimelineElement>

                <VerticalTimelineElement
                    className={`vertical-timeline-element ${flashStage === 3 ? 'flash-timeline' : ''}`}
                    contentStyle={{ background: flashStage === 3 ? 'red' : flashStage > 3 ? 'green' : flashStage > 3 ? 'green' : 'orange', color: '#fff' }}
                    contentArrowStyle={{ borderRight: `7px solid ${flashStage === 3 ? 'red' : flashStage > 3 ? 'green' : flashStage > 3 ? 'green' : 'orange'}` }}
                    date="Stage 3"
                    iconStyle={{ background: flashStage === 3 ? 'red' : flashStage > 3 ? 'green' : flashStage > 3 ? 'green' : 'orange', color: '#fff' }}
                    icon={<i className="fas fa-check-circle"></i>}
                    visible={true}
                >
                    <h3 className="vertical-timeline-element-title font-bold">Reviewed Successfully (Under Verification by)</h3>
                </VerticalTimelineElement>

                <VerticalTimelineElement
                    className={`vertical-timeline-element ${flashStage === 4 ? 'flash-timeline' : ''}`}
                    contentStyle={{ background: flashStage === 4 ? 'red' : flashStage > 4 ? 'green' : 'orange', color: '#fff' }}
                    contentArrowStyle={{ borderRight: `7px solid ${flashStage === 4 ? 'red' : flashStage > 4 ? 'green' : 'orange'}` }}
                    date="Stage 4"
                    iconStyle={{ background: flashStage === 4 ? 'red' : flashStage > 4 ? 'green' : 'orange', color: '#fff' }}
                    icon={<i className="fas fa-check-circle"></i>}
                    visible={true}
                >
                    <h3 className="vertical-timeline-element-title font-bold">Verified Successfully (Under Approval by)</h3>
                </VerticalTimelineElement>

                <VerticalTimelineElement
                    className={`vertical-timeline-element ${flashStage === 5 ? 'flash-timeline' : ''}`}
                    contentStyle={{ background: flashStage === 5 ? 'red' : flashStage === 6 ? 'green' : 'orange', color: '#fff' }}
                    contentArrowStyle={{ borderRight: `7px solid ${flashStage === 5 ? 'red' : flashStage === 6 ? 'green' : 'orange'}` }}
                    date="Stage 5"
                    iconStyle={{ background: flashStage === 5 ? 'red' : flashStage === 6 ? 'green' : 'orange', color: '#fff' }}
                    icon={<i className="fas fa-ban"></i>}
                    visible={true}
                >
                    <h3 className={`vertical-timeline-element-title font-bold ${formStage === 5 || formStage === 6 ? 'text-red' : ''}`}>
                        {formStage === 5 ? 'Rejected' : formStage === 6 ? 'Approved' : 'Rejected/ Approved'}
                    </h3>
                </VerticalTimelineElement>
            </VerticalTimeline>
        </div >
    )
};

export default TimelineNTF;