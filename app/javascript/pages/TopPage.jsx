import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";

import { Row, Layout, Card, Col, Alert } from "antd";
import axios from "axios";
const { Header, Content, Footer } = Layout;
import { useAuth } from "../hooks/useAuth.js";
import { Link } from "react-router-dom";
import { navigatiionsURL } from "../utils/constants.js";
// import "./shake.css"; // Import CSS file for animation styles

const Top = () => {
  const [navigations, setNavigations] = useState([]);
  const [isVisibleAlert, setIsVisibleAlert] = useState(false);
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
    if (moment().format("D") < 5) {
      setIsVisibleAlert(true);
    } else setIsVisibleAlert(false);
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
          倉庫番へようこそ
        </Row>
        <Row
          style={{
            marginBottom: 20,
            marginLeft: 20,
          }}
        >
          {isVisibleAlert && (
            <Alert
              message="月初めです。先月末の入金処理、請求処理を行ってください。"
              type="warning"
              closable
            />
          )}
        </Row>
        <Row>
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
