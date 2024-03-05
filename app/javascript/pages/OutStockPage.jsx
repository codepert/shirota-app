import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import moment from "moment";
import {
  Form,
  Select,
  Space,
  Input,
  DatePicker,
  Divider,
  Card,
  Row,
  Col,
} from "antd";
import { API } from "../utils/helper";
import {
  warehouseURL,
  shipperURL,
  productSetUrl,
  productStockURL,
  saveStockOutUrl,
} from "../utils/constants";

import { Content } from "antd/es/layout/layout";
import { dateFormat } from "../utils/constants";

import CustomButton from "../components/common/CustomButton";
import $lang from "../utils/content/jp.json";
import OutStockTable from "../components/OutStock/OutStockTable";
import { openNotificationWithIcon } from "../components/common/notification";
import { getDateStr } from "../utils/helper";
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
  const [stockInoutOptionsWithProduct, setStockInoutOptionsWithProduct] =
    useState([]);
  const [selectedStockInoutId, setSelectedStockInoutId] = useState("");

  const [outStockDate, setOutStockDate] = useState("");

  // -----------packing---------
  const [packaging, setPackaging] = useState("");

  // --------storagePrice-------
  const [storagePrice, setStoragePrice] = useState("");

  // ----------handlePrice------------
  const [handlePrice, setHandlePrice] = useState("");

  const [inStockDate, setInStockDate] = useState("");

  // ---------------outStockAmount---------------
  const [outStockAmount, setOutStockAmount] = useState("");

  // -------------amount--------------
  const [stockAmount, setStock] = useState("");

  const [prepareProducts, setPrepareProducts] = useState([]);

  const initWarehouseFee = () => {
    setPackaging("");
    setStoragePrice("");
    setHandlePrice("");
    setInStockDate("");
    setStock("");
  };
  //  -------init prepareProductItem--------
  const initPrepareProductItem = () => {
    setOutStockAmount("");
  };

  const getWarehouses = () => {
    API.get(warehouseURL)
      .then((res) => {
        const warehouses = res.data.data.map((item) => {
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
        const shippers = res.data.data.map((item) => {
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

  // ----------Get product data-----------
  const getProductsWithWarehouseAndShipper = () => {
    const url =
      productSetUrl +
      "?warehouse_id=" +
      selectedWarehouseId +
      "&shipper_id=" +
      selectedShipperId;

    API.get(url)
      .then((res) => {
        const products = res.data.data.map((item) => {
          return {
            label: item.product_name,
            value: item.stock_inout_id,
            product: {
              id: item.product_id,
              name: item.product_name,
            },
            stock: {
              id: item.id,
            },
            stock_inout: {
              id: item.stock_inout_id,
              inout_on: item.inout_on,
              lot_number: item.lot_number,
              weight: item.weight,
            },
          };
        });
        setStockInoutOptionsWithProduct(products);
      })
      .catch((err) => {});
  };

  const getProductItem = () => {
    const selectedStockInoutWithProduct = stockInoutOptionsWithProduct.filter(
      (item) => item.value == selectedStockInoutId
    )[0];

    const url =
      productStockURL +
      "?product_id=" +
      selectedStockInoutWithProduct.product.id +
      "&stock_id=" +
      selectedStockInoutWithProduct.stock.id +
      "&stock_inout_id=" +
      selectedStockInoutId;

    API.get(url)
      .then((res) => {
        const warehouseFee = res.data.data.data.attributes.warehouse_fee;
        setPackaging(warehouseFee.packaging);
        setStoragePrice(warehouseFee.storage_fee_rate);
        setHandlePrice(warehouseFee.handling_fee_rate);
        setInStockDate(
          res.data.in_stock_date != ""
            ? res.data.in_stock_date.replace(/\-/g, "/")
            : ""
        );
        setStock(res.data.stock_amount);
      })
      .catch((err) => {});
  };

  const onChangeWarehouse = (value) => {
    setSelectedWarehouseId(value);
  };

  const onChangeShipper = (value) => {
    setSelectedShipperId(value);
  };

  const onChangeProduct = (value) => {
    setSelectedStockInoutId(value);

    // API.get(
    //   productStockURL(option.product_id, selectedWarehouseId, selectedShipperId)
    // )
    //   .then((res) => {
    //     const warehouseFee = res.data.data.data.attributes.warehouse_fee;
    //     setPackaging(warehouseFee.packaging);
    //     setStoragePrice(warehouseFee.storage_fee_rate);
    //     setHandlePrice(warehouseFee.handling_fee_rate);
    //     setInStockDate(option.inout_on);
    //     setStock(res.data.stock.total_amount);
    //   })
    //   .catch((err) => {});
  };
  const isReadyPrepareProducts = () => {
    if (outStockDate == "") {
      openNotificationWithIcon(
        "warning",
        $lang.popConrimType.warning,
        $lang.messages.input_out_stock_date
      );
      return false;
    } else if (outStockAmount == "") {
      openNotificationWithIcon(
        "warning",
        $lang.popConrimType.warning,
        $lang.messages.input_out_amount
      );
      return false;
    } else if (outStockAmount > stockAmount) {
      openNotificationWithIcon(
        "warning",
        $lang.popConrimType.warning,
        $lang.messages.stockAmountError
      );

      return false;
    }

    return true;
  };

  const doPrepareProducts = () => {
    if (!isReadyPrepareProducts()) return;
    let selectedStockInoutArr = prepareProducts.slice();
    const outStockDateStr = getDateStr(outStockDate, "YYYY/MM/DD");

    const selectedStockInout = stockInoutOptionsWithProduct.filter(
      (item) => item.value == selectedStockInoutId
    )[0];
    const selectedWarehouse = warehouseOptions.filter(
      (item) => (item.value = selectedWarehouseId)
    )[0];
    const selectedShipper = shipperOptions.filter(
      (item) => item.value == selectedShipperId
    )[0];

    const newTableRecordData = {
      //main data
      index: selectedStockInoutArr.length + 1,
      product_name: selectedStockInout.product.name,
      packaging: packaging,
      lot_number: selectedStockInout.stock_inout.lot_number,
      stock_amount: stockAmount,
      amount: outStockAmount,
      weight: selectedStockInout.stock_inout.weight,
      //asset data
      warehouse_name: selectedWarehouse.label,
      shipper_name: selectedShipper.label,
      inout_on: outStockDateStr,
      in_stock_date: inStockDate,
      // memory data
      stock_id: selectedStockInout.stock.id,
      stock_inout_id: selectedStockInoutId,
      warehouse_id: selectedWarehouse.value,
      shipper_id: selectedShipper.value,
      handling_fee_rate: handlePrice,
      storage_fee_rate: storagePrice,
      category: 1,
    };

    selectedStockInoutArr.push(newTableRecordData);
    setPrepareProducts(selectedStockInoutArr);
    initPrepareProductItem();
  };

  const setPrepareProductItem = (editData) => {
    // setStock(editData.stock_amount);
    setInStockDate(editData.in_stock_date);
    setStock(editData.stock_amount);
    setOutStockAmount(editData.amount);
    // setOutStockDate(moment(new Date(editData.inout_on)));
    setOutStockDate(dayjs.tz(new Date(editData.inout_on), "Asia/Tokyo"));
    setPackaging(editData.packaging);
    setHandlePrice(editData.handling_fee_rate);
    setStoragePrice(editData.storage_fee_rate);

    // setSelectedWarehouseId(editData.warehouse_id);

    // setSelectedShipperId(editData.shipper_id);

    // setSelectedProduct(editData.product_id);
  };

  const EditPrepareProduct = (rowId) => {
    const oldData = prepareProducts.slice();
    const editData = oldData.filter((item, i) => i == rowId)[0];

    if (editData.warehouse_id != selectedWarehouseId) {
      setSelectedWarehouseId(editData.warehouse_id);
    }

    if (editData.shipper_id != selectedShipperId) {
      setSelectedShipperId(editData.shipper_id);
    }

    if (editData.stock_inout_id != selectedStockInoutId) {
      setSelectedStockInoutId(editData.stock_inout_id);
    }

    setPrepareProductItem(editData);
    setEditMode("edit");
  };

  const cancelEditProduct = () => {
    setEditMode("new");
    setOutStockAmount("");
  };

  const deletePrepareProduct = (rowId) => {
    const newData = prepareProducts.slice();
    const delData = newData.filter((item, i) => i == rowId)[0];

    const idx = newData.indexOf(delData);
    newData.splice(idx, 1);
    setPrepareProducts(newData);
  };

  const updatePrepareProduct = () => {
    let oldData = prepareProducts.slice();
    const updateData = oldData.filter(
      (item) => item.stock_inout_id == selectedStockInoutId
    )[0];

    updateData.amount = outStockAmount;
    // updateData.outstock_date = dayjs
    //   .tz(new Date(outStockDate), "Asia/Tokyo")
    //   .format(dateFormat);

    setPrepareProducts(oldData);
    setEditMode("new");
  };
  const savePrepareProducts = () => {
    console.log(prepareProducts);
    API.post(saveStockOutUrl, { data: prepareProducts })
      .then((res) => {
        setPrepareProducts([]);
        initPrepareProductItem();
        openNotificationWithIcon(
          "success",
          $lang.popConrimType.success,
          $lang.messages.success
        );
      })
      .catch((err) => {
        openNotificationWithIcon(
          "error",
          $lang.popConrimType.error,
          err.messages
        );
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
    if (selectedShipperId !== "" && selectedWarehouseId !== "") {
      getProductsWithWarehouseAndShipper();
    }
  }, [selectedShipperId, selectedWarehouseId]);

  useEffect(() => {
    const shipper = shipperOptions.filter(
      (item) => item.value == selectedShipperId
    );
    setShipperDescription({
      code: shipper.length > 0 ? shipper[0].code : "",
      closingDate: shipper.length > 0 ? shipper[0].closingDate : "",
    });
  }, [selectedShipperId]);

  useEffect(() => {
    if (stockInoutOptionsWithProduct.length > 0) {
      setSelectedStockInoutId(stockInoutOptionsWithProduct[0].value);
    } else {
      setSelectedStockInoutId("");
      initWarehouseFee();
    }
  }, [stockInoutOptionsWithProduct]);

  useEffect(() => {
    if (selectedStockInoutId != 0 && stockInoutOptionsWithProduct.length > 0) {
      getProductItem();
    }
  }, [selectedStockInoutId]);

  return (
    <div>
      <Content
        style={{ width: 1280, marginTop: 20 }}
        className="mx-auto flex flex-col justify-content content-h"
      >
        <Card
          style={{ width: "100%", marginTop: 20, marginBottom: 20 }}
          className="py-2 my-2"
          bordered={false}
        >
          <Form
            name="basic"
            autoComplete="off"
            initialValues={{
              warehouse: "",
              shipper: "",
              receipDate: "",
              product: "",
              packaging: "",
              storagePrice: "",
              handlePrice: "",
              inStockDate: "",
              outStockAmount: "",
              stockAmount: "",
            }}
          >
            <Row className="my-2">
              <Col span={1}>
                <label>{$lang.inStock.warehouse}: </label>
              </Col>
              <Col span={6}>
                <Select
                  placeholder={$lang.inStock.warehouse}
                  style={{ width: 150, marginLeft: 14 }}
                  value={selectedWarehouseId}
                  options={warehouseOptions}
                  onChange={onChangeWarehouse}
                  disabled={editMode == "edit"}
                />
              </Col>
            </Row>
            <Row className="my-2">
              <Col span={1}>
                <label>{$lang.inStock.shipper}:</label>
              </Col>
              <Col span={6}>
                <Select
                  style={{ width: 300, marginLeft: 14 }}
                  onChange={onChangeShipper}
                  options={shipperOptions}
                  value={selectedShipperId}
                  defaultValue={""}
                  placeholder={$lang.inStock.shipper}
                  disabled={editMode == "edit"}
                />
                {shipperOptions.length > 0 && (
                  <span className="" style={{ marginLeft: 16 }}>
                    {$lang.inStock.shipper} :&nbsp;&nbsp;
                    {shipperDisctription.code} &nbsp;/ &nbsp;
                    {shipperDisctription.closingDate}
                  </span>
                )}{" "}
              </Col>
            </Row>
            <Row className="my-2">
              <Col span={1}>
                <label>{$lang.outStock.outStockDate}:</label>
              </Col>
              <Col span={6}>
                <div className="ml-2">
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
                    placeholder={$lang.outStock.outStockDate}
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
              <Col span={16}>
                <Space.Compact block className="ml-3">
                  <Select
                    showSearch
                    placeholder={$lang.inStock.productName}
                    style={{ width: 300 }}
                    value={selectedStockInoutId}
                    options={stockInoutOptionsWithProduct}
                    onChange={onChangeProduct}
                    defaultValue={{
                      value: "",
                      label: "",
                    }}
                    disabled={editMode == "edit"}
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
                    value={storagePrice}
                    disabled
                  />
                  <Input
                    style={{ width: 100 }}
                    placeholder={$lang.inStock.storagePrice}
                    value={handlePrice}
                    disabled
                  />
                </Space.Compact>
              </Col>
            </Row>
            <Row>
              <Col span={1}></Col>
              <Col span={5} style={{ display: "flex" }}>
                <Space.Compact block className="ml-3">
                  <Input
                    style={{ width: 100 }}
                    placeholder={$lang.inStock.inStockDate}
                    value={inStockDate}
                    disabled
                  />
                </Space.Compact>
                <Space.Compact className="ml-3">
                  <Input
                    type="number"
                    style={{ width: 100 }}
                    placeholder={$lang.outStock.stockAmount}
                    value={stockAmount}
                    disabled
                  />
                  <Input
                    style={{ width: 100 }}
                    type="number"
                    placeholder={$lang.outStock.outStockAmount}
                    value={outStockAmount}
                    onChange={(e) => {
                      setOutStockAmount(e.target.value);
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
                    onClick={cancelEditProduct}
                    className="px-5 ml-2 default"
                    title={$lang.buttons.cancel}
                    visability={editMode == "edit"}
                  />
                </Col>
              ) : (
                <></>
              )}
            </Row>
          </Form>
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
          ></OutStockTable>
          <div
            style={{
              justifyContent: "flex-end",
              display: "flex",
              marginTop: 15,
            }}
          >
            {is_edit === 1 ? (
              <CustomButton
                onClick={savePrepareProducts}
                title={$lang.buttons.confirmDeparture}
                visability={true}
              ></CustomButton>
            ) : (
              <></>
            )}
          </div>
        </Card>
      </Content>
    </div>
  );
};

export default OutStockPage;
