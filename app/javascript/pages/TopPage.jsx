import React, { useState, useEffect } from "react";
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

  const getNavigations = () => {
    axios.get(`${navigatiionsURL}`).then((res) => {
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
        style={{ width: 1024 }}
        className="mx-auto flex flex-col justify-content content-h"
      >
        <Row
          className="my-8"
          style={{
            margin: 20,
            marginTop: 50,
          }}
        >
          {navigations.map((item, i) => (
            <Col key={i} span={8} style={{ margin: 20 }}>
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
