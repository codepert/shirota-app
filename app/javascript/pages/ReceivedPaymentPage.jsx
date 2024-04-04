import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Layout,
  Select,
  Space,
  Input,
  DatePicker,
  Divider,
  Button,
  notification,
  Card,
  Pagination,
  Row,
  Col,
} from "antd";
import { API } from "../utils/helper";
import ReceivedPaymentTable from "../features/receivedPayment/index.table";
import ReceivedPaymentRegisterModal from "../features/receivedPayment/register.modal";
import DeleteModal from "../components/common/modal/delete.modal";
import { openNotificationWithIcon } from "../components/common/notification";
import {
  shipperURL,
  receivedPaymentURL,
  exportReceivePaymentCSVDataUrl,
  dateFormat,
} from "../utils/constants";
import $lang from "../utils/content/jp.json";

const { Search } = Input;
const { Content } = Layout;

const { RangePicker } = DatePicker;
const ReceivedPaymentPage = ({ is_edit }) => {
  const [shipperOptions, setShipperOptions] = useState([]);
  const [shipperDisctription, setShipperDescription] = useState({
    code: "",
    closingDate: "",
  });
  const [searchShipper, setSearchShipper] = useState({
    value: "",
    label: "",
  });
  const [receivedPaymentData, setReceivedPaymentData] = useState([]);
  const [isposted, setIsPosted] = useState(false);
  const currentDate = dayjs().tz("Asia/Tokyo");

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [modalData, setModalData] = useState(null);
  const [isDeletedModalVisible, setIsDeletedModalVisible] = useState(false);
  const [handleId, setHandleId] = useState("");

  const [processDate, setProcessDate] = useState(
    dayjs(currentDate, dateFormat)
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [inStockRangeDates, setInstockRangeDates] = useState([]);
  const [processRangeDates, setProcessRangeDates] = useState([]);

  const getShippers = () => {
    API.get(shipperURL).then((res) => {
      let index = 1;
      const shippers = res.data.map((item) => {
        return {
          value: item.id,
          label: item.name,
          key: index++,
          id: item.id,
          code: item.code,
          closingDate: item.closing_date,
        };
      });
      setShipperOptions(shippers);
      const shippersWithAll = res.data.map((item) => {
        return {
          value: item.id,
          label: item.name,
          key: index++,
          id: item.id,
          code: item.code,
          closingDate: item.closing_date,
        };
      });
      shippersWithAll.unshift({
        value: "",
        label: $lang.all,
        index: 1,
        id: 0,
        code: "",
        closingDate: "",
      });
      setShipperOptions(shippersWithAll);
    });
  };

  const getReceivePayment = () => {
    const inStockDateParam =
      inStockRangeDates.length > 0
        ? `&instockFromDate=${new Date(inStockRangeDates[0].toString())
            .toISOString()
            .substring(0, 10)}&instockToDate=${new Date(
            inStockRangeDates[1].toString()
          )
            .toISOString()
            .substring(0, 10)}`
        : "";
    const processDateParam =
      processRangeDates.length > 0
        ? `&instockFromDate=${new Date(processRangeDates[0].toString())
            .toISOString()
            .substring(0, 10)}&instockToDate=${new Date(
            processRangeDates[1].toString()
          )
            .toISOString()
            .substring(0, 10)}`
        : "";
    const searchShipperParam =
      searchShipper.value != "" ? `&shipper=${searchShipper.value}` : "";
    const urlParam = `${receivedPaymentURL}?page=${currentPage}&limit=${itemsPerPage}${inStockDateParam}${processDateParam}${searchShipperParam}`;

    API.get(urlParam).then((res) => {
      let index = 0;
      const receivedPayment = res.data.map((item) => {
        return {
          ...item,
          shipper_name: item.shipper.name,
          shipper_code: item.shipper.code,
          key: index++,
          id: item.id,
        };
      });

      setTotal(res.headers["x-total-count"]);
      setReceivedPaymentData(receivedPayment);
    });
  };

  const editRow = (item) => {
    setModalData({
      id: item.id,
      shipper_id: item.shipper.id,
      amount: item.amount,
      received_on: item.received_on
        ? dayjs.tz(new Date(item.received_on), "Asia/Tokyo")
        : null,
      description: item.description,
      processing_on: item.processing_on
        ? dayjs.tz(new Date(item.processing_on), "Asia/Tokyo")
        : null,
    });
    handleShowModal();
  };

  const handleShowModal = () => {
    setIsModalVisible(true);
  };

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setItemPerPage(pageSize);
  };

  const onChangeSearchShipper = (value, option) => {
    setSearchShipper({
      value: value,
      label: option.label,
    });
    setShipperDescription({
      code: option.code,
      closingDate: option.closingDate,
    });
  };

  const onchangeProcessRangeDates = (_, dateStrings) => {
    if (!dateStrings[0] || !dateStrings[1]) {
      setProcessDate([]);
      // setPaymentData([]);
      return;
    }
    const fromDate = dayjs(dateStrings[0], "YYYY-MM-DD");
    const toDate = dayjs(dateStrings[1], "YYYY-MM-DD").add(1, "day");
    setProcessRangeDates([fromDate, toDate]);
  };

  const onchangeInStorkRangeDates = (_, dateStrings) => {
    if (!dateStrings[0] || !dateStrings[1]) {
      setInstockRangeDates([]);
      return;
    }
    const fromDate = dayjs(dateStrings[0], "YYYY-MM-DD");
    const toDate = dayjs(dateStrings[1], "YYYY-MM-DD").add(1, "day");
    // setInstockRangeDates(date);
    setInstockRangeDates([fromDate, toDate]);
  };

  const exportDataAndDownloadCVS = async () => {
    const inStockDateParam =
      inStockRangeDates.length > 0
        ? `&instockFromDate=${new Date(inStockRangeDates[0].toString())
            .toISOString()
            .substring(0, 10)}&instockToDate=${new Date(
            inStockRangeDates[1].toString()
          )
            .toISOString()
            .substring(0, 10)}`
        : "";
    const processDateParam =
      processRangeDates.length > 0
        ? `&instockFromDate=${new Date(processRangeDates[0].toString())
            .toISOString()
            .substring(0, 10)}&instockToDate=${new Date(
            processRangeDates[1].toString()
          )
            .toISOString()
            .substring(0, 10)}`
        : "";

    const searchShipperParam =
      searchShipper.value != "" ? `&shipper=${searchShipper.value}` : "";
    const urlParam = `${exportReceivePaymentCSVDataUrl}?offset=${currentPage}&limit=${itemsPerPage}${inStockDateParam}${processDateParam}${searchShipperParam}`;

    API.get(urlParam)
      .then((response) => {
        const timestamp = Date.now();
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "入庫_" + timestamp + ".csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
          openNotificationWithIcon("success", "", $lang.messages.success);
        }, 1000);
      })
      .catch((err) => {
        openNotificationWithIcon("error", "", err.messages);
      });
  };

  const handleRegister = (data, form) => {
    data.received_on = data.received_on.format("YYYY-MM-DD");
    data.processing_on = data.processing_on
      ? data.processing_on.format("YYYY-MM-DD")
      : null;
    data.received = data.processing_on ? 1 : 0;

    if (typeof data.id == "undefined") {
      createReceivePayment(data, form);
    } else {
      updateReceivePayment(data, form);
    }
  };

  const createReceivePayment = (data, form) => {
    API.post(receivedPaymentURL, data)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          "",
          $lang.messages.success_register_deposit
        );
        handleHideModal();
        setIsPosted(!isposted);
        form.resetFields();
      })
      .catch((err) => {
        openNotificationWithIcon("error", "", err.message);
      });
  };

  const updateReceivePayment = (data, form) => {
    API.put(`${receivedPaymentURL}/${data.id}`, data)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          "",
          $lang.messages.success_update_deposit
        );
        handleHideModal();
        setIsPosted(!isposted);
        form.resetFields();
      })
      .catch((err) => {
        openNotificationWithIcon("error", "", err.message);
      });
  };

  const deleteReceivePayment = () => {
    API.delete(`${receivedPaymentURL}/${handleId}`)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          "",
          $lang.messages.success_delete_deposit
        );
        setIsPosted(!isposted);
        setHandleId(null);
        handleHideDeleteModal();
      })
      .catch((err) => {
        openNotificationWithIcon("error", "", err.message);
      });
  };

  const handleHideDeleteModal = () => {
    setIsDeletedModalVisible(false);
  };

  const handleHideModal = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    getShippers();
  }, []);

  useEffect(() => {
    getReceivePayment();
  }, [currentPage, itemsPerPage, isposted]);

  return (
    <Content
      style={{ margin: "120px 10% 30px 10%" }}
      className="mx-auto flex flex-col justify-content content-h s-content"
    >
      <Card style={{ width: "100%" }} className="py-2 my-2" bordered={false}>
        <Row className="my-2">
          <Col span={1}>{$lang.received_on}:</Col>
          <DatePicker.RangePicker
            style={{ width: 250 }}
            value={inStockRangeDates}
            onChange={onchangeInStorkRangeDates}
          />
        </Row>
        <Row className="my-2">
          <Col span={1}>
            <label>{$lang.shipperName}:</label>
          </Col>
          <Col span={6}>
            <Select
              style={{ width: 250 }}
              options={shipperOptions}
              value={searchShipper.value}
              onChange={onChangeSearchShipper}
            />
            <p>
              {shipperOptions.length > 0 && (
                <span className="" style={{ marginLeft: 0 }}>
                  {$lang.shipperName} :&nbsp;&nbsp;
                  {shipperDisctription.code} &nbsp;/ &nbsp;
                  {shipperDisctription.closingDate}
                </span>
              )}{" "}
            </p>
          </Col>
        </Row>
        <Row className="my-2">
          <Col span={1}>{$lang.processing_on}:</Col>
          <DatePicker.RangePicker
            style={{ width: 250 }}
            value={processRangeDates}
            onChange={onchangeProcessRangeDates}
          />
        </Row>
        <Divider />
        <Row>
          {is_edit === 1 ? (
            <>
              <Space align="center">
                {" "}
                <Button
                  className="btn-bg-black"
                  style={{ marginLeft: 70 }}
                  onClick={getReceivePayment}
                >
                  {$lang.buttons.search}
                </Button>
                <Button
                  className="btn-bg-black ml-1"
                  onClick={exportDataAndDownloadCVS}
                >
                  {$lang.buttons.csvExchange}
                </Button>
              </Space>
            </>
          ) : (
            <></>
          )}
        </Row>
      </Card>
      <Card bordered={false} className="py-4 " style={{ marginTop: "20px" }}>
        {is_edit === 1 ? (
          <>
            <Row className="mb-5">
              <Col span={12}></Col>
              <Col span={12}>
                <Button
                  className="btn-bg-black"
                  style={{ float: "right", marginBottom: 10 }}
                  onClick={() => {
                    setModalData(null);
                    handleShowModal();
                  }}
                >
                  {$lang.buttons.register}
                </Button>
              </Col>
            </Row>
          </>
        ) : (
          <></>
        )}
        <ReceivedPaymentRegisterModal
          isOpen={isModalVisible}
          onClose={handleHideModal}
          onSave={handleRegister}
          initialValues={modalData}
        />
        <DeleteModal
          isOpen={isDeletedModalVisible}
          onClose={handleHideDeleteModal}
          onDelete={deleteReceivePayment}
          deletedId={handleId}
        />
        <ReceivedPaymentTable
          editRow={editRow}
          dataSource={receivedPaymentData}
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

export default ReceivedPaymentPage;
