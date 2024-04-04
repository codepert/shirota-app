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
  Button,
} from "antd";

import InStockTable from "../features/inStock/index.table";
import { openNotificationWithIcon } from "../components/common/notification";
import {
  warehouseURL,
  responsibleWarehouseURL,
  shipperURL,
  productDetailURL,
  saveStockInUrl,
  exportCSVDataUrl,
  checkStockInUrl,
  stockInoutURL,
  warehouseCategoryURL,
} from "../utils/constants";

import CustomButton from "../components/common/CustomButton";
import ConfirmModal from "../components/common/modal/confirm.modal";
import ConfirmPopver from "../components/common/popver/confirm.popver";
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

  const [warehouseCategoryOptions, setWarehouseCategoryOptions] = useState([]);
  const [selectedWarehouseCategory, setSelectedWarehouseCategory] = useState({
    value: "",
    label: "",
  });
  const [isModalVisible, setIsConfirmModalVisible] = useState(false);

  const [product, setProduct] = useState("");
  const [searchProductTxt, setSearchProductTxt] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  // const [productOptions, setProductOptions] = useState("");

  const [productName, setProductName] = useState("");
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

  const [isConfirmResetModalOpen, setIsConfirmResetModalOpen] = useState(false);
  const [isFindButtonDisabled, setIsFindButtonDisabled] = useState(false);
  //  -------init prepareProductItem--------
  const initPrepareProductItem = () => {
    setLotNumber("");
    setStock("");
    setWeight("");
  };

  const setPrepareProductItem = (editData) => {
    setLotNumber(editData.lot_number);
    setProductName(editData.product_name);
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
    setSearchProductTxt(editData.product_code);

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
    API.get(responsibleWarehouseURL).then((res) => {
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
        "",
        $lang.messages.empty_in_stock_data
      );
      return;
    }

    API.post(saveStockInUrl, { stock_inout: prepareProducts })
      .then((res) => {
        setPrepareProducts([]);
        initPrepareProductItem();
        openNotificationWithIcon("success", "", $lang.messages.success_instock);
        setIsFindButtonDisabled(false);
      })
      .catch((err) => {
        openNotificationWithIcon("error", "", err.messages);
      });
  };

  const handleHideConfirmModal = () => {
    setIsConfirmModalVisible(false);
  };

  const isReadyPrepareProducts = () => {
    if (inStockDate == "") {
      openNotificationWithIcon(
        "warning",
        "",
        $lang.messages.input_inStock_date
      );
      return false;
    } else if (lotNumber == "") {
      openNotificationWithIcon("warning", "", $lang.messages.input_lotNumber);
      return false;
    } else if (amount == "") {
      openNotificationWithIcon("warning", "", $lang.messages.input_stock);
      return false;
    } else if (weight == "") {
      openNotificationWithIcon("warning", "", $lang.messages.input_weight);
      return false;
    } else if (selectedProductId == "") {
      openNotificationWithIcon(
        "warning",
        "",
        $lang.messages.input_product_name
      );
      return false;
    }

    return true;
  };

  const doPrepareProducts = () => {
    if (!isReadyPrepareProducts()) return;

    const url =
      checkStockInUrl +
      `?lot_number=${lotNumber}&warehouse_id=${selectedWarehouse.value}&shipper_id=${seletedShipper.value}&product_id=${selectedProductId}`;
    API.get(url)
      .then((res) => {
        if (res.data.status != "ok") {
          openNotificationWithIcon(
            "warning",
            "",
            $lang.messages.exist_stock_with_equal_lot_number
          );
          return;
        }
        let selectedProductArr = prepareProducts.slice();
        const inStockDateStr = inStockDate.format("YYYY/MM/DD");

        const newData = {
          stock_inout_id: 0,
          handling_fee_rate: handlePrice,
          storage_fee_rate: storagePrice,
          product_id: selectedProductId,
          product_code: searchProductTxt,
          product_name: productName,
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
          warehouse_category_id: selectedWarehouseCategory.value,
          warehouse_category_name: selectedWarehouseCategory.label,
          category: 0,
        };

        selectedProductArr.push(newData);

        setPrepareProducts(selectedProductArr);
        initPrepareProductItem();
      })
      .then((err) => {});
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
    updateData.warehouse_category_id = selectedWarehouseCategory.value;
    updateData.warehouse_category_name = selectedWarehouseCategory.label;

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
      openNotificationWithIcon("warning", "", $lang.messages.empty_export_data);
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
            "",
            $lang.messages.success_export_data
          );
        }, 1000);
      })
      .catch((err) => {
        openNotificationWithIcon("error", "", err.messages);
      });
  };
  const handleSearchProduct = (e) => {
    setSearchProductTxt(e.target.value);
  };

  const getProduct = () => {
    API.get(
      `${productDetailURL}?q=${searchProductTxt}&warehouse_id=${selectedWarehouse.value}`
    ).then((res) => {
      if (res.data.length > 0) {
        const warehouseFee = res.data[0].warehouse_fee;
        setProductName(res.data[0].name);
        setPackaging(warehouseFee.packaging);
        setSearchProductTxt(res.data[0].code);
        setSelectedProductId(res.data[0].id);
        setStoragePrice(warehouseFee.storage_fee_rate);
        setHandlePrice(warehouseFee.handling_fee_rate);
        setWeight(res.data[0].weight);
      } else {
        openNotificationWithIcon(
          "warning",
          "",
          $lang.messages.not_register_product_or_responsibe_warehouse
        );
        setProductName("");
        setPackaging("");
        setSearchProductTxt("");
        setSelectedProductId("");
        setStoragePrice("");
        setHandlePrice("");
        setWeight("");
      }
    });
  };

  const resetPrepareProducts = () => {
    setPrepareProducts([]);
    setIsFindButtonDisabled(false);
  };

  const handleHideConfirmResetModal = () => {
    setIsConfirmResetModalOpen(false);
  };

  const getInStockData = () => {
    const url =
      stockInoutURL +
      "?shipper_id=" +
      seletedShipper.value +
      "&warehouse_id=" +
      selectedWarehouse.value +
      "&inout_on=" +
      inStockDate.format("YYYY-MM-DD") +
      "&category=0";

    API.get(url)
      .then((res) => {
        console.log(res.data);
        const data = res.data.map((item, i) => {
          return {
            stock_inout_id: item.id,
            handling_fee_rate: item.handling_fee_rate,
            storage_fee_rate: item.storage_fee_rate,
            product_id: item.product_id,
            product_code: item.product_code,
            product_name: item.product_name,
            product_type: item.product_type,
            catagory: 0,
            lot_number: item.lot_number,
            weight: item.weight,
            amount: item.amount,
            warehouse_id: selectedWarehouse.value,
            warehouse_name: selectedWarehouse.label,
            shipper_id: seletedShipper.value,
            shipper_name: seletedShipper.label,
            inout_on: item.inout_on.replace(/\-/g, "/"),
            warehouse_category_id: item.warehouse_category_id,
            warehouse_category_name: item.warehouse_category_name,
            idx: i,
          };
        });
        setPrepareProducts(data);
      })
      .catch((err) => {});
  };

  const getWarehouseCategory = () => {
    API.get(warehouseCategoryURL + "?warehouse_id=" + selectedWarehouse.value)
      .then((res) => {
        const data = res.data.map((item) => {
          return {
            value: item.id,
            label: item.storage_category,
          };
        });

        if (data.length > 0) {
          setWarehouseCategoryOptions(data);
          setSelectedWarehouseCategory({
            value: data[0].value,
            label: data[0].label,
          });
        }
      })
      .catch((err) => {});
  };

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
    if (prepareProducts.length > 0 && editMode == "create") {
      openNotificationWithIcon(
        "warning",
        "",
        $lang.messages.warning_stock_inout_section_1_change
      );
      const oldData = prepareProducts.slice();
      for (let i = 0; i < oldData.length; i++) {
        oldData[i].shipper_id = seletedShipper.value;
        oldData[i].shipper_name = seletedShipper.label;
      }

      setPrepareProducts(oldData);
    }
  }, [seletedShipper]);

  useEffect(() => {
    if (prepareProducts.length > 0 && editMode == "create") {
      openNotificationWithIcon(
        "warning",
        "",
        $lang.messages.warning_stock_inout_section_1_change
      );
      const oldData = prepareProducts.slice();
      for (let i = 0; i < oldData.length; i++) {
        oldData[i].warehouse_id = selectedWarehouse.value;
        oldData[i].warehouse_name = selectedWarehouse.label;
      }
      setPrepareProducts(oldData);
    }
    getWarehouseCategory();
  }, [selectedWarehouse]);

  useEffect(() => {
    if (prepareProducts.length > 0 && editMode == "create") {
      openNotificationWithIcon(
        "warning",
        "",
        $lang.messages.warning_stock_inout_section_1_change
      );
      const oldData = prepareProducts.slice();
      for (let i = 0; i < prepareProducts.length; i++) {
        oldData[i].inout_on = inStockDate.format("YYYY-MM-DD");
      }
      setPrepareProducts(oldData);
    }
  }, [inStockDate]);

  return (
    <div>
      <Content
        style={{ margin: "120px 10% 30px 10%" }}
        className="mx-auto flex flex-col justify-content content-h"
      >
        <Card style={{ width: "100%" }} className="py-2" bordered={false}>
          <div
            style={{
              padding: "10px 20px 0 20px",
            }}
          >
            <Row className="my-2">
              <Col span={2}>
                <label>{$lang.handling_warehouse}: </label>
              </Col>
              <Col span={6}>
                {warehouseOptions.length > 0 && (
                  <Select
                    placeholder={$lang.handling_warehouse}
                    style={{ width: 150 }}
                    value={selectedWarehouse}
                    options={warehouseOptions}
                    onChange={onChangeWarehouse}
                  />
                )}
              </Col>
            </Row>
            <Row className="my-2">
              <Col span={2}>
                <label>{$lang.shipperName}:</label>
              </Col>
              <Col span={4}>
                {shipperOptions.length > 0 && (
                  <>
                    <Select
                      style={{ width: 300 }}
                      onChange={onChangeShipper}
                      options={shipperOptions}
                      value={seletedShipper.value}
                      defaultValue={""}
                      placeholder={$lang.shipperName}
                    />
                    <Row>
                      {shipperOptions.length > 0 && (
                        <span className="" style={{ fontSize: 12 }}>
                          {$lang.shipperCode} :&nbsp;&nbsp;
                          {shipperDisctription.code} &nbsp; &nbsp;
                          {$lang.closingDate}: {shipperDisctription.closingDate}
                        </span>
                      )}
                    </Row>
                  </>
                )}
              </Col>
            </Row>
            <Row className="my-2">
              <Col span={2}>
                <label>{$lang.inStockDate}:</label>
              </Col>
              <Col span={6}>
                <div>
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
                    placeholder={$lang.inStockDate}
                    className="ml-1"
                    format={dateFormat}
                  />
                  <Button
                    style={{ marginLeft: 10 }}
                    onClick={getInStockData}
                    disabled={isFindButtonDisabled}
                    type="primary"
                  >
                    {$lang.buttons.find}
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
          <Divider />
          <div
            style={{
              padding: "0px 20px 10px 20px",
            }}
          >
            <Row className="my-2">
              <Col span={2}>
                <label>{$lang.productCode}:</label>
              </Col>
              <Col span={10}>
                <Input
                  style={{ width: 150 }}
                  placeholder={$lang.productCode}
                  value={searchProductTxt}
                  onChange={handleSearchProduct}
                  onPressEnter={(e) => {
                    if (e.keyCode === 13) {
                      getProduct();
                    }
                  }}
                />
              </Col>
            </Row>
            <Row className="my-2">
              <Col span={2}></Col>
              <Col span={10}>
                <Space className="">
                  <Space direction="vertical">
                    <div>{$lang.productName}</div>
                    <Input
                      style={{ width: 250 }}
                      placeholder={$lang.productName}
                      value={productName}
                    />
                  </Space>
                  <Space direction="vertical">
                    <div>{$lang.packaging}</div>
                    <Input
                      style={{ width: 150 }}
                      placeholder={$lang.packing}
                      value={packaging}
                      disabled
                    />
                  </Space>
                  <Space direction="vertical">
                    <div>{$lang.weight}</div>
                    <Input
                      type="number"
                      min={0}
                      style={{ width: 120 }}
                      placeholder={$lang.weight + "(kg)"}
                      value={weight}
                      disabled
                      onChange={(e) => {
                        setWeight(e.target.value);
                      }}
                    />
                  </Space>
                  <Space direction="vertical">
                    <div>{$lang.handlingFeeUnitPrice}</div>
                    <Input
                      style={{ width: 100 }}
                      placeholder={$lang.cargoPrice}
                      value={handlePrice}
                      onChange={(e) => {
                        setHandlePrice(e.target.value);
                      }}
                    />
                  </Space>
                  <Space direction="vertical">
                    <div>{$lang.storageFeeUnitPrice}</div>
                    <Input
                      style={{ width: 100 }}
                      placeholder={$lang.storagePrice}
                      value={storagePrice}
                      onChange={(e) => {
                        setStoragePrice(e.target.value);
                      }}
                    />
                  </Space>
                </Space>
              </Col>
            </Row>
            <Row>
              <Col span={2}></Col>
              <Col span={16}>
                <Space.Compact block>
                  <Space direction="vertical">
                    <div>{$lang.storageDivision}</div>
                    <Select
                      placeholder={$lang.storageDivision}
                      style={{ width: 150 }}
                      value={selectedWarehouseCategory}
                      options={warehouseCategoryOptions}
                      onChange={(val, options) => {
                        setSelectedWarehouseCategory({
                          value: val,
                          label: options.label,
                        });
                      }}
                    />
                  </Space>
                  <Space direction="vertical" style={{ marginLeft: 10 }}>
                    <div>{$lang.lotNumber}</div>
                    <Input
                      style={{ width: 150 }}
                      placeholder={$lang.lotNumber}
                      value={lotNumber}
                      onChange={(e) => {
                        setLotNumber(e.target.value);
                      }}
                    />
                  </Space>
                  <Space direction="vertical">
                    <div>{$lang.instockAmount}</div>
                    <Input
                      type="number"
                      style={{ width: 100 }}
                      placeholder={$lang.instockAmount}
                      value={amount}
                      min={0}
                      onChange={(e) => {
                        setStock(e.target.value);
                      }}
                    />
                  </Space>
                  {is_edit === 1 ? (
                    <Col span={6} style={{ marginTop: 30, marginLeft: 30 }}>
                      <Button
                        onClick={doPrepareProducts}
                        className="px-5 ml-2 btn-bg-black"
                        title={$lang.buttons.add}
                        hidden={editMode == "edit"}
                        type="primary"
                      >
                        {$lang.buttons.add}
                      </Button>
                      <Button
                        onClick={updatePrepareProduct}
                        className="px-5 ml-2 btn-bg-black"
                        title={$lang.buttons.change}
                        hidden={editMode != "edit"}
                        type="primary"
                      >
                        {$lang.buttons.change}
                      </Button>
                      <Button
                        onClick={cancelEdit}
                        className="px-5 ml-2 default"
                        title={$lang.buttons.cancel}
                        hidden={editMode != "edit"}
                      >
                        {$lang.buttons.cancel}
                      </Button>
                    </Col>
                  ) : (
                    <></>
                  )}
                </Space.Compact>
              </Col>
            </Row>
          </div>
        </Card>
        <Card
          style={{ width: "100%", marginTop: 20, marginBottom: 10 }}
          className="py-4 "
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
            <Row
              style={{
                justifyContent: "space-between",
                display: "flex",
                marginTop: 15,
              }}
            >
              <Col>
                <Button
                  onClick={() => {
                    if (prepareProducts.length > 0)
                      setIsConfirmResetModalOpen(true);
                  }}
                  style={{
                    marginRight: 10,
                  }}
                  danger
                >
                  {$lang.buttons.reset}
                </Button>
                <ConfirmModal
                  isOpen={isConfirmResetModalOpen}
                  onConfirm={() => {
                    handleHideConfirmResetModal();
                    resetPrepareProducts();
                  }}
                  onClose={handleHideConfirmResetModal}
                  message={
                    $lang.messages.warning_reset_prepare_inout_stock_list
                  }
                />
              </Col>
              <Col>
                <Button
                  onClick={exportDataAndDownloadCVS}
                  style={{
                    marginRight: 10,
                  }}
                >
                  {$lang.buttons.csvExchange}
                </Button>
                <ConfirmModal
                  isOpen={isModalVisible}
                  onConfirm={() => {
                    handleHideConfirmModal();
                    savePrepareProducts();
                  }}
                  onClose={handleHideConfirmModal}
                  message={$lang.messages.confirm_instock}
                />
                <Button onClick={setIsConfirmModalVisible} type="primary">
                  {$lang.buttons.confirmInStock}
                </Button>
              </Col>
            </Row>
          ) : (
            <div></div>
          )}
        </Card>
      </Content>
    </div>
  );
};

export default InStockPage;
