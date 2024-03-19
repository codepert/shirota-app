import React, { useState, useEffect } from "react";
import $lang from "../utils/content/jp.json";
import moment from "moment";

import { Link } from "react-router-dom";
import { billURL } from "../utils/constants";
import {
  Form,
  Layout,
  Button,
  Card,
  Space,
  Col,
  Select,
  Flex,
  Input,
} from "antd";
import { API } from "../utils/helper";
import CustomButton from "../components/common/CustomButton";
import { openNotificationWithIcon } from "../components/common/notification";
import BillListTable from "../features/bill/list.table";
const { Content } = Layout;

const BillingListPage = ({ is_edit }) => {
  const [ym, setYM] = useState("2024/01");
  const [day, setDay] = useState(1);

  const [form] = Form.useForm();
  const [billData, setBillData] = useState([]);

  const dateOptions = [20, 28, 29, 30, 31];
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const getList = () => {
    const yearMonth = ym.replace(/\//g, "-");
    const fromDate = yearMonth + "-01";
    const toDate = yearMonth + "-" + day;
    const url =
      billURL +
      `?ym=${yearMonth}&closing_date=${day}&page=${currentPage}&limit=${itemsPerPage}&from_date=${fromDate}&to_date=${toDate}`;

    API.get(url)
      .then((res) => {
        const data = res.data.map((item, i) => {
          return {
            billed_on: item.billed_on,
            cnt: item.cnt,
            duration: item.duration,
            shipper_name: item.shipper_name,
            updated_at: item.updated_at,
            key: i,
          };
        });

        setBillData(data);
        setTotal(res.data.count);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handlePageChange = (page, pageSize) => {
    setCurrentPage((page - 1) * pageSize);
    setItemPerPage(pageSize);
  };

  const exportBillPDF = (record) => {
    const param = {
      shipper_id: record.shipper_id,
      bill_payment_amount: record.bill_payment_amount,
      handling_cost: record.handling_cost,
      last_bill_amount: record.last_bill_amount,
      product_name: record.product_name,
      received_payment_amount: record.received_payment_amount,
      tax: record.tax,
      total_storage_fee: record.total_storage_fee,
    };
    API.post(billReportURL, param, {
      responseType: "arraybuffer",
    })
      .then((res) => {
        downloadPDF(res);
      })
      .catch((err) => {});
  };

  const downloadPDF = (response) => {
    const blob = new Blob([response.data], { type: "application/pdf" });
    const fileName = "generated_pdf.pdf";

    // Construct the URL and initiate the download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", fileName);
    a.click();
  };

  const exportBillAmountPDF = (record) => {
    console.log("record", record);
  };

  useEffect(() => {
    getList();
  }, []);
  return (
    <Content style={{ margin: 20 }} className="mx-auto content-h">
      <Card
        style={{ width: "100%", marginTop: 20, marginBottom: 20 }}
        className="py-2 my-2"
        bordered={false}
      >
        <Flex justify="space-between">
          <Flex justify="item-start">
            <Space>
              <label>{$lang.billing.YM}:</label>
              <Input
                defaultValue={2024}
                value={ym}
                onChange={(e) => {
                  setYM(e.target.value);
                }}
              />
            </Space>
            <Space>
              <label className="ml-8">{$lang.billing.day}:</label>
              <Select
                options={dateOptions.map((item) => {
                  return {
                    value: item,
                    label: item,
                  };
                })}
                style={{ width: 80 }}
                value={day}
                onChange={(val) => {
                  setDay(val);
                }}
              />
            </Space>
            <Space>
              <Button
                className="btn-bg-black"
                style={{ marginLeft: 20 }}
                onClick={getList}
              >
                {$lang.buttons.search}
              </Button>
            </Space>
          </Flex>
          <Flex>
            <Col span={12}>
              <Link to="/bill_process">
                <Button style={{ float: "right" }}>
                  {$lang.billing.addNew}
                </Button>
              </Link>
            </Col>
          </Flex>
        </Flex>
        <BillListTable
          exportBillPDF={exportBillPDF}
          exportBillAmountPDF={exportBillAmountPDF}
          dataSource={billData}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          total={total}
          onChange={handlePageChange}
          isEdit={is_edit}
        />
      </Card>
    </Content>
  );
};

export default BillingListPage;
