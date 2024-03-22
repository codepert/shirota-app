import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Space,
  Card,
  Row,
  Col,
  Divider,
  Flex,
  Input,
  Layout,
  Select,
  Button,
  DatePicker,
  Spin,
} from "antd";
import {} from "antd";

import dayjs from "dayjs";
import CustomButton from "../components/common/CustomButton";
// import CTable from "../components/CTable/CCTable";

import { API } from "../utils/helper";
import {
  warehouseURL,
  shipperURL,
  unCalcBillURL,
  exportBillOne,
  billReportURL,
  billAmountReportURL,
  billURL,
  lastBillDateURL,
  billsReportURL,
} from "../utils/constants";
import $lang from "../utils/content/jp.json";

const { RangePicker } = DatePicker;

import { openNotificationWithIcon } from "../components/common/notification";
import ConfirmModal from "../components/modal/confirm.modal";
import BillProcessTable from "../features/bill/process.table";

const { Content } = Layout;
const BillingProcessPage = ({ is_edit }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [billData, setBillList] = useState([]);
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

  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [dateOptions, setDateOptions] = useState([]);
  const [isBillData, setIsBillData] = useState(false);
  const [lastBillDate, setLastBillDate] = useState("");
  const [isModalVisible, setIsConfirmModalVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [isConfirmBillDisabled, setIsConfirmBillDisabled] = useState(false);
  const [isBillExportSpinLoading, setIsBillExportSpinLoading] = useState(false);
  const [isBillAmountExportSpinLoading, setIsBillAmountExportSpinLoading] =
    useState(false);
  const [isBillsExportSpinLoading, setIsBillsExportSpinLoading] =
    useState(false);
  const [isSpinLoading, SetIsSpinLoading] = useState(false);
  const getWarehouses = () => {
    API.get(warehouseURL).then((res) => {
      const warehouses = res.data.map((item) => {
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

  const getShippers = () => {
    API.get(shipperURL).then((res) => {
      const shippers = res.data.map((item) => {
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

  const getLastBillDate = () => {
    const url =
      lastBillDateURL +
      "?warehouse_id=" +
      selectedWarehouse.value +
      "&shipper_id=" +
      seletedShipper.value;
    API.get(url).then((res) => {
      let date = res.data.date;
      if (date != "") date = dayjs(date).format("YYYY/MM/DD HH:mm:ss");
      setLastBillDate(date);
    });
  };
  const getCalculateBillList = () => {
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

    const processDateParam =
      processRangeDates.length > 0
        ? `&from_date=${processRangeDates[0].format(
            "YYYY-MM-DD"
          )}&to_date=${processRangeDates[1].format("YYYY-MM-DD")}`
        : "";

    const urlParam = `${unCalcBillURL}?page=${currentPage}&limit=${itemsPerPage}${processDateParam}&warehouse_id=${selectedWarehouse.value}&y=${selectedYear}&m=${selectedMonth}&d=${selectedDay}&shipper_id=${seletedShipper.value}&closing_date=${selectedDay}&bill_date=${billDate}`;
    console.log("get urlParam", urlParam);

    API.get(urlParam)
      .then((res) => {
        let index = 1;
        const data = res.data.data.map((item) => {
          return {
            id: $lang.unconfirm,
            shipper_name: item.shipper_name,
            shipper_code: item.shipper_code,
            // last_bill_amount: item.last_bill_amount,
            handling_cost: item.handle_cost,
            deposit_amount: item.deposit_amount,
            total_storage_fee: item.storage_cost,
            bill_payment_amount: item.current_bill_amount,
            last_bill_amount: item.previous_bill_amount,
            tax: parseInt(item.current_bill_amount) / 10,
            key: index++,
            shipper_id: item.shipper_id,
          };
        });
        setIsBillData(res.data.is_bill_data);
        setBillList(data);
        setTotal(res.data.count);
        setLastBillDate(res.data.last_bill_date.replace(/\-/g, "/"));

        // if (res.data.is_bill_data) {
        //   openNotificationWithIcon(
        //     "warning",
        //     $lang.popConfirmType.warning,
        //     $lang.messages.empty_data
        //   );
        // }
      })
      .catch((err) => {
        console.log(err);
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

    const processDateParam =
      processRangeDates.length > 0
        ? `&from_date=${processRangeDates[0].format(
            "YYYY-MM-DD"
          )}&to_date=${processRangeDates[1].format("YYYY-MM-DD")}`
        : "";
    // const urlParam = `${unCalcBillURL}?offset=${currentPage}&limit=${itemsPerPage}${processDateParam}&warehouse_id=${selectedWarehouse.value}&y=${selectedYear}&m=${selectedMonth}&d=${selectedDay}&shipperFrom=${shipperFrom}&shipperTo=${shipperTo}&closing_date=${selectedDay}`;
    const urlParam = `${billURL}?page=${currentPage}&limit=${itemsPerPage}${processDateParam}&warehouse_id=${selectedWarehouse.value}&shipper_id=${seletedShipper.value}`;
    console.log("urlParam", urlParam);
    API.get(urlParam)
      .then((res) => {
        let index = 1;
        const data = res.data.map((item) => {
          return {
            id: item.id,
            shipper_name: item.shipper ? item.shipper.name : shipper_name,
            shipper_id: item.shipper ? item.shipper.id : item.shipper_id,
            shipper_code: item.shipper ? item.shipper.code : item.shipper_code,
            last_bill_amount: item.last_amount,
            deposit_amount: item.deposit_amount,
            handling_cost: item.handling_cost,
            total_storage_fee: item.storage_cost,
            bill_payment_amount: item.current_amount,
            tax: parseInt(item.current_amount) / 10,
            key: index++,
          };
        });

        // setLastBillDate(res.data.last_bill_date.replace(/\-/g, "/"));
        setBillList(data);
        setTotal(res.headers["x-total-count"]);
        // setLastBillDate(res.data.last_bill_date);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handlePageChange = (page, pageSize) => {
    setCurrentPage((page - 1) * pageSize);
    setItemPerPage(pageSize);
  };

  const handleSelectedDay = (value) => {
    setSelectedDay(value);
  };

  const setTargetRangeDates = (y, m, d) => {
    if (d === 20) {
      let fromDate = dayjs(`${y}/${m - 1}/21`);
      let toDate = dayjs(`${y}/${m}/20`);
      setProcessRangeDates([fromDate, toDate]);
    } else {
      let fromDate = dayjs(`${y}/${m}/1`);
      let toDate = dayjs(`${y}/${m}/${d}`);
      setProcessRangeDates([fromDate, toDate]);
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

  const createBill = () => {
    if (seletedShipper.value == "") {
      openNotificationWithIcon(
        "warning",
        $lang.popConfirmType.warning,
        "select shipper"
      );
      return;
    }
    const billDate =
      selectedYear +
      "-" +
      (selectedMonth < 10 ? "0" + selectedMonth : selectedMonth) +
      "-" +
      (selectedDay < 10 ? "0" + selectedDay : selectedDay);

    const params = {
      from_date: processRangeDates[0].format("YYYY-MM-DD"),
      to_date: processRangeDates[1].format("YYYY-MM-DD"),
      billed_on: billDate,
      closing_date: selectedDay,
      warehouse_id: selectedWarehouse.value,
      shipper_id: seletedShipper.value,
      y: selectedYear,
      m: selectedMonth,
      d: selectedDay,
    };

    SetIsSpinLoading(true);
    API.post(billURL, params)
      .then((res) => {
        SetIsSpinLoading(false);
        getBillList();
        openNotificationWithIcon(
          "success",
          $lang.popConfirmType.success,
          $lang.messages.finish_bill
        );
        console.log(res);
        // getLastBillDate();
      })
      .catch((err) => {
        console.log(err);
        openNotificationWithIcon("error", $lang.popConfirmType.error, err);
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

  const exportBillPDF = (record) => {
    processRangeDates.length > 0
      ? `&from_date=${processRangeDates[0].format(
          "YY年MM月DD日"
        )}&to_date=${processRangeDates[1].format("YY年MM月DD日")}`
      : "";

    setIsBillExportSpinLoading(true);
    API.post(
      billReportURL,
      {
        id: record.id,
        from_date: processRangeDates[0].format("YY年MM月DD日"),
        to_date: processRangeDates[1].format("YY年MM月DD日"),
      },
      {
        responseType: "arraybuffer",
      }
    )
      .then((res) => {
        setIsBillExportSpinLoading(false);
        downloadPDF(res);
      })
      .catch((err) => {
        setIsBillExportSpinLoading(false);
      });
  };

  const exportBillAmountPDF = (record) => {
    setIsBillAmountExportSpinLoading(true);
    API.post(
      billAmountReportURL,
      {
        bill_id: record.id,
        from_date: processRangeDates[0].format("YY年MM月DD日"),
        to_date: processRangeDates[1].format("YY年MM月DD日"),
      },
      {
        responseType: "arraybuffer",
      }
    )
      .then((res) => {
        setIsBillAmountExportSpinLoading(false);
        downloadPDF(res);
      })
      .catch((err) => {
        setIsBillAmountExportSpinLoading(false);
        console.log("err", err);
      });
  };

  const exportBillsPDF = () => {
    processRangeDates.length > 0
      ? `&from_date=${processRangeDates[0].format(
          "YYYY-MM-DD"
        )}&to_date=${processRangeDates[1].format("YYYY-MM-DD")}`
      : "";

    setIsBillsExportSpinLoading(true);
    API.post(
      billsReportURL,
      {
        from_date: processRangeDates[0].format("YYYY-MM-DD"),
        to_date: processRangeDates[1].format("YYYY-MM-DD"),
      },
      {
        responseType: "arraybuffer",
      }
    )
      .then((res) => {
        setIsBillsExportSpinLoading(false);
        downloadPDF(res);
      })
      .catch((err) => {
        setIsBillExportSpinLoading(false);
      });
  };

  const handleHideConfirmModal = () => {
    setIsConfirmModalVisible(false);
  };

  const onchageBillExportSpinLoading = () => {
    setIsBillExportSpinLoading(!isBillExportSpinLoading);
  };

  const onchageBillAmountExportSpinLoading = () => {
    setIsBillAmountExportSpinLoading(!isBillAmountExportSpinLoading);
  };
  useEffect(() => {
    getWarehouses();
    getShippers();
  }, []);

  useEffect(() => {
    const nextMonth = new Date(selectedYear, selectedMonth, 1);
    const endDay = new Date(nextMonth - 1);
    setDateOptions([20, endDay.getDate()]);
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    getLastBillDate();
  }, [selectedWarehouse, seletedShipper]);
  return (
    <Content style={{ margin: 20 }} className="mx-auto content-h">
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
                  setTargetRangeDates(
                    e.target.value,
                    selectedMonth,
                    selectedDay
                  );
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
                onChange={(v) => {
                  setSelectedMonth(v);
                  setTargetRangeDates(selectedYear, v, selectedDay);
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
                onChange={(v) => {
                  handleSelectedDay(v);
                  setTargetRangeDates(selectedYear, selectedMonth, v);
                }}
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
        <Flex justify="item-start">
          {" "}
          <Space>
            <Spin spinning={isSpinLoading}>
              <Button
                className="btn-bg-black"
                style={{ marginLeft: 60 }}
                onClick={() => {
                  setIsConfirmBillDisabled(false);
                  getCalculateBillList();
                }}
              >
                {$lang.billing.buttons.billingCalculation}
              </Button>
            </Spin>
          </Space>
          <Button
            className="btn-bg-black ml-1"
            onClick={() => {
              setIsConfirmBillDisabled(true);
              getBillList();
            }}
          >
            {$lang.billing.buttons.billingList}
          </Button>
        </Flex>
      </Card>
      <Card className="mb-5">
        <Flex vertical>
          <div style={{ marginBottom: 10 }}>{$lang.billing.new}</div>
          <Flex
            justify="space-between"
            style={{
              marginBottom: 10,
            }}
          >
            {is_edit === 1 ? (
              <>
                <Space className="" style={{ float: "right" }}>
                  <Spin spinning={isBillsExportSpinLoading}>
                    <Button className="btn-bg-black" onClick={exportBillsPDF}>
                      {$lang.buttons.billingListOutput}
                    </Button>
                  </Spin>
                  <label style={{ marginLeft: 20 }}>{$lang.processDate}</label>{" "}
                  :{lastBillDate}
                </Space>
                <Button
                  className="btn-bg-black"
                  onClick={() => {
                    const duration =
                      processRangeDates[0].format("YYYY-MM-DD") +
                      " ~ " +
                      processRangeDates[1].format("YYYY-MM-DD");
                    const warrehouse =
                      $lang.warehouse + " : " + selectedWarehouse.label;
                    setConfirmMessage($lang.messages.confirm_bill);
                    setIsConfirmModalVisible(true);
                  }}
                  disabled={isConfirmBillDisabled}
                >
                  {$lang.buttons.billingConfirmed}
                </Button>
              </>
            ) : (
              <></>
            )}
          </Flex>
        </Flex>
        <ConfirmModal
          isOpen={isModalVisible}
          onConfirm={() => {
            handleHideConfirmModal();
            createBill();
          }}
          onClose={handleHideConfirmModal}
          message={confirmMessage}
        />
        <BillProcessTable
          exportBillPDF={exportBillPDF}
          exportBillAmountPDF={exportBillAmountPDF}
          dataSource={billData}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          total={total}
          onChange={handlePageChange}
          isBillExportSpinLoading={isBillExportSpinLoading}
          isBillAmountExportSpinLoading={isBillAmountExportSpinLoading}
          isEdit={is_edit}
        />
      </Card>
    </Content>
  );
};

export default BillingProcessPage;
