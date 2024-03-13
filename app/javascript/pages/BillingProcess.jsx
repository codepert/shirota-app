import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Space,
  Card,
  Row,
  Col,
  Divider,
  Pagination,
  Form,
  Input,
  Layout,
  Select,
  Button,
  DatePicker,
} from "antd";
import {} from "antd";

import dayjs from "dayjs";
import CustomButton from "../components/common/CustomButton";
// import CTable from "../components/CTable/CCTable";

import { API } from "../utils/helper";
import {
  warehouseURL,
  shipperURL,
  billListURL,
  exportBillOne,
  computeBillURL,
  confirmBillURL,
} from "../utils/constants";
import $lang from "../utils/content/jp.json";

const { RangePicker } = DatePicker;

import { openNotificationWithIcon } from "../components/common/notification";

const { Content } = Layout;
const BillingProcess = ({ is_edit }) => {
  const billingProcessColumns = [
    {
      title: `${$lang.billing.table.productName}`,
      key: "product_name",
      width: "8%",
      dataIndex: "product_name",
      align: "center",
    },
    {
      title: `${$lang.billing.table.shipperId}`,
      key: "shipper_id",
      width: "8%",
      dataIndex: "shipper_id",
      align: "center",
    },
    {
      title: `${$lang.billing.table.shipperName}`,
      key: "shipper_name",
      width: "8%",
      dataIndex: "shipper_name",
      align: "center",
    },
    {
      title: `${$lang.billing.table.receivedAmount}`,
      key: "received_payment_amount",
      width: "10%",
      dataIndex: "received_payment_amount",
      align: "center",
    },
    {
      title: `${$lang.billing.table.handlingFee}`,
      key: "handling_cost",
      width: "10%",
      dataIndex: "handling_cost",
      align: "center",
    },
    {
      title: `${$lang.billing.table.storageFee}`,
      key: "total_storage_fee",
      width: "10%",
      dataIndex: "total_storage_fee",
      align: "center",
    },
    {
      title: `${$lang.billing.table.invoiceAmount}`,
      dataIndex: "bill_payment_amount",
      key: "bill_payment_amount",
      align: "center",
    },
    {
      title: `${$lang.billing.table.consumptionTax}`,
      dataIndex: "tax",
      key: "tax",
      align: "center",
    },
    {
      title: "",
      dataIndex: "operation",
      align: "center",
      render: (text, record, dataIndex) => (
        <div className="flex justify-center">
          <div className="hidden rounded-full"></div>
          <div className="p-2 rounded-full cursor-pointer text-center">
            <CustomButton
              // onClick={() => {
              //   exportDataAndDownloadPdf(record);
              // }}

              onClick={() => {
                openNotificationWithIcon("warning", "warning", "please wait");
              }}
              title={$lang.billing.buttons.billingReport}
              size="small"
              className="btn-default btn-hover-black"
              style={{ backgroundColor: "transparent", color: "#000" }}
              visability={true}
            />{" "}
            <CustomButton
              onClick={() => {
                openNotificationWithIcon("warning", "warning", "please wait");
              }}
              title={$lang.billing.buttons.detail}
              style={{
                backgroundColor: "transparent",
                color: "#000",
                marginLeft: 10,
              }}
              size="small"
              className="btn-default btn-hover-black"
              visability={true}
            />
          </div>
          {/* <div className="p-2 rounded-full cursor-pointer items-center text-center"></div> */}
        </div>
      ),
    },
  ];
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [form] = Form.useForm();
  const [allData, setAllData] = useState([]);
  const [showData, setShowData] = useState([]);
  const [dValue, setDValue] = useState();
  const [processRangeDates, setProcessRangeDates] = useState([]);
  const [shipperOptions, setShipperOptions] = useState();
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState({
    value: "",
    label: "",
  });
  // ------------Shipper-----------
  const [seletedShipper, setSeletedShipper] = useState({
    value: "",
    label: "",
  });

  const monthOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const dateOptions = [20, 28, 29, 30, 31];

  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [shipperFrom, setShipperFrom] = useState("");
  const [shipperTo, setShipperTo] = useState("");

  const onChangeDateValue = () => {
    console.log("log");
  };
  const handlePageChange = (page, pageSize) => {
    setCurrentPage((page - 1) * pageSize);
    setItemPerPage(pageSize);
  };

  const handleSelectedDay = (value) => {
    setSelectedDay(value);
    if (value === 20) {
      let fromDate = dayjs(`${selectedYear}/${selectedMonth}/21`);
      let toDate = dayjs(`${selectedYear}/${selectedMonth}/20`);
      setProcessRangeDates([fromDate, toDate]);
      console.log("first", fromDate);
    } else {
      let fromDate = dayjs(`${selectedYear}/${selectedMonth}/1`);
      let toDate = dayjs(`${selectedYear}/${selectedMonth}/${value}`);
      setProcessRangeDates([fromDate, toDate]);
      console.log("first", fromDate);
    }
  };
  const handleOnchangeTargetPeriod = (_, dateStrings) => {
    if (!dateStrings[0] || !dateStrings[1]) {
      setProcessDate([]);
      // setPaymentData([]);
      return;
    }
    const fromDate = dayjs(dateStrings[0], "YYYY-MM-DD").add(1, "day").utc();
    const toDate = dayjs(dateStrings[1], "YYYY-MM-DD").add(1, "day").utc();
    setProcessRangeDates([fromDate, toDate]);
  };
  //  -------Get warehouse names--------
  const getWarehouses = () => {
    API.get(warehouseURL).then((res) => {
      const warehouses = res.data.data.map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });

      setWarehouseOptions(warehouses);

      if (warehouses.length > 0)
        setSelectedWarehouse({
          value: warehouses[0].value,
          label: warehouses[0].label,
        });
    });
  };

  // --------Get shipper data--------
  const getShippers = () => {
    API.get(shipperURL).then((res) => {
      const shippers = res.data.data.map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });

      setShipperOptions(shippers);

      if (shippers.length > 0)
        setSeletedShipper({
          value: shippers[0].value,
          label: shippers[0].label,
        });
    });
  };

  const getBillList = () => {
    if (processRangeDates.length == 0) {
      openNotificationWithIcon(
        "warning",
        $lang.popConfirmType.warning,
        $lang.messages.empty_during
      );

      return;
    }

    const billDate =
      selectedYear +
      "-" +
      (selectedMonth < 10 ? "0" + selectedMonth : selectedMonth) +
      "-" +
      (selectedDay < 10 ? "0" + selectedDay : selectedDay);

    console.log("bill date", billDate);
    const processDateParam =
      processRangeDates.length > 0
        ? `&processFromDate=${new Date(processRangeDates[0].toString())
            .toISOString()
            .substring(0, 10)}&processToDate=${new Date(
            processRangeDates[1].toString()
          )
            .toISOString()
            .substring(0, 10)}`
        : "";
    // const urlParam = `${billListURL}?offset=${currentPage}&limit=${itemsPerPage}${processDateParam}&warehouse_id=${selectedWarehouse.value}&y=${selectedYear}&m=${selectedMonth}&d=${selectedDay}&shipperFrom=${shipperFrom}&shipperTo=${shipperTo}&closing_date=${selectedDay}`;
    const urlParam = `${billListURL}?offset=${currentPage}&limit=${itemsPerPage}${processDateParam}&warehouse_id=${selectedWarehouse.value}&y=${selectedYear}&m=${selectedMonth}&d=${selectedDay}&shipper_id=${seletedShipper.value}&closing_date=${selectedDay}&bill_date=${billDate}&closing_date=${selectedDay}`;

    API.get(urlParam)
      .then((res) => {
        let index = 1;
        const data = res.data.data.map((item) => {
          return {
            shipper_name: item.shipper_name,
            product_name: item.product_name,
            handling_cost: item.handling_cost,
            received_payment_amount: item.received_payment_amount,
            total_storage_fee: item.total_storage_fee,
            bill_payment_amount: item.bill_payment_amount,
            tax: item.tax,
            key: index++,
            shipper_id: item.shipper_id,
          };
        });
        setAllData(data);
        setTotal(res.data.count);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const computeBill = () => {
    const billDate =
      selectedYear +
      "-" +
      (selectedMonth < 10 ? "0" + selectedMonth : selectedMonth) +
      "-" +
      (selectedDay < 10 ? "0" + selectedDay : selectedDay);

    const processDateFrom =
      processRangeDates.length > 0
        ? new Date(processRangeDates[0].toString())
            .toISOString()
            .substring(0, 10)
        : "";

    const processDateTo =
      processRangeDates.length > 0
        ? new Date(processRangeDates[1].toString())
            .toISOString()
            .substring(0, 10)
        : "";
    const params = {
      billed_on: billDate,
      closing_date: selectedDay,
      duration_from: processDateFrom,
      duration_to: processDateTo,
      warehouse_id: selectedWarehouse.value,
      shipper_id: seletedShipper.value,
    };
    console.log("params", params);
    API.post(computeBillURL, params)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const confirmBill = () => {
    const billDate =
      selectedYear +
      "-" +
      (selectedMonth < 10 ? "0" + selectedMonth : selectedMonth) +
      "-" +
      (selectedDay < 10 ? "0" + selectedDay : selectedDay);
    const params = {
      billed_on: billDate,
      closing_date: selectedDay,
      warehouse_id: selectedWarehouse.value,
      shipper_id: seletedShipper.value,
    };
    API.post(confirmBillURL, {
      billed_on: billDate,
      closing_date: selectedDay,
      warehouse_id: selectedWarehouse.value,
      shipper_id: seletedShipper.value,
    })
      .then((res) => {
        getBillList();
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onChangeWarehouse = (value, option) => {
    setSelectedWarehouse({ value: value, label: option.label });
  };
  const onChangeShipper = (value, option) => {
    setSeletedShipper({ value: value, label: option.label });
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
  const exportDataAndDownloadPdf = (record) => {
    console.log("record", record);
    API.post(
      exportBillOne,
      {
        before_bill_amount: "10",
        receivedAmount: record.received_payment_amount,
        handling_cost: record.handling_cost,
        tax: record.tax,
        total_storage_fee: record.total_storage_fee,
        bill_payment_amount: record.bill_payment_amount,
        shipper_id: seletedShipper.id,
        warehouse_id: selectedWarehouse.value,
      },
      {
        responseType: "arraybuffer",
      }
    )
      .then((res) => {
        downloadPDF(res);
      })
      .catch((err) => {
        console.error(err);
      });
  };
  useEffect(() => {
    getWarehouses();
    getShippers();
    // getBillList();
  }, []);

  return (
    <Content
      style={{ width: 1280, marginTop: 20 }}
      className="mx-auto content-h"
    >
      <Card
        style={{ width: "100%", marginTop: 20, marginBottom: 20 }}
        className="py-2 my-2"
        bordered={false}
      >
        <Row className="my-2">
          <Col span={12}>
            <Space align="center">
              <label>{$lang.billing.billingDate}:</label>
              <Input
                type="number"
                className=""
                min={2000}
                style={{ width: 100 }}
                defaultValue={2024}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                }}
              ></Input>
            </Space>
            <Space align="center" className="ml-4">
              <label>{$lang.billing.month}:</label>
              <Select
                options={monthOptions.map((item) => {
                  return {
                    value: item,
                    label: item,
                  };
                })}
                defaultValue={1}
                onChange={(val) => {
                  setSelectedMonth(val);
                }}
                style={{ width: 80 }}
              />
            </Space>
            <Space align="center" className="ml-4">
              <label className="">{$lang.billing.day}:</label>
              <Select
                options={dateOptions.map((item) => {
                  return {
                    value: item,
                    label: item,
                  };
                })}
                onChange={handleSelectedDay}
                style={{ width: 80 }}
              />
            </Space>
          </Col>
          <Col span={12} align="right">
            <Link to="/bill_list">
              <Button style={{ float: "right" }}>{$lang.billing.back}</Button>
            </Link>
          </Col>
        </Row>
        <Row className="my-2">
          <Space align="center">
            <label>{$lang.billing.targetPeriod}:</label>
            <DatePicker.RangePicker
              theme={"light"}
              value={processRangeDates}
              // placeholder={["", ""]}
              onChange={handleOnchangeTargetPeriod}
              format={"YYYY/MM/DD"}
            />
          </Space>
        </Row>
        <Row className="my-2">
          <Space direction="horizontal">
            <label>{$lang.billing.targetShipper}:</label>
            <Space.Compact block>
              {/* <Input
                style={{
                  width: 100,
                  textAlign: "center",
                }}
                placeholder=""
                value={shipperFrom}
                onChange={(e) => {
                  setShipperFrom(e.target.value);
                }}
              />
              <Input
                className="site-input-split"
                style={{
                  width: 30,
                  borderLeft: 0,
                  borderRight: 0,
                  pointerEvents: "none",
                }}
                placeholder="~"
                disabled
              />
              <Input
                className="site-input-right"
                style={{
                  width: 100,
                  textAlign: "center",
                }}
                placeholder=""
                value={shipperTo}
                onChange={(e) => {
                  setShipperTo(e.target.value);
                }}
              /> */}
              <Select
                style={{ width: 300 }}
                onChange={onChangeShipper}
                options={shipperOptions}
                value={seletedShipper.value}
                defaultValue={""}
                placeholder={$lang.inStock.shipper}
              />
            </Space.Compact>
          </Space>
        </Row>
        <Row className="my-2">
          <Space align="center">
            <label>{$lang.billing.targetWarehouse}:</label>
            <Select
              placeholder={$lang.inStock.warehouse}
              style={{ width: 150 }}
              value={selectedWarehouse}
              options={warehouseOptions}
              onChange={onChangeWarehouse}
            />
          </Space>
        </Row>
        <Divider />
        <Row>
          <Space align="center">
            {" "}
            <Button
              className="btn-bg-black"
              style={{ marginLeft: 60 }}
              onClick={computeBill}
            >
              {$lang.billing.buttons.billingCalculation}
            </Button>
            <Button className="btn-bg-black ml-1" onClick={getBillList}>
              {$lang.billing.buttons.billingList}
            </Button>
          </Space>
        </Row>
      </Card>
      <Card>
        <Row>
          <Col span={12}>
            <div>{$lang.billing.new}</div>
          </Col>
          <Col span={12}>
            {is_edit === 1 ? (
              <Space className="" style={{ float: "right" }}>
                <Button className="btn-bg-black">
                  {$lang.buttons.billingListOutput}
                </Button>
                <Button className="btn-bg-black" onClick={confirmBill}>
                  {$lang.buttons.billingConfirmed}
                </Button>
              </Space>
            ) : (
              <></>
            )}
          </Col>
        </Row>
        <Row className="my-2">
          {/* <CTable
            rowKey={(node) => node.key}
            dataSource={allData}
            columns={billingProcessColumns}
          /> */}
          <div className="flex flex-col w-full">
            <div className="flex justify-center w-full bg-base-200 rounded-md mt-5">
              <Pagination
                current={currentPage}
                pageSize={itemsPerPage}
                total={total}
                onChange={handlePageChange}
                pageSizeOptions={[10, 20, 50, 100]}
                showSizeChanger
                className="p-1"
              />
            </div>
          </div>{" "}
        </Row>
      </Card>
    </Content>
  );
};

export default BillingProcess;
