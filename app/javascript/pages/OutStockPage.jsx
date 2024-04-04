import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
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
import {
  warehouseURL,
  responsibleWarehouseURL,
  shipperURL,
  productStockURL,
  saveStockOutUrl,
  exportCSVDataUrl,
  stockInoutURL,
  warehouseCategoryURL,
} from "../utils/constants";

import { Content } from "antd/es/layout/layout";
import { dateFormat } from "../utils/constants";

import CustomButton from "../components/common/CustomButton";
import { openNotificationWithIcon } from "../components/common/notification";
import ConfirmModal from "../components/common/modal/confirm.modal";

import OutStockTable from "../features/outStock/index.table";
import { getDateStr, API } from "../utils/helper";
import $lang from "../utils/content/jp.json";

const OutStockPage = ({ is_edit }) => {
  const [editMode, setEditMode] = useState("new");

  // ---------Warehouse--------
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");

  // ------------Shipper-----------
  const [shipperOptions, setShipperOptions] = useState([]);
  const [selectedShipperId, setSelectedShipperId] = useState("");
  const [shipperDisctription, setShipperDescription] = useState({
    code: "",
    closingDate: "",
  });
  // ---------product----------
  const currentDate = dayjs().tz("Asia/Tokyo");

  const [outStockDate, setOutStockDate] = useState(
    dayjs(currentDate, dateFormat)
  );
  const [inStockDate, setInStockDate] = useState("");

  // -----------packing---------
  const [packaging, setPackaging] = useState("");

  // --------storagePrice-------
  const [storagePrice, setStoragePrice] = useState("");

  // ----------handlePrice------------
  const [handlePrice, setHandlePrice] = useState("");

  // ---------------outStockAmount---------------
  const [outStockAmount, setOutStockAmount] = useState("");

  // -------------amount--------------
  const [stockAmount, setStockAmount] = useState("");

  const [prepareProducts, setPrepareProducts] = useState([]);

  const [searchProductTxt, setSearchProductTxt] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedStockInoutId, setSelectedStockInoutId] = useState("");
  const [stockInoutOptions, setStockInoutOptions] = useState([]);
  const [isModalVisible, setIsConfirmModalVisible] = useState(false);
  const [weight, setWeight] = useState("");
  const [isConfirmResetModalOpen, setIsConfirmResetModalOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [isFindButtonDisabled, setIsFindButtonDisabled] = useState(false);
  const [warehouseCategoryOptions, setWarehouseCategoryOptions] = useState([]);
  const [selectedWarehouseCategory, setSelectedWarehouseCategory] = useState({
    value: "",
    label: "",
  });
  const [selectedWarehouseCategoryId, setSelectedWarehouseCategoryId] =
    useState("");
  const initWarehouseFee = () => {
    setPackaging("");
    setStoragePrice("");
    setHandlePrice("");
    setInStockDate("");
    setStockAmount("");
  };
  //  -------init prepareProductItem--------
  const initPrepareProductItem = () => {
    setOutStockAmount("");
  };

  const getWarehouses = () => {
    API.get(responsibleWarehouseURL)
      .then((res) => {
        const warehouses = res.data.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        });

        setWarehouseOptions(warehouses);
        if (warehouses.length > 0) setSelectedWarehouseId(warehouses[0].value);
      })
      .catch((err) => {});
  };

  // --------Get shipper data--------
  const getShippers = () => {
    API.get(shipperURL)
      .then((res) => {
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
          setSelectedShipperId(shippers[0].value);

          setShipperDescription({
            code: shippers[0].code,
            closingDate: shippers[0].closingDate,
          });
        }
      })
      .catch((err) => {});
  };

  // --------Get product data--------
  const getProduct = () => {
    const url = `${productStockURL}?q=${searchProductTxt}&warehouse_id=${selectedWarehouseId}&shipper_id=${selectedShipperId}`;
    API.get(url).then((res) => {
      if (res.data.product.length > 0) {
        const product = res.data.product[0];
        const warehouseFee = res.data.product[0].warehouse_fee;

        setPackaging(warehouseFee.packaging);
        setSearchProductTxt(product.code);
        setProductName(product.name);
        setSelectedProductId(product.id);
        setStoragePrice(warehouseFee.storage_fee_rate);
        setHandlePrice(warehouseFee.handling_fee_rate);
        const instocks = res.data.in_stock.map((item, i) => {
          return {
            value: item.id,
            label: item.lot_number,
            stock_id: item.stock_id,
            inout_on: item.inout_on,
            amount: item.amount,
            weight: item.weight,
            lot_number: item.lot_number,
            warehouse_category_id: item.warehouse_category_id,
          };
        });
        setSelectedWarehouseCategoryId(instocks[0].warehouse_category_id);
        setStockInoutOptions(instocks);
        // setSelectedStockInoutId(instocks[0].value);
        setWeight(instocks[0].weight);
      } else {
        openNotificationWithIcon(
          "warning",
          "",
          $lang.messages.not_instock_product_or_responsibe_warehouse
        );
        setPackaging("");
        setSearchProductTxt("");
        setProductName("");
        setSelectedProductId("");
        setStoragePrice("");
        setHandlePrice("");
        setSelectedWarehouseCategoryId("");
        setStockInoutOptions("");
        setWeight("");
      }
    });
  };

  const isReadyPrepareProducts = () => {
    if (selectedStockInoutId == "") {
      openNotificationWithIcon(
        "warning",
        "",
        $lang.messages.input_product_name
      );
      return false;
    }
    if (outStockDate == "") {
      openNotificationWithIcon(
        "warning",
        "",
        $lang.messages.input_out_stock_date
      );
      return false;
    }
    if (outStockAmount == "") {
      openNotificationWithIcon("warning", "", $lang.messages.input_out_amount);
      return false;
    }
    if (outStockAmount > stockAmount) {
      openNotificationWithIcon("warning", "", $lang.messages.stockAmountError);

      return false;
    }

    if (selectedWarehouseCategoryId == "") {
      openNotificationWithIcon(
        "warning",
        "",
        $lang.messages.selected_warehouse_category
      );

      return false;
    }

    return true;
  };

  const doPrepareProducts = () => {
    if (!isReadyPrepareProducts()) return;
    let selectedStockInoutArr = prepareProducts.slice();
    const outStockDateStr = outStockDate.format("YYYY/MM/DD");

    const stockInout = stockInoutOptions.filter(
      (item) => item.value == selectedStockInoutId
    )[0];

    const selectedWarehouse = warehouseOptions.filter(
      (item) => (item.value = selectedWarehouseId)
    )[0];
    const selectedShipper = shipperOptions.filter(
      (item) => item.value == selectedShipperId
    )[0];

    const selectedWarehouseCategory = warehouseCategoryOptions.filter(
      (item) => item.value == selectedWarehouseCategoryId
    );

    const newTableRecordData = {
      //main data
      index: selectedStockInoutArr.length + 1,
      product_code: searchProductTxt,
      product_name: productName,
      packaging: packaging,
      lot_number: stockInout.lot_number,
      stock_amount: stockAmount,
      amount: outStockAmount,
      weight: stockInout.weight,
      //asset data
      warehouse_name: selectedWarehouse.label,
      shipper_name: selectedShipper.label,
      inout_on: outStockDateStr,
      in_stock_date: inStockDate,

      warehouse_category_id: selectedWarehouseCategory[0].value,
      warehouse_category_name: selectedWarehouseCategory[0].label,
      // memory data
      stock_id: stockInout.stock_id,
      stock_inout_id: stockInout.value,
      warehouse_id: selectedWarehouse.value,
      shipper_id: selectedShipper.value,
      handling_fee_rate: handlePrice,
      storage_fee_rate: storagePrice,
      category: 1,
    };

    selectedStockInoutArr.push(newTableRecordData);
    setPrepareProducts(selectedStockInoutArr);
    initPrepareProductItem();
    setStockAmount(stockAmount - outStockAmount);
    setIsFindButtonDisabled(true);
  };

  const EditPrepareProduct = (rowId) => {
    const oldData = prepareProducts.slice();
    const editData = oldData.filter((item, i) => i == rowId)[0];
    console.log("oldData", editData);
    if (editData.warehouse_id != selectedWarehouseId) {
      setSelectedWarehouseId(editData.warehouse_id);
    }

    if (editData.shipper_id != selectedShipperId) {
      setSelectedShipperId(editData.shipper_id);
    }

    if (editData.stock_inout_id != selectedStockInoutId) {
      setSelectedStockInoutId(editData.stock_inout_id);
    }

    if (editData.warehouse_category_id != selectedWarehouseCategoryId) {
      setSelectedWarehouseCategoryId(editData.warehouse_category_id);
    }

    setPrepareProductItem(editData);
    setEditMode("edit");
  };

  const setPrepareProductItem = (editData) => {
    // setStock(editData.stock_amount);
    setSearchProductTxt(editData.product_code);
    setProductName(editData.product_name);
    setInStockDate(editData.in_stock_date);
    setOutStockAmount(editData.amount);
    // setOutStockDate(moment(new Date(editData.inout_on)));
    setOutStockDate(dayjs.tz(new Date(editData.inout_on), "Asia/Tokyo"));
    setPackaging(editData.packaging);
    setHandlePrice(editData.handling_fee_rate);
    setStoragePrice(editData.storage_fee_rate);

    // setStockAmount(stockAmount * 1 + editData.amount * 1);
    setStockAmount(editData.stock_amount);

    setStockInoutOptions([
      {
        value: editData.stock_inout_id,
        label: editData.lot_number,
        stock_id: editData.stock_id,
        inout_on: editData.inout_on,
        amount: editData.stock_amount,
        weight: editData.weight,
        lot_number: editData.lot_number,
      },
    ]);
  };

  const updatePrepareProduct = () => {
    let oldData = prepareProducts.slice();
    const updateData = oldData.filter(
      (item) => item.stock_inout_id == selectedStockInoutId
    )[0];

    updateData.amount = outStockAmount;
    updateData.handling_fee_rate = handlePrice;
    updateData.warehouse_category_id = selectedWarehouseCategoryId;
    updateData.warehouse_category_name = warehouseCategoryOptions.filter(
      (item) => item.value == selectedWarehouseCategoryId
    )[0].label;
    // updateData.outstock_date = dayjs
    //   .tz(new Date(outStockDate), "Asia/Tokyo")
    //   .format(dateFormat);

    setPrepareProducts(oldData);
    setEditMode("new");
    setStockAmount(stockAmount - outStockAmount);
  };

  const handleSearchProduct = (e) => {
    setSearchProductTxt(e.target.value);
  };

  const cancelEditProduct = () => {
    setEditMode("new");
    setOutStockAmount("");
    getProduct();
  };

  const deletePrepareProduct = (rowId) => {
    EditPrepareProduct(rowId);

    const newData = prepareProducts.slice();
    const delData = newData.filter((item, i) => i == rowId)[0];

    const idx = newData.indexOf(delData);
    newData.splice(idx, 1);
    setPrepareProducts(newData);
    setEditMode("new");
    setOutStockAmount(0);
    getProduct();
  };

  const savePrepareProducts = () => {
    if (prepareProducts.length == 0) {
      openNotificationWithIcon(
        "warning",
        "",
        $lang.messages.empty_out_stock_data
      );
      return;
    }
    console.log(prepareProducts);
    API.post(saveStockOutUrl, { data: prepareProducts })
      .then((res) => {
        setPrepareProducts([]);
        initPrepareProductItem();
        openNotificationWithIcon(
          "success",
          "",
          $lang.messages.success_outstock
        );
        setIsFindButtonDisabled(false);
      })
      .catch((err) => {
        openNotificationWithIcon("error", "", err.messages);
      });
  };

  const onChangeWarehouse = (value) => {
    setSelectedWarehouseId(value);
  };

  const onChangeShipper = (value) => {
    setSelectedShipperId(value);
  };

  const handleHideConfirmModal = () => {
    setIsConfirmModalVisible(false);
  };

  const handleHideConfirmResetModal = () => {
    setIsConfirmResetModalOpen(false);
  };
  const resetPrepareProducts = () => {
    setPrepareProducts([]);
    setIsFindButtonDisabled(false);
  };

  const getOutStockData = () => {
    const selectedShipper = shipperOptions.filter(
      (item) => (item.value = selectedShipperId)
    )[0];

    const selectedWarehouse = warehouseOptions.filter(
      (item) => (item.value = selectedWarehouseId)
    )[0];

    const url =
      stockInoutURL +
      "?shipper_id=" +
      selectedShipper.value +
      "&warehouse_id=" +
      selectedWarehouse.value +
      "&inout_on=" +
      outStockDate.format("YYYY-MM-DD") +
      "&category=1";

    API.get(url)
      .then((res) => {
        console.log(res.data);
        const stockInout = stockInoutOptions.filter(
          (item) => item.value == selectedStockInoutId
        )[0];
        const outStockDateStr = outStockDate.format("YYYY/MM/DD");
        const data = res.data.map((item, i) => {
          return {
            product_code: item.product_code,
            product_name: item.product_name,
            packaging: item.product_type,
            lot_number: item.lot_number,
            stock_amount: item.stock_amount,
            amount: item.amount,
            weight: item.weight,
            //asset data
            warehouse_name: selectedWarehouse.label,
            shipper_name: selectedShipper.label,
            inout_on: outStockDateStr,
            in_stock_date: item.in_stock_date,
            // memory data
            stock_id: item.stock_id,
            stock_inout_id: item.id,
            warehouse_id: selectedWarehouse.value,
            shipper_id: selectedShipper.value,
            handling_fee_rate: item.handling_fee_rate,
            storage_fee_rate: item.storage_fee_rate,
            warehouse_category_id: item.warehouse_category_id,
            warehouse_category_name: item.warehouse_category_name,
            category: 1,
            idx: i,
          };
        });

        if (data.length > 0) setIsFindButtonDisabled(true);

        setPrepareProducts(data);
      })
      .catch((err) => {});
  };

  const getWarehouseCategory = () => {
    API.get(warehouseCategoryURL + "?warehouse_id=" + selectedWarehouseId)
      .then((res) => {
        const data = res.data.map((item) => {
          return {
            value: item.id,
            label: item.storage_category,
          };
        });

        if (data.length > 0) setWarehouseCategoryOptions(data);
      })
      .catch((err) => {});
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
        link.setAttribute("download", "出庫_" + timestamp + ".csv");
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

  useEffect(() => {
    if (warehouseOptions.length == 0) {
      getWarehouses();
    }

    if (shipperOptions.length == 0) {
      getShippers();
    }
  }, []);

  useEffect(() => {
    const shipper = shipperOptions.filter(
      (item) => item.value == selectedShipperId
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
      const selectedShipper = shipperOptions.filter(
        (item) => (item.value = selectedShipperId)
      )[0];
      const oldData = prepareProducts.slice();
      for (let i = 0; i < oldData.length; i++) {
        oldData[i].shipper_id = selectedShipper.value;
        oldData[i].shipper_name = selectedShipper.label;
      }

      setPrepareProducts(oldData);
    }
  }, [selectedShipperId]);

  useEffect(() => {
    if (selectedStockInoutId != "") {
      const selected = stockInoutOptions.filter(
        (item) => item.value == selectedStockInoutId
      )[0];

      setInStockDate(selected.inout_on.replace(/\-/g, "/"));
      setStockAmount(selected.amount);
      setWeight(selected.weight);
    }
  }, [selectedStockInoutId]);

  useEffect(() => {
    if (prepareProducts.length > 0 && editMode == "create") {
      openNotificationWithIcon(
        "warning",
        "",
        $lang.messages.warning_stock_inout_section_1_change
      );
      const selectedWarehouse = warehouseOptions.filter(
        (item) => (item.value = selectedWarehouseId)
      )[0];
      const oldData = prepareProducts.slice();
      for (let i = 0; i < oldData.length; i++) {
        oldData[i].warehouse_id = selectedWarehouse.value;
        oldData[i].warehouse_name = selectedWarehouse.label;
      }
      setPrepareProducts(oldData);
    }
    getWarehouseCategory();
  }, [selectedWarehouseId]);

  useEffect(() => {
    if (prepareProducts.length > 0 && editMode == "create") {
      openNotificationWithIcon(
        "warning",
        "",
        $lang.messages.warning_stock_inout_section_1_change
      );
      const oldData = prepareProducts.slice();
      for (let i = 0; i < prepareProducts.length; i++) {
        oldData[i].inout_on = outStockDate.format("YYYY-MM-DD");
      }
      setPrepareProducts(oldData);
    }
  }, [outStockDate]);

  useEffect(() => {
    if (stockInoutOptions.length > 0) {
      setSelectedStockInoutId(stockInoutOptions[0].value);
    }
  }, [stockInoutOptions]);

  return (
    <div>
      <Content
        style={{ margin: "120px 10% 30px 10%" }}
        className="mx-auto flex flex-col justify-content content-h"
      >
        <Card style={{ width: "100%" }} className="py-2" bordered={false}>
          <div
            style={{
              padding: "10px 20px",
              marginBottom: 20,
            }}
          >
            {" "}
            <Row className="my-2">
              <Col span={2}>
                <label>{$lang.warehouseName}: </label>
              </Col>
              <Col span={6}>
                <Select
                  placeholder={$lang.warehouseName}
                  style={{ width: 150 }}
                  value={selectedWarehouseId}
                  options={warehouseOptions}
                  onChange={onChangeWarehouse}
                  disabled={editMode == "edit"}
                />
              </Col>
            </Row>
            <Row className="my-2">
              <Col span={2}>
                <label>{$lang.shipperName}:</label>
              </Col>
              <Col span={6}>
                <Select
                  style={{ width: 300 }}
                  onChange={onChangeShipper}
                  options={shipperOptions}
                  value={selectedShipperId}
                  defaultValue={""}
                  placeholder={$lang.shipperName}
                  disabled={editMode == "edit"}
                />
                <Row>
                  {shipperOptions.length > 0 && (
                    <span className="" style={{ fontSize: 12 }}>
                      {$lang.shipperCode} :&nbsp;&nbsp;
                      {shipperDisctription.code} &nbsp; &nbsp;
                      {$lang.closingDate}: {shipperDisctription.closingDate}
                    </span>
                  )}{" "}
                </Row>
              </Col>
            </Row>
            <Row>
              <Col span={2}>
                <label>{$lang.outStockDate}:</label>
              </Col>
              <Col span={6}>
                <div>
                  <DatePicker
                    style={{ width: 150 }}
                    value={outStockDate}
                    onChange={(date, dt) => {
                      if (dt == "") {
                        setOutStockDate(dayjs(currentDate, dateFormat));
                      } else {
                        setOutStockDate(dayjs(date, dateFormat));
                      }
                    }}
                    placeholder={$lang.outStockDate}
                    format={dateFormat}
                  />
                  <Button
                    style={{ marginLeft: 10 }}
                    onClick={() => {
                      getOutStockData();
                    }}
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
              padding: "10px 20px",
            }}
          >
            <Row>
              {" "}
              <Col span={2}>
                <label>{$lang.productCode}:</label>
              </Col>
              <Col span={16}>
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
              <Col span={16}>
                <Space block>
                  <Space direction="vertical">
                    <div>{$lang.productName}</div>
                    <Input
                      style={{ width: 250 }}
                      placeholder={$lang.productName}
                      value={productName}
                    />
                  </Space>
                  <Space direction="vertical">
                    <div>{$lang.packing}</div>
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
                      style={{ width: 100 }}
                      placeholder={$lang.weight}
                      value={weight}
                      disabled
                    />
                  </Space>

                  <Space direction="vertical">
                    <div>{$lang.cargoPrice}</div>
                    <Input
                      style={{ width: 100 }}
                      placeholder={$lang.cargoPrice}
                      value={handlePrice}
                      onChange={(e) => {
                        setHandlePrice(e.target.value);
                      }}
                    />
                  </Space>
                </Space>
              </Col>
            </Row>
            <Row>
              <Col span={2}></Col>
              <Col span={16} style={{ display: "flex" }}>
                <Space.Compact block>
                  <Space direction="vertical">
                    <div>{$lang.lotNumber}</div>
                    <Select
                      placeholder={$lang.lotNumber}
                      style={{ width: 150 }}
                      value={selectedStockInoutId}
                      options={stockInoutOptions}
                      onChange={(v) => {
                        setSelectedStockInoutId(v);
                      }}
                      disabled={editMode == "edit"}
                    />
                  </Space>
                  <Space direction="vertical">
                    <div>{$lang.inStockDate}</div>
                    <Input
                      style={{ width: 150 }}
                      placeholder={$lang.inStockDate}
                      value={inStockDate}
                      disabled
                    />
                  </Space>
                  <Space direction="vertical">
                    <div>{$lang.storageDivision}</div>
                    <Select
                      placeholder={$lang.storageDivision}
                      style={{ width: 150 }}
                      value={selectedWarehouseCategoryId}
                      options={warehouseCategoryOptions}
                      onChange={(val, options) => {
                        setSelectedWarehouseCategoryId(val);
                      }}
                    />
                  </Space>
                  <Space direction="vertical" style={{ marginLeft: 10 }}>
                    <div>{$lang.stockAmount}</div>
                    <Input
                      type="number"
                      style={{ width: 100 }}
                      placeholder={$lang.stockAmount}
                      value={stockAmount}
                      disabled
                    />
                  </Space>
                  <Space direction="vertical" style={{ marginLeft: 10 }}>
                    <div>{$lang.outStockAmount}</div>
                    <Input
                      style={{ width: 100 }}
                      type="number"
                      placeholder={$lang.outStockAmount}
                      value={outStockAmount}
                      onChange={(e) => {
                        setOutStockAmount(e.target.value);
                      }}
                    />
                  </Space>
                </Space.Compact>
                {is_edit === 1 ? (
                  <Col span={6} style={{ marginTop: 30, marginLeft: 20 }}>
                    <Button
                      onClick={doPrepareProducts}
                      className="px-5 ml-2 btn-bg-black"
                      type="primary"
                      hidden={editMode == "edit"}
                    >
                      {$lang.buttons.add}
                    </Button>
                    <Button
                      onClick={updatePrepareProduct}
                      className="px-5 ml-2 btn-bg-black"
                      hidden={editMode != "edit"}
                      type="primary"
                    >
                      {$lang.buttons.change}
                    </Button>
                    <Button
                      onClick={cancelEditProduct}
                      className="px-5 ml-2 default"
                      hidden={editMode != "edit"}
                    >
                      {$lang.buttons.cancel}
                    </Button>
                  </Col>
                ) : (
                  <></>
                )}
              </Col>
            </Row>
          </div>
        </Card>
        <Card
          style={{ width: "100%", marginTop: 20, marginBottom: 20 }}
          className="py-4 my-2"
          bordered={false}
        >
          <OutStockTable
            data={prepareProducts}
            editRow={(key) => EditPrepareProduct(key)}
            deleteRow={deletePrepareProduct}
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
                <Button onClick={setIsConfirmModalVisible} type="primary">
                  {$lang.confirmDeparture}
                </Button>
                <ConfirmModal
                  isOpen={isModalVisible}
                  onConfirm={() => {
                    handleHideConfirmModal();
                    savePrepareProducts();
                  }}
                  onClose={handleHideConfirmModal}
                  message={$lang.messages.confirm_outstock}
                />
              </Col>
            </Row>
          ) : (
            <></>
          )}
        </Card>
      </Content>
    </div>
  );
};

export default OutStockPage;
