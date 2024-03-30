import React, { useState, useEffect } from "react";
import moment from "moment";

import { Row, Layout, Card, Col, Alert } from "antd";
const { Content } = Layout;
import { useAuth } from "../hooks/useAuth.js";
import { Link } from "react-router-dom";

const Top = () => {
  const [isVisibleAlert, setIsVisibleAlert] = useState(false);
  // const [shakeScreen, setShakeScreen] = useState(false); // State variable for shaking the screen
  const user = useAuth();
  const [navigations, setNavigations] = useState([]);

  useEffect(() => {
    const navigations = JSON.parse(user.state.permissionPages);
    const accessPages = navigations.filter((item) => {
      if (navigations.filter((i) => i.parent_id == item.page_id).length == 0) {
        return item;
      }
    });
    setNavigations(accessPages);

    if (moment().format("D") < 5) {
      setIsVisibleAlert(true);
    } else setIsVisibleAlert(false);
  }, []);

  return (
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
            <Link to={item.path} key={i}>
              <Card bordered={false}>{item.name}</Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Content>
  );
};

export default Top;
