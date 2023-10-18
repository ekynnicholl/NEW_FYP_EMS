"use client"

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";


type Login = {
    id: string
    firebase_uid: string;
};

export default function Homepage() {
    const { homepage_backup } = useParams();
    console.log(homepage_backup);

    const supabase = createClientComponentClient();

    const [login, setLogin] = useState<Login>({} as Login);
    const [logins, setLogins] = useState<Login[]>([] as Login[]);

    // Fetch data from database
    useEffect(() => {
        const fetchLogins = async () => {
            const { data } = await supabase.from("login").select("id, firebase_uid");
            setLogins(data || []); // Ensure data is not null
            if (data && data.length > 0) {
                setLogin(data[0]);
            }
        };
        fetchLogins();
    }, []);

    const concatenatedID = login.id + login.firebase_uid

    const testing = (login: Login) => {
        const concatenatedID = login.id + login.firebase_uid
        const homepage = login.id + login.firebase_uid
        if (concatenatedID == homepage) {
            console.log("HAIIIIII")
        }
    }

    if (homepage_backup === concatenatedID) {
        return (
            <div>
                <p>Haiiii</p>
            </div>
        );
    } else {
        return (
            <div>
                <p>NOOOOOOOOOOOOOo</p>
            </div>
        );
    }
}
