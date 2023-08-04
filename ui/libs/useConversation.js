import { useEffect, useState } from "react";
import axios from "axios";

export default function useConversations(room_id) {
    const [isLoading, setIsLoading] = useState(true);
    const [messages, setMessages] = useState([]);

    const fetchConversations = async (room_id) => {
        setIsLoading(true);

        if (!room_id) return;

        await axios.get(`http://localhost:8080/conversations/${room_id}`)
            .then(res => {
                const is_data_valid = res.data && res.data.length;
                const data = is_data_valid ? res.data : [];
                console.log("conversation in useConversation: " + JSON.stringify(data));    
                setIsLoading(false);
                setMessages(data);
            })
            .catch(error => console.log(error));
    }

    useEffect(() => fetchConversations(room_id), [room_id]);

    return [isLoading, messages, setMessages, fetchConversations];
}
