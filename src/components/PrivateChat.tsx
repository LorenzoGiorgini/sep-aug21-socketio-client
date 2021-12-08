import {
  Container,
  Row,
  Col,
  Form,
  FormControl,
  ListGroup,
  ListGroupItem,
  Button,
} from "react-bootstrap";
import { useState, useEffect, FormEvent } from "react";
import { io } from "socket.io-client";
import { IUser } from "../interfaces/IUser";
import IMessage from "../interfaces/IMessage";
import { Room } from "../interfaces/Room";
import { IPrivateChat } from "../interfaces/IPrivateChat";
import { useNavigate } from "react-router";
import { useParams } from "react-router-dom";

const ADDRESS = "http://localhost:3030";
const socket = io(ADDRESS, { transports: ["websocket"] });

const PrivateChat = ({ username, loggedIn }: IPrivateChat) => {
  const [message, setMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<IUser[]>([]);
  const [chatHistory, setChatHistory] = useState<IMessage[]>([]);
  const { id } = useParams();
  const [room, setRoom] = useState<any>(id);

  useEffect(() => {
    socket.on("privateMessage", (newMessage: IMessage) => {
      console.log("privateMessages");
      setChatHistory((chatHistory) => [...chatHistory, newMessage]);
    });
  }, [socket]);

  const handleMessageSubmit = (e: FormEvent) => {
    e.preventDefault();

    const newMessage: IMessage = {
      text: message,
      sender: username,
      socketId: socket.id,
      timestamp: Date.now(),
    };

    console.log(newMessage);

    console.log(room);

    socket.emit("sendPrivateMessage", { message: newMessage, room: room });

    setChatHistory([...chatHistory, newMessage]);
    setMessage("");
  };

  const fetchOnlineUsers = async () => {
    try {
      let response = await fetch(ADDRESS + "/online-users");
      if (response) {
        let data: { onlineUsers: IUser[] } = await response.json();
        setOnlineUsers(data.onlineUsers);
      } else {
        console.log("error fetching the online users");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container fluid className="px-4">
      <Row className="my-3" style={{ height: "95vh" }}>
        <Col md={10} className="d-flex flex-column justify-content-between">
          <ListGroup>
            {chatHistory.map((message, i) => (
              <ListGroupItem key={i}>
                <strong>{message.sender}</strong>
                <span className="mx-1"> | </span>
                <span>{message.text}</span>
                <span className="ml-2" style={{ fontSize: "0.7rem" }}>
                  {new Date(message.timestamp).toLocaleTimeString("en-US")}
                </span>
              </ListGroupItem>
            ))}
          </ListGroup>
          <Form onSubmit={handleMessageSubmit}>
            <FormControl
              placeholder="Insert your message here"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!loggedIn}
            />
          </Form>
        </Col>
        <Col md={2} style={{ borderLeft: "2px solid black" }}>
          <div className="mb-3">Connected users:</div>
          <ListGroup>
            {onlineUsers.length === 0 && (
              <ListGroupItem>No users yet!</ListGroupItem>
            )}
            {onlineUsers
              .filter((user) => user.room === room)
              .map((user) => (
                <ListGroupItem key={user.socketId}>
                  {user.username}
                </ListGroupItem>
              ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
};

export default PrivateChat;
