import { useEffect, useState } from "react";
import axios from "axios";

export default function useRoom(room_id, last_message) {
    const [newLastMessage, setNewLastMessage] = useState(null);
    const [roomIdCurrent, setRoomIdCurrent] = useState(-1);

    const updateLastMessage = async (room_id, last_message) => {

        if (!room_id) return;


        await axios.put(`http://localhost:8080/room/update}`, { room_id, last_message })
            .then(res => {
                let data = res.data;
                console.log("last_message new: " + JSON.stringify(data));
                setRoomIdCurrent(data.id)
                setNewLastMessage(data.last_message);
            })
            .catch(error => console.log(error));
    }

    useEffect(() => updateLastMessage({ room_id, last_message }), [room_id]);

    return [newLastMessage, roomIdCurrent, updateLastMessage];
}