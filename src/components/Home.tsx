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
import { IHome } from "../interfaces/IHome";
import { useNavigate } from "react-router";

const ADDRESS = "http://localhost:3030";
const socket = io(ADDRESS, { transports: ["websocket"] });

const Home = ({ username, setUsername, loggedIn, setLoggedIn }: IHome) => {
  const [message, setMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<IUser[]>([]);
  const [chatHistory, setChatHistory] = useState<IMessage[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connection established!");
    });

    socket.on("loggedin", () => {
      console.log("you're logged in!");

      setLoggedIn(true);

      fetchOnlineUsers();

      socket.on("newConnection", () => {
        console.log("watch out! a new challenger appears!");

        fetchOnlineUsers();
      });
    });

    socket.on("message", (newMessage: IMessage) => {
      setChatHistory((chatHistory) => [...chatHistory, newMessage]);
    });
  }, []);

  const handleUsernameSubmit = (e: FormEvent) => {
    e.preventDefault();

    socket.emit("setUsername", { username: username, room: room });
  };

  const handleMessageSubmit = (e: FormEvent) => {
    e.preventDefault();

    const newMessage: IMessage = {
      text: message,
      sender: username,
      socketId: socket.id,
      timestamp: Date.now(),
    };

    socket.emit("sendmessage", { message: newMessage, room: room });

    setChatHistory([...chatHistory, newMessage]);
    setMessage("");
  };

  const fetchOnlineUsers = async () => {
    try {
      let response = await fetch(ADDRESS + "/online-users");
      if (response) {
        let data: { onlineUsers: IUser[] } = await response.json();
        setOnlineUsers(data.onlineUsers);
        console.log(data);
      } else {
        console.log("error fetching the online users");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [room, setRoom] = useState<Room>("blue");

  return (
    <Container fluid className="px-4">
      <Row className="my-3" style={{ height: "95vh" }}>
        <Col md={10} className="d-flex flex-column justify-content-between">
          <Form onSubmit={handleUsernameSubmit} className="d-flex">
            <FormControl
              placeholder="Insert your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loggedIn}
            />
            <Button
              className="ml-2"
              variant={room === "blue" ? "primary" : "danger"}
              onClick={() => setRoom(room === "blue" ? "red" : "blue")}
            >
              Room
            </Button>
          </Form>
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
                <ListGroupItem
                  key={user.socketId}
                  onClick={() => navigate("/chat/" + user.socketId)}
                >
                  {user.username}
                </ListGroupItem>
              ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
