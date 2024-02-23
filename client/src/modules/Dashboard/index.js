/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from 'react'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ReactComponent as Phone } from "../../assets/phone.svg";
import { ReactComponent as Send } from "../../assets/send.svg";
import { ReactComponent as Plus } from "../../assets/plus.svg";
import Avatar from "../../assets/avatar.png";
import NoImage from "../../assets/noimage.png";
import Input from '../../components/Input'
import { io } from "socket.io-client";


const Dashboard = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user"))); 
  const [users, setusers] = useState([]);
  const [message, setMessage] = useState({});
  const [messages, setMessages] = useState("");
  const [conversation, setConversation] = useState([]);
  const [conversationss, setConversationss] = useState([]);
  const [socket, setSocket] = useState(null)
  const messageRef = useRef(null);

  useEffect(() => {
    messageRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);
  

  useEffect(() => {
    const newSocket = io("http://localhost:2000")
    setSocket(newSocket)
  }, [])

  useEffect(() => {
    socket?.emit("addUser", user?.id);
    socket?.on("getUsers", () => {});
    socket?.on("getMessage", (data) => {
      setMessage((prev) => ({
        ...prev,
        message: [
          ...prev.message,
          { message: data.message, user: { id: data.senderId } },
        ],
      }));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);


  useEffect(() => {
    const loged = JSON.parse(localStorage.getItem("user"));
    const fetchDataConversation = async () => {
      const res = await fetch(`http://localhost:2001/api/conversation/?userId=${loged.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setConversation(data);
    }
    fetchDataConversation();
  }, []);
 
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`http://localhost:2001/api/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setusers(data);
    }
    fetchData();
  }, []);
  

  const fetchMessage = async (conversationId, user) => {
    const res = await fetch(`http://localhost:2001/api/message/?conversationId=${conversationId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    setMessage({conversationId, user, message: data});
  }

  const sendMessage = async () => {
    socket?.emit("sendMessage", {
      message: messages,
      senderId: user.id,
      receiveId: message?.user?.id,
      conversationId: message?.conversationId,
    });
    const res = await fetch(`http://localhost:2001/api/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conversationId: message?.conversationId, senderId: user.id, receiveId: message?.user?.id, message: messages }),
    });
    messages && setMessages("");
  }

  const newConversation = async (userId) => {
    const res = await fetch(`http://localhost:2001/api/conversation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({senderId: user.id, receiveId: userId}),
    });
    const data = await res.json();
    if (res.status === 400) {
      toast.error(data);
    } else {
      toast.success(data);
    }
    setConversationss(data);
  }

  return (
    <div className="flex w-screen">
      <ToastContainer position='top-right'/>
      <div className="w-[25%] border h-screen bg-secondary">
        <div className="flex items-center mx-14 py-8">
          <div className="border border-primary p-[2px] rounded-full">
            <img alt="avatar" src={Avatar} height={75} width={75} />
          </div>
          <div className="ml-8">
            <h3 className="capitalize text-xl font-bold">{user?.fullName}</h3>
            <p className="text-sm font-light">My Account</p>
          </div>
        </div>
        <hr />
        <div className="text-2xl text-primary justify-start items-center py-2 mx-10 font-bold">
          Chat
        </div>
        <div className="max-h-[calc(100vh-200px)] ml-10 mt-2 overflow-scroll">
          <div>
            {conversation.length > 0 ? (
              conversation.map(({ user, conversationId }) => {
                return (
                  <div
                    key={user.id}
                    className="flex items-center py-8 border-b"
                  >
                    <div
                      className="cursor-pointer flex items-center"
                      onClick={() => fetchMessage(conversationId, user)}
                    >
                      <div>
                        <img
                          className="border border-black rounded-full"
                          alt="avatar"
                          src={NoImage}
                          height={50}
                          width={50}
                        />
                      </div>
                      <div className="ml-8">
                        <h3 className="capitalize text-lg font-semibold">
                          {user.fullName}
                        </h3>
                        <p className="text-sm font-light text-gray-600">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-lg font-semibold mt-24">
                No Conversation
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-[40%] h-screen bg-white flex flex-col items-center">
        {message?.user?.id ? (
          <div className="w-[95%] bg-secondary h-[70px] mt-8 rounded-full flex items-center px-7">
            <div className="border rounded-full">
              <img alt="avatar" src={Avatar} height={50} width={50} />
            </div>
            <div className="ml-6">
              <h3 className="capitalize text-lg font-semibold">
                {message?.user?.fullName}
              </h3>
              <p className="text-sm font-light text-gray-600">
                {message?.user?.email}
              </p>
            </div>
            <div className="ml-auto cursor-pointer">
              <Phone />
            </div>
          </div>
        ) : (
          <div className="w-[95%] bg-secondary h-[70px] mt-8 rounded-full flex items-center px-7">
            <div className="border rounded-full">
              <img alt="avatar" src={Avatar} height={50} width={50} />
            </div>
            <div className="ml-6">
              <h3 className="capitalize text-lg font-semibold">
                {user?.fullName}
              </h3>
              <p className="text-sm font-light text-gray-600">{user?.email}</p>
            </div>
            <div className="ml-auto cursor-pointer">
              <Phone />
            </div>
          </div>
        )}

        <div className="h-[75%] w-full overflow-scroll">
          <div className="p-8">
            {message?.message?.length > 0 ? (
              message.message.map(({ message, user: { id } = {} }, index) => {
                if (id === user.id) {
                  return (
                    <>
                    <div
                      ref={messageRef}
                      key={index}
                      className="max-w-[40%] bg-primary mb-3 rounded-b-xl rounded-tl-xl ml-auto p-4 text-white"
                    >
                      {message}
                    </div>
                    </>
                  );
                } else {
                  return (
                    <div
                      key={index}
                      className="max-w-[40%] bg-secondary rounded-b-2xl rounded-tr-xl p-4 mb-3"
                    >
                      {message}
                    </div>
                  );
                }
              })
            ) : (
              <div className="capitalize text-center text-lg font-semibold mt-24">
                no message
              </div>
            )}
          </div>
        </div>
        <div className="w-[90%] flex pt-5">
          <Input
            value={messages}
            onChange={(e) => setMessages(e.target.value)}
            className={"border-0 shadow-md rounded-full bg-light"}
            placeholder={"Type a message ..."}
          />
          <div onClick={sendMessage} className={`py-4 px-3 cursor-pointer`}>
            <Send />
          </div>
          <div className="cursor-pointer py-4 px-3">
            <Plus />
          </div>
        </div>
      </div>

      <div className="w-[35%] h-screen bg-secondary py-12 px-6">
        <div className='text-lg font-semibold text-primary'>People</div>
        <div>
          {users.length > 0 ? (
            users.map(({ user, userId }) => {
              return (
                <div key={userId} className="flex items-center py-8 border-b">
                  <div
                    className="cursor-pointer flex items-center"
                    onClick={() => newConversation(userId)}
                  >
                    <div>
                      <img
                        className="border border-black rounded-full"
                        alt="avatar"
                        src={NoImage}
                        height={50}
                        width={50}
                      />
                    </div>
                    <div className="ml-8">
                      <h3 className="capitalize text-lg font-semibold">
                        {user.fullName}
                      </h3>
                      <p className="text-sm font-light text-gray-600">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-lg font-semibold mt-24">
              No People
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard