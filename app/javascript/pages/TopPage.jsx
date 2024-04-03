import React, { useState, useEffect } from "react";
import moment from "moment";
import dayjs from "dayjs";

import {
  Row,
  Layout,
  Card,
  Col,
  Alert,
  DatePicker,
  Radio,
  Button,
  Spin,
} from "antd";
const { Content } = Layout;
import { useAuth } from "../hooks/useAuth.js";
import { Link } from "react-router-dom";
import { API, currentDate } from "../utils/helper";

import { exportStockInoutPdfURL } from "../utils/constants";

const dateFormat = "YYYY/MM/DD";

const Top = () => {
  const [isVisibleAlert, setIsVisibleAlert] = useState(false);
  // const [shakeScreen, setShakeScreen] = useState(false); // State variable for shaking the screen
  const user = useAuth();
  const [navigations, setNavigations] = useState([]);
  const [inoutVal, setIoutVal] = useState(1);
  const [targetDate, setTargetDate] = useState(dayjs(currentDate, dateFormat));
  const [isExportSpinLoading, setIsExportSpinLoading] = useState(false);
  const downloadPDF = (response, filename) => {
    const blob = new Blob([response.data], { type: "application/pdf" });

    // Construct the URL and initiate the download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", filename);
    a.click();
  };

  const exportInoutStockPDF = () => {
    setIsExportSpinLoading(true);
    API.post(
      exportStockInoutPdfURL,
      {
        inout_on: targetDate.format("YYYY-MM-DD"),
        category: inoutVal,
      },
      {
        responseType: "arraybuffer",
      }
    )
      .then((res) => {
        setIsExportSpinLoading(false);
        const fileName =
          targetDate.format("YYYY-MM-DD") +
          (inoutVal == 0 ? "_入庫" : "_出庫") +
          ".pdf";
        downloadPDF(res, fileName);
      })
      .catch((err) => {
        setIsExportSpinLoading(false);
      });
  };

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
      style={{ width: 1280, marginTop: 100 }}
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
              <Card
                bordered={false}
                style={{ borderLeft: "1px solid #357df9" }}
              >
                {item.name}
              </Card>
            </Link>
          </Col>
        ))}
        <Col style={{ margin: 20 }}>
          <Card bordered={false} style={{ borderLeft: "1px solid #357df9" }}>
            <Row>
              <DatePicker
                style={{ width: 150 }}
                value={targetDate}
                onChange={(date, dateStr) => {
                  if (dateStr == "") {
                    setTargetDate(dayjs(currentDate, dateFormat));
                  } else setTargetDate(dayjs(dateStr, dateFormat));
                }}
                placeholder={""}
                className="ml-1"
                format={dateFormat}
              />
              <Radio.Group
                onChange={(e) => {
                  setIoutVal(e.target.value);
                }}
                value={inoutVal}
                style={{ marginLeft: 10 }}
              >
                <Radio value={0}>入庫</Radio>
                <Radio value={1}>出庫</Radio>
              </Radio.Group>
            </Row>
            <Row
              style={{
                marginTop: 10,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Col></Col>
              <Col>
                <Spin spinning={isExportSpinLoading}>
                  <Button type="primary" onClick={exportInoutStockPDF}>
                    モニター出力
                  </Button>
                </Spin>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Content>
  );
};

export default Top;
