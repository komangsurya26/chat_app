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
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null)
  const messageRef = useRef(null);

  console.log("messagess>>>",messages);

  useEffect(() => {
    messageRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
 

  useEffect(() => {
    const newSocket = io("http://localhost:2001");
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    socket?.emit("addUser", user?.id)
    socket?.on("getUsers", (data) => {
      console.log("getUsers", data);
    })
    socket?.on("getMessage", (data) => {
      console.log("data>>",data);
      setMessages(prev => ({
        ...prev,
        message: [...prev.message || [], {user: data.user, message: data.message}]
      }))
    })
  }, [socket, user]);



  useEffect(() => {
    const loged = JSON.parse(localStorage.getItem("user"));
    const fetchConversation = async () => {
      const res = await fetch(`http://localhost:2001/api/conversation/${loged.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setConversations(data);
    }
    fetchConversation();
  }, []);
 
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`http://localhost:2001/api/users/${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setUsers(data);
    }
    fetchData();
  }, []);

  const fetchMessages = async (conversationId, receiver) => {
    const res = await fetch(
      `http://localhost:2001/api/message/${conversationId}/?senderId=${user?.id}&receiveId=${receiver?.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();
    console.log(data);
    setMessages({ receiver, conversationId, message: data });
  };

  const sendMessage = async () => {
    socket?.emit("sendMessage", {
      senderId: user.id,
      receiveId: messages?.receiver?.id,
      message: message,
      conversationId: messages?.conversationId,
    })
    const res = await fetch(`http://localhost:2001/api/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId: messages?.conversationId,
        senderId: user.id,
        receiveId: messages?.receiver?.id,
        message: message,
      }),
    })
    setMessage('')
  }
  

  return (
    <div className="flex w-screen">
      <ToastContainer position="top-right" />
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
            {conversations?.length > 0 ? (
              conversations?.map(({ conversationId, user }) => {
                return (
                  <div
                    className="flex items-center py-8 border-b"
                  >
                    <div
                      className="cursor-pointer flex items-center"
                      onClick={() => fetchMessages(conversationId, user)}
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
        {messages?.receiver?.fullName && (
          <div className="w-[95%] bg-secondary h-[70px] mt-8 rounded-full flex items-center px-7">
            <div className="border rounded-full">
              <img alt="avatar" src={Avatar} height={50} width={50} />
            </div>
            <div className="ml-6">
              <h3 className="capitalize text-lg font-semibold">
                {messages?.receiver?.fullName}
              </h3>
              <p className="text-sm font-light text-gray-600">
                {messages?.receiver?.email}
              </p>
            </div>
            <div className="ml-auto cursor-pointer">
              <Phone />
            </div>
          </div>
        )}

        <div className="h-[75%] w-full overflow-scroll">
          <div className="p-8">
            {messages?.message?.length > 0 ? (
              messages.message.map((msg) => {
                if (msg.user.id === user?.id) {
                  return (
                    <>
                      <div className="max-w-[40%] bg-primary mb-3 rounded-b-xl rounded-tl-xl ml-auto p-4 text-white">
                        {msg.message}
                      </div>
                      <div ref={messageRef}></div>
                    </>
                  );
                } else {
                  return (
                    <div className="max-w-[40%] bg-secondary rounded-b-2xl rounded-tr-xl p-4 mb-3">
                      {msg.message}
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

        {messages?.receiver?.fullName && (
          <div className="w-[90%] flex pt-5">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={"border-0 shadow-md rounded-full bg-light"}
              placeholder={"Type a message ..."}
            />
            <div
              onClick={() => sendMessage()}
              className={`py-4 px-3 cursor-pointer ${
                !message && "cursor-not-allowed"
              }`}
            >
              <Send />
            </div>
            <div
              className={`py-4 px-3 cursor-pointer ${
                !message && "cursor-not-allowed"
              }`}
            >
              <Plus />
            </div>
          </div>
        )}
      </div>

      <div className="w-[35%] h-screen bg-secondary py-12 px-6">
        <div className="text-lg font-semibold text-primary">People</div>
        <div>
          {users.length > 0 ? (
            users.map(({ user }) => {
              return (
                <div className="flex items-center py-8 border-b">
                  <div
                    onClick={() => fetchMessages("new", user)}
                    className="cursor-pointer flex items-center"
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