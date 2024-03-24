import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Row, Layout, Card, Col, Button } from "antd";
import axios from "axios";
const { Header, Content, Footer } = Layout;
import { useAuth } from "../hooks/useAuth.js";
import { Link } from "react-router-dom";
import { navigatiionsURL } from "../utils/constants.js";
// import "./shake.css"; // Import CSS file for animation styles

const Top = () => {
  const [navigations, setNavigations] = useState([]);
  // const [shakeScreen, setShakeScreen] = useState(false); // State variable for shaking the screen
  const navigate = useNavigate();

  const getNavigations = () => {
    console.log("top page................");
    axios
      .get(`${navigatiionsURL}`)
      .then((res) => {
        let index = 1;
        const allData = res.data.map((item) => {
          return {
            ...item,
            key: item.path,
            label: item.name,
            url: item.path,
            title: `${index++}. ${item.name}`,
          };
        });
        setNavigations(allData.slice(0, -3));
      })
      .catch((error) => {
        navigate("/signin");
      });
  };

  useEffect(() => {
    getNavigations();
  }, []);

  const authState = useAuth();

  const handleButtonClick = () => {
    // Toggle shakeScreen state to trigger the animation
    // setShakeScreen(true);
    // setTimeout(() => {
    //   setShakeScreen(false);
    // }, 1000); // Reset shakeScreen state after 1 second (adjust duration as needed)
  };

  return (
    // <div className={shakeScreen ? "shakeScreen" : ""}>
    <div>
      <Content
        className="mx-auto flex flex-col justify-content content-h"
        style={{ width: 1024 }}
      >
        <Row
          style={{
            margin: 20,
          }}
        >
          {navigations.map((item, i) => (
            <Col key={i} span={7} style={{ margin: 20 }}>
              <Link to={item.key} key={i}>
                <Card bordered={false}>{item.title}</Card>
              </Link>
            </Col>
          ))}
        </Row>
      </Content>
    </div>
  );
};

export default Top;
