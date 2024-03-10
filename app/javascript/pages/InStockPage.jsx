import React, { useState, useEffect } from "react";
import moment from "moment";
import dayjs from "dayjs";
import {
  Layout,
  Select,
  Space,
  Input,
  DatePicker,
  Divider,
  Card,
  Row,
  Col,
} from "antd";

import InStockTable from "../features/inStock/index.table";
import { openNotificationWithIcon } from "../components/common/notification";
import {
  warehouseURL,
  shipperURL,
  productDetailURL,
  saveStockInUrl,
  exportCSVDataUrl,
} from "../utils/constants";

import CustomButton from "../components/common/CustomButton";
import ConfirmModal from "../components/modal/confirm.modal";
import $lang from "../utils/content/jp.json";
import { API } from "../utils/helper";

const { Content } = Layout;
const dateFormat = "YYYY/MM/DD";

const InStockPage = ({ is_edit }) => {
  const [prepareProducts, setPrepareProducts] = useState([]);

  const [shipperDisctription, setShipperDescription] = useState({
    code: "",
    closingDate: "",
  });

  const [editMode, setEditMode] = useState("new");

  // ---------Warehouse--------
  const [selectedWarehouse, setSelectedWarehouse] = useState({
    value: "",
    label: "",
  });
  const [warehouseOptions, setWarehouseOptions] = useState([]);

  // ------------Shipper-----------
  const [seletedShipper, setSeletedShipper] = useState({
    value: "",
    label: "",
  });

  const [shipperOptions, setShipperOptions] = useState([]);

  const currentDate = dayjs().tz("Asia/Tokyo");

  // ----------------Openday--------------
  const [inStockDate, setInstockDate] = useState(
    dayjs(currentDate, dateFormat)
  );
  //

  // ---------product----------
  // const [selectedProduct, setSelectedProduct] = useState({
  //   value: "",
  //   label: "",
  // });
  const [isModalVisible, setIsConfirmModalVisible] = useState(false);

  const [product, setProduct] = useState("");
  const [searchProductTxt, setSearchProductTxt] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  // const [productOptions, setProductOptions] = useState("");

  // -----------packing---------
  const [packaging, setPackaging] = useState("");

  // --------storagePrice-------
  const [storagePrice, setStoragePrice] = useState("");

  // ----------handlePrice------------
  const [handlePrice, setHandlePrice] = useState("");

  // -------------lotNumber-----------
  const [lotNumber, setLotNumber] = useState("");

  // ---------------weight---------------
  const [weight, setWeight] = useState("");

  // -------------amount--------------
  const [amount, setStock] = useState("");

  //  -------init prepareProductItem--------
  const initPrepareProductItem = () => {
    setLotNumber("");
    setStock("");
    setWeight("");
  };

  const setPrepareProductItem = (editData) => {
    setLotNumber(editData.lot_number);
    setStock(editData.amount);
    setWeight(editData.weight);
    setPackaging(editData.product_type);
    setHandlePrice(editData.handling_fee_rate);
    setStoragePrice(editData.storage_fee_rate);

    setSelectedWarehouse({
      value: editData.warehouse_id,
      label: editData.warehouse_name,
    });

    setSeletedShipper({
      value: editData.shipper_id,
      label: editData.shipper_name,
    });

    setSelectedProductId(editData.product_id);
    setSearchProductTxt(editData.product_name);

    setInstockDate(dayjs.tz(new Date(editData.inout_on), "Asia/Tokyo"));
  };

  const onChangeWarehouse = (value, option) => {
    setSelectedWarehouse({ value: value, label: option.label });
  };

  const onChangeShipper = (value, option) => {
    setSeletedShipper({
      value: value,
      label: option.label,
    });
  };

  //  -------Get warehouse names--------
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

  // --------Get shipper data--------
  const getShippers = () => {
    API.get(shipperURL).then((res) => {
      const shippers = res.data.map((item) => {
        return {
          value: item.id,
          label: item.name,
          code: item.code,
          closingDate: item.closing_date,
        };
      });
      setShipperOptions(shippers);
      if (shippers.length > 0) {
        setSeletedShipper({
          value: shippers[0].value,
          label: shippers[0].label,
          code: shippers[0].code,
          closingDate: shippers[0].closingDate,
        });

        setShipperDescription({
          code: shippers[0].code,
          closingDate: shippers[0].closingDate,
        });
      }
    });
  };

  const savePrepareProducts = () => {
    if (prepareProducts.length == 0) {
      openNotificationWithIcon(
        "warning",
        $lang.popConfirmType.warning,
        $lang.messages.empty_in_stock_data
      );
      return;
    }

    API.post(saveStockInUrl, { stock_inout: prepareProducts })
      .then((res) => {
        setPrepareProducts([]);
        initPrepareProductItem();
        openNotificationWithIcon(
          "success",
          $lang.popConfirmType.success,
          $lang.messages.success
        );
      })
      .catch((err) => {
        openNotificationWithIcon(
          "error",
          $lang.popConfirmType.error,
          err.messages
        );
      });
  };

  const handleHideConfirmModal = () => {
    setIsConfirmModalVisible(false);
  };

  const isReadyPrepareProducts = () => {
    if (inStockDate == "") {
      openNotificationWithIcon(
        "warning",
        $lang.popConfirmType.warning,
        $lang.messages.input_inStock_date
      );
      return false;
    } else if (lotNumber == "") {
      openNotificationWithIcon(
        "warning",
        $lang.popConfirmType.warning,
        $lang.messages.input_lotNumber
      );
      return false;
    } else if (amount == "") {
      openNotificationWithIcon(
        "warning",
        $lang.popConfirmType.warning,
        $lang.messages.input_stock
      );
      return false;
    } else if (weight == "") {
      openNotificationWithIcon(
        "warning",
        $lang.popConfirmType.warning,
        $lang.messages.input_weight
      );
      return false;
    } else if (selectedProductId == "") {
      openNotificationWithIcon(
        "warning",
        $lang.popConfirmType.warning,
        $lang.messages.input_product_name
      );
      return false;
    }

    return true;
  };

  const doPrepareProducts = () => {
    if (!isReadyPrepareProducts()) return;

    let selectedProductArr = prepareProducts.slice();
    const inStockDateStr = inStockDate.format("YYYY/MM/DD");

    const newData = {
      handling_fee_rate: handlePrice,
      storage_fee_rate: storagePrice,
      product_id: selectedProductId,
      product_name: searchProductTxt,
      product_type: packaging,
      catagory: 0,
      lot_number: lotNumber,
      weight: weight,
      amount: amount,
      warehouse_id: selectedWarehouse.value,
      warehouse_name: selectedWarehouse.label,
      shipper_id: seletedShipper.value,
      shipper_name: seletedShipper.label,
      inout_on: inStockDateStr,
      idx: selectedProductArr.length + 1,
      category: 0,
    };

    selectedProductArr.push(newData);

    setPrepareProducts(selectedProductArr);
    initPrepareProductItem();
  };

  const editRow = (productId) => {
    const oldData = prepareProducts.slice();
    const editData = oldData.filter((data) => data.product_id == productId)[0];

    setPrepareProductItem(editData);
    setEditMode("edit");
  };

  const deleteRow = (id) => {
    const newData = prepareProducts.slice();
    const delData = newData.filter((data) => data.product_id == id)[0];
    const index = newData.indexOf(delData);
    newData.splice(index, 1);
    setPrepareProducts(newData);
  };

  const cancelEdit = () => {
    setEditMode("new");
    initPrepareProductItem();
  };

  const updatePrepareProduct = () => {
    let oldData = prepareProducts.slice();
    const updateData = oldData.filter(
      (item) => item.product_id == selectedProductId
    )[0];

    updateData.warehouse_id = selectedWarehouse.value;
    updateData.warehouse_name = selectedWarehouse.label;
    updateData.shipper_id = seletedShipper.value;
    updateData.shipper_name = seletedShipper.label;
    updateData.inout_on = inStockDate.format("YYYY/MM/DD");

    updateData.lot_number = lotNumber;
    updateData.weight = weight;
    updateData.amount = amount;
    updateData.handling_fee_rate = handlePrice;
    updateData.storage_fee_rate = storagePrice;

    setPrepareProducts(oldData);
    setEditMode("new");
  };

  const getCSVData = () => {
    return prepareProducts.map((item) => {
      return {
        product_name: item.product_name,
        product_type: item.product_type,
        lot_number: item.lot_number,
        weight: item.weight,
        amount: item.amount,
      };
    });
  };

  const exportDataAndDownloadCVS = async () => {
    const csvData = getCSVData();
    if (csvData.length == 0) {
      openNotificationWithIcon(
        "warning",
        $lang.messages.warning,
        "empty data to export"
      );
      return;
    }

    API.post(exportCSVDataUrl, { data: csvData })
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
          openNotificationWithIcon(
            "success",
            $lang.popConfirmType.success,
            $lang.messages.success
          );
        }, 1000);
      })
      .catch((err) => {
        openNotificationWithIcon(
          "error",
          $lang.popConfirmType.error,
          err.messages
        );
      });
  };
  const handleSearchProduct = (e) => {
    setSearchProductTxt(e.target.value);
  };

  const getProduct = () => {
    API.get(`${productDetailURL}?q=${searchProductTxt}`).then((res) => {
      if (res.data.length > 0) {
        const warehouseFee = res.data[0].warehouse_fee;
        setPackaging(warehouseFee.packaging);
        setSearchProductTxt(res.data[0].name);
        setSelectedProductId(res.data[0].id);
        setStoragePrice(warehouseFee.storage_fee_rate);
        setHandlePrice(warehouseFee.handling_fee_rate);
      } else {
        openNotificationWithIcon(
          "warning",
          $lang.popConfirmType.warning,
          $lang.messages.not_register_product
        );
      }
    });
  };
  // ----------When rerender, get all data------
  useEffect(() => {
    getWarehouses();
    getShippers();
  }, []);

  useEffect(() => {
    const shipper = shipperOptions.filter(
      (item) => item.value == seletedShipper.value
    );
    setShipperDescription({
      code: shipper.length > 0 ? shipper[0].code : "",
      closingDate: shipper.length > 0 ? shipper[0].closingDate : "",
    });
  }, [seletedShipper]);

  return (
    <div>
      <Content
        style={{ width: 1280, marginTop: 20 }}
        className="mx-auto flex flex-col justify-content content-h"
      >
        <Card
          style={{ width: "100%", marginTop: 10, marginBottom: 10 }}
          className="py-2 my-2"
          bordered={false}
        >
          <Row className="my-2">
            <Col span={1}>
              <label>{$lang.inStock.warehouse}: </label>
            </Col>
            <Col span={6}>
              {warehouseOptions.length > 0 && (
                <Select
                  placeholder={$lang.inStock.warehouse}
                  style={{ width: 150, marginLeft: 14 }}
                  value={selectedWarehouse}
                  options={warehouseOptions}
                  onChange={onChangeWarehouse}
                />
              )}
            </Col>
          </Row>
          <Row className="my-2">
            <Col span={1}>
              <label>{$lang.inStock.shipper}:</label>
            </Col>
            <Col span={6}>
              {shipperOptions.length > 0 && (
                <>
                  <Select
                    style={{ width: 300, marginLeft: 14 }}
                    onChange={onChangeShipper}
                    options={shipperOptions}
                    value={seletedShipper.value}
                    defaultValue={""}
                    placeholder={$lang.inStock.shipper}
                  />
                  {shipperOptions.length > 0 && (
                    <span className="" style={{ marginLeft: 16 }}>
                      {$lang.inStock.shipper} :&nbsp;&nbsp;
                      {shipperDisctription.code} &nbsp;/ &nbsp;
                      {shipperDisctription.closingDate}
                    </span>
                  )}
                </>
              )}
            </Col>
          </Row>
          <Row className="my-2">
            <Col span={1}>
              <label>{$lang.inStock.inStockDate}:</label>
            </Col>
            <Col span={6}>
              <div className="ml-2">
                <DatePicker
                  style={{ width: 150 }}
                  value={inStockDate}
                  onChange={(date, dt) => {
                    if (dt == "") {
                      setInstockDate(dayjs(currentDate, dateFormat));
                    } else {
                      setInstockDate(dayjs(date, dateFormat));
                    }
                  }}
                  defaultValue={dayjs(currentDate, dateFormat)}
                  placeholder={$lang.inStock.inStockDate}
                  className="ml-1"
                  format={dateFormat}
                />
              </div>
            </Col>
          </Row>
          <Row className="my-2">
            <Col span={1}>
              <label>{$lang.inStock.productName}:</label>
            </Col>
            <Col span={10}>
              <Space.Compact block className="ml-3">
                <Input
                  style={{ width: 150 }}
                  placeholder={$lang.inStock.productName}
                  value={searchProductTxt}
                  onChange={handleSearchProduct}
                  onPressEnter={(e) => {
                    if (e.keyCode === 13) {
                      getProduct();
                    }
                  }}
                />
                <Input
                  style={{ width: 150 }}
                  placeholder={$lang.inStock.packing}
                  value={packaging}
                  disabled
                />
                <Input
                  style={{ width: 100 }}
                  placeholder={$lang.inStock.cargoPrice}
                  value={handlePrice}
                  onChange={(e) => {
                    setHandlePrice(e.target.value);
                  }}
                />
                <Input
                  style={{ width: 100 }}
                  placeholder={$lang.inStock.storagePrice}
                  value={storagePrice}
                  onChange={(e) => {
                    setStoragePrice(e.target.value);
                  }}
                />
              </Space.Compact>
            </Col>
          </Row>
          <Row>
            <Col span={1}></Col>
            <Col span={16}>
              <Space.Compact block className="ml-3">
                <Input
                  style={{ width: 200 }}
                  placeholder={$lang.inStock.lotNumber}
                  value={lotNumber}
                  onChange={(e) => {
                    setLotNumber(e.target.value);
                  }}
                />
                <Input
                  type="number"
                  min={0}
                  style={{ width: 100 }}
                  placeholder={$lang.inStock.weight + "(kg)"}
                  value={weight}
                  onChange={(e) => {
                    setWeight(e.target.value);
                  }}
                />
                <Input
                  type="number"
                  style={{ width: 100 }}
                  placeholder={$lang.inStock.itemNumber}
                  value={amount}
                  min={0}
                  onChange={(e) => {
                    setStock(e.target.value);
                  }}
                />
              </Space.Compact>
            </Col>
          </Row>
          <Divider />
          <Row>
            <Col span={1}></Col>
            {is_edit === 1 ? (
              <Col span={6}>
                <CustomButton
                  onClick={doPrepareProducts}
                  className="px-5 ml-2 btn-bg-black"
                  title={$lang.buttons.add}
                  htmlType="submit"
                  visability={editMode != "edit"}
                />
                <CustomButton
                  onClick={updatePrepareProduct}
                  className="px-5 ml-2 btn-bg-black"
                  title={$lang.buttons.change}
                  visability={editMode == "edit"}
                />
                <CustomButton
                  onClick={cancelEdit}
                  className="px-5 ml-2 default"
                  title={$lang.buttons.cancel}
                  visability={editMode == "edit"}
                />
              </Col>
            ) : (
              <></>
            )}
          </Row>
        </Card>
        <Card
          style={{ width: "100%", marginTop: 10, marginBottom: 20 }}
          className="py-4 my-2"
          bordered={false}
        >
          <InStockTable
            data={prepareProducts}
            editRow={(key) => editRow(key)}
            deleteRow={deleteRow}
            pagination={false}
            is_edit={is_edit}
          />
          {is_edit === 1 ? (
            <div
              style={{
                justifyContent: "flex-end",
                display: "flex",
                marginTop: 15,
              }}
            >
              <CustomButton
                title={$lang.buttons.csvExchange}
                className="mr-2 btn-bg-black"
                visability={true}
                onClick={exportDataAndDownloadCVS}
              ></CustomButton>
              <ConfirmModal
                isOpen={isModalVisible}
                onConfirm={() => {
                  handleHideConfirmModal();
                  savePrepareProducts();
                }}
                onClose={handleHideConfirmModal}
                message={$lang.messages.confirm_instock}
              />
              <CustomButton
                onClick={setIsConfirmModalVisible}
                title={$lang.buttons.confirmInStock}
                visability={true}
              ></CustomButton>
            </div>
          ) : (
            <div></div>
          )}
        </Card>
      </Content>
    </div>
  );
};

export default InStockPage;
