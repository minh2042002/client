import Head from 'next/head'
import React, { useEffect, useState } from 'react'

import Avatar from '../components/avatar'
import ChatList from '../components/rooms'
import Conversation from '../components/conversation'
import Login from '../components/login'
import useConversations from '../libs/useConversation'
import useLocalStorage from '../libs/useLocalStorage'
import useWebsocket from '../libs/useWebsocket'
import useRoom from '@/libs/useRoom'

export default function Home() {
  const [room, setSelectedRoom] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLogin, setLogined] = useState(false);
  const [showLogIn, setShowLogIn] = useState(false);
  const [auth, setAuthUser] = useLocalStorage("user", false);
  const [isLoading, messages, setMessages, fetchConversations] = useConversations("");
  const [newLastMessage, roomIdCurrent, updateLastMessage] = useRoom("");
  // Cập nhật trạng thái để hiển thị chỉ báo nhập
  const handleTyping = (mode) => {
    if (mode === "IN") {
      setIsTyping(true)
    } else {
      setIsTyping(false)
    }
  }

  // Xử lý các tin nhắn đến và đi đến trạng thái
  const handleMessage = (msg, userId) => {
    setMessages(prev => {
      const item = { content: msg, user_id: userId };
      return [...prev, item];
    })
  }
  // Xử lý tin nhắn được truy xuất từ máy chủ WebSocket
  const onMessage = (data) => {
    try {
      let messageData = JSON.parse(data);
      switch (messageData.chat_type) {
        case "TYPING": {
          handleTyping(messageData.value[0]);
          return;
        }
        case "TEXT": {
          handleMessage(messageData.value[0], messageData.user_id);
          return;
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  const sendMessage = useWebsocket(onMessage)

  // Cho máy chủ WebSocket biết nếu người dùng hiện tại vẫn đang nhập tin nhắn
  const updateFocus = () => {
    const data = {
      id: 0,
      chat_type: "TYPING",
      value: ["IN"],
      room_id: room.id,
      user_id: auth.id
    }
    sendMessage(JSON.stringify(data))
  }

  // Cho phép máy chủ WebSocket biết khi người dùng hiện tại nhập xong
  const onFocusChange = () => {
    const data = {
      id: 0,
      chat_type: "TYPING",
      value: ["OUT"],
      room_id: room.id,
      user_id: auth.id
    }
    sendMessage(JSON.stringify(data))
  }


  // Cập nhật trạng thái tin nhắn và sau đó gửi tin nhắn đến máy chủ khi người dùng nhấn nút gửi
  const submitMessage = (e) => {
    e.preventDefault();
    let message = e.target.message.value;
    if (message === "") {
      return;
    }

    if (!room.id) {
      alert("Please select chat room!")
      return
    }

    const data = {
      id: 0,
      chat_type: "TEXT",
      value: [message],
      room_id: room.id,
      user_id: auth.id
    }
    sendMessage(JSON.stringify(data))
    e.target.message.value = "";
    handleMessage(message, auth.id);
    onFocusChange();
    updateLastMessage(data.id, data.last_message);
  }

  // Tìm nạp cuộc trò chuyện của phòng nhất định khi người dùng chuyển phòng trò chuyện
  const updateMessages = async (data) => {
    if (!data.id) return;
    await fetchConversations(data.id)
    setSelectedRoom(data);
  }


  // Cập nhật trạng thái để đăng xuất và xóa dữ liệu người dùng khỏi bộ nhớ cục bộ
  const signOut = () => {
    window.localStorage.removeItem("user");
    setLogined(false);
    setAuthUser(false);
  }

  useEffect(() => setShowLogIn(!auth), [auth]);

  return (
    <div>
      {!isLogin ? <Login show={showLogIn} setAuth={setAuthUser} setLogin={setLogined} /> :
        <div className={`${!auth && 'hidden'} bg-gradient-to-b from-orange-400 to-rose-400 h-screen p-12`}>
          <main className='flex w-full max-w-[1020px] h-[700px] mx-auto bg-[#FAF9FE] rounded-[25px] backdrop-opacity-30 opacity-95'>
          <aside className='bg-[#F0EEF5] w-[325px] h-[700px] rounded-l-[25px] p-4 overflow-auto relative'> 
            <ChatList onChatChange={updateMessages} userId={auth.id} />
            <button onClick={signOut} className='text-xs w-full max-w-[295px] p-3 rounded-[10px] bg-violet-200 font-semibold text-violet-600 text-center absolute bottom-4'>LOG OUT</button>
          </aside>
            
            {room?.id && (<section className='rounded-r-[25px] w-full max-w-[690px] grid grid-rows-[80px_minmax(450px,_1fr)_65px]'>
              <div className='rounded-tr-[25px] w-ful'>
                <div className='flex gap-3 p-3 items-center'>
                  <Avatar color='rgb(245 158 11)'>{room.users.get_target_user(auth.id)}</Avatar>
                  <div>
                    <p className='font-semibold text-gray-600 text-base'>{room.users.get_target_user(auth.id)}</p>
                    <div className='text-xs text-gray-400'>{isTyping ? "Typing..." : "10:15 AM"}</div>
                  </div>
                </div>
                <hr className='bg-[#F0EEF5]' />
              </div>
              {(isLoading && room.id) && <p className="px-4 text-slate-500">Loading conversation...</p>}
              <Conversation data={messages} auth={auth} users={room.users} />
              <div className='w-full'>
                <form onSubmit={submitMessage} className='flex gap-2 items-center rounded-full border border-violet-500 bg-violet-200 p-1 m-2'>
                  <input
                    onBlur={onFocusChange}
                    onFocus={updateFocus}
                    name="message"
                    className='p-2 placeholder-gray-600 text-sm w-full rounded-full bg-violet-200 focus:outline-none'
                    placeholder='Type your message here...' />
                  <button type='submit' className='bg-violet-500 rounded-full py-2 px-6 font-semibold text-white text-sm'>Sent</button>
                </form>
              </div>
            </section>)}
            
          </main>
        </div>

      }

    </div>
  );

}