import React, { useState, useEffect } from "react";
import $lang from "../utils/content/jp.json";
import dayjs from "dayjs";

import { Link } from "react-router-dom";
import { billURL, billsReportURL } from "../utils/constants";
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
  Spin,
  DatePicker,
} from "antd";
import { API } from "../utils/helper";
import CustomButton from "../components/common/CustomButton";
import { openNotificationWithIcon } from "../components/common/notification";
import BillListTable from "../features/bill/list.table";
const { Content } = Layout;
const currentDate = dayjs().tz("Asia/Tokyo");

const BillingListPage = ({ is_edit }) => {
  const [ym, setYM] = useState(dayjs(currentDate, "YYYY/MM"));
  const [day, setDay] = useState(20);

  const [form] = Form.useForm();
  const [billData, setBillData] = useState([]);

  const [dateOptions, setDateOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [isBillExportSpinLoading, setIsBillExportSpinLoading] = useState(false);
  const [isBillAmountExportSpinLoading, setIsBillAmountExportSpinLoading] =
    useState(false);
  const getList = () => {
    const yearMonth = ym.format("YYYY-MM");
    let fromDate = "";
    let toDate = "";
    if (day === 20) {
      const d = new Date(yearMonth);
      let m = d.getMonth() + 1;
      if (m == 1) {
        const y = d.getFullYear() - 1;
        fromDate = y + "-12" + "-21";
        toDate = yearMonth + "-20";
      } else {
        m = m - 1;
        if (m < 10) m = "0" + m;
        fromDate = d.getFullYear() + "-" + m + "-21";
        toDate = yearMonth + "-20";
      }
    } else {
      fromDate = yearMonth + "-01";
      toDate = yearMonth + "-" + day;
    }

    const url =
      billURL +
      `?&page=${currentPage}&limit=${itemsPerPage}&from_date=${fromDate}&to_date=${toDate}`;

    API.get(url)
      .then((res) => {
        const data = res.data.map((item, i) => {
          return {
            id: item.id,
            billed_on: item.created_at,
            cnt: item.processing_cnt,
            duration: item.duration_from + " ~ " + item.duration_to,
            from_date: item.duration_from,
            to_date: item.duration_to,
            warehouse_name: item.warehouse.name,
            updated_at: item.updated_at,
            warehouse_id: item.warehouse.id,
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

  const exportBillAmountPDF = (record) => {
    const arr = record.duration.split("~");
    const filename = record.duration + "_請求書.pdf";
    setIsBillExportSpinLoading(true);
    debugger;
    API.post(
      billsReportURL,
      {
        from_date: record.from_date,
        to_date: record.to_date,
        warehouse_id: record.warehouse_id,
      },
      {
        responseType: "arraybuffer",
      }
    )
      .then((res) => {
        setIsBillExportSpinLoading(false);
        downloadPDF(res, filename);
      })
      .catch((err) => {});
  };

  const downloadPDF = (response, filename) => {
    const blob = new Blob([response.data], { type: "application/pdf" });

    // Construct the URL and initiate the download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", filename);
    a.click();
  };

  const exportBillPDF = (record) => {
    setIsBillAmountExportSpinLoading(true);
    setIsBillAmountExportSpinLoading(false);
    const arr = record.duration.split("~");
    const filename = record.duration + "_明細書.pdf";
  };

  useEffect(() => {
    getList();
  }, []);

  useEffect(() => {
    const y = ym.format("YYYY");
    const m = ym.format("M");
    const NextMonth = new Date(y, m, 1);
    const endDay = new Date(NextMonth - 1);

    setDateOptions([20, endDay.getDate()]);
  }, [ym]);
  return (
    <Content style={{ margin: 20 }} className="mx-auto content-h">
      <Card
        style={{ width: "100%", marginTop: 20, marginBottom: 20 }}
        className="py-2 my-2"
        bordered={false}
      >
        <Flex justify="space-between" style={{ marginBottom: 10 }}>
          <Flex justify="item-start">
            <Space>
              <label>{$lang.billing.YM}:</label>
              <DatePicker
                format={"YYYY/MM"}
                value={ym}
                picker="month"
                onChange={(v) => {
                  setYM(v);
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
            <Col>
              <Link to="/bill_process">
                <Button style={{ float: "right" }}>
                  {$lang.billing.addNew}
                </Button>
              </Link>
            </Col>
          </Flex>
        </Flex>
        <BillListTable
          exportBillPDF={exportBillAmountPDF}
          exportBillAmountPDF={exportBillPDF}
          dataSource={billData}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          total={total}
          onChange={handlePageChange}
          isEdit={is_edit}
          isBillExportSpinLoading={isBillExportSpinLoading}
          isBillAmountExportSpinLoading={isBillAmountExportSpinLoading}
        />
      </Card>
    </Content>
  );
};

export default BillingListPage;
