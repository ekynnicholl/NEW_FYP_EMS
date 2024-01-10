import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Commits {
    sha: string;
    commit: {
        message: string;
        author: {
            name: string;
            date: string;
        };
    };
}

const UpdateLogs: React.FC = () => {
    const [commits, setCommits] = useState<Commits[]>([]);

    useEffect(() => {
        const fetchCommits = async () => {
            try {
                const response = await axios.get<Commits[]>(
                    'https://api.github.com/repos/Pinkslushie/NEW_FYP_EMS/commits', {
                    headers: {
                        Authorization: `Bearer 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`,
                    },
                },
                );

                setCommits(response.data);
            } catch (error) {
                console.error('Error fetching commits:', error);
            }
        };

        fetchCommits();
    }, []);

    return (
        <div className="p-4 mb-4 bg-white rounded-lg shadow-lg dark:bg-dark_mode_card text-center">
            <h1 className="font-bold pt-5 text-[20px] dark:text-dark_text">Update Logs</h1>
            <div className="border-t border-gray-300 my-2"></div>
            <ul>
                {commits.map((commit) => (
                    <li key={commit.sha}>
                        <p className="font-bold">{new Date(commit.commit.author.date).toLocaleString()} | By: {commit.commit.author.name}</p>
                        <p>{commit.commit.message}</p>
                        <br />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UpdateLogs;
